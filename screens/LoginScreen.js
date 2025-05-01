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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResetTimerOnLogin } from "./AutoLogout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useResetTimerOnLogin();

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!username.trim()) {
      errorTexts.username = "Username is required";
      isValid = false;
    }

    if (!password) {
      errorTexts.password = "Password is required";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        console.log("Calling login API with username:", username.trim());

        // Calling the Lambda function through API Gateway
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        });

        await AsyncStorage.setItem("appUser", username);
        const appUser = await AsyncStorage.getItem("appUser");
        console.log("appUser:", appUser);

        const data = await response.json();
        const parsedBody = JSON.parse(data.body);
        const statusCode = data.statusCode;

        console.log("API response status:", statusCode);

        if (statusCode !== 200 && statusCode !== 202) {
          // Handle different error scenarios based on status code and error code in body
          switch (statusCode) {
            case 401: // NotAuthorizedException
              Alert.alert("Login Failed", "Incorrect username or password");
              break;
            case 403: // UserNotConfirmedException
              Alert.alert(
                "Account Not Verified",
                "Please verify your account first",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      navigation.reset({
                        index: 0,
                        routes: [
                          {
                            name: "VerificationSent",
                            params: { username: username },
                          },
                        ],
                      }),
                  },
                ]
              );
              break;
            case 404: // UserNotFoundException
              Alert.alert("Login Failed", "User does not exist");
              break;
            case 400: // InvalidParameterException
              Alert.alert(
                "Invalid Input",
                parsedBody.message || "Please check your input"
              );
              break;
            case 500:
            default:
              Alert.alert(
                "Login Error",
                parsedBody.message || "An unexpected error occurred"
              );
          }
          return;
        }

        if (statusCode == 200) {
          console.log("Login successful");

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

          const accessToken = await AsyncStorage.getItem("accessToken");
          console.log("accessToken:", accessToken);

          // Database query to fetch the status of the user and the directing to correct screens has to be modified with a switch statement
          // case 0: unconfirmed client to verification screen
          // case 1: confirmed but care intake less client to care intake form
          // case 2: active client/CN to respective dashboard
          // case 3: temporary password client will always be identified with the session string, so need of this case
          // case 4: CNs that need to update the profile page data will get directed to profile screen with a polite alert request to update it

          // Navigate to dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: "CNDashboard" }],
          });
        } else if (statusCode == 202) {
          console.log("CN temp login!");

          // Store sessionString of temp CN in AsyncStorage
          if (parsedBody.session) {
            await AsyncStorage.setItem("sessionString", parsedBody.session);
          }
          
          // A state to identify as the user(CN) is currently directed to a temporary password reset stage 
          // to check at auto logout feature
          await AsyncStorage.setItem("TempPWDChange", "true");

          const sessionString = await AsyncStorage.getItem("sessionString");
          console.log("sessionString:", sessionString);

          // Navigate to password reset screen for forced password change
          navigation.reset({
            index: 0,
            routes: [{ name: "PWDReset" }],
          });
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
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Log In</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Welcome Back!</Text>
              <Text style={styles.welcomeSubtitle}>
                Log in to access your dashboard
              </Text>
            </View>

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
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
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

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate("ForgotPWD")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#09D1C7", "#35AFEA"]}
                style={styles.gradientButton}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? "Logging In..." : "Log In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpLinkContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
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
  welcomeContainer: {
    marginVertical: 30,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  welcomeSubtitle: {
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
  loginButton: {
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
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signUpLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signUpText: {
    fontSize: 14,
    color: "#666",
  },
  signUpLink: {
    fontSize: 14,
    color: "#09D1C7",
    fontWeight: "bold",
  },
});

export default LoginScreen;
