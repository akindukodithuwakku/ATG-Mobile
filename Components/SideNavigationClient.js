import React from "react";
import { Text, TouchableOpacity, StyleSheet, Image, Animated } from "react-native";
import { Ionicons, Foundation } from "@expo/vector-icons";

const SideNavigationClient = ({ navigation, onClose, activeRoute, setActiveRoute }) => {
  const [slideAnim] = React.useState(new Animated.Value(-300)); // Slide-in animation

  // Menu items with routes and icons
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

  // Slide-in animation when the component mounts
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.header}>Menu</Text>

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.menuItem,
            activeRoute === item.name && styles.activeMenuItem, // Highlight active item
          ]}
          onPress={() => {
            setActiveRoute(item.name); // Set the active route
            navigation.navigate(item.route);
            onClose();
          }}
        >
          {typeof item.icon === "string" ? (
            item.icon === "clipboard-notes" ? (
              <Foundation name="clipboard-notes" size={24} color="white" style={styles.icon} />
            ) : (
              <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
            )
          ) : (
            <Image source={item.icon} style={styles.icon} />
          )}
          <Text style={[styles.menuText, activeRoute === item.name && styles.activeText]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 30,
    bottom: 0,
    width: "80%",
    backgroundColor: "#35AFEA",
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "white",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#2a8ac7",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  },
  activeMenuItem: {
    backgroundColor: "#09D1C7",
  },
  activeText: {
    color: "#fff",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#fff",
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default SideNavigationClient;
