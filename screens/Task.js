import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from "../Components/BottomNavigationClient";

const TaskScreen = () => {
    
    const handleComplete = () => {
        Alert.alert("Task marked as complete!");
    };

    const handleDelete = () => {
        Alert.alert("Task deleted!");
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task Id</Text>
            </View>
            <View style={styles.taskContainer}>
    <View style={styles.iconContainer}>
        <Ionicons name="flash" size={20} color="#FFFFFF" />
    </View>
    <View style={styles.taskTextContainer}>
        <Text style={styles.taskLabel}>Task</Text>
        <Text></Text>
        <Text>
        </Text>
        <View style={styles.cloudBubble}>
      
            <Text style={styles.taskDescription}>
                lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </Text>
        </View>
    </View>
</View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <Text style={styles.completeButtonText}>Mark as complete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete}>
                    <Text style={styles.deleteText}>Delete task</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: "#E0F7FA",
  },
  header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      backgroundColor: "#00BCD4",
      paddingTop: 40,
  },
  headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
      marginLeft: 20,
  },
  taskContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      flex: 1,
      paddingVertical: 20,
      padding: 10,
  },
  iconContainer: {
      backgroundColor: "#4A90E2",
      borderRadius: 50,
      padding: 10,
      marginRight: 10,
  },
  cloudBubble: {
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      lineLength: 20,
      padding: 15,
      paddingTop:20,
      shadowColor: "#000",
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 10,
  },
  taskLabel: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
      margineBottom: 10,
  },
  taskDescription: {
      fontSize: 16,
      color: "#333",
      textAlign: 'left',
  },
  buttonContainer: {
      marginBottom: 30,
      paddingHorizontal: 20,
  },
  completeButton: {
      backgroundColor: "#00BCD4",
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: "center",
      marginBottom: 10,
  },
  completeButtonText: {
      fontSize: 18,
      color: "white",
      fontWeight: "bold",
  },
  deleteText: {
      fontSize: 16,
      color: "#00BFFF",
      textAlign: 'center',
  },
});

export default TaskScreen;