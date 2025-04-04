import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SideNavigationCN from "../../Components/SideNavigationCN";
import BottomNavigationCN from "../../Components/BottomNavigationCN";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAutomaticLogout } from "../../screens/AutoLogout";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreenCN = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "Trevin Perera",
    profileImage: null,
  });
  const defaultImage = require("../../assets/ChatAvatar.png");

  // Reset timer and modal states when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
      setShowLogoutModal(false);
    }, [])
  );

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Load profile data when screen focuses
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedProfileData = await AsyncStorage.getItem("userProfile");
        if (storedProfileData !== null) {
          const userData = JSON.parse(storedProfileData);
          setProfileData({
            fullName: userData.fullName,
            profileImage: userData.profileImage,
          });
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadProfileData();

    // Focus listener to reload data when returning to screen
    const unsubscribe = navigation.addListener("focus", () => {
      loadProfileData();
    });

    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

  const toggleMenu = useCallback(() => {
    resetTimer();
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen, resetTimer]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    resetTimer();
    setShowLogoutModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  const menuItems = [
    {
      title: "Profile",
      icon: <Feather name="user" size={24} color="#0C6478" />,
      route: "UserProfile",
    },
    {
      title: "Privacy Policy",
      icon: <MaterialIcons name="privacy-tip" size={24} color="#0C6478" />,
      route: "TermsPrivacy",
    },
    {
      title: "Password Reset",
      icon: <MaterialIcons name="lock-reset" size={24} color="#0C6478" />,
      route: "PWDReset",
    },
    {
      title: "Contact Us",
      icon: <Feather name="phone" size={24} color="#0C6478" />,
      route: "ContactUs",
    },
    {
      title: "Logout",
      icon: <MaterialIcons name="logout" size={24} color="#ff4757" />,
      isLogout: true,
    },
  ];

  const handleMenuItemPress = (item) => {
    resetTimer();
    if (item.isLogout) {
      handleLogout();
    } else {
      navigation.navigate(item.route);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["#09D1C7", "#35AFEA"]}
        style={styles.headerGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <Ionicons
              name={isMenuOpen ? "close" : "menu"}
              size={30}
              color="black"
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>My Profile</Text>
        </View>

        {/* Profile Section */}
        <View
          style={styles.profileSection}
          onTouchStart={handleUserInteraction}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profileData.profileImage
                  ? { uri: profileData.profileImage }
                  : defaultImage
              }
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                resetTimer();
                navigation.navigate("EditProfile");
              }}
            >
              <Feather name="edit" size={20} color="#0C6478" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profileData.fullName}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text
                  style={[
                    styles.menuItemText,
                    item.route === "Logout" && styles.logoutText,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Feather
                  name="chevron-right"
                  size={24}
                  color={item.route === "Logout" ? "#ff4757" : "#35AFEA"}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetTimer();
                  setShowLogoutModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Side Navigation Overlay */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigationCN navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  menuButton: {
    padding: 5,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
  },
  profileSection: {
    alignItems: "center",
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#fff",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.85,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  menuContainer: {
    padding: 15,
    backgroundColor: "#f8f9fa",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemRight: {
    opacity: 0.7,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#333",
    fontWeight: "500",
  },
  logoutText: {
    color: "#ff4757",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1,
  },
  overlayBackground: {
    flex: 1,
  },
  // modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#35AFEA",
  },
  logoutButton: {
    backgroundColor: "#35AFEA",
  },
  cancelButtonText: {
    color: "#35AFEA",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ProfileScreenCN;
