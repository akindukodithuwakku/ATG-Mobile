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
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { LinearGradient } from "expo-linear-gradient";

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

        <View style={styles.logoContainer}>
          <LinearGradient
            colors={["#09D1C7", "#0C6478"]}
            style={styles.circleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Image
            source={require("../assets/Ayman_Logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.headerText}>DASHBOARD</Text>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={navigateToNotifications}
        >
          <Ionicons name="notifications-outline" size={30} color="black" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Overlay for Side Navigation */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={toggleMenu}/>
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}

      {/* Dashboard Content */}
      <View style={styles.content}>
        {/* Main Navigation Cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("CarePlanCN")}
          >
            <LinearGradient
              colors={["#6a3093", "#a044ff"]}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.carePlanIcon}>
                {/* Heart */}
                <FontAwesome name="heartbeat" size={32} color="red" style={styles.heartIcon} />
                {/* Hands */}
                <FontAwesome5 name="hands" size={32} color="black" style={styles.handIcon} />
              </View>
              <Text style={styles.cardTitle}>Care Plan Management</Text>
              <Text style={styles.cardSubtitle}>
                Create and manage care plans.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    marginTop: 30,
    justifyContent: "space-between",
  },
  menuButton: {
    width: 40,
  },
  logoContainer: {
    position: "relative",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  circleGradient: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 50,
  },
  logo: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    zIndex: 1,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
    color: "white",
  },
  notificationButton: {
    width: 40,
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
    padding: 20,
    marginBottom: 60,
  },
  cardContainer: {
    flex: 1,
    gap: 20,
  },
  card: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardGradient: {
    padding: 20,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
    marginTop: 5,
  },
  carePlanIcon: {
    alignItems: "center",
  },
  handIcon: {
    marginTop: -10,
  },
  heartIcon: {
    marginBottom: -10,
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
