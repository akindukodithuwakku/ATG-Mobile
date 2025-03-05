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
      // 10 seconds for testing
      if (isTimerActive && timeSinceLastActivity > 10000) {
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
    console.warn("useAutomaticLogout must be used within a LogoutProvider");
    return { resetTimer: () => {} }; // Return dummy function
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
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use setTimeout to avoid state updates during render
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Welcome" }],
            });
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
