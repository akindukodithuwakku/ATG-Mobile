import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
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
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
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
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3CBAC8",
  },
  tagline: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
    paddingHorizontal: 30,
  },
  loginButton: {
    backgroundColor: "#3CBAC8",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginVertical: 10,
  },
  signupButton: {
    backgroundColor: "#E6F6F8",
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  signupText: {
    color: "#3CBAC8",
    fontWeight: "bold",
  },
});

export default WelcomeScreen;