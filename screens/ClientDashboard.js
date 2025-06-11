import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import ReadinessQuestionnaire from "./ReadinessQuestionnaire";
import {
  Ionicons,
  Foundation,
  Feather,
  FontAwesome,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useAutomaticLogout } from "../screens/AutoLogout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const ClientDashboard = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasAppointment, setHasAppointment] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [username, setUsername] = useState("");
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Reset timer when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
    }, [])
  );

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Fetch username on component mount
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("appUser");
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, []);

  // Check for existing appointment on component mount
  useEffect(() => {
    const checkAppointment = async () => {
      if (!username) return;

      try {
        // Fetch active appointment from database
        const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "get_active_appointment",
            data: {
              client_username: username,
            },
          }),
        });

        const result = await response.json();
        const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

        if (result.statusCode === 200) {
          const appointmentData = parsedBody;

          if (
            appointmentData.hasAppointment &&
            appointmentData.appointmentDateTime
          ) {
            const appointmentDate = new Date(
              appointmentData.appointmentDateTime
            );

            // Set state for UI
            setHasAppointment(true);
            setAppointmentTime(appointmentDate.getTime());

            await AsyncStorage.setItem("hasAppointment", "true");
          } else {
            // No active appointment found
            setHasAppointment(false);
            setAppointmentTime(null);

            // Clean up AsyncStorage
            await AsyncStorage.removeItem("hasAppointment");
          }
        } else {
          throw new Error(
            parsedBody?.error || "Failed to fetch appointment data"
          );
        }
      } catch (error) {
        console.error("Error checking appointment:", error);
        setHasAppointment(false);
        setAppointmentTime(null);
      }
    };

    if (username) {
      checkAppointment();
    }

    // Check for appointment updates whenever the dashboard is focused
    const unsubscribe = navigation.addListener("focus", () => {
      if (username) {
        checkAppointment();
      }
    });

    return unsubscribe;
  }, [navigation, username]);

  // Update countdown timer
  useEffect(() => {
    if (!hasAppointment || !appointmentTime) return;

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = appointmentTime - now;

      // If appointment time has passed, clear the appointment
      if (distance < 0) {
        clearInterval(intervalId);
        setHasAppointment(false);
        setAppointmentTime(null);

        // Clear from storage
        AsyncStorage.removeItem("hasAppointment");
        
        // Call API to complete the appointment
        const completeAppointment = async () => {
          try {
            const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "complete_appointment",
                data: {
                  client_username: username
                }
              }),
            });
            
            const result = await response.json();
            console.log("Appointment completion result:", result);
            if (result.statusCode === 200) {
              console.log("Appointment marked as completed");
            } else {
              console.warn("Failed to mark appointment as completed:", result);
            }
          } catch (error) {
            console.error("Error completing appointment:", error);
          }
        };
        
        completeAppointment();
        return;
      }

      // Calculate time units
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [hasAppointment, appointmentTime]);

  const toggleMenu = useCallback(() => {
    resetTimer();
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen, resetTimer]);

  const navigateToScreen = useCallback(
    (screenName) => {
      resetTimer();
      navigation.navigate(screenName);
    },
    [navigation, resetTimer]
  );

  const navigateToReadiness = useCallback(() => {
    setShowQuestionnaire(true);
  }, []);

  const handleCloseQuestionnaire = () => {
    setShowQuestionnaire(false);
  };

  // Function to format countdown numbers with leading zeros
  const formatNumber = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  // Render appointment countdown component
  const renderAppointmentCountdown = () => {
    return (
      <View style={styles.countdownContainer}>
        <Text style={styles.countdownTitle}>Appointment Countdown</Text>
        <View style={styles.countdownRow}>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>
              {formatNumber(countdown.days)}
            </Text>
            <Text style={styles.countdownLabel}>Days</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>
              {formatNumber(countdown.hours)}
            </Text>
            <Text style={styles.countdownLabel}>Hours</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>
              {formatNumber(countdown.minutes)}
            </Text>
            <Text style={styles.countdownLabel}>Minutes</Text>
          </View>
          <Text style={styles.countdownSeparator}>:</Text>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>
              {formatNumber(countdown.seconds)}
            </Text>
            <Text style={styles.countdownLabel}>Seconds</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleUserInteraction}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <LinearGradient
        colors={["#09D1C7", "#35AFEA"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
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
            />
            <Image
              source={require("../assets/Ayman_Logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.headerText}>DASHBOARD</Text>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigateToScreen("NotificationsC")}
          >
            <Ionicons name="notifications-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Overlay for Side Navigation */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}

      {/* Dashboard Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={handleUserInteraction}
      >
        {/* Conditional rendering: either appointment countdown or consultation button */}
        {hasAppointment ? (
          renderAppointmentCountdown()
        ) : (
          <TouchableOpacity
            style={styles.consultationButton}
            onPress={() => {
              navigateToReadiness();
              handleUserInteraction();
            }}
          >
            <Text style={styles.consultationButtonText}>
              Need a Consultation?
            </Text>
          </TouchableOpacity>
        )}
        {/* Main Navigation Cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigateToScreen("CarePlanC")}
          >
            <LinearGradient
              colors={["#6a3093", "#a044ff"]}
              style={styles.cardGradient}
            >
              <View style={styles.carePlanIcon}>
                {/* Heart */}
                <FontAwesome
                  name="plus"
                  size={24}
                  color="black"
                  style={styles.heartIcon}
                />
                {/* Hands */}
                <FontAwesome5
                  name="hands"
                  size={24}
                  color="black"
                  style={styles.handIcon}
                />
              </View>
              <Text style={styles.cardTitle}>Care Plan</Text>
              <Text style={styles.cardSubtitle}>
                View and manage your personalized care plan.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigateToScreen("MedicationC")}
          >
            <LinearGradient
              colors={["#FF512F", "#DD2476"]}
              style={styles.cardGradient}
            >
              <Foundation name="clipboard-notes" size={32} color="black" />
              <Text style={styles.cardTitle}>Medication Management</Text>
              <Text style={styles.cardSubtitle}>
                Track your medications and prescriptions.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          {/* Documents Upload Button */}
          <TouchableOpacity
            style={styles.documentsButton}
            onPress={() => navigateToScreen("DocumentC")}
          >
            <Ionicons name="document-text-outline" size={24} color="white" />
            <Text style={styles.documentsButtonText}>Documents Upload</Text>
          </TouchableOpacity>

          {/* Chat Icon */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigateToScreen("Chat")}
          >
            <View style={styles.chatIconContainer}>
              <Feather
                name="message-circle"
                size={62}
                color="#09D1C7"
                style={styles.mirroredIcon}
              />
              <Image
                source={require("../assets/ChatAvatar.png")}
                style={styles.chatAvatar}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationClient navigation={navigation} />

      <ReadinessQuestionnaire
        visible={showQuestionnaire}
        onClose={handleCloseQuestionnaire}
        navigation={navigation}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
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
    width: 30,
    alignItems: "flex-end",
    marginRight: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  consultationButton: {
    backgroundColor: "#4479D4",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  consultationButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  countdownContainer: {
    backgroundColor: "#E6F2FF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A6D1FF",
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
    color: "#0C6478",
  },
  countdownRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  countdownItem: {
    alignItems: "center",
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  countdownLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  countdownSeparator: {
    fontSize: 24,
    marginHorizontal: 5,
    color: "#333",
    fontWeight: "bold",
  },
  cardContainer: {
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
    shadowRadius: 3.85,
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
    marginTop: -5,
  },
  heartIcon: {
    marginBottom: -10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  documentsButton: {
    backgroundColor: "#666",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    flex: 0.8, // Take up 80% of the row
  },
  documentsButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  chatButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0.2,
  },
  chatIconContainer: {
    position: "relative",
    width: 62,
    height: 62,
  },
  mirroredIcon: {
    transform: [{ scaleX: -1 }], // Flip the icon
    position: "absolute",
  },
  chatAvatar: {
    width: 45,
    height: 45,
    position: "absolute",
    top: 7,
    left: 7,
    borderRadius: 17.5,
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

export default ClientDashboard;
