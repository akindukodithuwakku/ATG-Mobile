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
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppointmentScheduling = ({ navigation }) => {
  // Database call to retrive the calendly name
  const calanderEmail = "kavindyagamage";
  const calendlyUrl = `https://calendly.com/${calanderEmail}`; // Your Calendly URL
  const webViewRef = useRef(null);
  const [bookingProcessed, setBookingProcessed] = useState(false);

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
      if (bookingProcessed) return;

      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "booking_response") {
        setBookingProcessed(true);
        saveBookingData(data.data);
        Alert.alert(
          "Booking Confirmed",
          "Your appointment has been scheduled successfully!"
        );
        setBookingProcessed(false);
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

      // Convert UTC time to local timezone
      const localStartTime = new Date(startTime);
      console.log("Fetched local start time: " + localStartTime);

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        "appointmentDateTime",
        localStartTime.toISOString()
      );
      await AsyncStorage.setItem("hasAppointment", "true");

      // Read async to retrieve the note from readiness
      // Query appointment data to the database (clientName, localStartTime, status, timeStamp, notes (Received and saved from questionnaire))

      console.log(
        "Appointment saved to storage:",
        localStartTime.toISOString()
      );
    } catch (error) {
      console.error("Error saving booking to storage:", error);
      Alert.alert(
        "Error",
        "Failed to save appointment information. Please try again."
      );
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Appointment Scheduling</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.greetingText}>
          Hello, welcome to the appointment scheduler!
        </Text>

        <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            source={{ uri: calendlyUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleWebViewMessage}
          />
        </View>
      </ScrollView>

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
});

export default AppointmentScheduling;
