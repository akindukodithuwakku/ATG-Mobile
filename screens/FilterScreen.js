import React, { useState } from 'react';
import { View, Text, Switch, Button, StyleSheet } from 'react-native';

const FilterScreen = () => {
  const [status, setStatus] = useState({
    toBeCompleted: false,
    overdue: false,
    completed: false,
  });

  const [type, setType] = useState({
    appointment: false,
    article: false,
    questionnaire: false,
    task: false,
  });

  const handleStatusToggle = (name) => {
    setStatus((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const handleTypeToggle = (name) => {
    setType((prevState) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  const applyFilter = () => {
    console.log('Applied Filters:', { status, type });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Filter</Text>

      <Text style={styles.sectionTitle}>Status</Text>
      {Object.keys(status).map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{key.replace(/([A-Z])/g, ' $1')}</Text>
          <Switch
            value={status[key]}
            onValueChange={() => handleStatusToggle(key)}
          />
        </View>
      ))}

      <Text style={styles.sectionTitle}>Type</Text>
      {Object.keys(type).map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <Switch
            value={type[key]}
            onValueChange={() => handleTypeToggle(key)}
          />
        </View>
      ))}

      <Button title="Apply filter" onPress={applyFilter} color="#008CBA" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
  },
});

export default FilterScreen;