import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WelcomeScreen = ({ navigation }) => {
  const scheme = useColorScheme();
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      <Image source={require("../assets/Ayman_Logo.png")} style={styles.logo} />

      <Text style={styles.welcomeText}>Welcome To</Text>

      <Text style={styles.appName}>ATG HealthCare</Text>

      <Text style={styles.tagline}>
        Your health is our priority. Empowering you with all our strength to
        live a healthier, happier life.
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("Login")}
      >
        <LinearGradient
          colors={["#09D1C7", "#35AFEA"]}
          style={styles.gradientButton}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#09D1C7",
    marginBottom: 15,
  },
  tagline: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  loginButton: {
    width: 200,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 15,
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
  signupButton: {
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E9F6FE",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#09D1C7",
  },
  signupText: {
    color: "#09D1C7",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WelcomeScreen;
