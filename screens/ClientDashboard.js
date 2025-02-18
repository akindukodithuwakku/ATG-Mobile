import React, { useState, useCallback, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
} from "react-native";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import ReadinessQuestionnaire from "./ReadinessQuestionnaire";
import { useAutomaticLogout } from "./AutoLogout";
import { Ionicons, Foundation } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ClientDashboard = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [hasAppointment, setHasAppointment] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const scheme = useColorScheme();

  // Check for existing appointment on component mount
  useEffect(() => {
    const checkAppointment = async () => {
      try {
        const appointmentData = await AsyncStorage.getItem("appointmentData");
        if (appointmentData) {
          const parsedData = JSON.parse(appointmentData);
          const appointmentDate = new Date(parsedData.appointmentTime);

          // Only show appointment if it's in the future
          if (appointmentDate > new Date()) {
            setHasAppointment(true);
            setAppointmentTime(appointmentDate.getTime());
          } else {
            // Clear expired appointment
            await AsyncStorage.removeItem("appointmentData");
            setHasAppointment(false);
          }
        }
      } catch (error) {
        console.error("Error checking appointment:", error);
      }
    };

    checkAppointment();
  }, []);

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
        AsyncStorage.removeItem("appointmentData");
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

  // Reset auto logout timer when dashboard mounts
  useEffect(() => {
    resetTimer();
  }, []);
  
  const handleUserInteraction = () => {
    resetTimer();
  };

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const navigateToNotifications = useCallback(() => {
    navigation.navigate("NotificationsC");
  }, [navigation]);

  const navigateToChat = useCallback(() => {
    navigation.navigate("Chat");
  }, [navigation]);

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
    <TouchableOpacity activeOpacity={1} onPress={handleUserInteraction} style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar
          barStyle={scheme === "dark" ? "light-content" : "dark-content"}
          translucent={true}
          backgroundColor={scheme === "dark" ? "black" : "transparent"}
        />

        {/* Header */}
        <LinearGradient
          colors={["#09D1C7", "#35AFEA"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
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
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Image
              source={require("../assets/Ayman_Logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.headerText}>DASHBOARD</Text>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={navigateToNotifications}
          >
            <Ionicons name="notifications-outline" size={30} color="black" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Overlay for Side Navigation */}
        {isMenuOpen && (
          <View style={styles.overlay}>
            <SideNavigationClient
              navigation={navigation}
              onClose={toggleMenu}
            />
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
        >
          {/* Conditional rendering: either appointment countdown or consultation button */}
          {hasAppointment ? (
            renderAppointmentCountdown()
          ) : (
            <TouchableOpacity
              style={styles.consultationButton}
              onPress={navigateToReadiness}
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
              onPress={() => navigation.navigate("CarePlanC")}
            >
              <LinearGradient
                colors={["#6a3093", "#a044ff"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
              onPress={() => navigation.navigate("MedicationC")}
            >
              <LinearGradient
                colors={["#FF512F", "#DD2476"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
              onPress={() => navigation.navigate("DocumentC")}
            >
              <Ionicons name="document-text-outline" size={24} color="white" />
              <Text style={styles.documentsButtonText}>Documents Upload</Text>
            </TouchableOpacity>

            {/* Chat Icon */}
            <TouchableOpacity
              style={styles.chatButton}
              onPress={navigateToChat}
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
      </View>
    </TouchableOpacity>
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
    marginTop: 30,
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
    width: 40,
    alignItems: "flex-end",
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
