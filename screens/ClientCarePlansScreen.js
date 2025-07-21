import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  useColorScheme,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from '../Components/BottomNavigationClient';
import SideNavigationClient from '../Components/SideNavigationClient';

const ClientCarePlansScreen = ({ route, navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const scheme = useColorScheme();

  const clientUsername = route?.params?.username || 'Kavindya_02'; // fallback for testing

  const fetchCarePlans = async () => {
    try {
      const response = await fetch(
        `https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/getcareplansbyClient?client_username=${clientUsername}`
      );
      const json = await response.json();
      setPlans(json.data || []);
    } catch (error) {
      console.error('Error fetching client care plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlans();
  }, []);

  const renderPlan = ({ item }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() =>
        navigation.navigate('CarePlanMgtClient', {
          carePlanId: item.id,
          clientUsername: clientUsername,
          carePlanName: item.actions,
          dateCreated: item.date_created,
        })
      }
    >
      <Text style={styles.planTitle}>{item.actions || 'Unnamed Plan'}</Text>
      <Text style={styles.planDesc}>Care Navigator: {item.care_navigator_username}</Text>
      <Text style={styles.planDate}>
        Created: {item.date_created ? new Date(item.date_created).toLocaleDateString() : 'N/A'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor={scheme === 'dark' ? 'black' : 'transparent'}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Care Plans</Text>
      </View>

      {isSideNavVisible && (
        <SideNavigationClient navigation={navigation} onClose={() => setIsSideNavVisible(false)} />
      )}

      <ScrollView contentContainerStyle={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color="#00BCD4" />
        ) : plans.length === 0 ? (
          <Text style={styles.emptyText}>No care plans assigned.</Text>
        ) : (
          <FlatList
            data={plans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPlan}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>

      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    backgroundColor: '#00BCD4',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
  },
  body: { padding: 20, paddingBottom: 100 },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  planTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  planDesc: { fontSize: 15, color: '#666', marginVertical: 5 },
  planDate: { fontSize: 13, color: '#999' },
  listContent: { paddingBottom: 60 },
});

export default ClientCarePlansScreen;