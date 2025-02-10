import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, useColorScheme } from "react-native";
import SideNavigationClient from "../Components/SideNavigationClient";
import { Ionicons } from "@expo/vector-icons";

const ClientDashboard = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scheme = useColorScheme(); // Detect the current theme (light or dark)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <View style={styles.container}>
      {/* Adjust the status bar based on the theme */}
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} // Set bar style depending on theme
        translucent={true}
        backgroundColor={scheme === 'dark' ? 'black' : 'transparent'} // Set background color based on theme
      />
      {/* Header with Hamburger Icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>DASHBOARD</Text>
      </View>

      {/* Overlay for Side Navigation */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity style={styles.overlayBackground} onPress={toggleMenu} />
        </View>
      )}

      {/* Dashboard Content */}
      <View style={styles.content}>
        <Text style={styles.dashboardText}>Welcome to the Client Dashboard</Text>
      </View>
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
    backgroundColor: "#f8f9fa",
    marginTop: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dashboardText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
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
    flex: 1, // Allows tapping outside the menu to close it
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

export default ClientDashboard;
