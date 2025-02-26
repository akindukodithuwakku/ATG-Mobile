import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "react-native-paper";
import BottomNavigationClient from "../Components/BottomNavigationClient";

const HealthConditions = ({ navigation }) => {
  const [conditions, setConditions] = useState({
    diabetes: false,
    hypertension: false,
    arthritis: false,
    heartDisease: false,
    other: false,
  });
  const [otherCondition, setOtherCondition] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [surgeries, setSurgeries] = useState("");

  const toggleCondition = (key) => {
    setConditions({ ...conditions, [key]: !conditions[key] });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Health Conditions</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Current Medical Conditions</Text>
            {Object.keys(conditions).map((key) => (
              <View key={key} style={styles.checkboxContainer}>
                <Checkbox
                  status={conditions[key] ? "checked" : "unchecked"}
                  onPress={() => toggleCondition(key)}
                  color="#00BCD4"
                />
                <Text style={styles.checkboxText}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              </View>
            ))}

            {conditions.other && (
              <TextInput
                style={styles.textArea}
                placeholder="Please specify other conditions..."
                value={otherCondition}
                onChangeText={setOtherCondition}
              />
            )}

            <Text style={styles.label}>Known Allergies</Text>
            <TextInput
              style={styles.textArea}
              placeholder="List any known allergies..."
              value={allergies}
              onChangeText={setAllergies}
            />

            <Text style={styles.label}>Current Medications</Text>
            <TextInput
              style={styles.textArea}
              placeholder="List all current medications..."
              value={medications}
              onChangeText={setMedications}
            />

            <Text style={styles.label}>History of Surgeries/Procedures</Text>
            <TextInput
              style={styles.textArea}
              placeholder="List any surgeries or medical procedures..."
              value={surgeries}
              onChangeText={setSurgeries}
            />
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={() => navigation.navigate("NextScreen")}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
        
        {/* Bottom Navigation */}
        <BottomNavigationClient navigation={navigation} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FDFF" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 15, 
    backgroundColor: "#00BCD4", 
    paddingTop: 40 
  },
  headerText: { fontSize: 20, fontWeight: "bold", color: "white", marginLeft: 20 },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  formContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 20, color: "#333" },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  checkboxText: { fontSize: 16, color: "#333" },
  textArea: { 
    backgroundColor: "#E0F7FA", 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    marginTop: 12, 
    height: 80, 
    textAlignVertical: "top" 
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 75, 
    backgroundColor: "#F8FDFF",
  },
  backButton: { 
    backgroundColor: "#FFFFFF", 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    borderWidth: 1, 
    borderColor: "#00BCD4",
    flex: 1, 
    marginRight: 10 
  },
  continueButton: { 
    backgroundColor: "#00BCD4", 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    flex: 1, 
    marginLeft: 10 
  },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#000000", textAlign: "center" },
});

export default HealthConditions;