import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useAutomaticLogout } from "../screens/AutoLogout";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const HandleAppointmentsCN = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clientUsername, setClientUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  const toggleMenu = () => {
    resetTimer();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCancelAppointment = async () => {
    resetTimer();
    if (!clientUsername.trim()) {
      setError("Please enter a client username");
      return;
    }

    setIsLoading(true);
    setError("");

    // Database update for appointment cancelling
    try {
      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cancel_appointment",
          data: {
            client_username: clientUsername.trim().toLowerCase(),
          }
        }),
      });
      
      const result = await response.json();
      console.log("Appointment cancellation result:", result);
      if (result.statusCode === 200) {
        setIsLoading(false);
        console.log("Appointment marked as cancelled");
        Alert.alert(
          "Success",
          `Appointment for client "${clientUsername}" has been cancelled.`,
          [{ text: "OK", onPress: () => resetTimer() }]
        );
      } else {
        console.warn("Failed to mark appointment as cancelled:", result);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    } finally {
      setIsLoading(false);
      setClientUsername("");
    }
  };

  const handleGoToCalendar = () => {
    console.log("Calendar! Navigating to Google Calendar screen.")
    resetTimer();
    navigation.navigate("CalendarCN");
  };

  return (
    <View style={styles.container} onTouchStart={handleUserInteraction}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

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
          <Text style={styles.headerText}>Manage Appointments</Text>
        </View>
      </LinearGradient>

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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        onScrollBeginDrag={handleUserInteraction}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#35AFEA"
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Enter a client's username to cancel their scheduled appointment
          </Text>
        </View>

        <Text style={styles.inputLabel}>Client Username</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter client username"
            value={clientUsername}
            onChangeText={(text) => {
              resetTimer();
              setClientUsername(text);
              if (error) setError("");
            }}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelAppointment}
          disabled={isLoading}
        >
          <LinearGradient
            colors={["#FF5F6D", "#FF9666"]}
            style={styles.gradientButton}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              {isLoading ? "Processing..." : "Cancel Appointment"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.calendarButton}
          onPress={handleGoToCalendar}
        >
          <LinearGradient
            colors={["#09D1C7", "#35AFEA"]}
            style={styles.gradientButton}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Go to Calendar</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Appointment Management</Text>
          <Text style={styles.helpText}>
            This screen allows you to cancel appointments that have been
            scheduled by clients. You can view upcoming appointments in your
            calendar. If you need to discuss an appointment with a client before
            cancelling, please use the chat feature to contact them directly.
          </Text>
        </View>
      </ScrollView>

      <BottomNavigationCN navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  menuButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 15,
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  contentContainer: {
    padding: 20,
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
  infoBox: {
    backgroundColor: "#E9F6FE",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#444444",
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginBottom: 10,
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginBottom: 10,
  },
  cancelButton: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 15,
  },
  calendarButton: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  helpSection: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444444",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});

export default HandleAppointmentsCN;
