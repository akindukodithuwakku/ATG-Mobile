import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";

const MedicationLogScreen = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme();
  const menuAnimation = new Animated.Value(isMenuOpen ? 1 : 0);

  const client_username = "kavindya_02"; // Replace this dynamically if needed

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: isMenuOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchMedicationLogs = async () => {
    try {
      const response = await fetch(
        `https://rsxn7kxzr6.execute-api.ap-south-1.amazonaws.com/prod/getMedicationLogs?client_username=${client_username}`
      );
      const data = await response.json();

      if (response.ok && data.medications) {
        setLogs(data.medications);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch medication logs.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to fetch medication logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicationLogs();
  }, []);

  const formatDateTime = (datetimeString) => {
    if (!datetimeString) return "❌ Not Taken";

    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) {
      // If schedule_time is in string format like "Morning", "8AM", etc.
      return datetimeString;
    }
    return date.toLocaleString();
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.medName}>{item.name || item.medication_name}</Text>
      <Text style={styles.detail}>💊 Dosage: {item.dosage}</Text>
      <Text style={styles.detail}>
        🗓 Scheduled:{" "}
        {formatDateTime(item.schedule_time || item.scheduled_time)}
      </Text>
      <Text style={styles.detail}>🕒 Taken: {formatDateTime(item.taken_time)}</Text>
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
        <Text style={styles.headerText}>Medication Intake Log</Text>
      </View>

      {isMenuOpen && (
        <Animated.View style={[styles.overlay, { opacity: menuAnimation }]}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity style={styles.overlayBackground} onPress={toggleMenu} />
        </Animated.View>
      )}

      <SafeAreaView style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#00AEEF" />
        ) : logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No medication intake history found.</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            renderItem={renderLogItem}
            contentContainerStyle={styles.listContent}
          />
        )}

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("MedicationC")}
        >
          <Text style={styles.navButtonText}>Go to Medication Management</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

export default MedicationLogScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
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
  listContent: {
    paddingBottom: 16,
  },
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
  detail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
  },
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
