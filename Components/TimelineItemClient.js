import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TimelineItemClient = ({ id, title, description, start, end, status, isLast }) => {
  const navigation = useNavigation();

  const statusLower = status?.toLowerCase();

  // Define color based on status
  const getStatusColor = () => {
    switch (statusLower) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'overdue':
        return '#F44336'; // Red
      case 'pending':
        return '#9E9E9E'; // Ash gray
      default:
        return '#00BCD4'; // Default blue
    }
  };

  // Format date and time
  const formatDate = (datetime) => {
    const dateObj = new Date(datetime);
    const options = { day: 'numeric', month: 'short' }; // e.g., 13 Jul
    return dateObj.toLocaleDateString('en-US', options);
  };

  const formatTime = (datetime) => {
    const dateObj = new Date(datetime);
    const options = { hour: 'numeric', minute: '2-digit', hour12: true }; // e.g., 1:00 PM
    return dateObj.toLocaleTimeString('en-US', options);
  };

  const statusColor = getStatusColor();
  const formattedDate = formatDate(start);
  const timeRange = `${formatTime(start)} - ${formatTime(end)}`;
  const isCompleted = statusLower === 'completed';

  const handleComplete = () => {
    navigation.navigate('Task', {
      taskId: id,
      taskTitle: title,
      taskDescription: description,
      taskStart: start,
      taskEnd: end,
      taskStatus: 'Completed',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.circle, { backgroundColor: statusColor }]} />
        <Text style={[styles.dateText, { color: statusColor }]}>{formattedDate}</Text>
        {!isLast && <View style={[styles.verticalLine, { backgroundColor: statusColor }]} />}
      </View>

      <View style={styles.card}>
        <Text style={styles.taskTitle}>{title}</Text>
        <Text style={styles.taskDescription}>{description}</Text>
        <Text style={styles.taskTime}>{timeRange}</Text>
        <Text style={[styles.taskStatus, { color: statusColor }]}>Status: {status}</Text>

        {!isCompleted && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Ionicons name="checkmark-done" size={18} color="white" />
            <Text style={styles.completeText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginLeft: 20,
    marginBottom: 20,
  },
  timeline: {
    alignItems: 'center',
    width: 50,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 5,
  },
  verticalLine: {
    flex: 1,
    width: 2,
    marginTop: 2,
  },
  dateText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    flex: 1,
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    marginHorizontal: 12,
    padding: 12,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007C91',
  },
  taskDescription: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  taskTime: {
    fontSize: 13,
    color: '#444',
    marginTop: 6,
  },
  taskStatus: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#00BCD4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completeText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: 'bold',
  },
});

export default TimelineItemClient;