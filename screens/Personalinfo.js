import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Switch,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigationClient from "../Components/BottomNavigationClient";

const PersonalInfo = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [isMale, setIsMale] = useState(false);
  const [isFemale, setIsFemale] = useState(false);
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Personal Information</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Form Fields */}
        <View style={styles.formContainer}>
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
        </View>
      </ScrollView>

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate("HealthConditions")} // Navigate to HealthConditions
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
  input: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 12,
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
  textArea: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginTop: 12,
    height: 80, // Adjust height as needed
    textAlignVertical: "top", // Ensures text starts at the top
  },
});

export default PersonalInfo;
