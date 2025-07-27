import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
  Alert,
  StyleSheet, // <-- Add this line
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomNavigationCN from '../Components/BottomNavigationCN';
import SideNavigationCN from '../Components/SideNavigationCN';
import { sendTaskUpdateNotification } from '../utils/NotificationHandler';

const STATUS_OPTIONS = ["pending", "completed", "overdue"];

const UpdateTaskScreen = ({ navigation, route }) => {
  // You should get the task details from route.params or fetch from API
  const task = route.params?.task || {};

  const [title, setTitle] = useState(task.title || "");
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status || "pending");
  const [startDate, setStartDate] = useState(task.start ? new Date(task.start) : null);
  const [startTime, setStartTime] = useState(task.start ? task.start.slice(11, 16) : "");
  const [endDate, setEndDate] = useState(task.end ? new Date(task.end) : null);
  const [endTime, setEndTime] = useState(task.end ? task.end.slice(11, 16) : "");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const scheme = useColorScheme();

  const closeSideNav = () => setIsSideNavVisible(false);

  const formatDateTime = (dateObj, timeStr) => {
    if (!dateObj || !timeStr) return null;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} ${timeStr}:00`;
  };

  const getClientUsernameFromCarePlan = async (carePlanId) => {
    try {
      console.log("Fetching client username for care plan ID:", carePlanId);
      
      const response = await fetch(
        "https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/dbHandling",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_care_plan_details",
            data: {
              care_plan_id: carePlanId,
            },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Care plan details API response:", result);
        
        if (result.statusCode === 200 && result.body) {
          const clientUsername = result.body.client_username;
          console.log("Found client username:", clientUsername);
          return clientUsername;
        } else {
          console.log("API response not successful:", result);
        }
      } else {
        console.log("API request failed with status:", response.status);
      }
      return null;
    } catch (error) {
      console.error("Error fetching care plan details:", error);
      return null;
    }
  };

  const handleUpdateTask = async () => {
    if (!title || !startDate || !startTime || !endDate || !endTime) {
      setErrorMessage("All fields are required.");
      return;
    }
    setErrorMessage("");

    const start = formatDateTime(startDate, startTime);
    const end = formatDateTime(endDate, endTime);

    const payload = {
      id: task.id,
      title,
      description,
      status,
      start,
      end,
    };

    try {
      const response = await fetch(
        "https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/tasks",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        // Send notification to client about task update
        try {
          console.log("=== TASK UPDATE NOTIFICATION DEBUG ===");
          console.log("Task object:", task);
          
          // Get the care plan ID from the task
          const carePlanId = task.care_plan_id;
          console.log("Care plan ID:", carePlanId);
          
          if (carePlanId) {
            // Use the new centralized function
            const notificationResult = await sendTaskUpdateNotification(carePlanId, title, status);
            console.log("Task update notification result:", notificationResult);
          } else {
            console.log("No care plan ID found in task");
          }
          console.log("=== END TASK UPDATE NOTIFICATION DEBUG ===");
        } catch (notificationError) {
          console.error("Error sending task update notification:", notificationError);
          console.error("Error details:", notificationError.message);
          // Don't fail the task update if notification fails
        }

        Alert.alert("✅ Task updated successfully!");
        navigation.goBack();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to update task.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  const showPicker = (field, type) => {
    setActiveField(field);
    if (type === "date") setShowDatePicker(true);
    else setShowTimePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (!selectedDate) return;
    if (activeField === "startDate") setStartDate(selectedDate);
    else if (activeField === "endDate") setEndDate(selectedDate);
    setErrorMessage("");
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (!selectedTime) return;
    const hh = String(selectedTime.getHours()).padStart(2, "0");
    const mm = String(selectedTime.getMinutes()).padStart(2, "0");
    const time = `${hh}:${mm}`;
    if (activeField === "startTime") setStartTime(time);
    else if (activeField === "endTime") setEndTime(time);
    setErrorMessage("");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSideNavVisible(true)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Update Task</Text>
      </View>

      {isSideNavVisible && (
        <SideNavigationCN navigation={navigation} onClose={closeSideNav} />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            onFocus={() => setErrorMessage("")}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Task description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setErrorMessage("")}
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.statusOption,
                  status === option && styles.statusOptionSelected,
                ]}
                onPress={() => setStatus(option)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    status === option && styles.statusOptionTextSelected,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Start</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => showPicker("startDate", "date")}
            >
              <Text>{startDate ? startDate.toDateString() : "Pick Date"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => showPicker("startTime", "time")}
            >
              <Text>{startTime || "Pick Time"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>End</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => showPicker("endDate", "date")}
            >
              <Text>{endDate ? endDate.toDateString() : "Pick Date"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => showPicker("endTime", "time")}
            >
              <Text>{endTime || "Pick Time"}</Text>
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorCircle}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      <TouchableOpacity style={styles.updateTaskButton} onPress={handleUpdateTask}>
        <Text style={styles.updateTaskText}>Update Task</Text>
      </TouchableOpacity>

      <BottomNavigationCN navigation={navigation} />
    </View>
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
    marginLeft: 20,
  },
  scrollContainer: { flexGrow: 1, paddingBottom: 150 },
  formContainer: { padding: 40 },
  label: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
  input: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginVertical: 8,
  },
  textArea: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    height: 80,
    fontSize: 16,
    marginVertical: 8,
  },
  statusContainer: {
    flexDirection: "column",
    marginVertical: 8,
    marginTop: 10,
  },
  statusOption: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 10, // space between options
    borderColor: "#B3E5FC",
    borderWidth: 1,
    alignItems: "center",
  },
  statusOptionSelected: {
    backgroundColor: "#00BCD4",
  },
  statusOptionText: {
    fontSize: 16,
    color: "#008CBA",
    fontWeight: "bold",
  },
  statusOptionTextSelected: {
    color: "white",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  dateInput: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    flex: 1,
    marginRight: 10,
  },
  timeInput: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    flex: 1,
  },
  updateTaskButton: {
    backgroundColor: "#00BCD4",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    position: "absolute",
    bottom: 70,
  },
  updateTaskText: { fontSize: 18, color: "white", fontWeight: "bold" },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  errorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    marginTop: 5,
  },
  errorIconText: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default UpdateTaskScreen;