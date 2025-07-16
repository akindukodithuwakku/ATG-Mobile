import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimelineItem = ({ title, description, start, status, isLast, onEdit }) => {
  const dateObj = start ? new Date(start) : null;
  const dayLabel = dateObj
    ? `${dateObj.getDate()} ${dateObj.toLocaleDateString('en-US', { weekday: 'short' })}`
    : 'No date';
  const timeLabel = dateObj
    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={styles.row}>
      {/* Timeline section */}
      <View style={styles.leftColumn}>
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
          <Text style={styles.dateLabel}>{dayLabel}</Text>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      {/* Task info section */}
      <View style={styles.rightColumn}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{timeLabel}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          <Text style={styles.status}>Status: {status}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onEdit} style={styles.editButton}>
        <Ionicons name="create-outline" size={24} color="#00BCD4" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  leftColumn: {
    width: 60,
    alignItems: 'center',
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00BCD4',
    marginRight: 6,
  },
  dateLabel: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: 'bold',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#00BCD4',
    marginTop: 4,
  },
  rightColumn: {
    flex: 1,
  },
  card: {
    backgroundColor: '#F2FDFF',
    padding: 12,
    borderRadius: 8,
    borderColor: '#B2EBF2',
    borderWidth: 1,
  },
  title: { fontWeight: 'bold', fontSize: 16 },
  time: { fontSize: 13, color: '#666', marginTop: 2 },
  description: { marginTop: 4, color: '#333' },
  status: { marginTop: 4, fontStyle: 'italic', color: '#007B9F' },
  editButton: {
    marginLeft: 10,
  },
});

export default TimelineItem;
