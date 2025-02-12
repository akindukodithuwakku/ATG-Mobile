import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { Ionicons, Foundation } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

const SideNavigationCN = ({ navigation, onClose }) => {
  const route = useRoute();
  const [slideAnim] = React.useState(new Animated.Value(-300)); // Slide-in animation

  // Menu items with routes and icons
  const menuItems = [
    { name: "Home", icon: "home-outline", route: "CNDashboard" },
    {
      name: "CarePlan",
      icon: require("../assets/CarePlanIcon.png"),
      route: "CarePlanCN",
    },
    {
      name: "Medication",
      icon: "clipboard-notes",
      route: "MedicationCN",
    },
    {
      name: "Appointments",
      icon: "calendar-outline",
      route: "Appointments",
    },
    {
      name: "Notifications",
      icon: "notifications-outline",
      route: "NotificationsCN",
    },
    { name: "Profile", icon: "person-outline", route: "Profile" },
  ];

  // Slide-in animation when the component mounts
  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNavigation = (route) => {
    navigation.navigate(route);
    // onClose();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: slideAnim }] }]}
    >
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
            route.name === item.route && styles.activeMenuItem, // Highlight active item
          ]}
          onPress={() => handleNavigation(item.route)}
        >
          {typeof item.icon === "string" ? (
            item.icon === "clipboard-notes" ? (
              <Foundation
                name="clipboard-notes"
                size={24}
                color="#363636"
                marginLeft={5}
              />
            ) : (
              <Ionicons name={item.icon} size={24} color="#363636" />
            )
          ) : (
            <Image source={item.icon} style={styles.imgIcon} />
          )}
          <Text
            style={[
              styles.menuText,
              route.name === item.route && styles.activeText,
            ]}
          >
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
  imgIcon: {
    width: 24,
    height: 28,
    // resizeMode: "contain",
  },
});

export default SideNavigationCN;
