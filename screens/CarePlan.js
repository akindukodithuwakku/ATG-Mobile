import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, StatusBar, useColorScheme, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from "../Components/BottomNavigationClient";
import SideNavigationClient from "../Components/SideNavigationClient";
import ArticleCard from '../Components/ArticleCard'; // Import the ArticleCard component

const data = [
  { id: '1', type: 'Article', duration: '5 min', title: 'What is a care plan?' },
  // Add more data as needed
];

const CarePlanOverview = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <ArticleCard 
      title={item.title} 
      duration={item.duration} 
      type={item.type} 
      onPress={() => navigation.navigate('Details', { item })} // Navigate to details on press
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const CarePlanScreen = ({ navigation }) => {
  const scheme = useColorScheme();
  const [isSideNavVisible, setIsSideNavVisible] = React.useState(false);

  const closeSideNav = () => {
    setIsSideNavVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setIsSideNavVisible(!isSideNavVisible)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Care Plan Overview</Text>
          <Text style={styles.headersec}>What you can do for yourself?</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#B3E5FC" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search..." />
      </View>

      {/* Side Navigation */}
      {isSideNavVisible && (
        <SideNavigationClient navigation={navigation} onClose={closeSideNav} />
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CarePlanOverview navigation={navigation} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationClient navigation={navigation} />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddTaskScreen')} // Navigate to AddTask screen
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FDFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#00BCD4",
    paddingTop: 40,
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    textAlign: 'center',
  },
  headersec: {
    fontSize: 15,
    paddingTop: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 90,
    marginLeft: '0%',
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 10,
  },
  searchInput: {
    height: 40,
    flex: 1,
    borderColor: '#CCCCCC',
    borderWidth: 2 ,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#E0F7FA',
  },
  searchIcon: {
    marginRight: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 150,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 30,
    backgroundColor: '#00BCD4',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default CarePlanScreen;