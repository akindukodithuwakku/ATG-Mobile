import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useAutomaticLogout } from "../screens/AutoLogout";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const AppointmentScheduling = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const webViewRef = useRef(null);

  const [clientUsername, setClientUsername] = useState("");
  const [calendlyName, setCalendlyName] = useState("");
  const [calendlyError, setCalendlyError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Component level ref to track processed booking IDs
  const processedBookingIds = useRef(new Set());

  // Constructing the Calendly URL of CN based on the fetched calendly name
  const calendlyUrl = calendlyName
    ? `https://calendly.com/${calendlyName}`
    : "";

  // Reset timer and fetch client's CN calendly name when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      resetTimer();
    
      // Clear processed bookings when the screen comes into focus
      processedBookingIds.current.clear();

      // Get username from AsyncStorage then fetch CN's calendly name
      const getClientAndFetchCnCalendly = async () => {
        try {
          const storedUsername = await AsyncStorage.getItem("appUser");
          if (storedUsername) {
            setClientUsername(storedUsername);
            fetchCnCalendlyName(storedUsername);
          } else {
            showError("User information not found. Please login again.");
          }
        } catch (error) {
          console.error("Error getting username from AsyncStorage:", error);
          showError("Failed to retrieve user information.");
        }
      };

      getClientAndFetchCnCalendly();
    }, [])
  );

  // Function to show errors with an Alert
  const showError = (message) => {
    setErrorMessage(message);
    setCalendlyError(true);
    Alert.alert("Error", message);
  };

  // Fetch CN's calendly name for this client from database
  const fetchCnCalendlyName = async (storedUsername) => {
    try {
      resetTimer();
      setCalendlyError(false);
      setErrorMessage("");

      const nameToUse = storedUsername?.trim() || clientUsername?.trim();

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
          action: "get_client_cn_calendly",
          data: {
            client_username: nameToUse,
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
        showError(`Calendly error: ${parsedResult.error}`);
      } else {
        showError(
          "Care Navigator calendly information not found for your account."
        );
      }
    } catch (error) {
      console.error("Error fetching CN calendly name:", error);
      showError(`Failed to load appointment scheduler: ${error.message}`);
    }
  };

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // JavaScript to inject for capturing the booking response
  const injectedJavaScript = `
    (function() {
      // Listen for form submission
      window.addEventListener('message', function(event) {
        if (event.data.type === 'scheduling_modal.booking_completed') {
          window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
        }
      });

      // Listen for XHR requests to capture booking response
      const originalXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        
        xhr.open = function() {
          if (arguments[0] === 'POST' && arguments[1].includes('/api/booking/invitees')) {
            this.addEventListener('load', function() {
              try {
                if (this.status === 200) {  // Only capture successful creation responses
                  const response = JSON.parse(this.responseText);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'booking_response',
                    data: response
                  }));
                }
              } catch (e) {
                console.error('Failed to parse response:', e);
              }
            });
          }
          return originalOpen.apply(this, arguments);
        };
        
        return xhr;
      };
    })();
  `;

  const handleWebViewMessage = (event) => {
    try {
      resetTimer();
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "booking_response") {
        // Create a unique ID from the booking data
        const bookingId =
          data.data?.event?.uri ||
          data.data?.event?.start_time ||
          JSON.stringify(data.data);

        // Check if this booking is already processed 
        if (processedBookingIds.current.has(bookingId)) {
          return;
        }

        // Mark this booking as processed
        processedBookingIds.current.add(bookingId);

        console.log("Processing booking:", bookingId);
        saveBookingData(data.data)
          .then(() => {
            Alert.alert(
              "Booking Confirmed",
              "Your appointment has been scheduled successfully!"
            );
          })
          .catch((error) => {
            console.error("Error in booking:", error);
            processedBookingIds.current.delete(bookingId);
          });
      }
    } catch (error) {
      console.error("Error processing WebView message:", error);
    }
  };

  const saveBookingData = async (bookingData) => {
    try {
      // Extract the start_time from the response
      const startTime = bookingData?.event?.start_time;
      console.log("Fetched UTC start time: " + startTime);

      if (!startTime) {
        throw new Error("No start time found in booking data");
      }

      // Get the client username from AsyncStorage
      const clientUsername = await AsyncStorage.getItem("appUser");
      if (!clientUsername) {
        throw new Error("No username found in storage");
      }

      // Retrieve questionnaire data if available
      let questionnaireData = null;
      let clientNote = "";

      try {
        const pendingQuestionnaireData = await AsyncStorage.getItem(
          "pendingQuestionnaireData"
        );
        if (pendingQuestionnaireData) {
          questionnaireData = JSON.parse(pendingQuestionnaireData);
          clientNote = questionnaireData.clientNote || "";
          console.log("Retrieved questionnaire data from storage");
        } else {
          console.log("No questionnaire data found in storage");
        }
      } catch (questionnaireError) {
        console.warn(
          "Error retrieving questionnaire data:",
          questionnaireError
        );
      }

      // Prepare questionnaire data for database
      const questionnairePayload = questionnaireData
        ? JSON.stringify({
            answers: questionnaireData.answers,
            questions: questionnaireData.questions,
          })
        : null;

      // Save directly to the database
      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_appointment",
          data: {
            client_username: clientUsername,
            local_start_time: startTime,
            client_note: clientNote,
            questionnaire_data: questionnairePayload,
          },
        }),
      });

      const result = await response.json();

      if (result.statusCode === 200) {
        console.log("Appointment saved to database successfully:", result);

        // Clear the pending questionnaire data after successful save
        if (questionnaireData) {
          await AsyncStorage.removeItem("pendingQuestionnaireData");
        }

        // Maintain hasAppointment flag in AsyncStorage for app state management
        await AsyncStorage.setItem("hasAppointment", "true");

        return true;
      } else {
        throw new Error(
          result.body?.error || "Failed to create appointment in database"
        );
      }
    } catch (error) {
      console.error("Error saving booking to database:", error);
      Alert.alert(
        "Error",
        "Failed to save appointment information. Please try again."
      );
      return false;
    }
  };

  // Handle WebView errors
  const handleLoadError = (syntheticEvent) => {
    resetTimer();
    const { nativeEvent } = syntheticEvent;
    const errorMessage = nativeEvent?.description || "Failed to load scheduler";
    showError(errorMessage);
  };

  const renderErrorView = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="calendar-outline" size={60} color="#CCCCCC" />
      <Text style={styles.errorTitle}>Appointment Scheduler Unavailable</Text>
      <Text style={styles.errorText}>
        {errorMessage ||
          "There was a problem loading the appointment scheduler. Please check your internet connection and try again."}
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          resetTimer();
          setCalendlyError(false);
          fetchCnCalendlyName(clientUsername);
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
          <Text style={styles.headerText}>Appointment Scheduling</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {calendlyError ? (
          renderErrorView()
        ) : calendlyName ? (
          <>
            <Text style={styles.greetingText}>
              Schedule an appointment with your Care Navigator
            </Text>
            <WebView
              ref={webViewRef}
              source={{ uri: calendlyUrl }}
              style={styles.calendly}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onError={handleLoadError}
              injectedJavaScript={injectedJavaScript}
              onMessage={handleWebViewMessage}
            />
          </>
        ) : null}
      </View>

      <BottomNavigationClient navigation={navigation} />
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
    padding: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    paddingLeft: 5,
  },
  headerText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  greetingText: {
    textAlign: "center",
    margin: 10,
    paddingBottom: 10,
    fontSize: 18,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#0C6478",
  },
  calendly: {
    flex: 1,
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

export default AppointmentScheduling;
