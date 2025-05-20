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

   console.log("Review params:", route.params);
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

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://iwr4xjz0i5.execute-api.ap-south-1.amazonaws.com/dev/careintake', {
        method: 'POST',              
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
            <TextInput style={styles.input} placeholder="Current Medical Conditions" value={formData.conditions || ''} onChangeText={text => handleChange('conditions', text)} />
            <TextInput style={styles.input} placeholder="Allergies" value={formData.allergies || ''} onChangeText={text => handleChange('allergies', text)} />
            <TextInput style={styles.input} placeholder="Medications" value={formData.medications || ''} onChangeText={text => handleChange('medications', text)} />
            <TextInput style={styles.input} placeholder="Surgeries" value={formData.surgeries || ''} onChangeText={text => handleChange('surgeries', text)} />

            <Text style={styles.sectionTitle}>Care Needs & Preferences</Text>
            <TextInput style={styles.input} placeholder="Preference" value={formData.preference || ''} onChangeText={text => handleChange('preference', text)} />
            <TextInput style={styles.input} placeholder="Medical Conditions" value={formData.medicalConditions || ''} onChangeText={text => handleChange('medicalConditions', text)} />
            <TextInput style={styles.input} placeholder="Special Assistance Needed" value={formData.specialAssistance || ''} onChangeText={text => handleChange('specialAssistance', text)} />
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#00BCD4" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 15, marginBottom: 15, borderRadius: 10, backgroundColor: "#fff" },
  buttonContainer: { padding: 20, paddingEnd: 30 },
  continueButton: { backgroundColor: "#00BCD4", padding: 15, borderRadius: 10, alignItems: "center" },
  continueText: { fontSize: 16, fontWeight: "bold", color: "white" },
});

export default CareIntakeReview;