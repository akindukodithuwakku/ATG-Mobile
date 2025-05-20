import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const AdditionalDetailsScreen = ({ route }) => {
  const navigation = useNavigation();

  const previousData = route.params || {};

  const [userName, setUserName] = useState(previousData.userName || '');
  const [fullName, setFullName] = useState(previousData.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(previousData.dateOfBirth || '');
  const [contactNumber, setContactNumber] = useState(previousData.contactNumber || '');
  const [homeAddress, setHomeAddress] = useState(previousData.homeAddress || '');
  const [gender, setGender] = useState(previousData.gender || '');

  const [conditions, setConditions] = useState(previousData.conditions || '');
  const [otherCondition, setOtherCondition] = useState(previousData.otherCondition || '');
  const [allergies, setAllergies] = useState(previousData.allergies || '');
  const [medications, setMedications] = useState(previousData.medications || '');
  const [surgeries, setSurgeries] = useState(previousData.surgeries || '');

  const [preference, setPreference] = useState(previousData.preference || '');
  const [medicalConditions, setMedicalConditions] = useState(previousData.medicalConditions || '');
  const [specialAssistance, setSpecialAssistance] = useState(previousData.specialAssistance || '');
  const [additionalNotes, setAdditionalNotes] = useState(previousData.additionalNotes || '');

  const [contactName, setContactName] = useState(previousData.contactName || '');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(previousData.emergencyContactNumber || '');
  const [relationship, setRelationship] = useState(previousData.relationship || '');

  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const fullFormData = {
      userName,
      fullName,
      dateOfBirth,
      contactNumber,
      homeAddress,
      gender,
      conditions,
        otherCondition,
        allergies,
        medications,
        surgeries,
        preference,
        medicalConditions,
  specialAssistance,
      additionalNotes,
        contactName,
        emergencyContactNumber,
        relationship,
    };

    try {
      const response = await fetch('https://iwr4xjz0i5.execute-api.ap-south-1.amazonaws.com/dev/careintake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullFormData),
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Additional Details</Text>

      <TextInput
        style={styles.input}
        placeholder="User Name"
        value={userName}
        onChangeText={setUserName}
      />

    <TextInput
        style={styles.input}
        placeholder=" Full Name"
        value={ fullName}
        onChangeText={ setFullName}
      />

    <TextInput
        style={styles.input}
        placeholder=" Date of Birth"
        value={ dateOfBirth}
        onChangeText={ setDateOfBirth}
      />

    <TextInput
        style={styles.input}
        placeholder=" Contact Number"
        value={ contactNumber}
        onChangeText={ setContactNumber}
      />

    <TextInput
        style={styles.input}
        placeholder=" Home Address"
        value={ homeAddress}
        onChangeText={ setHomeAddress}
      />

      <TextInput
        style={styles.input}
        placeholder=" gender"
        value={ gender}
        onChangeText={ setGender}
      />

    <TextInput
        style={styles.input}
        placeholder=" Conditions"
        value={ conditions}
        onChangeText={ setConditions}
      />

    <TextInput
        style={styles.input}
        placeholder=" Other Condition"
        value={ otherCondition}
        onChangeText={ setOtherCondition}
      />

    <TextInput
        style={styles.input}
        placeholder=" Allergies"
        value={ allergies}
        onChangeText={ setAllergies}
      />

 <TextInput
        style={styles.input}
        placeholder=" Medications"
        value={ medications}
        onChangeText={ setMedications}
      />

<TextInput
        style={styles.input}
        placeholder=" Surgeries"
        value={ surgeries}
        onChangeText={ setSurgeries}
      />
      <TextInput
        style={styles.input}
        placeholder=" Preference"
        value={ preference}
        onChangeText={ setPreference}
      />

<TextInput
        style={styles.input}
        placeholder=" Medical Conditions"
        value={ medicalConditions}
        onChangeText={ setMedicalConditions}
      />

      
      <TextInput
        style={styles.input}
        placeholder="Special Assistance Needed"
        value={specialAssistance}
        onChangeText={setSpecialAssistance}
      />

      <TextInput
        style={styles.input}
        placeholder="Additional Notes"
        value={additionalNotes}
        onChangeText={setAdditionalNotes}
        multiline
      />

<TextInput
        style={styles.input}
        placeholder=" Contact Name"
        value={ contactName}
        onChangeText={ setContactName}
      />

      <TextInput
        style={styles.input}
        placeholder=" Emergency Contact Number"
        value={ emergencyContactNumber}
        onChangeText={ setEmergencyContactNumber}
      />

<TextInput
        style={styles.input}
        placeholder=" Relationship"
        value={ relationship}
        onChangeText={ setRelationship}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#00BCD4',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdditionalDetailsScreen;