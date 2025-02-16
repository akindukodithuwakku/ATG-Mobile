import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

const AppointmentScheduling = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scheme = useColorScheme();
  const calendlyUrl = "https://calendly.com/username"; // Your Calendly URL

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />
      {/* Header */}
      <LinearGradient
        colors={["#09D1C7", "#35AFEA"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Appointment Scheduling</Text>
      </LinearGradient>

      {/* Overlay for Side Navigation */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}

      {/* Dashboard Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.greetingText}>
          Hello, welcome to the appointment scheduler!
        </Text>

        {/* WebView to load Calendly link */}
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: calendlyUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 30,
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
    color: "white",
  },
  greetingText: {
    textAlign: "center",
    margin: 10,
    fontSize: 18,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#A6D1FF",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    zIndex: 1,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

export default AppointmentScheduling;
