import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import { markMedicationAsTaken } from "../utils/MedicationNotificationService";

const MarkMedicationTakenScreen = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clientUsername, setClientUsername] = useState(null);
  const menuAnimation = useRef(new Animated.Value(0)).current;

  // Get client username on component mount
  useEffect(() => {
    const getClientUsername = async () => {
      try {
        const username = await AsyncStorage.getItem("appUser");
        setClientUsername(username);
      } catch (error) {
        console.error("Error getting client username:", error);
      }
    };
    getClientUsername();
  }, []);

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: isMenuOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchMedications = async () => {
    if (!clientUsername) {
      console.log("Client username not available yet");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = `https://rsxn7kxzr6.execute-api.ap-south-1.amazonaws.com/prod/getMedicationLogs?client_username=${encodeURIComponent(
        clientUsername
      )}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok && data.medications) {
        setMedications(data.medications);
      } else {
        Alert.alert("Info", "No medications found.");
        setMedications([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("Error", "Failed to fetch medications.");
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine schedule type from schedule_time
  const determineScheduleType = (schedule) => {
    if (!schedule) return "Morning"; // Default fallback

    // If it's a time string like "Morning", "Evening", "Night"
    const scheduleStr = schedule.toString().toLowerCase();
    if (scheduleStr.includes("morning")) return "Morning";
    if (scheduleStr.includes("evening")) return "Evening";
    if (scheduleStr.includes("night")) return "Night";

    // If it's a timestamp, determine by hour
    const parsedTime = Date.parse(schedule);
    if (!isNaN(parsedTime)) {
      const hour = new Date(parsedTime).getHours();
      if (hour >= 6 && hour < 12) return "Morning";
      if (hour >= 12 && hour < 20) return "Evening";
      return "Night";
    }

    // Default fallback
    return "Morning";
  };

  const handleMarkTaken = async (medication_id) => {
    const taken_time = new Date().toISOString();

    if (!medication_id || !taken_time) {
      console.error("❗ Missing medication_id or taken_time");
      Alert.alert("Error", "Invalid medication ID or time.");
      return;
    }

    // Find the medication details
    const medication = medications.find((med) => med.id === medication_id);
    if (!medication) {
      Alert.alert("Error", "Medication not found.");
      return;
    }

    try {
      // First, mark as taken in the notification system to prevent future notifications
      const scheduleType = determineScheduleType(medication.schedule_time);
      await markMedicationAsTaken(
        medication.name,
        medication.dosage,
        scheduleType
      );

      // Then, call the API to mark as taken in the backend
      const response = await fetch(
        "https://rsxn7kxzr6.execute-api.ap-south-1.amazonaws.com/prod/markTaken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ medication_id, taken_time }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMedications((prev) =>
          prev.map((item) =>
            item.id === medication_id
              ? { ...item, taken: true, taken_time }
              : item
          )
        );
        Alert.alert(
          "Success",
          `${medication.name} marked as taken. Notifications for this medication have been stopped.`
        );
      } else {
        throw new Error(data.error || "Failed to mark as taken");
      }
    } catch (error) {
      console.error("❌ Mark taken error:", error);
      Alert.alert(
        "Error",
        "Could not mark medication as taken. Please try again."
      );
    }
  };

  // Updated schedule formatter to handle varchar schedule_info correctly
  const formatSchedule = (schedule) => {
    if (!schedule || schedule.trim() === "") return "❌ Not Set";

    // Try parse as date first
    const parsedTimestamp = Date.parse(schedule);
    if (!isNaN(parsedTimestamp)) {
      // Valid date string — format nicely
      return new Date(parsedTimestamp).toLocaleString();
    }

    // Not a date string — return raw schedule string like "Morning" or "Evening"
    return schedule;
  };

  useEffect(() => {
    if (clientUsername) {
      fetchMedications();
    }
  }, [clientUsername]);

  const renderMedItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.medName}>{item.name}</Text>
      <Text style={styles.detail}>💊 Dosage: {item.dosage}</Text>
      <Text style={styles.detail}>
        🕒 Schedule: {formatSchedule(item.schedule_time)}
      </Text>

      {!item.taken ? (
        <TouchableOpacity
          onPress={() => handleMarkTaken(item.id)}
          style={styles.markButton}
        >
          <Text style={styles.markButtonText}>✅ Mark as Taken</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.takenText}>✔️ Already Taken</Text>
          <Text style={styles.takenTime}>
            🕒 Taken at: {new Date(item.taken_time).toLocaleString()}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color={scheme === "dark" ? "#fff" : "black"}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Mark Medication as Taken</Text>
      </View>

      {isMenuOpen && (
        <Animated.View style={[styles.overlay, { opacity: menuAnimation }]}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </Animated.View>
      )}

      <SafeAreaView style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#00AEEF" />
        ) : medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No medications scheduled.</Text>
          </View>
        ) : (
          <FlatList
            data={medications}
            keyExtractor={(item) =>
              item.id ? item.id.toString() : Math.random().toString()
            }
            renderItem={renderMedItem}
            contentContainerStyle={styles.listContent}
          />
        )}

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("MedicationLog")}
        >
          <Text style={styles.navButtonText}>Go to Medication Log</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

export default MarkMedicationTakenScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "#00AEEF",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
  },
  listContent: { paddingBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  detail: { fontSize: 14, color: "#555", marginBottom: 4 },
  markButton: {
    marginTop: 12,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  markButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  takenText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
    marginTop: 12,
  },
  takenTime: { fontSize: 13, color: "#888", marginTop: 4 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#aaa", textAlign: "center" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    zIndex: 1,
  },
  overlayBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  navButton: {
    backgroundColor: "#00AEEF",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
