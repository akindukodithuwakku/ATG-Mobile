import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet, 
  Image,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
} from "react-native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Ionicons } from "@expo/vector-icons";

const CNDashboard = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scheme = useColorScheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateToNotifications = () => {
    navigation.navigate("NotificationsCN");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.greenCircle} />
          <Image
            source={require("../assets/Ayman_Logo.png")}
            style={styles.logo}
          />
        </View>
        <Text style={styles.headerText}>DASHBOARD</Text>
        <TouchableOpacity style={styles.notificationButton} onPress={navigateToNotifications}>
          <Ionicons name="notifications-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Overlay for Side Navigation */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}

      {/* Dashboard Content */}
      <View style={styles.content}>
        <Text style={styles.dashboardText}>
          Welcome to the Care Navigator Dashboard
        </Text>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigationCN navigation={navigation} />
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
    justifyContent: "space-between",
  },
  menuButton: {
    width: 40,
  },
  logoContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenCircle: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    zIndex: 1,
  },
  logo: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    zIndex: 2,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: 15,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  notificationButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
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
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

export default CNDashboard;
