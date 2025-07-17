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

const SIGNOUT_API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signOut";

const REFRESH_TOKEN_API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/mobile/refreshToken";

const ProfileScreenC = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      // Validate token when screen comes into focus
      ensureValidToken();
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

  const showLogout = () => {
    setShowLogoutModal(true);
  };

  // Check if the access token has expired
  const isTokenExpired = async () => {
    try {
      const tokenExpiry = await AsyncStorage.getItem("tokenExpiry");

      if (!tokenExpiry) {
        console.log("No token expiry found in storage");
        return true;
      }

      const expiryTime = parseInt(tokenExpiry, 10);
      const currentTime = Date.now();

      // Add a 5-minute buffer to refresh token before it actually expires
      const bufferTime = 5 * 60 * 1000;

      const isExpired = currentTime >= expiryTime - bufferTime;

      console.log(`Token expiry check: ${isExpired ? "EXPIRED" : "VALID"}`);

      return isExpired;
    } catch (error) {
      console.error("Error checking token expiry:", error);
      return true;
    }
  };

  // Refresh the access token using the refresh token
  const refreshAccessToken = async () => {
    try {
      console.log("Attempting to refresh access token...");

      const refreshToken = await AsyncStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("No refresh token found in storage");
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please login again."
        );
        return false;
      }

      const response = await fetch(REFRESH_TOKEN_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      const statusCode = data.statusCode;

      console.log("Token refresh response status:", statusCode);

      switch (statusCode) {
        case 200:
          console.log("Access token refreshed successfully");

          if (parsedBody.tokens) {
            await AsyncStorage.setItem(
              "accessToken",
              parsedBody.tokens.accessToken
            );

            const newExpiryTime =
              Date.now() + parsedBody.tokens.expiresIn * 1000;
            await AsyncStorage.setItem("tokenExpiry", newExpiryTime.toString());

            // Handle refresh token rotation if enabled (Else same refresh token will work)
            if (parsedBody.tokens.refreshToken) {
              console.log("New refresh token received - updating storage");
              await AsyncStorage.setItem(
                "refreshToken",
                parsedBody.tokens.refreshToken
              );
            }

            console.log("New tokens saved to AsyncStorage");
            return true;
          } else {
            console.error("No tokens in refresh response");
            return false;
          }

        case 401:
          console.log("Refresh token is invalid or expired");
          Alert.alert(
            "Session Expired",
            "Your session has expired. Please login again."
          );
          await clearAuthData();
          welcomeNavigation();
          return false;

        case 400:
          console.error("Invalid parameter in refresh request");
          Alert.alert(
            "Error",
            parsedBody.message || "Invalid request parameters"
          );
          return false;

        case 404:
          console.error("User pool or user not found");
          Alert.alert("Error", "User account not found");
          await clearAuthData();
          welcomeNavigation();
          return false;

        case 429:
          console.error("Too many refresh requests");
          Alert.alert("Error", "Too many requests. Please try again later.");
          return false;

        case 500:
        default:
          console.error("Internal error during token refresh");
          Alert.alert(
            "Error",
            parsedBody.message ||
              "An error occurred while refreshing your session. Please try again."
          );
          return false;
      }
    } catch (error) {
      console.error("Token refresh request error:", error);
      Alert.alert(
        "Connection Error",
        "Unable to refresh your session. Please check your internet connection."
      );
      return false;
    }
  };

  // Validate token and refresh if necessary before making API calls
  const ensureValidToken = async () => {
    try {
      console.log("Checking token validity...");

      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        console.log("No access token found");
        Alert.alert("Session Expired", "Please login again.");
        await clearAuthData();
        welcomeNavigation();
        return false;
      }

      const tokenExpired = await isTokenExpired();

      if (tokenExpired) {
        console.log("Token is expired, attempting to refresh...");
        const refreshSuccessful = await refreshAccessToken();

        if (!refreshSuccessful) {
          console.log("Token refresh failed");
          return false;
        }

        console.log("Token refreshed successfully");
      } else {
        console.log("Token is still valid");
      }

      return true;
    } catch (error) {
      console.error("Error in ensureValidToken:", error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Ensure we have a valid token before attempting logout
      const tokenValid = await ensureValidToken();

      if (!tokenValid) {
        Alert.alert("Tokens are invalid", "Please login again.");
        await clearAuthData();
        welcomeNavigation();
        return;
      }

      // Get the access token from AsyncStorage
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (!accessToken) {
        Alert.alert("Error", "No access token found.");
        await clearAuthData();
        welcomeNavigation();
        return;
      }

      // Call the logout API endpoint
      const response = await fetch(SIGNOUT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: accessToken,
        }),
      });

      const data = await response.json();
      const parsedBody = JSON.parse(data.body);
      const statusCode = data.statusCode;

      console.log("Logout response status:", statusCode);

      // Handle response based on status code
      switch (statusCode) {
        case 200:
          // Successful logout
          console.log("Successfully logged out");
          await clearAuthData();
          welcomeNavigation();
          break;

        case 401: // NotAuthorizedException
          // Token is invalid/expired, user needs to login again anyway
          console.log("Token invalid or expired");
          Alert.alert(
            "Session Expired",
            "Your session has expired. Please login again."
          );
          await clearAuthData();
          welcomeNavigation();
          break;

        case 400: // InvalidParameterException
          Alert.alert(
            "Error",
            parsedBody.message || "Invalid request parameters"
          );
          break;

        case 404: // ResourceNotFoundException
          Alert.alert("Error", "User account not found");
          await clearAuthData();
          welcomeNavigation();
          break;

        case 429: // TooManyRequestsException
          Alert.alert("Too many requests. Please try again later.");
          break;

        case 500: // InternalErrorException or UnknownError
        default:
          Alert.alert(
            "Error",
            parsedBody.message ||
              "An unknown error occurred. Please try again later."
          );
          break;
      }
    } catch (error) {
      console.error("Logout request error:", error);
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } finally {
      setShowLogoutModal(false);
      setIsLoading(false);
    }
  };

  const clearAuthData = async () => {
    try {
      // Remove all auth-related items from storage
      const keysToRemove = [
        "accessToken",
        "refreshToken",
        "tokenExpiry",
        "userData",
      ];
      await Promise.all(
        keysToRemove.map((key) => AsyncStorage.removeItem(key))
      );
      console.log("Auth data cleared from storage");
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  const welcomeNavigation = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  const confirmLogout = () => {
    resetTimer();
    handleLogout();
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
      showLogout();
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
                <Text style={styles.logoutButtonText}>
                  {isLoading ? "Logging Out..." : "Yes, Logout"}
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
});

export default ProfileScreenC;
