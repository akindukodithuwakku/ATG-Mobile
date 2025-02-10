import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, Foundation } from '@expo/vector-icons';

const BottomNavigationClient = ({ navigation }) => {
  const menuItems = [
    { name: "Home", icon: "home-outline", route: "ClientDashboard" },
    { name: "CarePlan", icon: "clipboard-notes", route: "CarePlan" },
    {
      name: "Medication",
      icon: require("../assets/CarePlanIcon.png"),
      route: "Medication",
    },
    { name: "Profile", icon: "person-outline", route: "Profile" },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.route)}
        >
          {typeof item.icon === "string" ? (
            item.icon === "clipboard-notes" ? (
              <Foundation name="clipboard-notes" size={24} color="#666" />
            ) : (
              <Ionicons name={item.icon} size={24} color="#666" />
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default BottomNavigationClient;