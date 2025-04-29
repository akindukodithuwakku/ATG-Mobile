import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const Appointments = ({ navigation }) => {

  // Replace this with the care navigator's calendar URL
  // const calendarUrl = 'https://calendar.google.com/calendar/embed?src=benjaminalec285%40gmail.com';
  const calanderEmail = "benjaminalec285";
  const calendarUrl = `https://calendar.google.com/calendar/embed?src=${calanderEmail}%40gmail.com`;

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
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Google Calender</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <WebView
          source={{ uri: calendarUrl }}
          style={styles.calendar}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
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
    marginBottom: 60,
  },
  calendar: {
    flex: 1,
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

export default Appointments;
