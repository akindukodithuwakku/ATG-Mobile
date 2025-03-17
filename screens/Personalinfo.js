//personal information form
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomNavigationClient from "../Components/BottomNavigationClient";
import SideNavigationClient from "../Components/SideNavigationClient";

const ErrorIcon = () => (
  <View style={styles.errorIcon}>
    <Text style={styles.errorIconText}>!</Text>
  </View>
);

const PersonalInfo = ({ navigation }) => {
  const [userName, setUserName] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [isMale, setIsMale] = useState(false);
  const [isFemale, setIsFemale] = useState(false);
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scheme = useColorScheme();

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString();
      setDateOfBirth(formattedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Function to close the side navigation
  const closeSideNav = () => {
    setIsSideNavVisible(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userName) newErrors.userName = "Username cannot be empty";
    if (!fullName) newErrors.fullName = "Full Name cannot be empty";
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of Birth cannot be empty";
    if (!contactNumber) newErrors.contactNumber = "Contact Number cannot be empty";
    if (!homeAddress) newErrors.homeAddress = "Home Address cannot be empty";
    if (!isMale && !isFemale) newErrors.gender = "Please select a gender";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleContinue = () => {
    if (validateForm()) {
      const personalInfoData = {
        userName,
        fullName,
        dateOfBirth,
        contactNumber,
        homeAddress,
        gender: isMale ? "Male" : "Female", // Determine gender based on the selected switch
      };
      navigation.navigate("HealthConditions", { personalInfoData }); // Pass data to the next screen
    }
  };

  // Clear error when user starts typing
  const handleInputChange = (setter, field) => (text) => {
    setter(text);
    if (errors[field]) {
      setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
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
        <Text style={styles.headerText}>Personal Information</Text>
      </View>

      {/* Side Navigation */}
      {isSideNavVisible && (
        <SideNavigationClient navigation={navigation} onClose={closeSideNav} />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Form Fields */}
        <View style={styles.formContainer}>

          {/* Username Field */}
    <Text style={styles.label}>Username</Text>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#B3E5FC"
        value={userName}
        onChangeText={handleInputChange(setUserName, "userName")}
      />
      {errors.userName}
    </View>
    {errors.userName && (
      <View style={styles.errorContainer}>
        <ErrorIcon />
        <Text style={styles.error}>{errors.userName}</Text>
      </View>
    )}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#B3E5FC"
              value={fullName}
              onChangeText={handleInputChange(setFullName, "fullName")}
            />
            {errors.fullName}
          </View>
          {errors.fullName && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{errors.fullName}</Text>
            </View>
          )}

          <Text style={styles.label}>Date Of Birth</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="DD / MM / YYYY"
              placeholderTextColor="#B3E5FC"
              value={dateOfBirth}
              onChangeText={handleInputChange(setDateOfBirth, "dateOfBirth")}
              onFocus={showDatepicker}
            />
            <TouchableOpacity onPress={showDatepicker}>
              <Ionicons name="calendar" size={24} color="#00BCD4" />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          {errors.dateOfBirth && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{errors.dateOfBirth}</Text>
            </View>
          )}

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            <View style={styles.genderOption}>
              <Switch
                value={isMale}
                onValueChange={() => {
                  setIsMale(true);
                  setIsFemale(false);
                }}
              />
              <Text style={styles.genderText}>Male</Text>
            </View>
            <View style={{ width: 60 }} />
            <View style={styles.genderOption}>
              <Switch
                value={isFemale}
                onValueChange={() => {
                  setIsFemale(true);
                  setIsMale(false);
                }}
              />
              <Text style={styles.genderText}>Female</Text>
            </View>
          </View>
          {errors.gender && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{errors.gender}</Text>
            </View>
          )}

          <Text style={styles.label}>Contact Number</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your contact number"
              placeholderTextColor="#B3E5FC"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={handleInputChange(setContactNumber, "contactNumber")}
            />
            {errors.contactNumber}
          </View>
          {errors.contactNumber && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{errors.contactNumber}</Text>
            </View>
          )}

          <Text style={styles.label}>Home Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Enter your home address"
              placeholderTextColor="#B3E5FC"
              value={homeAddress}
              onChangeText={handleInputChange(setHomeAddress, "homeAddress")}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.homeAddress}
          </View>
          {errors.homeAddress && (
            <View style={styles.errorContainer}>
              <ErrorIcon />
              <Text style={styles.error}>{errors.homeAddress}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

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
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  input: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    flex: 1,
  },
  textArea: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: "top",
    flex: 1,
  },
  genderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    justifyContent: "flex-start",
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  genderText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  continueButton: {
    backgroundColor: "#00BCD4",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    position: "absolute",
    bottom: 70,
  },
  continueText: {
    fontSize: 18,
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
    fontSize: 16,
    color: 'white',
  },
});

export default PersonalInfo;