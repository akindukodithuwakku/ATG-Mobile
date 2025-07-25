import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const SIGNOUT_API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signOut";

const REFRESH_TOKEN_API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/mobile/refreshToken";

// Create context
export const LogoutContext = createContext(null);

// Provider component
export const LogoutProvider = ({ children }) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isTimerActive, setIsTimerActive] = useState(true);
  const autoLogoutOccurred = useRef(false);

  useEffect(() => {
    let timeoutId;

    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      // 30 minutes
      if (isTimerActive && timeSinceLastActivity > 1800000) {
        setIsTimerActive(false);
        autoLogoutOccurred.current = true;
      }
    };

    if (isTimerActive) {
      timeoutId = setInterval(checkInactivity, 1000);
    }

    return () => {
      if (timeoutId) {
        clearInterval(timeoutId);
      }
    };
  }, [lastActivity, isTimerActive]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setLastActivity(Date.now());
        setIsTimerActive(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const resetTimer = () => {
    setLastActivity(Date.now());
    setIsTimerActive(true);
  };

  const updateActivity = () => {
    if (isTimerActive) {
      setLastActivity(Date.now());
    }
  };

  // Method to check and clear the auto logout flag
  const checkAndClearAutoLogout = () => {
    const wasAutoLogout = autoLogoutOccurred.current;
    autoLogoutOccurred.current = false;
    return wasAutoLogout;
  };

  return (
    <LogoutContext.Provider
      value={{
        updateActivity,
        resetTimer,
        isTimerActive,
        checkAndClearAutoLogout,
      }}
    >
      {children}
    </LogoutContext.Provider>
  );
};

// Hook for components
export const useAutomaticLogout = () => {
  const context = useContext(LogoutContext);
  const navigation = useNavigation();

  // Return early if context is not available
  if (!context) {
    console.warn("Missing LogoutProvider in component hierarchy");
    return { resetTimer: () => {} };
  }

  useEffect(() => {
    if (context.isTimerActive === false) {
      // Force close any open modals before navigating
      navigation.setOptions({
        gestureEnabled: false,
      });
      navigation.navigate("AutomaticLogout");
    }
  }, [context.isTimerActive]);

  return {
    resetTimer: context.resetTimer,
  };
};

// Automatic Logout Screen
export const AutomaticLogoutScreen = ({ navigation }) => {
  const { resetTimer } = useContext(LogoutContext);
  const [timeLeft, setTimeLeft] = useState(8);

  // Check if the access token has expired
  const isTokenExpired = async () => {
    try {
      const tokenExpiry = await AsyncStorage.getItem("tokenExpiry");

      if (!tokenExpiry) {
        console.log("No token expiry found in storage");
        return true;
      }

      const expiryTime = parseInt(tokenExpiry, 10);
      const currentTime = Date.now();

      // Add a 5-minute buffer to refresh token before it actually expires
      const bufferTime = 5 * 60 * 1000;

      const isExpired = currentTime >= expiryTime - bufferTime;

      console.log(`Token expiry check: ${isExpired ? "EXPIRED" : "VALID"}`);

      return isExpired;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  };

  // Refresh the access token using the refresh token
  const refreshAccessToken = async () => {
    try {
      console.log("Attempting to refresh access token...");

      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("No refresh token found in storage");
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again."
        );
        return false;
      }

      const response = await fetch(REFRESH_TOKEN_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      const statusCode = data.statusCode;

      console.log("Token refresh response status:", statusCode);

      switch (statusCode) {
        case 200:
          console.log("Access token refreshed successfully");

          if (parsedBody.tokens) {
            await AsyncStorage.setItem(
              "accessToken",
              parsedBody.tokens.accessToken
            );

            const newExpiryTime =
              Date.now() + parsedBody.tokens.expiresIn * 1000;
            await AsyncStorage.setItem("tokenExpiry", newExpiryTime.toString());

            // Handle refresh token rotation if enabled (Else same refresh token will work)
            if (parsedBody.tokens.refreshToken) {
              console.log("New refresh token received - updating storage");
              await AsyncStorage.setItem(
                "refreshToken",
                parsedBody.tokens.refreshToken
              );
            }

            console.log("New tokens saved to AsyncStorage");
            return true;
          } else {
            console.error("No tokens in refresh response");
            return false;
          }

        case 401:
          console.log("Refresh token is invalid or expired");
          Alert.alert(
            "Session Expired",
            "Your session has expired. Please login again."
          );
          await clearAuthData();
          welcomeNavigation();
          return false;

        case 400:
          console.error("Invalid parameter in refresh request");
          Alert.alert(
            "Error",
            parsedBody.message || "Invalid request parameters"
          );
          return false;

        case 404:
          console.error("User pool or user not found");
          Alert.alert("Error", "User account not found");
          await clearAuthData();
          welcomeNavigation();
          return false;

        case 429:
          console.error("Too many refresh requests");
          Alert.alert("Error", "Too many requests. Please try again later.");
          return false;

        case 500:
        default:
          console.error("Internal error during token refresh");
          Alert.alert(
            "Error",
            parsedBody.message ||
              "An error occurred while refreshing your session. Please try again."
          );
          return false;
      }
    } catch (error) {
      console.error("Token refresh request error:", error);
      Alert.alert(
        "Connection Error",
        "Unable to refresh your session. Please check your internet connection."
      );
      return false;
    }
  };

  // Validate token and refresh if necessary before making API calls
  const ensureValidToken = async () => {
    try {
      console.log("Checking token validity...");

      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        console.log("No access token found");
        Alert.alert("Session Expired", "Please login again.");
        await clearAuthData();
        welcomeNavigation();
        return false;
      }

      const tokenExpired = await isTokenExpired();

      if (tokenExpired) {
        console.log("Token is expired, attempting to refresh...");
        const refreshSuccessful = await refreshAccessToken();

        if (!refreshSuccessful) {
          console.log("Token refresh failed");
          return false;
        }

        console.log("Token refreshed successfully");
      } else {
        console.log("Token is still valid");
      }

      return true;
    } catch (error) {
      console.error("Error in ensureValidToken:", error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Ensure we have a valid token before attempting logout
      const tokenValid = await ensureValidToken();

      if (!tokenValid) {
        Alert.alert("Tokens are invalid", "Please login again.");
        await clearAuthData();
        welcomeNavigation();
        return;
      }

      // Get the access token from AsyncStorage
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (!accessToken) {
        Alert.alert("Error", "No access token found.");
        await clearAuthData();
        welcomeNavigation();
        return;
      }

      // Call the logout API endpoint
      const response = await fetch(SIGNOUT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: accessToken,
        }),
      });

      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      const statusCode = data.statusCode;

      console.log("Logout response status:", statusCode);

      // Handle response based on status code
      switch (statusCode) {
        case 200:
          // Successful logout
          console.log("Successfully logged out");
          await clearAuthData();
          welcomeNavigation();
          break;

        case 401: // NotAuthorizedException
          // Token is invalid/expired, user needs to login again anyway
          console.log("Token invalid or expired");
          Alert.alert(
            "Session Expired",
            "Your session has expired. Please login again."
          );
          await clearAuthData();
          welcomeNavigation();
          break;

        case 400: // InvalidParameterException
          Alert.alert(
            "Error",
            parsedBody.message || "Invalid request parameters"
          );
          break;

        case 404: // ResourceNotFoundException
          Alert.alert("Error", "User account not found");
          await clearAuthData();
          welcomeNavigation();
          break;

        case 429: // TooManyRequestsException
          Alert.alert("Too many requests. Please try again later.");
          break;

        case 500: // InternalErrorException or UnknownError
        default:
          Alert.alert(
            "Error",
            parsedBody.message ||
              "An unknown error occurred. Please try again later."
          );
          break;
      }
    } catch (error) {
      console.error("Logout request error:", error);
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setShowLogoutModal(false);
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      // Remove all auth-related items from storage
      const keysToRemove = [
        "accessToken",
        "refreshToken",
        "tokenExpiry",
        "sessionString",
        "userProfile",
      ];
      await Promise.all(
        keysToRemove.map((key) => AsyncStorage.removeItem(key))
      );
      console.log("Auth data cleared from storage");
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const welcomeNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use setTimeout to avoid state updates during render
          setTimeout(() => {
            handleLogout();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleKeepLoggedIn = () => {
    resetTimer();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalOverlay}>
        <View style={styles.autoLogoutModal}>
          <Text style={styles.inactivityText}>Inactivity detected</Text>
          <Text style={styles.autoLogoutText}>
            Automatic Logout in {timeLeft} seconds...
          </Text>
          <TouchableOpacity
            style={styles.keepLoggedInButton}
            onPress={handleKeepLoggedIn}
          >
            <Text style={styles.keepLoggedInText}>Keep me logged in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Special hook to be used in login screen for a force auto logout timer reset
export const useResetTimerOnLogin = () => {
  const context = useContext(LogoutContext);
  const initialCheckRef = useRef(false);

  // Only check once when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (
        !initialCheckRef.current &&
        context &&
        context.checkAndClearAutoLogout
      ) {
        initialCheckRef.current = true;

        // Only reset the timer if we came from an auto logout
        if (context.checkAndClearAutoLogout()) {
          context.resetTimer();
        }
      }

      return () => {
        initialCheckRef.current = false;
      };
    }, [context])
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(108, 199, 218, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  autoLogoutModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inactivityText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  autoLogoutText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  keepLoggedInButton: {
    backgroundColor: "#6CC7DA",
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  keepLoggedInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
