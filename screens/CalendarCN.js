import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useAutomaticLogout } from "../screens/AutoLogout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const CalendarCN = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isLoading, setIsLoading] = useState(true);
  const [calendarError, setCalendarError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [cnUsername, setCnUsername] = useState("");
  const [calendlyName, setCalendlyName] = useState("");

  // Create calendar URL based on the CN's calendly name
  const calendarUrl = calendlyName
    ? `https://calendar.google.com/calendar/embed?src=${calendlyName}%40gmail.com&mode=WEEK&hl=en`
    : "";

  // Reset timer and fetch calendly_name when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      resetTimer();

      // Get username from AsyncStorage then fetch calendly name
      const getUserAndCalendly = async () => {
        try {
          const storedUsername = await AsyncStorage.getItem("appUser");
          if (storedUsername) {
            setCnUsername(storedUsername);
            fetchCalendlyName(storedUsername);
          } else {
            showError("User information not found. Please login again.");
          }
        } catch (error) {
          console.error("Error getting username from AsyncStorage:", error);
          showError("Failed to retrieve user information.");
        }
      };

      getUserAndCalendly();
    }, [])
  );

  // Function to show errors with an Alert
  const showError = (message) => {
    setErrorMessage(message);
    setCalendarError(true);
    setIsLoading(false);
    Alert.alert("Error", message);
  };

  // Fetch calendly name from database
  const fetchCalendlyName = async (storedUsername) => {
    try {
      resetTimer();
      setIsLoading(true);
      setCalendarError(false);
      setErrorMessage("");

      const nameToUse = storedUsername?.trim() || cnUsername?.trim();

      if (!nameToUse) {
        showError("Username is missing. Please login again.");
        return;
      }

      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_cn_calendly_name",
          data: {
            cn_username: nameToUse,
          },
        }),
      });

      const result = await response.json();
      if (!result.body) {
        throw new Error("Invalid server response format");
      }

      const parsedResult =
        typeof result.body === "string" ? JSON.parse(result.body) : result.body;

      if (parsedResult.calendly_name) {
        setCalendlyName(parsedResult.calendly_name);
      } else if (parsedResult.error) {
        showError(`Calendar error: ${parsedResult.error}`);
      } else {
        showError("Calendar information not found for this user.");
      }
    } catch (error) {
      console.error("Error fetching CN calendly name:", error);
      showError(`Failed to load calendar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Handle WebView loading states
  const handleLoadStart = () => {
    resetTimer();
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    resetTimer();
    setIsLoading(false);
  };

  const handleLoadError = (syntheticEvent) => {
    resetTimer();
    setIsLoading(false);
    const { nativeEvent } = syntheticEvent;
    const errorMessage = nativeEvent?.description || "Failed to load calendar";
    showError(errorMessage);
  };

  // JavaScript to inject for better mobile viewing experience
  const injectedJavaScript = `
    document.body.style.overflow = 'hidden';
    document.querySelector('.gb_Bd.gb_Cd').style.display = 'none';
    true;
  `;

  const renderErrorView = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="calendar-outline" size={60} color="#CCCCCC" />
      <Text style={styles.errorTitle}>Calendar Unavailable</Text>
      <Text style={styles.errorText}>
        {errorMessage ||
          "There was a problem loading the calendar. Please check your internet connection and try again."}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          resetTimer();
          setCalendarError(false);
          fetchCalendlyName(cnUsername);
        }}
      >
        <LinearGradient
          colors={["#09D1C7", "#35AFEA"]}
          style={styles.gradientButton}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

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
          <TouchableOpacity
            onPress={() => {
              resetTimer();
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Calendar View</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#35AFEA" />
            <Text style={styles.loadingText}>Loading calendar...</Text>
          </View>
        )}

        {calendarError ? (
          renderErrorView()
        ) : calendlyName ? (
          <WebView
            source={{ uri: calendarUrl }}
            style={styles.calendar}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleLoadError}
            injectedJavaScript={injectedJavaScript}
          />
        ) : null}
      </View>
    </View>
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
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  backButton: {
    padding: 10,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  calendar: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#444444",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#444444",
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 20,
  },
  retryButton: {
    height: 45,
    width: 120,
    borderRadius: 22.5,
    overflow: "hidden",
    marginTop: 10,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CalendarCN;
