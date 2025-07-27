import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Improved date formatting: accepts DD/MM/YYYY or YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes("-")) {
      // Already in YYYY-MM-DD
      return dateStr;
    }
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return dateStr; // fallback
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  // Transform formData to match backend structure
  const transformFormData = (formData) => {
    const conditions = formData.conditions || {};
    const medicalConditions = formData.medicalConditions || {};
    const specialAssistance = formData.specialAssistance || {};

    return {
      client_username: formData.username || null,
      care_navigator_username: formData.careNavigatorUsername || null,
      full_name: formData.fullName || null,
      date_of_birth: formatDate(formData.dateOfBirth) || null,
      gender: formData.gender || null,
      contact_number: formData.contactNumber || null,
      home_address: formData.homeAddress || null,
      profile_img_key: formData.profileImgKey || null,

      // Health Conditions (from HealthConditions screen)
      current_medical_conditions_diabetes:
        typeof conditions.diabetes === "boolean"
          ? conditions.diabetes
            ? 1
            : 0
          : 0,
      current_medical_conditions_hypertension:
        typeof conditions.hypertension === "boolean"
          ? conditions.hypertension
            ? 1
            : 0
          : 0,
      current_medical_conditions_arthritis:
        typeof conditions.arthritis === "boolean"
          ? conditions.arthritis
            ? 1
            : 0
          : 0,
      current_medical_conditions_heart_disease:
        typeof conditions.heartDisease === "boolean"
          ? conditions.heartDisease
            ? 1
            : 0
          : 0,
      current_medical_conditions_other: formData.otherCondition || null,
      known_allergies: formData.allergies || null,
      current_medications: formData.medications || null,
      history_of_surgeries_procedures: formData.surgeries || null,

      // Care Needs (from CareNeedsPreferences screen)
      primary_reason_for_care: formData.preference || null,
      current_medical_conditions_weekdays:
        medicalConditions["weekdays morning"] ||
        medicalConditions["weekdays evening"]
          ? 1
          : 0,
      current_medical_conditions_weekends:
        medicalConditions["weekends morning"] ||
        medicalConditions["weekends evening"]
          ? 1
          : 0,
      current_medical_conditions_morning:
        medicalConditions["weekdays morning"] ||
        medicalConditions["weekends morning"]
          ? 1
          : 0,
      current_medical_conditions_evening:
        medicalConditions["weekdays evening"] ||
        medicalConditions["weekends evening"]
          ? 1
          : 0,

      // Special Assistance
      special_assistance_mobility:
        typeof specialAssistance.mobility === "boolean"
          ? specialAssistance.mobility
            ? 1
            : 0
          : 0,
      special_assistance_language_preferences:
        typeof specialAssistance.languagePreferences === "boolean"
          ? specialAssistance.languagePreferences
            ? 1
            : 0
          : 0,
      special_assistance_medication_management:
        typeof specialAssistance.medicationManagement === "boolean"
          ? specialAssistance.medicationManagement
            ? 1
            : 0
          : 0,
      special_assistance_hygiene:
        typeof specialAssistance.hygiene === "boolean"
          ? specialAssistance.hygiene
            ? 1
            : 0
          : 0,
      additional_notes: formData.additionalNotes || null,

      // Emergency Contact
      emergency_contact_name: formData.contactName || null,
      emergency_contact_number: formData.emergencyContactNumber || null,
      relationship_to_emergency_contact: formData.relationship || null,
    };
  };

  const validateReviewForm = (data) => {
    if (
      !data.fullName ||
      !data.dateOfBirth ||
      !data.gender ||
      !data.contactNumber ||
      !data.homeAddress ||
      !data.contactName ||
      !data.emergencyContactNumber ||
      !data.relationship
    ) {
      Alert.alert(
        "Validation Error",
        "Please fill all required fields before submitting."
      );
      return false;
    }
    return true;
  };

  const assignCareNavigator = async (clientUsername) => {
    try {
      console.log("Assigning care navigator for client:", clientUsername);

      // Calling the Lambda function through API Gateway for care navigator assignment
      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "assign_care_navigator",
          data: {
            client_username: clientUsername.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.body) {
        throw new Error("Invalid server response format");
      }

      const parsedResult =
        typeof result.body === "string" ? JSON.parse(result.body) : result.body;

      const statusCode = result.statusCode;

      console.log("Care navigator assignment response status:", statusCode);
      console.log("Assignment result:", parsedResult);

      if (statusCode === 200) {
        console.log("Care navigator assigned successfully");

        // Check if it's a new assignment or existing one
        if (parsedResult.assigned_navigator) {
          console.log(`Assigned navigator: ${parsedResult.assigned_navigator}`);
          return {
            success: true,
            message: parsedResult.message,
            assignedNavigator: parsedResult.assigned_navigator,
            isNewAssignment: !parsedResult.message.includes("already has"),
          };
        } else {
          // Case where client already had a navigator
          return {
            success: true,
            message: parsedResult.message,
            assignedNavigator: parsedResult.assigned_navigator || null,
            isNewAssignment: false,
          };
        }
      } else {
        // Handle different error scenarios based on status code
        let errorMessage = parsedResult.error || "Unknown error occurred";

        switch (statusCode) {
          case 400:
            console.error("Bad request - missing required fields");
            throw new Error(`Invalid request: ${errorMessage}`);
          case 404:
            if (errorMessage.includes("Client not found")) {
              console.error("Client not found in database");
              throw new Error(
                "Client account not found. Please contact support."
              );
            } else if (errorMessage.includes("No active care navigators")) {
              console.error("No active care navigators available");
              throw new Error(
                "No care navigators available at the moment. Please try again later."
              );
            }
            break;
          case 500:
            console.error("Database error:", errorMessage);
            throw new Error("Server error occurred. Please try again later.");
          default:
            console.error("Unexpected error:", errorMessage);
            throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Care navigator assignment error:", error);

      // Return error object instead of throwing for better handling
      return {
        success: false,
        error: error.message,
        isNetworkError:
          error.message.includes("fetch") || error.message.includes("network"),
      };
    }
  };

  const updateDB = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      let applicationUser;
      if (accessToken) {
        applicationUser = await AsyncStorage.getItem("appUser");
      } else {
        applicationUser = await AsyncStorage.getItem("appUsername");
      }
      const updateActive = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "active_user",
          data: {
            username: applicationUser.trim(),
          },
        }),
      });

      if (!updateActive.ok) {
        throw new Error("Server response failed.");
      }

      Alert.alert("Client profile updated as an active account.");

      const assignmentResult = await assignCareNavigator(applicationUser);

      if (assignmentResult.success) {
        if (assignmentResult.isNewAssignment) {
          console.log(
            `Care navigator ${assignmentResult.assignedNavigator} assigned to ${applicationUser}`
          );

          Alert.alert(
            "Account Created",
            "Your account has been created and a care navigator has been assigned to help you."
          );
        } else {
          console.log("Care navigator was already assigned");
        }
      } else {
        // Handle assignment failure
        console.error(
          "Failed to assign care navigator:",
          assignmentResult.error
        );

        if (assignmentResult.isNetworkError) {
          Alert.alert(
            "Network Error",
            "Your account was created but we couldn't assign a care navigator due to connection issues. Please contact support."
          );
        } else {
          Alert.alert(
            "Assignment Error",
            `Your account was created but care navigator assignment failed: ${assignmentResult.error}. Please contact support.`
          );
        }
      }
    } catch (error) {
      Alert.alert(
        "Failed to update account status or failed to assign a care navigator"
      );
    } finally {
      await AsyncStorage.removeItem("appUsername");
    }
  };

  const handleSubmit = async () => {
    if (!validateReviewForm(formData)) return;
    try {
      const payload = transformFormData(formData);
      console.log("Submitting payload:", payload);

      const response = await fetch(
        "https://iwr4xjz0i5.execute-api.ap-south-1.amazonaws.com/dev/careintake",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        await AsyncStorage.removeItem("healthConditions");
        await AsyncStorage.removeItem("careNeedsPreferences");
        await AsyncStorage.removeItem("emergencyContact");
        await AsyncStorage.removeItem("personalInfo");

        updateDB();

        navigation.navigate("SubmissionSuccess");
      } else {
        const errorText = await response.text();
        if (errorText.toLowerCase().includes("duplicate entry")) {
          Alert.alert(
            "Submission Failed",
            "This username already exists. Please use a different username."
          );
        } else {
          Alert.alert("Submission Failed", errorText || "Please try again.");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      Alert.alert(
        "Error",
        "Something went wrong. Please check your internet connection."
      );
    }
  };

  // Helper for displaying selected checkboxes
  const getSelected = (obj, otherText) => {
    if (!obj) return "None";
    let selected = Object.entries(obj)
      .filter(([_, v]) => v && _ !== "other")
      .map(([k]) => k);

    // If "other" is selected, add the otherText
    if (obj.other && otherText) {
      selected.push(otherText);
    } else if (obj.other) {
      selected.push("Other");
    }

    return selected.length ? selected.join(", ") : "None";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar
          barStyle={scheme === "dark" ? "light-content" : "dark-content"}
          translucent
          backgroundColor={scheme === "dark" ? "black" : "transparent"}
        />

        <View style={styles.header}>
          <Text style={styles.headerText}>Care Intake Review</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.fullName || ""}
              onChangeText={(text) => handleChange("fullName", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth"
              value={formData.dateOfBirth || ""}
              onChangeText={(text) => handleChange("dateOfBirth", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender"
              value={formData.gender || ""}
              onChangeText={(text) => handleChange("gender", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              value={formData.contactNumber || ""}
              onChangeText={(text) => handleChange("contactNumber", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Home Address"
              value={formData.homeAddress || ""}
              onChangeText={(text) => handleChange("homeAddress", text)}
            />

            <Text style={styles.sectionTitle}>Health Conditions</Text>
            <TextInput
              style={styles.input}
              value={getSelected(formData.conditions, formData.otherCondition)}
              editable={false}
              placeholder="Current Medical Conditions"
            />
            <TextInput
              style={styles.input}
              placeholder="Allergies"
              value={formData.allergies || ""}
              onChangeText={(text) => handleChange("allergies", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Medications"
              value={formData.medications || ""}
              onChangeText={(text) => handleChange("medications", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Surgeries"
              value={formData.surgeries || ""}
              onChangeText={(text) => handleChange("surgeries", text)}
            />

            <Text style={styles.sectionTitle}>Care Needs & Preferences</Text>
            <TextInput
              style={styles.input}
              placeholder="Primary Reason for care"
              value={formData.preference || ""}
              onChangeText={(text) => handleChange("preference", text)}
            />
            <TextInput
              style={styles.input}
              value={getSelected(formData.medicalConditions)}
              editable={false}
              placeholder="Current Medical Conditions (Care Needs)"
            />
            <TextInput
              style={styles.input}
              value={getSelected(formData.specialAssistance)}
              editable={false}
              placeholder="Special Assistance Needed"
            />
            <TextInput
              style={styles.input}
              placeholder="Additional Notes"
              value={formData.additionalNotes || ""}
              onChangeText={(text) => handleChange("additionalNotes", text)}
              multiline
            />

            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Emergency Contact Name"
              value={formData.contactName || ""}
              onChangeText={(text) => handleChange("contactName", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Emergency Contact Number"
              value={formData.emergencyContactNumber || ""}
              onChangeText={(text) =>
                handleChange("emergencyContactNumber", text)
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship to Emergency Contact"
              value={formData.relationship || ""}
              onChangeText={(text) => handleChange("relationship", text)}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSubmit}
          >
            <Text style={styles.continueText}>Submit</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 40,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginLeft: 30,
  },
  scrollContainer: { flexGrow: 1, paddingBottom: 150 },
  formContainer: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    color: "#00BCD4",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  buttonContainer: { padding: 20, paddingEnd: 30 },
  continueButton: {
    backgroundColor: "#00BCD4",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 50,
  },
  continueText: { fontSize: 16, fontWeight: "bold", color: "white" },
  reviewLabel: { fontSize: 16, color: "#333", marginBottom: 10 },
});

export default CareIntakeReview;
