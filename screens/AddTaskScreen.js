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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import SideNavigationClient from "../Components/SideNavigationClient";
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTask = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const scheme = useColorScheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeField, setActiveField] = useState(null); // 'startDate', 'startTime', 'endDate', 'endTime'
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const closeSideNav = () => {
    setIsSideNavVisible(false);
  };

  const handleAddTask = async () => {
    if (!title) {
      setErrorMessage("Title is required.");
      return;
    }
    setErrorMessage("");

    // Prepare your payload
    const payload = {
      care_plan_id: 2, // <-- Replace with actual care_plan_id
      title,
      description,
      status: "pending",
      updated_by: "testuser_01", // <-- Replace with actual username
      start: `${startDate} ${startTime}`,
      end: `${endDate} ${endTime}`,
    };

    try {
      const response = await fetch('https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        // Optionally show a success message or navigate
        navigation.goBack();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to add task.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    }
  };

  const showPicker = (field, type) => {
    setActiveField(field);
    if (type === 'date') {
      setShowDatePicker(true);
    } else {
      setShowTimePicker(true);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    const date = selectedDate || new Date();
    if (activeField === 'startDate') {
      setStartDate(date.toLocaleDateString());
    } else if (activeField === 'endDate') {
      setEndDate(date.toLocaleDateString());
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    const time = selectedTime || new Date();
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    if (activeField === 'startTime') {
      setStartTime(`${hours}:${minutes}`);
    } else if (activeField === 'endTime') {
      setEndTime(`${hours}:${minutes}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add A Task</Text>
      </View>

      {isSideNavVisible && (
        <SideNavigationClient navigation={navigation} onClose={closeSideNav} />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Write the title of the activity here"
            placeholderTextColor="#B3E5FC"
            value={title}
            onChangeText={setTitle}
            onFocus={() => setErrorMessage("")}
          />
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorCircle}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write a task description here"
            placeholderTextColor="#B3E5FC"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Start</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity style={styles.dateInput} onPress={() => showPicker('startDate', 'date')}>
              <Text style={styles.inputText}>{startDate || "Select Date"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeInput} onPress={() => showPicker('startTime', 'time')}>
              <Text style={styles.inputText}>{startTime || "Select Time"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>End</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity style={styles.dateInput} onPress={() => showPicker('endDate', 'date')}>
              <Text style={styles.inputText}>{endDate || "Select Date"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.timeInput} onPress={() => showPicker('endTime', 'time')}>
              <Text style={styles.inputText}>{endTime || "Select Time"}</Text>
            </TouchableOpacity>
          </View>
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

      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={handleAddTask}
      >
        <Text style={styles.addTaskText}>Add Task</Text>
      </TouchableOpacity>

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
    padding: 40,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
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
    fontSize: 16,
    height: 80,
    textAlignVertical: "top",
    marginVertical: 8,
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
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  timeInput: {
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    flex: 1,
  },
  addTaskButton: {
    backgroundColor: "#00BCD4",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    position: "absolute",
    bottom: 70,
  },
  addTaskText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  errorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  errorIconText: {
    color: "white",
    fontSize: 16,
  },
});

export default AddTask;