import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  StatusBar,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from "../Components/BottomNavigationClient";

const TaskScreen = ({ route, navigation }) => {
  const {
    taskId,
    taskTitle,
    taskDescription,
    taskStart,
    taskEnd,
    carePlanId,  // carePlanId passed here
  } = route.params || {};

  const bubbleScale = useRef(new Animated.Value(0)).current;
  const scheme = useColorScheme();

  useEffect(() => {
    Animated.timing(bubbleScale, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [bubbleScale]);

  const formatDateTime = (datetime) => {
    const dateObj = new Date(datetime);
    return dateObj.toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleComplete = () => {
    Alert.alert(
      "Confirm",
      `Are you sure you want to mark "${taskTitle}" as completed?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const response = await fetch("https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/tasks/mark-completed", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: taskId })
              });
              const data = await response.json();
              if (response.ok) {
                Alert.alert(
                  "✅ Task Completed",
                  `“${taskTitle}” has been successfully marked as completed.`,
                  [
                    {
                      text: "OK",
                      onPress: () => navigation.goBack(),
                    }
                  ],
                  { cancelable: false }
                );
              } else {
                Alert.alert("❌ Error", data.error || "Unable to complete the task. Please try again.");
              }
            } catch (error) {
              console.error(error);
              Alert.alert("Network Error", "Failed to connect to server. Please check your internet connection.");
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{taskTitle || 'Task'}</Text>
      </View>

      <View style={styles.centerContent}>
        <Ionicons name="flash" size={40} color="#4A90E2" style={{ marginBottom: 15 }} />
        <Text style={styles.taskLabel}>Task Details</Text>
        <Animated.View style={[styles.cloudBubble, { transform: [{ scale: bubbleScale }] }]}>
          <Text style={styles.taskDetail}><Text style={styles.bold}>Title:</Text> {taskTitle || 'N/A'}</Text>
          <Text style={styles.taskDetail}><Text style={styles.bold}>Description:</Text> {taskDescription || 'N/A'}</Text>
          <Text style={styles.taskDetail}><Text style={styles.bold}>Start:</Text> {taskStart ? formatDateTime(taskStart) : 'N/A'}</Text>
          <Text style={styles.taskDetail}><Text style={styles.bold}>End:</Text> {taskEnd ? formatDateTime(taskEnd) : 'N/A'}</Text>

          <View style={styles.bubbleTail} />
        </Animated.View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Mark as complete</Text>
        </TouchableOpacity>
      </View>

      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0F7FA" },
  header: {
    flexDirection: "row", alignItems: "center",
    padding: 15, backgroundColor: "#00BCD4", paddingTop: 40,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white", marginLeft: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  taskLabel: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 15 },
  cloudBubble: {
    backgroundColor: "#FFFFFF", borderRadius: 20,
    padding: 15, paddingTop: 20, shadowColor: "#000",
    width: 300, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 10,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute', top: 20, left: -10,
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFFFFF',
  },
  taskDetail: { fontSize: 16, color: "#333", marginBottom: 6 },
  bold: { fontWeight: "bold" },
  buttonContainer: { marginBottom: 30, paddingHorizontal: 20 },
  completeButton: { backgroundColor: "#00BCD4", paddingVertical: 14, borderRadius: 30, alignItems: "center", marginBottom: 50 },
  completeButtonText: { fontSize: 18, color: "white", fontWeight: "bold" },
});

export default TaskScreen;
