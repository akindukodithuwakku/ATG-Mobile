import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform,useColorScheme,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigationClient from "../Components/BottomNavigationClient";

const EmergencyContact = ({ navigation }) => {
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const scheme = useColorScheme();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar barStyle={scheme === "dark" ? "light-content" : "dark-content"} translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Emergency Contact Information</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Emergency Contact Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Name"
              placeholderTextColor="#B3E5FC"
              value={contactName}
              onChangeText={setContactName}
            />

            <Text style={styles.label}>Emergency Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Contact Number"
              placeholderTextColor="#B3E5FC"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
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
            onPress={() => navigation.navigate("CareIntakeReview")}
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
});

export default EmergencyContact;