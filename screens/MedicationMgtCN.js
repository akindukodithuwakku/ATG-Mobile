import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Ionicons } from "@expo/vector-icons";

const MedicationMgtCN = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme();

  const care_navigator_username = "cn_alecbenjamin"; // 🔒 Hardcoded ID

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://rsxn7kxzr6.execute-api.ap-south-1.amazonaws.com/dev/viewMedications?care_navigator_id=${care_navigator_username}`
      );
      const result = await response.json();
      const sortedData = (result.medications || []).sort((a, b) =>
        a.full_name?.localeCompare(b.full_name)
      );
      setMedications(sortedData);
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const filteredMedications = medications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (med.full_name &&
        med.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "#121212" : "#f8f9fa"}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>View Medication Management</Text>
      </View>

      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Medication or Client Name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#00AEEF"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={filteredMedications}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : Math.random().toString()
          }
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { flex: 2 }]}>Medication</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Dosage</Text>
              <Text style={[styles.columnHeader, { flex: 2 }]}>Schedule</Text>
              <Text style={[styles.columnHeader, { flex: 1 }]}>Refill</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: 10 }}>
              <View style={styles.medicationRow}>
                <Text style={[styles.medicationText, { flex: 2 }]}>
                  {item.name}
                </Text>
                <Text style={[styles.medicationText, { flex: 1 }]}>
                  {item.dosage}
                </Text>
                <Text style={[styles.medicationText, { flex: 2 }]}>
                  {item.schedule_time}
                </Text>
                <Text style={[styles.medicationText, { flex: 1 }]}>
                  {item.refill_date?.split("T")[0]}
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>
                  Client: {item.full_name || "Unknown"}
                </Text>
                <Text style={styles.cardLabel}>Taken Time:</Text>
                <Text style={styles.cardText}>
                  {item.taken_time
                    ? item.taken_time.replace("T", " ").split(".")[0]
                    : "Not taken yet"}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.tableContainer}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("MarkMedication")}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>✅ Mark Medication Taken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("MedicationLog")}
          style={[styles.navButton, { backgroundColor: "#2196F3" }]}
        >
          <Text style={styles.navButtonText}>📋 View Medication Log</Text>
        </TouchableOpacity>
      </View>

      <BottomNavigationCN navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    marginTop: 30,
  },
  headerText: { fontSize: 20, fontWeight: "bold", marginLeft: 15 },
  searchContainer: { padding: 15 },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: "#f8f9fa",
  },
  tableContainer: { flexGrow: 1, paddingHorizontal: 15 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00AEEF",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  columnHeader: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  medicationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  medicationText: { fontSize: 14, textAlign: "center" },
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
  },
  navButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  navButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  card: {
    backgroundColor: "#f0f8ff",
    padding: 10,
    marginHorizontal: 5,
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cce5ff",
  },
  cardLabel: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
    color: "#333",
  },
  cardText: {
    fontSize: 13,
    color: "#555",
  },
});

export default MedicationMgtCN;
