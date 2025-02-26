import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CareIntakeReview = ({ route }) => {
  const navigation = useNavigation();
  const formData = route.params; // All form data from previous steps

  const handleSubmit = () => {
    // Submit logic here (e.g., API call)
    navigation.navigate('SubmissionSuccess'); // Navigate to success screen
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Care Intake Form Review</Text>

      {/* Personal Information */}
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={formData.fullName} editable={false} />

      <Text style={styles.label}>Date of Birth</Text>
      <TextInput style={styles.input} value={formData.dob} editable={false} />

      <Text style={styles.label}>Gender</Text>
      <TextInput style={styles.input} value={formData.gender} editable={false} />

      <Text style={styles.label}>Contact Number</Text>
      <TextInput style={styles.input} value={formData.contactNumber} editable={false} />

      <Text style={styles.label}>Home Address</Text>
      <TextInput style={styles.input} value={formData.address} editable={false} />

      {/* Emergency Contact */}
      <Text style={styles.sectionTitle}>Emergency Contact</Text>
      <Text style={styles.label}>Contact Name</Text>
      <TextInput style={styles.input} value={formData.emergencyName} editable={false} />

      <Text style={styles.label}>Emergency Contact Number</Text>
      <TextInput style={styles.input} value={formData.emergencyNumber} editable={false} />

      <Text style={styles.label}>Relationship</Text>
      <TextInput style={styles.input} value={formData.emergencyRelation} editable={false} />

      {/* Medical History */}
      <Text style={styles.sectionTitle}>Medical History</Text>
      <Text style={styles.label}>Current Medical Conditions</Text>
      <TextInput style={styles.input} value={formData.medicalConditions.join(', ')} editable={false} />

      <Text style={styles.label}>Allergies</Text>
      <TextInput style={styles.input} value={formData.allergies.join(', ')} editable={false} />

      <Text style={styles.label}>Medications</Text>
      <TextInput style={styles.input} value={formData.medications.join(', ')} editable={false} />

      <Text style={styles.label}>Recent Surgeries</Text>
      <TextInput style={styles.input} value={formData.surgeries.join(', ')} editable={false} />

      {/* Care Needs */}
      <Text style={styles.sectionTitle}>Care Needs</Text>
      <Text style={styles.label}>Primary Care Concerns</Text>
      <TextInput style={styles.input} value={formData.careConcerns} editable={false} />

      <Text style={styles.label}>Required Assistance</Text>
      <TextInput style={styles.input} value={formData.assistanceRequired.join(', ')} editable={false} />

      <Text style={styles.label}>Mobility Support Needed</Text>
      <TextInput style={styles.input} value={formData.mobilitySupport ? "Yes" : "No"} editable={false} />

      {/* Insurance & Additional Information */}
      <Text style={styles.sectionTitle}>Insurance & Additional Info</Text>
      <Text style={styles.label}>Insurance Provider</Text>
      <TextInput style={styles.input} value={formData.insuranceProvider} editable={false} />

      <Text style={styles.label}>Policy Number</Text>
      <TextInput style={styles.input} value={formData.policyNumber} editable={false} />

      <Text style={styles.label}>Additional Notes</Text>
      <TextInput style={styles.input} value={formData.additionalNotes} editable={false} />

      {/* Consent Checkbox */}
      <View style={styles.checkboxContainer}>
        <Text style={styles.checkboxLabel}>
          ☐ I confirm that the information provided is accurate and consent to care services.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonBack} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSubmit} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, color: '#007BFF' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { backgroundColor: '#F5F5F5', padding: 10, borderRadius: 5, marginTop: 5 },
  checkboxContainer: { marginVertical: 10 },
  checkboxLabel: { fontSize: 14 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  buttonBack: { backgroundColor: '#ddd', padding: 10, borderRadius: 5 },
  buttonSubmit: { backgroundColor: '#00CFFF', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default CareIntakeReview;