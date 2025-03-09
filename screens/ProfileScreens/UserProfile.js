import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAutomaticLogout } from "../../screens/AutoLogout";
import { useFocusEffect } from "@react-navigation/native";

const UserProfile = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [profileData, setProfileData] = useState({
    fullName: "Trevin Perera",
    email: "trevin.perera@gmail.com",
    phone: "+94 77 360 4872",
    address: "64/A, Flower Street, Colombo, Sri Lanka",
    bio: "Software developer.",
    profileImage: null,
  });

  const defaultImage = require("../../assets/ChatAvatar.png");

  const loadProfileData = useCallback(async () => {
    try {
      const storedProfileData = await AsyncStorage.getItem("userProfile");
      if (storedProfileData !== null) {
        setProfileData(JSON.parse(storedProfileData));
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetTimer();
      loadProfileData();
    }, [loadProfileData])
  );

  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, []);

  const detailItems = [
    {
      icon: "mail",
      title: "Email",
      value: profileData.email,
    },
    {
      icon: "phone",
      title: "Phone",
      value: profileData.phone,
    },
    {
      icon: "map-pin",
      title: "Address",
      value: profileData.address,
    },
    {
      icon: "file-text",
      title: "Bio",
      value: profileData.bio,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["#09D1C7", "#35AFEA"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              resetTimer();
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>User Profile</Text>
          <TouchableOpacity
            style={styles.headerEditButton}
            onPress={() => {
              resetTimer();
              navigation.navigate("EditProfile");
            }}
          >
            <Feather name="edit-2" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleUserInteraction}
        onTouchStart={handleUserInteraction}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profileData.profileImage
                  ? { uri: profileData.profileImage }
                  : defaultImage
              }
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.profileName}>{profileData.fullName}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {detailItems.map((item, index) => (
            <View key={index} style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Feather name={item.icon} size={20} color="#0C6478" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailTitle}>{item.title}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  headerEditButton: {
    padding: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 15,
  },
  profileImageContainer: {
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#E9F6FE",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0C6478",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#E9F6FE",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
    justifyContent: "center",
  },
  detailTitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default UserProfile;
