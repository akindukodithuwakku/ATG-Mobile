import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Animated,
  ScrollView,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";

const MedicationMgtClient = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [medications, setMedications] = useState([
    { name: "", dosage: "", schedule: "", refillDate: "" },
  ]);
  const [isSuccess, setIsSuccess] = useState(false); // Track success state
  const scheme = useColorScheme();
  const menuAnimation = new Animated.Value(isMenuOpen ? 1 : 0);

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: isMenuOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", schedule: "", refillDate: "" },
    ]);
  };

  const updateMedication = (index, key, value) => {
    const newMedications = [...medications];
    newMedications[index][key] = value;
    setMedications(newMedications);
  };

  const handleFinish = () => {
    setIsSuccess(true); // Show success page
  };

  const resetUpload = () => {
    setIsSuccess(false); // Reset success state
    setMedications([{ name: "", dosage: "", schedule: "", refillDate: "" }]); // Clear medications
  };

  const renderSuccessPage = () => {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle-outline" size={80} color="#00AEEF" />
        <Text style={styles.successTitle}>Medication Added Successfully!</Text>
        <Text style={styles.successMessage}>
          Your medication details have been saved successfully.
        </Text>
        <TouchableOpacity style={styles.successButton} onPress={resetUpload}>
          <Text style={styles.successButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />
      {/* Header with Menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name={isMenuOpen ? "close" : "menu"} size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Medication Management</Text>
      </View>
      {/* Side Navigation */}
      {isMenuOpen && (
        <Animated.View style={[styles.overlay, { opacity: menuAnimation }]}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity style={styles.overlayBackground} onPress={toggleMenu} />
        </Animated.View>
      )}

      {/* Success Page */}
      {isSuccess && renderSuccessPage()}

      {/* Main Form Section */}
      {!isSuccess && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Medication Details</Text>
          {medications.map((med, index) => (
            <View key={index} style={styles.medicationBox}>
              {/* Medication Name Input Field */}
              <Text style={styles.label}>Medication Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter medication name"
                value={med.name}
                onChangeText={(value) => updateMedication(index, "name", value)}
              />
              {/* Dosage Input (Hybrid Picker + Custom Input) */}
              <Text style={styles.label}>Dosage</Text>
              <Picker
                selectedValue={med.dosage}
                onValueChange={(value) => updateMedication(index, "dosage", value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Dosage" value="" />
                <Picker.Item label="250 mg" value="250 mg" />
                <Picker.Item label="500 mg" value="500 mg" />
                <Picker.Item label="Custom" value="custom" />
              </Picker>
              {med.dosage === "custom" && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter custom dosage (e.g., 475 mg)"
                  keyboardType="numeric"
                  value={med.customDosage || ""}
                  onChangeText={(text) =>
                    updateMedication(index, "customDosage", text)
                  }
                />
              )}
              {/* Schedule Input (Hybrid Picker + Custom Input) */}
              <Text style={styles.label}>Schedule</Text>
              <Picker
                selectedValue={med.schedule}
                onValueChange={(value) => updateMedication(index, "schedule", value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Schedule" value="" />
                <Picker.Item label="Morning" value="Morning" />
                <Picker.Item label="Evening" value="Evening" />
                <Picker.Item label="Custom" value="custom" />
              </Picker>
              {med.schedule === "custom" && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter custom schedule (e.g., Afternoon)"
                  value={med.customSchedule || ""}
                  onChangeText={(text) =>
                    updateMedication(index, "customSchedule", text)
                  }
                />
              )}
              {/* Refill Date Input (Hybrid Picker + Custom Input) */}
              <Text style={styles.label}>Next Refill Date</Text>
              <Picker
                selectedValue={med.refillDate}
                onValueChange={(value) => updateMedication(index, "refillDate", value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Refill Date" value="" />
                <Picker.Item label="In 1 Week" value="1 Week" />
                <Picker.Item label="In 2 Weeks" value="2 Weeks" />
                <Picker.Item label="Custom" value="custom" />
              </Picker>
              {med.refillDate === "custom" && (
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter custom refill date (e.g., 2023-12-01)"
                  value={med.customRefillDate || ""}
                  onChangeText={(text) =>
                    updateMedication(index, "customRefillDate", text)
                  }
                />
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addMedication}>
            <Text style={styles.addButtonText}>+ Add another</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Finished</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {/* Bottom Navigation */}
      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

// Styles
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
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00AEEF",
    marginBottom: 10,
  },
  medicationBox: {
    backgroundColor: "#F2F2F2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addButton: {
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    color: "#00AEEF",
    fontWeight: "bold",
  },
  finishButton: {
    backgroundColor: "#00AEEF",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 70,
  },
  finishButtonText: {
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
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00AEEF",
    marginTop: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  successButton: {
    backgroundColor: "#00AEEF",
    padding: 20,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 40,
  },
  successButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MedicationMgtClient;