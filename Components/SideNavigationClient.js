import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons, Foundation } from "@expo/vector-icons";

const SideNavigationClient = ({ navigation, onClose }) => {
  const menuItems = [
    { name: "Home", icon: "home-outline", route: "ClientDashboard" },
    { name: "CarePlan Management", icon: "clipboard-notes", route: "CarePlan" },
    {
      name: "Medication Management",
      icon: require("../assets/CarePlanIcon.png"),
      route: "Medication",
    },
    { name: "Profile", icon: "person-outline", route: "Profile" },
  ];

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={30} color="black" />
      </TouchableOpacity>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => {
            navigation.navigate(item.route);
            onClose();
          }}
        >
          {typeof item.icon === "string" ? (
            item.icon === "clipboard-notes" ? (
              <Foundation name="clipboard-notes" size={24} color="black" style={styles.icon} />
            ) : (
              <Ionicons name={item.icon} size={24} color="black" style={styles.icon} />
            )
          ) : (
            <Image source={item.icon} style={styles.icon} />
          )}
          <Text style={styles.menuText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "70%",
    backgroundColor: "#f8f9fa",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default SideNavigationClient;
