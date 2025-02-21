import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  TextInput,
  FlatList,
} from "react-native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Ionicons } from "@expo/vector-icons";

// Sample data for medication details
const medicationData = [
  { id: '1', name: 'Aspirin', dosage: '100 mg', schedule: 'Once a day', refillDate: '2024-01-15' },
  { id: '2', name: 'Metformin', dosage: '500 mg', schedule: 'Once a day', refillDate: '2024-01-20' },
  { id: '3', name: 'Amoxicillin', dosage: '250 mg', schedule: 'Three times a day', refillDate: '2024-01-25' },
];

const MedicationMgtCN = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientName, setClientName] = useState(""); // Dynamic client name
  const scheme = useColorScheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Filtered data based on search query
  const filteredMedications = medicationData.filter((med) =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "#121212" : "#f8f9fa"}
      />

      {/* Header with Hamburger Icon */}
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

      {/* Overlay for Side Navigation */}
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Medication Name"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Client Name Input */}
      <View style={styles.clientInfo}>
        <Text style={styles.label}>Client Name:</Text>
        <TextInput
          style={styles.clientNameInput}
          placeholder="Enter Client Name"
          value={clientName}
          onChangeText={setClientName}
        />
      </View>

      {/* Scrollable Table */}
      <FlatList
        data={filteredMedications}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          // Table Header
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { flex: 2 }]}>Medication</Text>
            <Text style={[styles.columnHeader, { flex: 1 }]}>Dosage</Text>
            <Text style={[styles.columnHeader, { flex: 2 }]}>Schedule</Text>
            <Text style={[styles.columnHeader, { flex: 1 }]}>Refill Date</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.medicationRow}>
            <Text style={[styles.medicationText, { flex: 2 }]}>{item.name}</Text>
            <Text style={[styles.medicationText, { flex: 1 }]}>{item.dosage}</Text>
            <Text style={[styles.medicationText, { flex: 2 }]}>{item.schedule}</Text>
            <Text style={[styles.medicationText, { flex: 1 }]}>{item.refillDate}</Text>
          </View>
        )}
        contentContainerStyle={styles.tableContainer}
      />

      {/* Bottom Navigation */}
      <BottomNavigationCN navigation={navigation} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    marginTop: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: "#f8f9fa",
  },
  clientInfo: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  clientNameInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: "#f8f9fa",
  },
  tableContainer: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00AEEF",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  columnHeader: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  medicationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  medicationText: {
    fontSize: 14,
    textAlign: "center",
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

export default MedicationMgtCN;