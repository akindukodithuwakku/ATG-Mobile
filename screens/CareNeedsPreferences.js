import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "react-native-paper";
import BottomNavigationClient from "../Components/BottomNavigationClient";

const CareNeedsPreferences = ({ navigation }) => {
  const [preference, setPreference] = useState("");
  const scheme = useColorScheme();

  // State for checkboxes
  const [medicalConditions, setMedicalConditions] = useState({
    "weekdays morning": false,
    "weekdays evening": false,
    "weekends morning": false,
    "weekends evening": false,
  });

  const [specialAssistance, setSpecialAssistance] = useState({
    mobility: false,
    hypertension: false,
    medicationManagement: false,
    hygiene: false,
  });

  const handleMedicalConditionChange = (condition) => {
    const selectedCount = Object.values(medicalConditions).filter(Boolean).length;

    if (medicalConditions[condition]) {
      // If the checkbox is already checked, uncheck it
      setMedicalConditions((prev) => ({
        ...prev,
        [condition]: false,
      }));
    } else if (selectedCount < 2) {
      // If less than 2 are selected, allow selection
      setMedicalConditions((prev) => ({
        ...prev,
        [condition]: true,
      }));
    }
  };

  const handleSpecialAssistanceChange = (assistance) => {
    const selectedCount = Object.values(specialAssistance).filter(Boolean).length;

    if (specialAssistance[assistance]) {
      // If the checkbox is already checked, uncheck it
      setSpecialAssistance((prev) => ({
        ...prev,
        [assistance]: false,
      }));
    } else if (selectedCount < 2) {
      // If less than 2 are selected, allow selection
      setSpecialAssistance((prev) => ({
        ...prev,
        [assistance]: true,
      }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Care Needs And Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Primary Reason For Care</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Describe The Primary Reason For Care..."
            placeholderTextColor="#999"
            multiline
          />

          <Text style={styles.sectionTitle}>Current Medical Conditions</Text>
          <View style={styles.checkboxContainer}>
            {Object.keys(medicalConditions).map((condition) => (
              <View key={condition} style={styles.checkboxRow}>
                <Checkbox
                  status={medicalConditions[condition] ? "checked" : "unchecked"}
                  onPress={() => handleMedicalConditionChange(condition)}
                  color="#00BCD4" // Set the color for the checked state
                />
                <Text style={styles.checkboxLabel}>{condition.charAt(0).toUpperCase() + condition.slice(1)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Special Assistance Needed</Text>
          <View style={styles.checkboxContainer}>
            {Object.keys(specialAssistance).map((assistance) => (
              <View key={assistance} style={styles.checkboxRow}>
                <Checkbox
                  status={specialAssistance[assistance] ? "checked" : "unchecked"}
                  onPress={() => handleSpecialAssistanceChange(assistance)}
                  color="#00BCD4" // Set the color for the checked state
                />
                <Text style={styles.checkboxLabel}>{assistance.charAt(0).toUpperCase() + assistance.slice(1).replace(/([A-Z])/g, ' $1')}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.smallInputBox} // Use the new style for a smaller text area
            placeholder="Provide Any Additional Details..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3} // Limit the number of lines
          />
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => console.log("Continue button pressed")}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FDFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#00BCD4",
    paddingTop: 40,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  inputBox: {
    backgroundColor: "#E3F7FF",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    color: "#333",
  },
  smallInputBox: {
    backgroundColor: "#E3F7FF",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    color: "#333",
    height: 80, // Set a specific height for the smaller text area
  },
  checkboxContainer: {
    marginTop: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 10,
    color: "#333",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 70,
    width: "90%",
    alignSelf: "center",
  },
  backButton: {
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#00BCD4",
    width: "45%",
    alignItems: "center",
  },
  backText: {
    color: "#00BCD4",
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#00BCD4",
    paddingVertical: 14,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
  continueText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CareNeedsPreferences;