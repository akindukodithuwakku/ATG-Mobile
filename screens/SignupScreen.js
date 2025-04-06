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
  Modal,
  useColorScheme,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { signUp, confirmSignUp, resendSignUpCode } from "aws-amplify/auth";

export const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!username.trim()) {
      errorTexts.username = "Username is required";
      isValid = false;
    }

    if (!email.trim()) {
      errorTexts.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errorTexts.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      errorTexts.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errorTexts.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      errorTexts.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  const handleSignUp = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        // Sign up the user with Cognito
        console.log(`${username} ${email} ${password}`);

        const signUpResponse = await signUp({
          username: username,
          password: password,
          options: {
            userAttributes: {
              email: email,
              preferred_username: username,
            },
          },
        });
        console.log("User signed up successfully:", signUpResponse);

        // Navigate to verification screen on success
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "VerificationSent",
              params: { username: username },
            },
          ],
        });
      } catch (error) {
        setIsLoading(false);
        if (error.code === "UsernameExistsException") {
          Alert.alert("Error", "This email is already registered.");
        } else {
          console.log(`error: ${error}`);
          Alert.alert("Error", "Something went wrong. Please try again.");
        }
      }
    }
  };

  // Terms Modal
  const TermsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showTermsModal}
      onRequestClose={() => setShowTermsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Use</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>
              By signing up, you agree to our{" "}
              <Text style={styles.boldText}>Terms of Use</Text>, including:
            </Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You must provide <Text style={styles.boldText}>accurate</Text>{" "}
                information and use the app responsibly.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The app is for{" "}
                <Text style={styles.boldText}>
                  personal healthcare management
                </Text>{" "}
                and does not replace medical advice.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Security</Text>: You are
                responsible for your account and password protection.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Misuse</Text> may result in
                account suspension.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                We may <Text style={styles.boldText}>update</Text> the terms and
                policies, and you will be notified.
              </Text>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowTermsModal(false)}
          >
            <LinearGradient
              colors={["#09D1C7", "#35AFEA"]}
              style={styles.gradientButton}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Privacy Policy Modal
  const PrivacyModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showPrivacyModal}
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>
              By signing up, you agree to our{" "}
              <Text style={styles.boldText}>Privacy Policy</Text>, which
              outlines:
            </Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>What we collect</Text>: Profile
                details, health-related data, and usage information.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Why we collect it</Text>: To
                enable care plan management, appointments, and security.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Who we share with</Text>:
                Healthcare providers, AWS Cognito, and third-party integrations.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Your rights</Text>: Access,
                update, or request deletion of your data.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>Security</Text>: Your data is
                protected with encryption and strict security measures.
              </Text>
            </View>

            <Text style={[styles.modalText, styles.marginTop]}>
              By continuing, you confirm that you have read and accept our full
              Privacy Policy.
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setShowPrivacyModal(false)}
          >
            <LinearGradient
              colors={["#09D1C7", "#35AFEA"]}
              style={styles.gradientButton}
            >
              <Text style={styles.modalButtonText}>I Understand</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
            <Text style={styles.headerText}>Sign Up</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Username Field */}
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors({ ...errors, username: null });
                }
              }}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            {/* Email Field */}
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
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

            {/* Password Field */}
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: null });
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
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password Field */}
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
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

            {/* Terms and Privacy Policy */}
            <Text style={styles.termsText}>
              By continuing, you agree to{" "}
              <Text
                style={styles.termsLink}
                onPress={() => setShowTermsModal(true)}
              >
                Terms of Use
              </Text>{" "}
              and{" "}
              <Text
                style={styles.termsLink}
                onPress={() => setShowPrivacyModal(true)}
              >
                Privacy Policy
              </Text>
              .
            </Text>

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#09D1C7", "#35AFEA"]}
                style={styles.gradientButton}
              >
                <Text style={styles.signUpButtonText}>
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <TermsModal />
        <PrivacyModal />
      </View>
    </TouchableWithoutFeedback>
  );
};

// Verification Sent Screen Component
export const VerificationSentScreen = ({ route, navigation }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const scheme = useColorScheme();
  const [error, setError] = useState("");

  // Get email from navigation params
  const { username = "" } = route.params || {};

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    // Check explicitly if username is empty or undefined
    if (!username || username.trim() === "") {
      console.log("Username is empty or undefined");
      setError("Username is missing. Please start over.");
      Alert.alert("Error", "Username is missing. Please start over.");
      return;
    }

    setIsVerifying(true);

    try {
      // Make sure username is trimmed to not have any whitespaces
      const trimmedUsername = username.trim();
      
      // Explicit log to check username right before confirmation
      console.log(`About to confirm signup for username: '${trimmedUsername}'`);
      
      await confirmSignUp({
        username: trimmedUsername,
        confirmationCode: verificationCode.trim()
      });

      setIsVerifying(false);

      navigation.reset({
        index: 0,
        routes: [{ name: "NotificationsCN" }],
      });
    } catch (error) {
      console.log(`verifyResponse: ${error}`);
      setIsVerifying(false);
      Alert.alert("Failed to verify email. Please try again.");
    }
  };

  const handleResendCode = async () => {
    if (!username || username.trim() === "") {
      console.log("Username is empty for resend");
      setError("Username is missing. Please start over.");
      Alert.alert("Error", "Username is missing. Please start over.");
      return;
    }

    try {
      await resendSignUpCode({
        username: username
      });
      Alert.alert(
        "Success",
        "A new verification code has been sent to your email."
      );
    } catch (error) {
      console.log(`resendSignUp: ${error}`);
      Alert.alert("Failed to resend code. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      {/* Content */}
      <View style={styles.verificationContainer}>
        {/* Email icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={70} color="#35AFEA" />
        </View>

        <Text style={styles.verificationTitle}>Verification Email Sent!</Text>
        <Text style={styles.verificationText}>
          Please check your email inbox for a verification code to continue your
          account setup.
        </Text>

        {/* Verification code input */}
        <View style={styles.form}>
          <Text style={styles.inputLabel}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <Text style={styles.noteText}>
          You must verify your email and complete the care intake form to
          finalize your registration.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleVerifyEmail}
            disabled={isVerifying}
          >
            <LinearGradient
              colors={["#09D1C7", "#35AFEA"]}
              style={styles.gradientButton}
            >
              <Text style={styles.primaryButtonText}>
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleResendCode}
          >
            <Text style={styles.secondaryButtonText}>Resend Code</Text>
          </TouchableOpacity>

          <View style={styles.alternativeActions}>
            <TouchableOpacity
              style={styles.textButton}
              onPress={() => {
                // Functionality to clear any partial registration data will be added later.
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Welcome" }],
                });
              }}
            >
              <Text style={styles.textButtonText}>Start Over</Text>
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
              <Text style={styles.textButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
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
  termsText: {
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    marginBottom: 20,
  },
  termsLink: {
    color: "#09D1C7",
  },
  signUpButton: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButtonText: {
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "70%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalBody: {
    maxHeight: "65%",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletPoint: {
    flexDirection: "row",
    marginBottom: 10,
    paddingLeft: 5,
  },
  bullet: {
    fontSize: 14,
    marginRight: 10,
    color: "#444",
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "bold",
  },
  marginTop: {
    marginTop: 10,
  },
  modalButton: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Verification Screen styles
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
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  alternativeActions: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
  },
  textButton: {
    padding: 10,
    paddingRight: 25,
  },
  textButtonText: {
    color: "#35AFEA",
    fontSize: 16,
  },
});
