import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Platform,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SideNavigationClient from "../../Components/SideNavigationClient";
import BottomNavigationClient from "../../Components/BottomNavigationClient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAutomaticLogout } from "../../screens/AutoLogout";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreenC = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearDataConfirmText, setClearDataConfirmText] = useState("");
  const [profileData, setProfileData] = useState({
    fullName: "Jane Doe",
    profileImage: null,
  });
  const defaultImage = require("../../assets/ChatAvatar.png");

  // Reset timer and modal states when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
      setShowLogoutModal(false);
      setShowClearDataModal(false);
      setClearDataConfirmText("");
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

  const handleClearData = () => {
    setShowClearDataModal(true);
  };

  const clearStorage = async () => {
    resetTimer();
    try {
      await AsyncStorage.clear();
      console.log("AsyncStorage has been cleared!");
      setShowClearDataModal(false);
      setClearDataConfirmText("");

      // Success alert
      Alert.alert(
        "Data Cleared",
        "All app data has been successfully cleared.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Failed to clear AsyncStorage:", error);

      // Error alert
      Alert.alert("Error", "Failed to clear app data. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  const clearAppointmentData = async () => {
    resetTimer();
    try {
      await AsyncStorage.removeItem("appointmentDateTime");
      await AsyncStorage.removeItem("hasAppointment");

      setShowClearDataModal(false);
      setClearDataConfirmText("");

      Alert.alert(
        "Appointment Data Cleared",
        "Your appointment data has been successfully cleared.",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to clear appointment data. Please try again.",
        [{ text: "OK" }]
      );
    }
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
    {
      title: "Clear App Data",
      icon: <MaterialIcons name="delete-forever" size={24} color="#ff4757" />,
      isClearData: true,
    },
  ];

  const handleMenuItemPress = (item) => {
    resetTimer();
    if (item.isLogout) {
      handleLogout();
    } else if (item.isClearData) {
      handleClearData();
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
                    item.isLogout && styles.logoutText,
                    item.isClearData && styles.dangerText,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                <Feather
                  name="chevron-right"
                  size={24}
                  color={
                    item.isLogout || item.isClearData ? "#ff4757" : "#35AFEA"
                  }
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

      {/* Clear Data Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showClearDataModal}
        onRequestClose={() => {
          setShowClearDataModal(false);
          setClearDataConfirmText("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons
              name="warning"
              size={40}
              color="#ff4757"
              style={styles.warningIcon}
            />
            <Text style={styles.modalTitle}>Clear All App Data?</Text>
            <Text style={styles.modalText}>
              This action will permanently delete all your saved data and cannot
              be undone.
            </Text>
            <Text style={styles.confirmInstructionText}>
              Type "DELETE" to confirm:
            </Text>
            <View style={styles.confirmInputContainer}>
              <Text style={styles.confirmInputText}>
                {clearDataConfirmText}
              </Text>
            </View>
            <View style={styles.keypadContainer}>
              {["D", "E", "L", "T"].map((letter, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.keypadButton}
                  onPress={() => {
                    resetTimer();
                    setClearDataConfirmText(clearDataConfirmText + letter);
                  }}
                >
                  <Text style={styles.keypadButtonText}>{letter}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.keypadButton}
                onPress={() => {
                  resetTimer();
                  setClearDataConfirmText(clearDataConfirmText.slice(0, -1));
                }}
              >
                <Feather name="delete" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetTimer();
                  setShowClearDataModal(false);
                  setClearDataConfirmText("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.dangerButton,
                  clearDataConfirmText !== "DELETE" && styles.disabledButton,
                ]}
                onPress={
                  clearDataConfirmText === "DELETE" ? clearStorage : null
                }
                disabled={clearDataConfirmText !== "DELETE"}
              >
                <Text
                  style={[
                    styles.dangerButtonText,
                    clearDataConfirmText !== "DELETE" &&
                      styles.disabledButtonText,
                  ]}
                >
                  Clear Data
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Side Navigation Overlay */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigationClient navigation={navigation} />
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
    marginBottom: 60,
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
  dangerText: {
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
  // Clear modal styles
  warningIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  confirmInstructionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 10,
  },
  confirmInputContainer: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  confirmInputText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff4757",
  },
  keypadContainer: {
    flexDirection: "row",
    // flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  keypadButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    margin: 5,
  },
  keypadButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dangerButton: {
    backgroundColor: "#ff4757",
  },
  disabledButton: {
    backgroundColor: "#ffa0aa",
  },
  dangerButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButtonText: {
    opacity: 0.7,
  },
});

export default ProfileScreenC;
