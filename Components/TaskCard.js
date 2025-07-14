// Components/TaskCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskCard = ({ title, description, start, end, status }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {start && end ? (
        <Text style={styles.time}>
          {new Date(start).toLocaleString()} - {new Date(end).toLocaleString()}
        </Text>
      ) : null}
      <Text style={styles.status}>Status: {status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007B9F',
  },
  description: {
    fontSize: 14,
    marginTop: 5,
    color: '#333',
  },
  time: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
  status: {
    fontSize: 14,
    marginTop: 10,
    fontWeight: '600',
    color: '#555',
  },
});

export default TaskCard;
