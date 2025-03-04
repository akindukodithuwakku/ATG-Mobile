import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

const AppointmentScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}> Appointment ID</Text>
      </View>

      <View style={styles.appointmentContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="calendar" size={24} color="#00BFFF" />
        </View>
        <Text style={styles.appointmentTitle}>Appointment</Text>
        <Text style={styles.appointmentDetails}>
          lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </View>

      <Text style={styles.dateText}>Date: Tuesday, 25 May</Text>
      <Text style={styles.timeText}>Time: 16:00 - 16:30</Text>
      <Text style={styles.locationText}>
        Location: lorum ipsum. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. 
        Velit officia consequat duis enim velit mollit.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.buttonText1}>Mark as complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.buttonText2}>Cancel Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00BFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  headerText: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  appointmentContainer: {
    padding: 16,
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: 'left',
    marginBottom: 8,
    color: 'black',
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  appointmentDetails: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationText: {
    marginBottom: 16,
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#00BFFF',
    padding: 12,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#00BFFF',
    padding: 12,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText1: {
    color: 'white', // Change this to 'black' for the cancel button
    fontWeight: 'bold',
  },
    buttonText2: {
        color: '#00BFFF',
        fontWeight: 'bold',
    },
});

export default AppointmentScreen;