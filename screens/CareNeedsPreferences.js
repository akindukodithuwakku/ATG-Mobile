//careneeds prefernces form
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  useColorScheme,
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

const CareNeedsPreferences = ({ navigation }) => {
  const [preference, setPreference] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState(""); // State for additional notes
  const [primaryReasonError, setPrimaryReasonError] = useState("");
  const [medicalConditionsError, setMedicalConditionsError] = useState("");
  const [specialAssistanceError, setSpecialAssistanceError] = useState("");
  const scheme = useColorScheme();
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      const savedData = await AsyncStorage.getItem('careNeedsPreferences');
      if (savedData) {
        const { preference, medicalConditions, specialAssistance, additionalNotes } = JSON.parse(savedData);
        setPreference(preference);
        setMedicalConditions(medicalConditions);
        setSpecialAssistance(specialAssistance);
        setAdditionalNotes(additionalNotes); // Load additional notes
      }
    };
    loadData();
  }, []);

  const saveData = async () => {
    const data = { preference, medicalConditions, specialAssistance, additionalNotes }; // Include additional notes
    await AsyncStorage.setItem('careNeedsPreferences', JSON.stringify(data));
  };

  const handleMedicalConditionChange = (condition) => {
    const selectedCount = Object.values(medicalConditions).filter(Boolean).length;

    if (medicalConditions[condition]) {
      setMedicalConditions((prev) => ({
        ...prev,
        [condition]: false,
      }));
    } else if (selectedCount < 2) {
      setMedicalConditions((prev) => ({
        ...prev,
        [condition]: true,
      }));
    }

    setMedicalConditionsError("");
  };

  const handleSpecialAssistanceChange = (assistance) => {
    const selectedCount = Object.values(specialAssistance).filter(Boolean).length;

    if (specialAssistance[assistance]) {
      setSpecialAssistance((prev) => ({
        ...prev,
        [assistance]: false,
      }));
    } else if (selectedCount < 2) {
      setSpecialAssistance((prev) => ({
        ...prev,
        [assistance]: true,
      }));
    }

    setSpecialAssistanceError("");
  };

  const validateForm = () => {
    let isValid = true;

    setPrimaryReasonError("");
    setMedicalConditionsError("");
    setSpecialAssistanceError("");

    if (!preference) {
      setPrimaryReasonError("Primary reason for care cannot be empty.");
      isValid = false;
    }

    const selectedMedicalConditions = Object.values(medicalConditions).some((value) => value);
    if (!selectedMedicalConditions) {
      setMedicalConditionsError("Please select at least one medical condition.");
      isValid = false;
    }

    const selectedSpecialAssistance = Object.values(specialAssistance).some((value) => value);
    if (!selectedSpecialAssistance) {
      setSpecialAssistanceError("Please select at least one type of special assistance needed.");
      isValid = false;
    }

    return isValid;
 };

 const handleContinue = () => {
  if (validateForm()) {
    saveData(); // Save data before navigating
    const careNeedsData = {
      preference,
      medicalConditions,
      specialAssistance,
      additionalNotes,
    };
    navigation.navigate("EmergencyContact", { careNeedsData }); // Pass data to the next screen
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
        <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Care Needs And Preferences</Text>
      </View>

      {/* Side Navigation */}
      {isSideNavVisible && (
        <SideNavigationClient navigation={navigation} onClose={() => setIsSideNavVisible(false)} />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Primary Reason For Care</Text>
          <TextInput
            style={styles.inputBox}
            placeholder="Describe The Primary Reason For Care..."
            placeholderTextColor="#999"
            multiline
            value={preference}
            onChangeText={(text) => {
              setPreference(text);
              if (text) {
                setPrimaryReasonError("");
              }
            }}
          />
          {primaryReasonError && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{primaryReasonError}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Current Medical Conditions</Text>
          <View style={styles.checkboxContainer}>
            {Object.keys(medicalConditions).map((condition) => (
              <View key={condition} style={styles.checkboxRow}>
                <Checkbox
                  status={medicalConditions[condition] ? "checked" : "unchecked"}
                  onPress={() => handleMedicalConditionChange(condition)}
                  color="#00BCD4"
                />
                <Text style={styles.checkboxLabel}>{condition.charAt(0).toUpperCase() + condition.slice(1)}</Text>
              </View>
            ))}
          </View>
          {medicalConditionsError && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{medicalConditionsError}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Special Assistance Needed</Text>
          <View style={styles.checkboxContainer}>
            {Object.keys(specialAssistance).map((assistance) => (
              <View key={assistance} style={styles.checkboxRow}>
                <Checkbox
                  status={specialAssistance[assistance] ? "checked" : "unchecked"}
                  onPress={() => handleSpecialAssistanceChange(assistance)}
                  color="#00BCD4"
                />
                <Text style={styles.checkboxLabel}>{assistance.charAt(0).toUpperCase() + assistance.slice(1).replace(/([A-Z])/g, ' $1')}</Text>
              </View>
            ))}
          </View>
          {specialAssistanceError && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{specialAssistanceError}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.smallInputBox}
            placeholder="Provide Any Additional Details..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            value={additionalNotes}
            onChangeText={(text) => {
              setAdditionalNotes(text);
            }}
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

        <TouchableOpacity style={styles.continueButton}
          onPress={handleContinue} // Validate before navigating
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
    height: 80,
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
  continueButton: {
    backgroundColor: "#00BCD4",
    paddingVertical: 14,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
  backText: {
    color: "#00BCD4",
    fontWeight: "bold",
  },
  continueText: {
    color: "white",
    fontWeight: "bold",
  },
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

export default CareNeedsPreferences;