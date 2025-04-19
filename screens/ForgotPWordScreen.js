import React, { useState } from "react";
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
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/mobile";

// Forgot Password Initial Screen
export const ForgotPasswordScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!username.trim()) {
      errorTexts.username = "Username is required";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        console.log(
          "Calling initiate forgot password API with username:",
          username.trim()
        );

        // Calling the Lambda function through API Gateway
        const response = await fetch(`${API_ENDPOINT}/initiateForgotPWD`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
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
            navigation.navigate("ForgotPWDCode", { username: username.trim() });
            break;

          case 400:
            // InvalidParameterException
            Alert.alert(
              "Error",
              parsedBody.message || "Invalid request parameters."
            );
            break;

          case 404:
            // Username not passed
            Alert.alert("Error", parsedBody.message || "Username is required.");
            break;

          case 429: // TooManyRequestsException
            Alert.alert("Too many requests. Please try again later.");
            break;

          case 500: // UnknownError
          default:
            Alert.alert(
              "Error",
              parsedBody.message ||
                "An unknown error occurred. Please try again later."
            );
        }
      } catch (error) {
        console.error("Request error:", error);
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Forgot Password</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionTitle}>Reset Your Password</Text>
              <Text style={styles.instructionText}>
                Enter your username below. A verification code will be sent to
                associated email to reset your password.
              </Text>
            </View>

            {/* Username Field */}
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors({ ...errors, username: null });
                }
              }}
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
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
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Reset Code Sent Verification Screen
export const ResetCodeSentScreen = ({ navigation, route }) => {
  const { username } = route.params || { username: "" };
  const scheme = useColorScheme();
  const [isResending, setIsResending] = useState(false);

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      // Calling the Lambda function through API Gateway
      const response = await fetch(`${API_ENDPOINT}/initiateForgotPWD`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
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
            "A new verification code has been sent to your email."
          );
          break;

        case 400:
          // InvalidParameterException
          Alert.alert(
            "Error",
            parsedBody.message || "Invalid request parameters."
          );
          break;

        case 404:
          // Username not passed
          Alert.alert("Error", parsedBody.message || "Username is required.");
          break;

        case 429: // TooManyRequestsException
          Alert.alert("Too many requests. Please try again later.");
          break;

        case 500: // UnknownError
        default:
          Alert.alert(
            "Error",
            parsedBody.message ||
              "An unknown error occurred. Please try again later."
          );
      }
    } catch (error) {
      console.error("Request error:", error);
      Alert.alert(
        "Connection Error",
        error.message ||
          "Something went wrong. Please check your internet connection and try again later."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      <View style={styles.verificationContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-open-outline" size={70} color="#35AFEA" />
        </View>

        <Text style={styles.verificationTitle}>Verification Code Sent!</Text>
        <Text style={styles.verificationText}>
          We've sent a verification code to your email associated with account{" "}
          <Text style={styles.boldText}>{username}</Text>. Please check your
          inbox and use the code to reset your password.
        </Text>

        <Text style={styles.noteText}>
          The verification code will expire within a limited time. If you don't
          see the email, please check your spam folder.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              navigation.navigate("ForgotPWDReset", { username });
            }}
          >
            <LinearGradient
              colors={["#09D1C7", "#35AFEA"]}
              style={styles.gradientButton}
            >
              <Text style={styles.primaryButtonText}>
                Enter Verification Code
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.alternativeActions}>
            <TouchableOpacity
              style={styles.textButton}
              onPress={handleResendCode}
              disabled={isResending}
            >
              <Text style={styles.textButtonText}>
                {isResending ? "Resending..." : "Resend Code"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              }}
            >
              <Text style={styles.textButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// Enter code and reset password screen
export const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || { email: "" };
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!verificationCode.trim()) {
      errorTexts.verificationCode = "Verification code is required";
      isValid = false;
    }

    if (!newPassword) {
      errorTexts.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 8) {
      errorTexts.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      errorTexts.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        // AWS Cognito requests would be added here
        // await Auth.forgotPasswordSubmit(email, verificationCode, newPassword);

        // Simulation with a timeout for testing
        setTimeout(() => {
          setIsLoading(false);
          Alert.alert("Success", "Your password has been reset successfully!", [
            {
              text: "OK",
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                }),
            },
          ]);
        }, 1500);
      } catch (error) {
        setIsLoading(false);
        if (error.code === "CodeMismatchException") {
          setErrors({ verificationCode: "Invalid verification code" });
        } else if (error.code === "ExpiredCodeException") {
          setErrors({
            verificationCode:
              "Verification code has expired. Please request a new one.",
          });
        } else {
          Alert.alert("Error", "Something went wrong. Please try again later.");
        }
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Reset Password</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionTitle}>Create New Password</Text>
              <Text style={styles.instructionText}>
                Enter the verification code sent to{" "}
                <Text style={styles.boldText}>{email}</Text> and create a new
                password.
              </Text>
            </View>

            {/* Verification Code Field */}
            <Text style={styles.inputLabel}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
              value={verificationCode}
              onChangeText={(text) => {
                setVerificationCode(text);
                if (errors.verificationCode) {
                  setErrors({ ...errors, verificationCode: null });
                }
              }}
              autoCapitalize="none"
            />
            {errors.verificationCode && (
              <Text style={styles.errorText}>{errors.verificationCode}</Text>
            )}

            {/* New Password Field */}
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: null });
                  }
                }}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="#777"
                />
              </TouchableOpacity>
            </View>
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}

            {/* Confirm New Password Field */}
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: null });
                  }
                }}
                secureTextEntry={!confirmPasswordVisible}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
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
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Code Link */}
            <View style={styles.resendCodeContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ForgotPWD");
                }}
              >
                <Text style={styles.resendLink}>Resend Code</Text>
              </TouchableOpacity>
            </View>
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
  backButtonText: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "bold",
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
  instructionContainer: {
    marginVertical: 30,
    alignItems: "center",
  },
  instructionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#E9F6FE",
    fontSize: 16,
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
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    color: "#09D1C7",
    fontWeight: "bold",
  },
  resendCodeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    color: "#09D1C7",
    fontWeight: "bold",
  },
  // Verification screen styles
  verificationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  verificationText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
    marginBottom: 30,
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  alternativeActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 20,
  },
  textButton: {
    padding: 10,
  },
  textButtonText: {
    color: "#35AFEA",
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
});
