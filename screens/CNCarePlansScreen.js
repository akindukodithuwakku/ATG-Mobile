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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationCN from '../Components/BottomNavigationCN';
import SideNavigationCN from '../Components/SideNavigationCN';

const CNCarePlansScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const scheme = useColorScheme();

  // Hardcoded care navigator username
  const careNavigatorUsername = 'cn_alecbenjamin';

  const fetchCarePlans = async () => {
    try {
      const response = await fetch(
        `https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/getcareplansbyCN?care_navigator_username=${careNavigatorUsername}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const json = await response.json();
      console.log('API Response:', json);
      setPlans(json.care_plans || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlans();
  }, []);

  const renderPlan = ({ item }) => {
    const key = item.id || `${item.client_username}_${item.date_created}`;

    return (
      <TouchableOpacity
        key={key}
        style={styles.planCard}
        onPress={() =>
          navigation.navigate('CarePlanMgtCN', {
            carePlanId: item.id,
            clientUsername: item.client_username,
            carePlanName: item.care_plan_name,
            dateCreated: item.date_created,
          })
        }
      >
        <Text style={styles.planTitle}>{item.care_plan_name || 'Unnamed Plan'}</Text>
        <Text style={styles.planClient}>Client: {item.client_username || 'N/A'}</Text>
        <Text style={styles.planStatus}>Status: {item.status || 'N/A'}</Text>
        <Text style={styles.planDate}>
          Created: {item.date_created ? new Date(item.date_created).toLocaleDateString() : 'N/A'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor={scheme === 'dark' ? 'black' : 'transparent'}
      />

      {/* Header with Side Nav Toggle */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assigned Care Plans</Text>
      </View>

      {isSideNavVisible && (
        <SideNavigationCN navigation={navigation} onClose={() => setIsSideNavVisible(false)} />
      )}

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color="#00BCD4" />
        ) : plans.length === 0 ? (
          <Text style={styles.emptyText}>No care plans assigned yet.</Text>
        ) : (
          <FlatList
            data={plans}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : `${item.client_username}_${item.date_created}_${index}`
            }
            renderItem={renderPlan}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <BottomNavigationCN navigation={navigation} />
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
  body: { flex: 1, padding: 20, paddingBottom: 100 },
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
  planClient: { fontSize: 15, color: '#444', marginVertical: 4 },
  planStatus: { fontSize: 14, color: '#555', marginVertical: 6 },
  planDate: { fontSize: 13, color: '#999' },
  listContent: { paddingBottom: 60 },
});

export default CNCarePlansScreen;
