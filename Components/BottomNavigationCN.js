import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons, Foundation } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

const BottomNavigationCN = ({ navigation }) => {
  const route = useRoute();

  const menuItems = [
    { name: "Home", icon: "home-outline", route: "CNDashboard" },
    {
      name: "CarePlan",
      icon: require("../assets/CarePlanIcon.png"),
      route: "CarePlanCN",
    },
    { name: "Medication", icon: "clipboard-notes", route: "MedicationCN" },
    { name: "Profile", icon: "person-outline", route: "ProfileCN" },
  ];

  const handleNavigation = (route) => {
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.menuItem,
            route.name === item.route && styles.activeMenuItem,
          ]}
          onPress={() => handleNavigation(item.route)}
        >
          {typeof item.icon === "string" ? (
            item.icon === "clipboard-notes" ? (
              <Foundation name="clipboard-notes" size={24} color="#666" />
            ) : (
              <Ionicons name={item.icon} size={24} color="#666" />
            )
          ) : (
            <Image
              source={item.icon}
              style={[
                styles.imgIcon,
                route.name === item.route && styles.activeIcon,
              ]}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#E6F2FF",
    borderTopWidth: 1,
    borderTopColor: "#A6D1FF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    shadowColor: "#0071BC",
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  menuItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeMenuItem: {
    backgroundColor: "rgba(0, 113, 188, 0.2)",
  },
  imgIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});

export default BottomNavigationCN;
