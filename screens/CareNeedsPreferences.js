import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CareNeedsPreferences = ({ navigation }) => {
  const [reasonForCare, setReasonForCare] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedAssistance, setSelectedAssistance] = useState([]);

  const conditions = ["Weekdays", "Weekends", "Morning", "Evening"];
  const assistance = ["Mobility", "Hypertension", "Medication Management", "Hygiene"];

  const toggleSelection = (item, type) => {
    if (type === "condition") {
      setSelectedConditions((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    } else {
      setSelectedAssistance((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Care Needs And Preferences</Text>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Primary Reason For Care */}
        <Text style={styles.sectionTitle}>Primary Reason For Care</Text>
        <TextInput
          style={styles.input}
          placeholder="Describe The Primary Reason For Care..."
          value={reasonForCare}
          onChangeText={setReasonForCare}
          multiline
        />

        {/* Current Medical Conditions */}
        <Text style={styles.sectionTitle}>Current Medical Conditions</Text>
        <View style={styles.optionsContainer}>
          {conditions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionButton,
                selectedConditions.includes(item) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(item, "condition")}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={selectedConditions.includes(item) ? "#00c3ff" : "#ccc"}
              />
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Special Assistance Needed */}
        <Text style={styles.sectionTitle}>Special Assistance Needed</Text>
        <View style={styles.optionsContainer}>
          {assistance.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.optionButton,
                selectedAssistance.includes(item) && styles.selectedOption,
              ]}
              onPress={() => toggleSelection(item, "assistance")}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={selectedAssistance.includes(item) ? "#00c3ff" : "#ccc"}
              />
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Notes */}
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Provide Any Additional Details..."
          value={additionalNotes}
          onChangeText={setAdditionalNotes}
          multiline
        />
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("SubmitForm")}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#00c3ff",
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#e0f2ff",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedOption: {
    borderColor: "#00c3ff",
    backgroundColor: "#e0f8ff",
  },
  optionText: {
    marginLeft: 5,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#00c3ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#00c3ff",
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: "#00c3ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CareNeedsPreferences;