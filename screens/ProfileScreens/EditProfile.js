import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = ({ navigation }) => {
  const [profileData, setProfileData] = useState({
    fullName: "Trevin Perera",
    email: "trevin.perera@gmail.com",
    phone: "+94 77 360 4872",
    address: "64/A, Flower Street, Colombo, Sri Lanka",
    bio: "Software developer.",
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const defaultImage = require("../../assets/ChatAvatar.png"); // Default image fallback

  // Load profile data from AsyncStorage on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedProfileData = await AsyncStorage.getItem("userProfile");
        if (storedProfileData !== null) {
          const userData = JSON.parse(storedProfileData);
          setProfileData(userData);
          if (userData.profileImage) {
            setNewImage(userData.profileImage);
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    loadProfileData();
  }, []);

  // Handle input changes
  const handleChange = (field, value) => {
    setProfileData({
      ...profileData,
      [field]: value,
    });

    // Clear error for this field if exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  // Form validation
  const validateForm = () => {
    let errorTexts = {};
    let isValid = true;

    if (!profileData.fullName.trim()) {
      errorTexts.fullName = "Name is required";
      isValid = false;
    }

    if (!profileData.email.trim()) {
      errorTexts.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errorTexts.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!profileData.phone.trim()) {
      errorTexts.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9\s-()]{10,15}$/.test(profileData.phone)) {
      errorTexts.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setNewImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  // Save profile data to AsyncStorage
  const saveProfileToStorage = async (updatedProfile) => {
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      return true;
    } catch (error) {
      console.error("Error saving profile data:", error);
      return false;
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (validateForm()) {
      setIsLoading(true);

      // Update profile with new image if selected
      const updatedProfile = {
        ...profileData,
        profileImage: newImage || profileData.profileImage,
      };

      // Save to AsyncStorage
      const saveSuccess = await saveProfileToStorage(updatedProfile);

      if (saveSuccess) {
        setTimeout(() => {
          setIsLoading(false);
          Alert.alert(
            "Success",
            "Your profile has been updated successfully!",
            [
              {
                text: "OK",
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }, 1500);
      } else {
        setIsLoading(false);
        Alert.alert("Error", "Failed to save profile data.");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Edit Profile</Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.formScrollView}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Profile Image Section */}
            <View style={styles.imageContainer}>
              <Image
                source={
                  newImage
                    ? { uri: newImage }
                    : profileData.profileImage
                    ? { uri: profileData.profileImage }
                    : defaultImage
                }
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.cameraIcon} onPress={pickImage}>
                <View style={styles.iconCircle}>
                  <Feather name="camera" size={22} color="#0C6478" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
              />
            </View>
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}

            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={profileData.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={profileData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            <Text style={styles.inputLabel}>Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your address"
                value={profileData.address}
                onChangeText={(text) => handleChange("address", text)}
              />
            </View>

            <Text style={styles.inputLabel}>Bio</Text>
            <View style={[styles.inputContainer, styles.bioContainer]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Tell us about yourself"
                value={profileData.bio}
                onChangeText={(text) => handleChange("bio", text)}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#09D1C7", "#35AFEA"]}
                style={styles.gradientButton}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 40,
  },
  formScrollView: {
    flex: 1,
  },
  formContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  form: {
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 20,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: "35%",
  },
  iconCircle: {
    backgroundColor: "#fff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
    color: "#333",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#E9F6FE",
  },
  input: {
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  bioContainer: {
    height: 120,
  },
  bioInput: {
    height: 120,
    paddingTop: 15,
    paddingBottom: 15,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 5,
  },
  saveButton: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 30,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditProfile;
