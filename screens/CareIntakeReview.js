import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, StatusBar, useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from '../Components/BottomNavigationClient';
import SideNavigationClient from '../Components/SideNavigationClient';

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

  // Transform formData to match backend structure
  const transformFormData = (formData) => {
  const medicalConditions = formData.medicalConditions || {};
  const specialAssistance = formData.specialAssistance || {};

  return {
    client_username: formData.userName,
    care_navigator_username: formData.careNavigatorUsername || "", // or null if not available
    full_name: formData.fullName,
    date_of_birth: formData.dateOfBirth,
    gender: formData.gender,
    contact_number: formData.contactNumber,
    home_address: formData.homeAddress,
    profile_img_key: formData.profileImgKey || null,

    // Add these fields for your SQL table:
    current_medical_conditions_diabetes: medicalConditions.diabetes ? 1 : 0,
    current_medical_conditions_hypertension: medicalConditions.hypertension ? 1 : 0,
    current_medical_conditions_arthritis: medicalConditions.arthritis ? 1 : 0,
    current_medical_conditions_heart_disease: medicalConditions.heartDisease ? 1 : 0,

    current_medical_conditions_other: formData.otherCondition || null,
    known_allergies: formData.allergies || null,
    current_medications: formData.medications || null,
    history_of_surgeries_procedures: formData.surgeries || null,

    primary_reason_for_care: formData.preference,
    current_medical_conditions_weekdays: (medicalConditions["weekdays morning"] || medicalConditions["weekdays evening"]) ? 1 : 0,
    current_medical_conditions_weekends: (medicalConditions["weekends morning"] || medicalConditions["weekends evening"]) ? 1 : 0,
    current_medical_conditions_morning: (medicalConditions["weekdays morning"] || medicalConditions["weekends morning"]) ? 1 : 0,
    current_medical_conditions_evening: (medicalConditions["weekdays evening"] || medicalConditions["weekends evening"]) ? 1 : 0,

    special_assistance_mobility: specialAssistance.mobility ? 1 : 0,
    special_assistance_hypertension: specialAssistance.hypertension ? 1 : 0,
    special_assistance_medication_management: specialAssistance.medicationManagement ? 1 : 0,
    special_assistance_hygiene: specialAssistance.hygiene ? 1 : 0,
    additional_notes: formData.additionalNotes || null,

    emergency_contact_name: formData.contactName,
    emergency_contact_number: formData.emergencyContactNumber,
    relationship_to_emergency_contact: formData.relationship,
  };
};

  const handleSubmit = async () => {
    try {
      const payload = transformFormData(formData);
          console.log("Submitting payload:", payload);

      const response = await fetch('https://iwr4xjz0i5.execute-api.ap-south-1.amazonaws.com/dev/careintake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigation.navigate('SubmissionSuccess');
      } else {
        const errorData = await response.json();
        Alert.alert('Submission Failed', errorData.message || 'Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Something went wrong. Please check your internet connection.');
    }
  };

  // Helper for displaying selected checkboxes
  const getSelected = (obj) =>
    Object.entries(obj || {})
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join(', ') || 'None';

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
              value={getSelected(formData.medicalConditions)}
              editable={false}
              placeholder="Current Medical Conditions"
            />
            <TextInput style={styles.input} placeholder="Allergies" value={formData.allergies || ''} onChangeText={text => handleChange('allergies', text)} />
            <TextInput style={styles.input} placeholder="Medications" value={formData.medications || ''} onChangeText={text => handleChange('medications', text)} />
            <TextInput style={styles.input} placeholder="Surgeries" value={formData.surgeries || ''} onChangeText={text => handleChange('surgeries', text)} />

            <Text style={styles.sectionTitle}>Care Needs & Preferences</Text>
            <TextInput style={styles.input} placeholder="Preference" value={formData.preference || ''} onChangeText={text => handleChange('preference', text)} />
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
  continueButton: { backgroundColor: "#00BCD4", padding: 15, borderRadius: 10, alignItems: "center",marginBottom: 50},
  continueText: { fontSize: 16, fontWeight: "bold", color: "white" },
  reviewLabel: { fontSize: 16, color: "#333", marginBottom: 10 },
});

export default CareIntakeReview;