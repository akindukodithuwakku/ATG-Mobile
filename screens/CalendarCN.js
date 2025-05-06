import React, { useState, useCallback, useEffect } from "react";
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
  const [apiError, setApiError] = useState(false);

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
          }
        } catch (error) {
          console.error("Error getting username from AsyncStorage:", error);
          setApiError(true);
        }
      };

      getUserAndCalendly();
    }, [])
  );

  // Fetch calendly name from database
  const fetchCalendlyName = async (storedUsername) => {
    try {
      resetTimer();
      setIsLoading(true);
      setApiError(false);

      const nameToUse = storedUsername.trim() || cnUsername.trim();

      if (!nameToUse) {
        console.error("Username is missing");
        setApiError(true);
        setIsLoading(false);
        return;
      }
      console.log("nameToUse:", nameToUse);

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
      const parsedResult = JSON.parse(result.body);
      console.log(result);

      if (response.ok && parsedResult.calendly_name) {
        setCalendlyName(parsedResult.calendly_name);
      } else {
        console.error("Error fetching CN calendly name:", parsedResult.error);
        setApiError(true);
      }
    } catch (error) {
      console.error("Error fetching CN calendly name:", error);
      setApiError(true);
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

  const handleLoadError = () => {
    resetTimer();
    setIsLoading(false);
    setCalendarError(true);
  };

  // JavaScript to inject for better mobile viewing experience
  const injectedJavaScript = `
    document.body.style.overflow = 'hidden';
    document.querySelector('.gb_Bd.gb_Cd').style.display = 'none';
    true;
  `;

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

        {apiError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="person-outline" size={60} color="#CCCCCC" />
            <Text style={styles.errorTitle}>Calendar Not Available</Text>
            <Text style={styles.errorText}>
              Could not find calendar information for this care navigator.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                resetTimer();
                fetchCalendlyName();
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
        ) : calendarError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="calendar-outline" size={60} color="#CCCCCC" />
            <Text style={styles.errorTitle}>Calendar Unavailable</Text>
            <Text style={styles.errorText}>
              There was a problem loading the calendar. Please check your
              internet connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                resetTimer();
                setCalendarError(false);
                setIsLoading(true);
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
