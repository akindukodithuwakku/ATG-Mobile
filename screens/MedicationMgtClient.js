import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  Animated,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import CheckBox from "react-native-check-box";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import {
  scheduleMedicationReminder,
  formatTimeDisplay,
  DEFAULT_TIMES,
  startMedicationMonitoring,
  getCustomFrequencyExamples,
  validateCustomFrequency,
} from "../utils/MedicationNotificationService";
import {
  showSuccessNotification,
  showErrorNotification,
} from "../utils/NotificationHandler";

const scheduleOptions = ["Morning", "Evening", "Night", "Other"];

const MedicationMgtClient = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [medications, setMedications] = useState([
    {
      name: "",
      dosage: "",
      schedule: [],
      scheduleTime: new Date(),
      refillDate: new Date(),
      customSchedule: "",
      showSchedulePicker: false,
      showRefillPicker: false,
    },
  ]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState([{}]);
  const [showFrequencyExamples, setShowFrequencyExamples] = useState({});
  const scheme = useColorScheme();
  const menuAnimation = new Animated.Value(isMenuOpen ? 1 : 0);

  // Start medication monitoring when component mounts
  React.useEffect(() => {
    const cleanup = startMedicationMonitoring();
    return cleanup;
  }, []);

  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: isMenuOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const updateMedication = (index, key, value) => {
    const newMedications = [...medications];
    newMedications[index][key] = value;
    setMedications(newMedications);
    const newErrors = [...errors];
    newErrors[index][key] = "";
    setErrors(newErrors);
  };

  const toggleSchedule = (index, option) => {
    const current = [...medications];
    const schedule = [...(current[index].schedule || [])];
    const isOtherSelected = schedule.includes("Other");
    const isCurrentOptionSelected = schedule.includes(option);

    if (option === "Other") {
      // If "Other" is clicked
      if (isOtherSelected) {
        // If "Other" is already selected, deselect it
        current[index].schedule = [];
      } else {
        // If "Other" is not selected, select only "Other" (clear all others)
        current[index].schedule = ["Other"];
      }
    } else {
      // If a standard schedule (Morning, Evening, Night) is clicked
      if (isOtherSelected) {
        // If "Other" is currently selected, can't select standard schedules
        return;
      }

      if (isCurrentOptionSelected) {
        // If the option is already selected, remove it
        current[index].schedule = schedule.filter((item) => item !== option);
      } else {
        // If the option is not selected, add it to the current selection
        current[index].schedule = [...schedule, option];
      }
    }

    setMedications(current);
  };

  const handleFinish = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasError = false;
    const newErrors = medications.map((med) => {
      const e = {};
      if (!med.name.trim()) {
        e.name = "Medication name required";
        hasError = true;
      }
      if (!med.dosage.trim()) {
        e.dosage = "Dosage required";
        hasError = true;
      }
      if (med.schedule.length === 0) {
        e.schedule = "Select a schedule option";
        hasError = true;
      }
      if (med.schedule.includes("Other") && !med.customSchedule.trim()) {
        e.customSchedule = "Enter frequency for 'Other'";
        hasError = true;
      } else if (med.schedule.includes("Other") && med.customSchedule.trim()) {
        const validation = validateCustomFrequency(med.customSchedule);
        if (!validation.isValid) {
          e.customSchedule = validation.error;
          hasError = true;
        }
      }
      if (!med.refillDate) {
        e.refillDate = "Refill date required";
        hasError = true;
      } else if (med.refillDate < today) {
        e.refillDate = "Refill date must be in the future";
        hasError = true;
      }
      if (!med.scheduleTime) {
        e.scheduleTime = "Schedule time is required";
        hasError = true;
      } else if (med.refillDate && med.scheduleTime > med.refillDate) {
        e.refillDate = "Refill date must be after the schedule time";
        hasError = true;
      }

      return e;
    });

    setErrors(newErrors);
    if (hasError) return;

    const client_username = "testuser_01";

    for (let med of medications) {
      try {
        // Schedule notification reminders
        await scheduleMedicationReminder(
          med.name,
          med.dosage,
          med.schedule,
          med.schedule.includes("Other") ? med.customSchedule : null,
          med.refillDate
        );

        // Prepare API payload
        const payload = {
          client_username,
          medication_name: med.name,
          dosage: med.dosage,
          schedule_time: med.schedule.includes("Other")
            ? med.customSchedule
            : med.scheduleTime.toISOString(),
          refill_date: med.refillDate.toISOString(),
        };

        // Call API
        const response = await fetch(
          "https://rsxn7kxzr6.execute-api.ap-south-1.amazonaws.com/prod/addMedication",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();
        if (!response.ok) {
          await showErrorNotification(
            result?.error || "Failed to save medication"
          );
          Alert.alert("Upload Failed", result?.error || "Something went wrong");
          return;
        }

        await showSuccessNotification(
          `Medication ${med.name} added successfully with reminders set!`
        );
      } catch (err) {
        console.error("API Error:", err);
        await showErrorNotification("Failed to submit medication");
        Alert.alert("Error", "Failed to submit medication.");
        return;
      }
    }

    setIsSuccess(true);
  };

  const resetUpload = () => {
    setIsSuccess(false);
    setMedications([
      {
        name: "",
        dosage: "",
        schedule: [],
        scheduleTime: new Date(),
        refillDate: new Date(),
        customSchedule: "",
        showSchedulePicker: false,
        showRefillPicker: false,
      },
    ]);
    setErrors([{}]);
  };

  const renderSuccessPage = () => (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle-outline" size={80} color="#00AEEF" />
      <Text style={styles.successTitle}>Medication Added Successfully!</Text>
      <Text style={styles.successMessage}>Details saved successfully.</Text>
      <TouchableOpacity style={styles.successButton} onPress={resetUpload}>
        <Text style={styles.successButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Medication Management</Text>
      </View>

      {isMenuOpen && (
        <Animated.View style={[styles.overlay, { opacity: menuAnimation }]}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </Animated.View>
      )}

      <View style={styles.navButtonsContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("MarkMedication")}
        >
          <Text style={styles.navButtonText}>Mark Medication Taken</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("MedicationLog")}
        >
          <Text style={styles.navButtonText}>View Medication Log</Text>
        </TouchableOpacity>
      </View>

      {isSuccess ? (
        renderSuccessPage()
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Medication Details</Text>

          {medications.map((med, index) => (
            <View key={index} style={styles.medicationBox}>
              <Text style={styles.label}>Medication Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors[index]?.name && styles.errorBorder,
                ]}
                placeholder="e.g. Aspirin"
                value={med.name}
                onChangeText={(text) => updateMedication(index, "name", text)}
              />
              {errors[index]?.name && (
                <Text style={styles.errorText}>{errors[index].name}</Text>
              )}

              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors[index]?.dosage && styles.errorBorder,
                ]}
                placeholder="e.g. 500 mg"
                value={med.dosage}
                onChangeText={(text) => updateMedication(index, "dosage", text)}
              />
              {errors[index]?.dosage && (
                <Text style={styles.errorText}>{errors[index].dosage}</Text>
              )}

              <Text style={styles.label}>Schedule</Text>
              <View style={styles.checkboxRow}>
                {scheduleOptions.map((option) => (
                  <View key={option} style={styles.checkboxContainer}>
                    <CheckBox
                      style={styles.checkbox}
                      isChecked={(med.schedule || []).includes(option)}
                      onClick={() => toggleSchedule(index, option)}
                      rightText={option}
                      checkBoxColor="#00AEEF"
                      disabled={
                        // Disable "Other" if any standard schedule is selected
                        (option === "Other" &&
                          (med.schedule || []).some(
                            (opt) => opt !== "Other"
                          )) ||
                        // Disable standard schedules if "Other" is selected
                        (option !== "Other" &&
                          (med.schedule || []).includes("Other"))
                      }
                    />
                    {option !== "Other" && DEFAULT_TIMES[option] && (
                      <Text style={styles.defaultTimeText}>
                        (Default: {formatTimeDisplay(option)})
                      </Text>
                    )}
                  </View>
                ))}
              </View>
              {errors[index]?.schedule && (
                <Text style={styles.errorText}>{errors[index].schedule}</Text>
              )}

              {med.schedule.includes("Other") && (
                <>
                  <View style={styles.customFrequencyContainer}>
                    <Text style={styles.label}>Frequency (for "Other")</Text>
                    <TouchableOpacity
                      style={styles.examplesButton}
                      onPress={() => {
                        const updated = { ...showFrequencyExamples };
                        updated[index] = !updated[index];
                        setShowFrequencyExamples(updated);
                      }}
                    >
                      <Text style={styles.examplesButtonText}>
                        {showFrequencyExamples[index]
                          ? "Hide Examples"
                          : "Show Examples"}
                      </Text>
                      <Ionicons
                        name={
                          showFrequencyExamples[index]
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={16}
                        color="#00AEEF"
                      />
                    </TouchableOpacity>
                  </View>

                  {showFrequencyExamples[index] && (
                    <View style={styles.examplesContainer}>
                      <Text style={styles.examplesTitle}>Examples:</Text>
                      {getCustomFrequencyExamples().map((example, exIndex) => (
                        <TouchableOpacity
                          key={exIndex}
                          style={styles.exampleItem}
                          onPress={() => {
                            updateMedication(index, "customSchedule", example);
                            const updated = { ...showFrequencyExamples };
                            updated[index] = false;
                            setShowFrequencyExamples(updated);
                          }}
                        >
                          <Text style={styles.exampleText}>• {example}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <TextInput
                    style={[
                      styles.textInput,
                      errors[index]?.customSchedule && styles.errorBorder,
                    ]}
                    placeholder="e.g. Every 6 hours, Twice a day"
                    value={med.customSchedule}
                    onChangeText={(text) => {
                      updateMedication(index, "customSchedule", text);

                      // Real-time validation
                      if (text.trim()) {
                        const validation = validateCustomFrequency(text);
                        if (validation.isValid) {
                          // Clear any previous error
                          const newErrors = [...errors];
                          newErrors[index] = { ...newErrors[index] };
                          delete newErrors[index].customSchedule;
                          setErrors(newErrors);
                        }
                      }
                    }}
                  />

                  {/* Show validation info if input is valid */}
                  {med.customSchedule &&
                    (() => {
                      const validation = validateCustomFrequency(
                        med.customSchedule
                      );
                      if (validation.isValid) {
                        return (
                          <Text style={styles.validationInfo}>
                            ✓ {validation.description}
                          </Text>
                        );
                      }
                      return null;
                    })()}

                  {errors[index]?.customSchedule && (
                    <Text style={styles.errorText}>
                      {errors[index].customSchedule}
                    </Text>
                  )}
                </>
              )}

              <Text style={styles.label}>Next Refill Date</Text>
              <TouchableOpacity
                onPress={() => {
                  const updated = [...medications];
                  updated[index].showRefillPicker = true;
                  setMedications(updated);
                }}
              >
                <Text style={styles.valueText}>
                  {med.refillDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {med.showRefillPicker && (
                <DateTimePicker
                  value={med.refillDate || new Date()}
                  mode="date"
                  display={Platform.OS === "android" ? "calendar" : "default"}
                  onChange={(event, selectedDate) => {
                    const updated = [...medications];
                    updated[index].showRefillPicker = Platform.OS === "ios";
                    if (selectedDate) {
                      updated[index].refillDate = selectedDate;
                    }
                    setMedications(updated);
                  }}
                />
              )}
              {errors[index]?.refillDate && (
                <Text style={styles.errorText}>{errors[index].refillDate}</Text>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Finished</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

export default MedicationMgtClient;

// --- styles remain unchanged from your original code ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 30,
  },
  headerText: { fontSize: 20, fontWeight: "bold", marginLeft: 15 },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00AEEF",
    marginBottom: 10,
  },
  medicationBox: {
    backgroundColor: "#F2F2F2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  textInput: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  errorBorder: { borderColor: "red" },
  finishButton: {
    backgroundColor: "#00AEEF",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 70,
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00AEEF",
    marginTop: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  successButton: {
    backgroundColor: "#00AEEF",
    padding: 20,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 40,
  },
  successButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  navButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#e6f7ff",
  },
  navButton: {
    backgroundColor: "#00AEEF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  navButtonText: { color: "#fff", fontWeight: "bold" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    zIndex: 1,
  },
  overlayBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  errorText: { color: "red", fontSize: 12, marginBottom: 10 },
  checkboxRow: { flexDirection: "column", marginBottom: 10 },
  checkboxContainer: { marginBottom: 8 },
  checkbox: { width: "100%", padding: 8 },
  defaultTimeText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 25,
    marginTop: -5,
    fontStyle: "italic",
  },
  valueText: { marginBottom: 10, fontSize: 16, color: "#333" },
  customFrequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  examplesButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#e6f7ff",
    borderRadius: 12,
  },
  examplesButtonText: {
    color: "#00AEEF",
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 4,
  },
  examplesContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#00AEEF",
  },
  examplesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  exampleItem: {
    paddingVertical: 2,
  },
  exampleText: {
    fontSize: 12,
    color: "#555",
  },
  validationInfo: {
    fontSize: 11,
    color: "#00AA00",
    marginTop: -5,
    marginBottom: 10,
    fontStyle: "italic",
  },
});
