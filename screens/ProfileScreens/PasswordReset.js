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

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!currentPassword) {
      errorTexts.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!newPassword) {
      errorTexts.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 8) {
      errorTexts.newPassword = "Password must be at least 8 characters";
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
      // Backend password reset actions would be added here

      // Simulating process with a timeout
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert("Success", "Your password has been reset successfully!", [
          {
            text: "OK",
            onPress: () => {
              resetTimer();
              navigation.goBack();
            },
          },
        ]);
      }, 1500);
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
