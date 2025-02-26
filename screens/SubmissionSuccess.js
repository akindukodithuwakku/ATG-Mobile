import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SubmissionSuccess = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/checkmark.png')} style={styles.image} />
      <Text style={styles.title}>Your Form is successfully Submitted</Text>
      <Text style={styles.subtitle}>Thank you for getting in touch!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  image: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#555', marginBottom: 20 },
  button: { backgroundColor: '#00CFFF', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default SubmissionSuccess;