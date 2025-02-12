import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, useColorScheme } from "react-native";
import { useRoute } from "@react-navigation/native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Ionicons } from "@expo/vector-icons";

const CarePlanMgtCN = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("CarePlan Management");
  const route = useRoute();
  const scheme = useColorScheme();

  // Effect to update activeRoute based on the current route name
  useEffect(() => {
    const routeToMenuItemMap = {
      "CNDashboard": "Home",
      "CarePlanCN": "CarePlan Management",
      "MedicationCN": "Medication Management",
      "Appointments": "Appointments",
      "NotificationsCN": "Notifications",
      "Profile": "Profile"
    };

    const currentMenuItemName = routeToMenuItemMap[route.name];
    if (currentMenuItemName) {
      setActiveRoute(currentMenuItemName);
    }
  }, [route.name]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent={true}
        backgroundColor={scheme === 'dark' ? 'black' : 'transparent'}
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
        <Text style={styles.headerText}>CarePlan ManagementCN</Text>
      </View>

      {/* Overlay for Side Navigation */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN 
            navigation={navigation} 
            onClose={toggleMenu} 
            activeRoute={activeRoute}
            setActiveRoute={setActiveRoute}
          />
          <TouchableOpacity style={styles.overlayBackground} onPress={toggleMenu} />
        </View>
      )}

      {/* Dashboard Content */}
      <View style={styles.content}>
        <Text style={styles.dashboardText}>Welcome to the CarePlan ManagementCN</Text>
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

export default CarePlanMgtCN;
