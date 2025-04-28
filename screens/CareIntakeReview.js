// Final review of the care intake form after entering data into the form
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from '../Components/BottomNavigationClient';
import SideNavigationClient from '../Components/SideNavigationClient';

const CareIntakeReview = ({ navigation, route }) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [gender, setGender] = useState('');
  const [conditions, setConditions] = useState({});
  const [otherCondition, setOtherCondition] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    if (route.params?.personalInfoData) {
      const { fullName, dateOfBirth, contactNumber, homeAddress, gender } = route.params.personalInfoData;
      setFullName(fullName);
      setDateOfBirth(dateOfBirth);
      setContactNumber(contactNumber);
      setHomeAddress(homeAddress);
      setGender(gender);
    }

    if (route.params?.healthData) {
      const { conditions, otherCondition, allergies, medications, surgeries } = route.params.healthData;
      setConditions(conditions);
      setOtherCondition(otherCondition);
      setAllergies(allergies);
      setMedications(medications);
      setSurgeries(surgeries);
    }

    if (route.params?.emergencyContactData) {
      const { contactName, contactNumber, relationship } = route.params.emergencyContactData;
      setEmergencyContactName(contactName);
      setEmergencyContactNumber(contactNumber);
      setRelationship(relationship);
    }
  }, [route.params]);

  const handleSubmit = async () => {
    const formData = {
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
    };

    try {
      // Replace with your API endpoint
      const response = await fetch('https://abc123.execute-api.ap-south-1.amazonaws.com/dev/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Clear the form fields
      setFullName('');
      setDateOfBirth('');
      setContactNumber('');
      setHomeAddress('');
      setGender('');
      setConditions({});
      setOtherCondition('');
      setAllergies('');
      setMedications('');
      setSurgeries('');
      setEmergencyContactName('');
      setEmergencyContactNumber('');
      setRelationship('');

      // Navigate to a success screen
      navigation.navigate('SubmissionSuccess');
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (e.g., show an alert)
    }
  };

  const closeSideNav = () => {
    setIsSideNavVisible(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
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
            <Text style={styles.dataText}>{fullName}</Text>

            <Text style={styles.label}>Date Of Birth</Text>
            <Text style={styles.dataText}>{dateOfBirth}</Text>

            <Text style={styles.label}>Gender</Text>
            <Text style={styles.dataText}>{gender}</Text>

            <Text style={styles.label}>Contact Number</Text>
            <Text style={styles.dataText}>{contactNumber}</Text>

            <Text style={styles.label}>Home Address</Text>
            <Text style={styles.dataText}>{homeAddress}</Text>

            {/* Health Conditions */}
            <Text style={styles.label}>Current Medical Conditions</Text>
            {Object.keys(conditions).map((key) => (
              conditions[key] && (
                <Text key={key} style={styles.dataText}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              )
            ))}
            {conditions.other && (
              <Text style={styles.dataText}>Other: {otherCondition}</Text>
            )}

            <Text style={styles.label}>Known Allergies</Text>
            <Text style={styles.dataText}>{allergies}</Text>

            <Text style={styles.label}>Current Medications</Text>
            <Text style={styles.dataText}>{medications}</Text>

            <Text style={styles.label}>History of Surgeries/Procedures</Text>
            <Text style={styles.dataText}>{surgeries}</Text>

            {/* Emergency Contact Information */}
            <Text style={styles.label}>Emergency Contact Name</Text>
            <Text style={styles.dataText}>{emergencyContactName}</Text>

            <Text style={styles.label}>Emergency Contact Number</Text>
            <Text style={styles.dataText}>{emergencyContactNumber}</Text>

            <Text style={styles.label}>Relationship To Emergency Contact</Text>
            <Text style={styles.dataText}>{relationship}</Text>
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueButton} onPress={handleSubmit}>
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
  dataText: {
    fontSize: 16,
    marginTop: 8,
    color: "#555",
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