import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useAutomaticLogout } from "../../screens/AutoLogout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const PasswordReset = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset timer when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
    }, [])
  );

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

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

  const clearAuthData = async () => {
    try {
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

      const response = await fetch(`${API_ENDPOINT}/mobile/refreshToken`, {
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

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!currentPassword) {
      errorTexts.currentPassword = "Current password is required";
      isValid = false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!newPassword) {
      errorTexts.newPassword = "New password is required";
      isValid = false;
    } else if (!passwordRegex.test(newPassword)) {
      errorTexts.newPassword =
        "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character";
      isValid = false;
    }

    if (newPassword && !confirmPassword) {
      errorTexts.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errorTexts.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  const handleResetPassword = async () => {
    resetTimer();
    if (validateForm()) {
      setIsLoading(true);

      try {
        // Get the access token from storage
        const accessToken = await AsyncStorage.getItem("accessToken");
        const sessionString = await AsyncStorage.getItem("sessionString");
        const appUser = await AsyncStorage.getItem("appUser");

        if (!(accessToken || sessionString)) {
          Alert.alert(
            "Error",
            "No access token or session string found in async storage."
          );
          await clearAuthData();
          welcomeNavigation();
          return;
        }

        if (accessToken) {
          // Ensure we have a valid token before attempting logout
          const tokenValid = await ensureValidToken();

          if (!tokenValid) {
            Alert.alert("Tokens are invalid", "Please login again.");
            await clearAuthData();
            welcomeNavigation();
            return;
          }

          // To fetch new access token
          const accessToken = await AsyncStorage.getItem("accessToken");

          if (!accessToken) {
            Alert.alert("Error", "No access token found.");
            await clearAuthData();
            welcomeNavigation();
            return;
          }

          // Call the password reset Lambda function through API Gateway
          const response = await fetch(`${API_ENDPOINT}/mobile/passwordReset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              previous_password: currentPassword,
              new_password: newPassword,
              access_token: accessToken,
            }),
          });

          const data = await response.json();
          const parsedBody = JSON.parse(data.body);
          const statusCode = data.statusCode;

          console.log("API response status:", statusCode);

          switch (statusCode) {
            case 200:
              // Success
              console.log(parsedBody.message);
              Alert.alert(
                "Success",
                "Your password has been reset successfully!",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      resetTimer();
                      navigation.goBack();
                    },
                  },
                ]
              );
              break;

            case 401: // NotAuthorizedException
              Alert.alert(
                "Error",
                parsedBody.message ||
                  "Invalid Access Token, Access Token has been revoked, or Incorrect previous password."
              );
              break;

            case 400: // InvalidPasswordException
              Alert.alert(
                "Error",
                parsedBody.message || "Password doesn't match the policy."
              );
              break;

            case 404: // InvalidParameterException
              Alert.alert(
                "Error",
                parsedBody.message || "All fields are required."
              );
              break;

            case 500:
            default:
              Alert.alert(
                "Login Error",
                parsedBody.message || "An unexpected error occurred"
              );
          }
        } else if (sessionString) {
          // Call the temp password reset Lambda function through API Gateway
          const response = await fetch(`${API_ENDPOINT}/mobile/tempPWDReset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: appUser.trim().toLowerCase(),
              new_password: newPassword,
              session: sessionString,
            }),
          });

          const data = await response.json();
          const parsedBody = JSON.parse(data.body);
          const statusCode = data.statusCode;

          console.log("API response status:", statusCode);

          switch (statusCode) {
            case 200:
              // Success
              console.log(parsedBody.message);

              // Store the tokens in AsyncStorage
              if (parsedBody.tokens) {
                await AsyncStorage.setItem(
                  "accessToken",
                  parsedBody.tokens.accessToken
                );
                await AsyncStorage.setItem(
                  "refreshToken",
                  parsedBody.tokens.refreshToken
                );
                await AsyncStorage.setItem(
                  "tokenExpiry",
                  (Date.now() + parsedBody.tokens.expiresIn * 1000).toString()
                );
              }

              await AsyncStorage.removeItem("sessionString");
              await AsyncStorage.setItem("TempPWDChange", "false");

              const accessToken = await AsyncStorage.getItem("accessToken");
              console.log("accessToken:", accessToken);

              try {
                const incompleteProfileCNResponse = await fetch(
                  `${API_ENDPOINT}/dbHandling`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      action: "profile_incomplete_CN",
                      data: {
                        username: appUser.trim().toLowerCase(),
                      },
                    }),
                  }
                );

                const responseResult = await incompleteProfileCNResponse.json();

                if (!incompleteProfileCNResponse.ok) {
                  const errorMessage =
                    responseResult.error || "An unknown error occurred";
                  throw new Error(errorMessage);
                }

                console.log("User status changed successfully.");
              } catch (error) {
                console.error("Error updating profile status:", error.message);
              }

              Alert.alert(
                "Success",
                "Your password changed successfully and user authenticated!",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      resetTimer();
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "EditProfile" }],
                      });
                    },
                  },
                ]
              );
              break;

            case 401: // NotAuthorizedException
              Alert.alert(
                "Error",
                parsedBody.message ||
                  "Invalid temporary password or session expired."
              );
              break;

            case 400: // InvalidPasswordException
              Alert.alert(
                "Error",
                parsedBody.message || "Password doesn't match the policy."
              );
              break;

            case 404: // InvalidParameterException
              Alert.alert(
                "Error",
                parsedBody.message || "New password is required."
              );
              break;

            case 500:
            default:
              Alert.alert(
                "Login Error",
                parsedBody.message || "An unexpected error occurred"
              );
          }
        }
      } catch (error) {
        console.error("Login request error:", error);
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const confirmForgotPassword = () => {
    resetTimer();
    Alert.alert(
      "Forgot Password",
      "This will log you out and redirect to the password recovery screen. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resetTimer(),
        },
        {
          text: "Continue",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "ForgotPWD" }],
            });
          },
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        handleUserInteraction();
      }}
    >
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <LinearGradient
          colors={["#09D1C7", "#35AFEA"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                resetTimer();
                navigation.goBack();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Reset Password</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={handleUserInteraction}
          onTouchStart={handleUserInteraction}
        >
          <View style={styles.form}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Change Your Password</Text>
              <Text style={styles.subtitle}>
                Create a new password for your account
              </Text>
            </View>

            {/* Current Password Field */}
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={(text) => {
                  resetTimer();
                  setCurrentPassword(text);
                  if (errors.currentPassword) {
                    setErrors({ ...errors, currentPassword: null });
                  }
                }}
                secureTextEntry={!currentPasswordVisible}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => {
                  resetTimer();
                  setCurrentPasswordVisible(!currentPasswordVisible);
                }}
              >
                <Ionicons
                  name={currentPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={confirmForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* New Password Field */}
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={(text) => {
                  resetTimer();
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: null });
                  }
                }}
                secureTextEntry={!newPasswordVisible}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => {
                  resetTimer();
                  setNewPasswordVisible(!newPasswordVisible);
                }}
              >
                <Ionicons
                  name={newPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}

            {/* Confirm Password Field */}
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  resetTimer();
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: null });
                  }
                }}
                secureTextEntry={!confirmPasswordVisible}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => {
                  resetTimer();
                  setConfirmPasswordVisible(!confirmPasswordVisible);
                }}
              >
                <Ionicons
                  name={confirmPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#09D1C7", "#35AFEA"]}
                style={styles.gradientButton}
              >
                <Text style={styles.resetButtonText}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 10,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 40,
  },
  formScrollView: {
    flex: 1,
  },
  formContentContainer: {
    flexGrow: 1,
  },
  form: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginVertical: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#E9F6FE",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 5,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 15,
    marginBottom: 5,
  },
  forgotPasswordText: {
    color: "#09D1C7",
    fontSize: 14,
    fontWeight: "500",
  },
  resetButton: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 30,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PasswordReset;
