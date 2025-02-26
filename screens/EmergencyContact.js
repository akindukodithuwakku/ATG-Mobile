import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const EmergencyContact = ({ navigation }) => {
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [relationship, setRelationship] = useState("");

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Emergency Contact Information</Text>

        {/* Emergency Contact Name */}
        <Text style={styles.subHeader}>Emergency Contact Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Contact Name"
          value={contactName}
          onChangeText={setContactName}
        />

        {/* Emergency Contact Number */}
        <Text style={styles.subHeader}>Emergency Contact Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Contact Number"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />

        {/* Relationship */}
        <Text style={styles.subHeader}>Relationship To Emergency Contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Relationship"
          value={relationship}
          onChangeText={setRelationship}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate("NextScreen")}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8FDFF" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", color: "#00AEEF", marginBottom: 20 },
  subHeader: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 15 },
  input: { borderWidth: 1, borderColor: "#C0C0C0", borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: "#FFF" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  backButton: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#00AEEF", flex: 1, alignItems: "center", marginRight: 10 },
  backText: { color: "#00AEEF", fontSize: 16, fontWeight: "bold" },
  continueButton: { padding: 12, borderRadius: 10, backgroundColor: "#00AEEF", flex: 1, alignItems: "center" },
  continueText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});

export default EmergencyContact;