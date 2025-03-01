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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Forgot Password Initial Screen
export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!email.trim()) {
      errorTexts.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errorTexts.email = "Email is invalid";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        // Requests to AWS Cognito will be added here
        // await Auth.forgotPassword(email);
        // Upon success navigation to verification code sent screen, if caught error catch block

        // Simulating the navigation with a timeout (Success path)
        setTimeout(() => {
          setIsLoading(false);
          navigation.navigate("ForgotPWDCode", { email });
        }, 1500);
      } catch (error) {
        setIsLoading(false);
        if (error.code === "UserNotFoundException") {
          setErrors({ email: "No account found with this email" });
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
                Enter your email address below. A verification code will be sent
                to your email to reset your password.
              </Text>
            </View>

            {/* Email Field */}
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
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
});
