import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, StatusBar, useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from '../Components/BottomNavigationClient';
import SideNavigationClient from '../Components/SideNavigationClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CareIntakeReview = ({ navigation, route }) => {
  const scheme = useColorScheme();

  // Destructure all possible data from params
  const {
    personalInfoData = {},
    healthData = {},
    careNeedsData = {},
    emergencyContactData = {},
  } = route.params || {};

  // Combine all data for review and editing
  const [formData, setFormData] = useState({
    ...personalInfoData,
    ...healthData,
    ...careNeedsData,
    ...emergencyContactData,
  });

  const [isSideNavVisible, setIsSideNavVisible] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Improved date formatting: accepts DD/MM/YYYY or YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('-')) {
      // Already in YYYY-MM-DD
      return dateStr;
    }
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return dateStr; // fallback
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Transform formData to match backend structure
  const transformFormData = (formData) => {
    const conditions = formData.conditions || {};
    const medicalConditions = formData.medicalConditions || {};
    const specialAssistance = formData.specialAssistance || {};

    return {
      client_username: formData.userName || null,
      care_navigator_username: formData.careNavigatorUsername || null,
      full_name: formData.fullName || null,
      date_of_birth: formatDate(formData.dateOfBirth) || null,
      gender: formData.gender || null,
      contact_number: formData.contactNumber || null,
      home_address: formData.homeAddress || null,
      profile_img_key: formData.profileImgKey || null,

      // Health Conditions (from HealthConditions screen)
      current_medical_conditions_diabetes: typeof conditions.diabetes === "boolean" ? (conditions.diabetes ? 1 : 0) : 0,
      current_medical_conditions_hypertension: typeof conditions.hypertension === "boolean" ? (conditions.hypertension ? 1 : 0) : 0,
      current_medical_conditions_arthritis: typeof conditions.arthritis === "boolean" ? (conditions.arthritis ? 1 : 0) : 0,
      current_medical_conditions_heart_disease: typeof conditions.heartDisease === "boolean" ? (conditions.heartDisease ? 1 : 0) : 0,
      current_medical_conditions_other: formData.otherCondition || null,
      known_allergies: formData.allergies || null,
      current_medications: formData.medications || null,
      history_of_surgeries_procedures: formData.surgeries || null,

      // Care Needs (from CareNeedsPreferences screen)
      primary_reason_for_care: formData.preference || null,
      current_medical_conditions_weekdays: (medicalConditions["weekdays morning"] || medicalConditions["weekdays evening"]) ? 1 : 0,
      current_medical_conditions_weekends: (medicalConditions["weekends morning"] || medicalConditions["weekends evening"]) ? 1 : 0,
      current_medical_conditions_morning: (medicalConditions["weekdays morning"] || medicalConditions["weekends morning"]) ? 1 : 0,
      current_medical_conditions_evening: (medicalConditions["weekdays evening"] || medicalConditions["weekends evening"]) ? 1 : 0,

      // Special Assistance
      special_assistance_mobility: typeof specialAssistance.mobility === "boolean" ? (specialAssistance.mobility ? 1 : 0) : 0,
      special_assistance_language_preferences: typeof specialAssistance.languagePreferences === "boolean" ? (specialAssistance.languagePreferences ? 1 : 0) : 0,
      special_assistance_medication_management: typeof specialAssistance.medicationManagement === "boolean" ? (specialAssistance.medicationManagement ? 1 : 0) : 0,
      special_assistance_hygiene: typeof specialAssistance.hygiene === "boolean" ? (specialAssistance.hygiene ? 1 : 0) : 0,
      additional_notes: formData.additionalNotes || null,

      // Emergency Contact
      emergency_contact_name: formData.contactName || null,
      emergency_contact_number: formData.emergencyContactNumber || null,
      relationship_to_emergency_contact: formData.relationship || null,
    };
  };

 const validateReviewForm = (data) => {
  if (
    !data.userName ||
    !data.fullName ||
    !data.dateOfBirth ||
    !data.gender ||
    !data.contactNumber ||
    !data.homeAddress ||
    !data.contactName ||
    !data.emergencyContactNumber ||
    !data.relationship
  ) {
    Alert.alert("Validation Error", "Please fill all required fields before submitting.");
    return false;
  }
  return true;
};

  const handleSubmit = async () => {
    if (!validateReviewForm(formData)) return;
    try {
      const payload = transformFormData(formData);
      console.log("Submitting payload:", payload);

      const response = await fetch('https://iwr4xjz0i5.execute-api.ap-south-1.amazonaws.com/dev/careintake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await AsyncStorage.removeItem('healthConditions');
        await AsyncStorage.removeItem('careNeedsPreferences');
        await AsyncStorage.removeItem('emergencyContact');
        await AsyncStorage.removeItem('personalInfo');
        navigation.navigate('SubmissionSuccess');
      } else {
        const errorText = await response.text();
        if (errorText.toLowerCase().includes('duplicate entry')) {
          Alert.alert('Submission Failed', 'This username already exists. Please use a different username.');
        } else {
          Alert.alert('Submission Failed', errorText || 'Please try again.');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Something went wrong. Please check your internet connection.');
    }
  };

  // Helper for displaying selected checkboxes
  const getSelected = (obj, otherText) => {
    if (!obj) return 'None';
    let selected = Object.entries(obj)
      .filter(([_, v]) => v && _ !== 'other')
      .map(([k]) => k);

    // If "other" is selected, add the otherText
    if (obj.other && otherText) {
      selected.push(otherText);
    } else if (obj.other) {
      selected.push('Other');
    }

    return selected.length ? selected.join(', ') : 'None';
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} translucent backgroundColor={scheme === 'dark' ? 'black' : 'transparent'} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Care Intake Review</Text>
        </View>

        {isSideNavVisible && <SideNavigationClient navigation={navigation} onClose={() => setIsSideNavVisible(false)} />}

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TextInput style={styles.input} placeholder="Full Name" value={formData.fullName || ''} onChangeText={text => handleChange('fullName', text)} />
            <TextInput style={styles.input} placeholder="Date of Birth" value={formData.dateOfBirth || ''} onChangeText={text => handleChange('dateOfBirth', text)} />
            <TextInput style={styles.input} placeholder="Gender" value={formData.gender || ''} onChangeText={text => handleChange('gender', text)} />
            <TextInput style={styles.input} placeholder="Contact Number" value={formData.contactNumber || ''} onChangeText={text => handleChange('contactNumber', text)} />
            <TextInput style={styles.input} placeholder="Home Address" value={formData.homeAddress || ''} onChangeText={text => handleChange('homeAddress', text)} />

            <Text style={styles.sectionTitle}>Health Conditions</Text>
            <TextInput
              style={styles.input}
              value={getSelected(formData.conditions, formData.otherCondition)}
              editable={false}
              placeholder="Current Medical Conditions"
            />
            <TextInput style={styles.input} placeholder="Allergies" value={formData.allergies || ''} onChangeText={text => handleChange('allergies', text)} />
            <TextInput style={styles.input} placeholder="Medications" value={formData.medications || ''} onChangeText={text => handleChange('medications', text)} />
            <TextInput style={styles.input} placeholder="Surgeries" value={formData.surgeries || ''} onChangeText={text => handleChange('surgeries', text)} />

            <Text style={styles.sectionTitle}>Care Needs & Preferences</Text>
            <TextInput style={styles.input} placeholder="Primary Reason for care" value={formData.preference || ''} onChangeText={text => handleChange('preference', text)} />
            <TextInput
              style={styles.input}
              value={getSelected(formData.medicalConditions)}
              editable={false}
              placeholder="Current Medical Conditions (Care Needs)"
            />
            <TextInput
              style={styles.input}
              value={getSelected(formData.specialAssistance)}
              editable={false}
              placeholder="Special Assistance Needed"
            />
            <TextInput style={styles.input} placeholder="Additional Notes" value={formData.additionalNotes || ''} onChangeText={text => handleChange('additionalNotes', text)} multiline />

            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TextInput style={styles.input} placeholder="Emergency Contact Name" value={formData.contactName || ''} onChangeText={text => handleChange('contactName', text)} />
            <TextInput style={styles.input} placeholder="Emergency Contact Number" value={formData.emergencyContactNumber || ''} onChangeText={text => handleChange('emergencyContactNumber', text)} />
            <TextInput style={styles.input} placeholder="Relationship to Emergency Contact" value={formData.relationship || ''} onChangeText={text => handleChange('relationship', text)} />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleSubmit}>
            <Text style={styles.continueText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <BottomNavigationClient navigation={navigation} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FDFF" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#00BCD4", paddingTop: 40 },
  headerText: { fontSize: 20, fontWeight: "bold", color: "white", marginLeft: 20 },
  scrollContainer: { flexGrow: 1, paddingBottom: 150 },
  formContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 20, color: "#00BCD4" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 15, marginBottom: 15, borderRadius: 10, backgroundColor: "#fff" },
  buttonContainer: { padding: 20, paddingEnd: 30 },
  continueButton: { backgroundColor: "#00BCD4", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 50 },
  continueText: { fontSize: 16, fontWeight: "bold", color: "white" },
  reviewLabel: { fontSize: 16, color: "#333", marginBottom: 10 },
});

export default CareIntakeReview;