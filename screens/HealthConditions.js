//health condtions form
import React, { useState, useEffect } from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigationClient from "../Components/BottomNavigationClient";
import SideNavigationClient from "../Components/SideNavigationClient";

const ErrorIcon = () => (
  <View style={styles.errorIcon}>
    <Text style={styles.errorIconText}>!</Text>
  </View>
);

const HealthConditions = ({ navigation, route}) => {
  const { personalInfoData } = route.params || {};
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
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const savedData = await AsyncStorage.getItem('healthConditions');
      if (savedData) {
        const { conditions, otherCondition, allergies, medications, surgeries } = JSON.parse(savedData);
        setConditions(conditions);
        setOtherCondition(otherCondition);
        setAllergies(allergies);
        setMedications(medications);
        setSurgeries(surgeries);
      }
    };
    loadData();
  }, []);

  const saveData = async () => {
    const data = { conditions, otherCondition, allergies, medications, surgeries };
    await AsyncStorage.setItem('healthConditions', JSON.stringify(data));
  };

  const toggleCondition = (key) => {
    setConditions((prevConditions) => {
      const updatedConditions = { ...prevConditions, [key]: !prevConditions[key] };
      if (updatedConditions[key]) {
        setErrors((prevErrors) => ({ ...prevErrors, conditions: "" }));
      }
      return updatedConditions;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    const selectedConditions = Object.values(conditions).some((value) => value === true);

    if (!selectedConditions) {
      newErrors.conditions = "Please select at least one medical condition.";
    }

    if (!medications) {
      newErrors.medications = "Current medications cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      saveData(); // Save data before navigating
      const healthData = {
        conditions,
        otherCondition,
        allergies,
        medications,
        surgeries,
      };
  navigation.navigate("CareNeedsPreferences", { personalInfoData, healthData });    }
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
          <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Health Conditions</Text>
        </View>

        {/* Side Navigation */}
        {isSideNavVisible && (
          <SideNavigationClient navigation={navigation} onClose={() => setIsSideNavVisible(false)} />
        )}

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
            {errors.conditions && (
              <View style={styles.errorContainer}>
                <ErrorIcon />
                <Text style={styles.error}>{errors.conditions}</Text>
              </View>
            )}

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
              onChangeText={(text) => {
                setMedications(text);
                if (text) {
                  setErrors((prevErrors) => ({ ...prevErrors, medications: "" }));
                }
              }}
            />
            {errors.medications && (
              <View style={styles.errorContainer}>
                <ErrorIcon />
                <Text style={styles.error}>{errors.medications}</Text>
              </View>
            )}

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
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue} // Validate and navigate
          >
            <Text style={styles.continueText}>Continue</Text>
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
    paddingVertical: 65, 
    backgroundColor: "#F8FDFF",
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
  continueButton: { 
    backgroundColor: "#00BCD4", 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 30, 
    flex: 1, 
    marginLeft: 10 
  },
  backText: { fontSize: 16, fontWeight: "bold", color: "#00BCD4", textAlign: "center" },
  continueText: { fontSize: 16, fontWeight: "bold", color: "white", textAlign: "center" },
  error: {
    color: 'red',
    marginTop: 5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  errorIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  errorIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HealthConditions;
