//emergency contact information form
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavigationClient from "../Components/BottomNavigationClient";
import SideNavigationClient from "../Components/SideNavigationClient";

const ErrorIcon = () => (
  <View style={styles.errorIcon}>
    <Text style={styles.errorIconText}>!</Text>
  </View>
);

const EmergencyContact = ({ navigation, route }) => {
  const { personalInfoData, healthData, careNeedsData } = route.params || {};
  const [contactName, setContactName] = useState("");
  const [emergencyContactNumber, setemergencyContactNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const [contactNameError, setContactNameError] = useState("");
  const [emergencyContactNumberError, setemergencyContactNumberError] = useState("");
  const [relationshipError, setRelationshipError] = useState("");
  const scheme = useColorScheme();
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const savedData = await AsyncStorage.getItem('emergencyContact');
      if (savedData) {
        const { contactName, emergencyContactNumber, relationship } = JSON.parse(savedData);
        setContactName(contactName);
        setemergencyContactNumber(emergencyContactNumber);
        setRelationship(relationship);
      }
    };
    loadData();
  }, []);

  const saveData = async () => {
    const data = { contactName, emergencyContactNumber, relationship };
    await AsyncStorage.setItem('emergencyContact', JSON.stringify(data));
  };

  const validateForm = () => {
    let isValid = true;

    setContactNameError("");
    setemergencyContactNumberError("");
    setRelationshipError("");

    if (!contactName) {
      setContactNameError("Contact name cannot be empty.");
      isValid = false;
    }

    if (!emergencyContactNumber) {
      setemergencyContactNumberError("Contact number cannot be empty.");
      isValid = false;
    }

    if (!relationship) {
      setRelationshipError("Relationship cannot be empty.");
      isValid = false;
    }

    return isValid;
  };
  const handleContinue = () => {
    if (validateForm()) {
      saveData(); // Save data before navigating
      const emergencyContactData = {
        contactName,
        emergencyContactNumber,
        relationship,
      };
      navigation.navigate("CareIntakeReview", {
        personalInfoData,
        healthData,
        careNeedsData,
        emergencyContactData,
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Emergency Contact Information</Text>
        </View>

        {/* Side Navigation */}
        {isSideNavVisible && (
          <SideNavigationClient navigation={navigation} onClose={() => setIsSideNavVisible(false)} />
        )}

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Name"
              placeholderTextColor="#B3E5FC"
              value={contactName}
              onChangeText={(text) => {
                setContactName(text);
                if (text) {
                  setContactNameError(""); // Clear error when user types
                }
              }}
            />
            {contactNameError && (
              <View style={styles.errorContainer}>
                <ErrorIcon />
                <Text style={styles.error}>{contactNameError}</Text>
              </View>
            )}

            <Text style={styles.label}>Emergency Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Number"
              placeholderTextColor="#B3E5FC"
              keyboardType="phone-pad"
              value={emergencyContactNumber}
              onChangeText={(text) => {
                setemergencyContactNumber(text);
                if (text) {
                  setemergencyContactNumberError(""); // Clear error when user types
                }
              }}
            />
            {emergencyContactNumberError && (
              <View style={styles.errorContainer}>
                <ErrorIcon />
                <Text style={styles.error}>{emergencyContactNumberError}</Text>
              </View>
            )}

            <Text style={styles.label}>Relationship To Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Relationship"
              placeholderTextColor="#B3E5FC"
              value={relationship}
              onChangeText={(text) => {
                setRelationship(text);
                if (text) {
                  setRelationshipError(""); // Clear error when user types
                }
              }}
            />
            {relationshipError && (
              <View style={styles.errorContainer}>
                <ErrorIcon />
                <Text style={styles.error}>{relationshipError}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue} // Use the correct handler here!
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
  headerText: { fontSize: 19, fontWeight: "bold", color: "white", marginLeft: 20 },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  formContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 20, color: "#333" },
  input: { 
    backgroundColor: "#E0F7FA", 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    marginTop: 20 
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingVertical: 70, 
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

export default EmergencyContact;