import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from '../Components/BottomNavigationClient';
import SideNavigationClient from '../Components/SideNavigationClient'; // Import the SideNavigationClient

const CareIntakeReview = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [gender, setGender] = useState(''); // 'male' or 'female'
  const [conditions, setConditions] = useState({
    diabetes: false,
    hypertension: false,
    arthritis: false,
    heartDisease: false,
    other: false,
  });
  const [otherCondition, setOtherCondition] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isSideNavVisible, setIsSideNavVisible] = useState(false); // State to control side navigation visibility
  const scheme = useColorScheme();

  const toggleCondition = (key) => {
    setConditions({ ...conditions, [key]: !conditions[key] });
  };

  const handleSubmit = () => {
    console.log({
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
      emergencyContactName,
      emergencyContactNumber,
      relationship,
    });
    navigation.navigate('SubmissionSuccess'); // Navigate to SubmissionSuccess screen
  };

  // Function to close the side navigation
  const closeSideNav = () => {
    setIsSideNavVisible(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar
          barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
          translucent={true}
          backgroundColor={scheme === 'dark' ? 'black' : 'transparent'}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Care Intake Review</Text>
        </View>

        {/* Side Navigation */}
        {isSideNavVisible && (
          <SideNavigationClient navigation={navigation} onClose={closeSideNav} />
        )}

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            {/* Personal Information */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#B3E5FC"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Date Of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="DD / MM / YYYY"
              placeholderTextColor="#B3E5FC"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity onPress={() => setGender('male')} style={styles.genderOption}>
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setGender('female')} style={styles.genderOption}>
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your contact number"
              placeholderTextColor="#B3E5FC"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            <Text style={styles.label}>Home Address</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your home address"
              placeholderTextColor="#B3E5FC"
              value={homeAddress}
              onChangeText={setHomeAddress}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Health Conditions */}
            <Text style={styles.label}>Current Medical Conditions</Text>
            {Object.keys(conditions).map((key) => (
              <View key={key} style={styles.checkboxContainer}>
                <TouchableOpacity onPress={() => toggleCondition(key)} style={styles.checkboxRow}>
                  <Text style={styles.checkboxText}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.checkboxText}>{conditions[key] ? '✓' : '✗'}</Text>
                </TouchableOpacity>
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

            {/* Emergency Contact Information */}
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Name"
              placeholderTextColor="#B3E5FC"
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
            />

            <Text style={styles.label}>Emergency Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Number"
              placeholderTextColor="#B3E5FC"
              keyboardType="phone-pad"
              value={emergencyContactNumber}
              onChangeText={setEmergencyContactNumber}
            />

            <Text style={styles.label}>Relationship To Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Relationship"
              placeholderTextColor="#B3E5FC"
              value={relationship}
              onChangeText={setRelationship}
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
            onPress={handleSubmit} // Submit the form
          >
            <Text style={styles.continueText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <BottomNavigationClient navigation={navigation} />
 </View>
    </KeyboardAvoidingView>
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
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  input: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 12,
  },
  textArea: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 12,
    height: 80,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  genderOption: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  genderText: {
    fontSize: 16,
    color: "#333",
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
    marginLeft: 10,
  },
  backText: { fontSize: 16, fontWeight: "bold", color: "#00BCD4", textAlign: "center" },
  continueText: { fontSize: 16, fontWeight: "bold", color: "white", textAlign: "center" },
});

export default CareIntakeReview;