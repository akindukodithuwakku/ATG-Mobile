import React, { useState, useEffect, useCallback } from "react";
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
  Modal,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAutomaticLogout } from "../../screens/AutoLogout";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const DB_API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/dbHandling";

const AVATAR_MAP = {
  default: require("../../assets/avatars/Default.png"),
  young_man: require("../../assets/avatars/YoungMan.jpeg"),
  mid_man: require("../../assets/avatars/MidMan.jpeg"),
  old_man: require("../../assets/avatars/OldMan.jpeg"),
  young_woman: require("../../assets/avatars/YoungWoman.jpeg"),
  mid_woman: require("../../assets/avatars/MidWoman.jpeg"),
  old_woman: require("../../assets/avatars/OldWoman.jpeg"),
};

const AVATAR_OPTIONS = [
  { key: "default", label: "Default" },
  { key: "young_man", label: "Young Man" },
  { key: "mid_man", label: "Middle-aged Man" },
  { key: "old_man", label: "Senior Man" },
  { key: "young_woman", label: "Young Woman" },
  { key: "mid_woman", label: "Middle-aged Woman" },
  { key: "old_woman", label: "Senior Woman" },
];

const EditProfile = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [profileData, setProfileData] = useState({
    fullName: "User",
    phone: "",
    address: "",
    dateOfBirth: null,
    gender: "",
    profileImage: null,
    profileImageKey: "default",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [userType, setUserType] = useState(""); // 'client' or 'cn'
  const [username, setUsername] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const genderOptions = ["Male", "Female", "Other", "Prefer Not to Say"];

  // Reset timer when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
    }, [])
  );

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Load profile data from AsyncStorage and database on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Get username to determine user type
        const appUser = await AsyncStorage.getItem("appUser");

        if (appUser) {
          setUsername(appUser);
          const isCareNavigator = appUser.startsWith("cn_");
          setUserType(isCareNavigator ? "cn" : "client");

          // Load from AsyncStorage first
          const storedProfileData = await AsyncStorage.getItem("userProfile");
          let currentUserProfile = {};

          if (storedProfileData !== null) {
            currentUserProfile = JSON.parse(storedProfileData);
          }

          // Fetch fresh data from database
          const dbResponse = await fetch(DB_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: isCareNavigator ? "get_cn_details" : "get_client_details",
              data: {
                username: appUser,
              },
            }),
          });

          const dbData = await dbResponse.json();
          const dbDataBody =
            typeof dbData.body === "string"
              ? JSON.parse(dbData.body)
              : dbData.body;

          if (dbResponse.ok && dbDataBody) {
            // Get profile image key from database or use default
            const profileImgKey = dbDataBody.profile_img_key || "default";
            // Merge database data with local profile data
            const updatedProfile = {
              fullName:
                dbDataBody.full_name || currentUserProfile.fullName || "",
              phone:
                dbDataBody.contact_number || currentUserProfile.phone || "",
              address:
                dbDataBody.home_address || currentUserProfile.address || "",
              dateOfBirth: dbDataBody.date_of_birth
                ? new Date(dbDataBody.date_of_birth)
                : currentUserProfile.dateOfBirth
                ? new Date(currentUserProfile.dateOfBirth)
                : null,
              gender: dbDataBody.gender || currentUserProfile.gender || "",
              profileImage: AVATAR_MAP[profileImgKey] || AVATAR_MAP["default"],
              profileImageKey: profileImgKey,
            };

            setProfileData(updatedProfile);
            setNewImage(updatedProfile.profileImage);

            // Update AsyncStorage with fresh data
            await AsyncStorage.setItem(
              "userProfile",
              JSON.stringify(updatedProfile)
            );
          } else {
            // Use stored data as fallback
            const profileImgKey =
              currentUserProfile.profileImageKey || "default";
            setProfileData({
              fullName: currentUserProfile.fullName || "",
              phone: currentUserProfile.phone || "",
              address: currentUserProfile.address || "",
              dateOfBirth: currentUserProfile.dateOfBirth
                ? new Date(currentUserProfile.dateOfBirth)
                : null,
              gender: currentUserProfile.gender || "",
              profileImage: AVATAR_MAP[profileImgKey] || AVATAR_MAP["default"],
              profileImageKey: profileImgKey,
            });

            setNewImage(AVATAR_MAP[profileImgKey] || AVATAR_MAP["default"]);
          }
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
        Alert.alert("Error", "Failed to load profile data");
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

    if (!profileData.phone.trim()) {
      errorTexts.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9\s-()]{10,15}$/.test(profileData.phone)) {
      errorTexts.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!profileData.dateOfBirth) {
      errorTexts.dateOfBirth = "Date of birth is required";
      isValid = false;
    }

    if (!profileData.gender) {
      errorTexts.gender = "Gender is required";
      isValid = false;
    }

    if (!profileData.address) {
      errorTexts.address = "Address is required";
      isValid = false;
    }

    setErrors(errorTexts);
    return isValid;
  };

  const selectAvatar = (avatarKey) => {
    const selectedAvatar = AVATAR_MAP[avatarKey];
    setNewImage(selectedAvatar);
    setProfileData({
      ...profileData,
      profileImage: selectedAvatar,
      profileImageKey: avatarKey,
    });
    setShowAvatarModal(false);
  };

  // Handle date picker
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("dateOfBirth", selectedDate);
    }
  };

  // Handle gender selection
  const handleGenderSelect = (gender) => {
    handleChange("gender", gender);
    setShowGenderModal(false);
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

  // Update database
  const updateDatabase = async (updatedProfile) => {
    try {
      const statusResponse = await fetch(DB_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_user_status",
          data: {
            username: username.trim(),
          },
        }),
      });

      const statusResult = await statusResponse.json();

      if (!statusResult.body) {
        throw new Error("Invalid server response format");
      }

      const parsedStatusResult =
        typeof statusResult.body === "string"
          ? JSON.parse(statusResult.body)
          : statusResult.body;

      if (
        parsedStatusResult.status !== undefined &&
        parsedStatusResult.status !== null
      ) {
        const status = parsedStatusResult.status;

        if (status === 4) {
          const appUser = await AsyncStorage.getItem("appUser");
          const activeCNResponse = await fetch(DB_API_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "active_user",
              data: {
                username: appUser.trim().toLowerCase(),
              },
            }),
          });

          const responseResult = await activeCNResponse.json();

          if (!activeCNResponse.ok) {
            const errorMessage =
              responseResult.error || "An unknown error occurred";
            throw new Error(errorMessage);
          }

          console.log("User status changed to active successfully.");
        }
      }

      const action =
        userType === "cn" ? "update_cn_details" : "update_client_details";

      // Format date for database (YYYY-MM-DD)
      const formattedDate = updatedProfile.dateOfBirth
        ? updatedProfile.dateOfBirth.toISOString().split("T")[0]
        : null;

      const response = await fetch(DB_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action,
          data: {
            username: username,
            full_name: updatedProfile.fullName,
            date_of_birth: formattedDate,
            gender: updatedProfile.gender,
            contact_number: updatedProfile.phone,
            home_address: updatedProfile.address,
            profile_img_key: updatedProfile.profileImageKey,
          },
        }),
      });

      const data = await response.json();
      const responseBody =
        typeof data.body === "string" ? JSON.parse(data.body) : data.body;

      if (response.ok) {
        console.log("Database updated successfully");
        return true;
      } else {
        console.error("Database update failed:", responseBody);
        Alert.alert(
          "Error",
          responseBody.error || "Failed to update profile in database"
        );
        return false;
      }
    } catch (error) {
      console.error("Database update error:", error);
      Alert.alert("Error", "Failed to connect to database");
      return false;
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    resetTimer();
    if (validateForm()) {
      setIsLoading(true);

      try {
        // Update profile with new image if selected
        const updatedProfile = {
          ...profileData,
          profileImage: newImage || profileData.profileImage,
        };

        // Save to AsyncStorage
        const storageSuccess = await saveProfileToStorage(updatedProfile);

        if (!storageSuccess) {
          setIsLoading(false);
          Alert.alert("Error", "Failed to save profile data locally");
          return;
        }

        // Update database
        const dbSuccess = await updateDatabase(updatedProfile);

        if (dbSuccess) {
          setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
              "Success",
              "Your profile has been updated successfully!",
              [
                {
                  text: "OK",
                  onPress: () => {
                    navigation.reset({
                      index: 0,
                      routes: [
                        { name: userType === "cn" ? "ProfileCN" : "ProfileC" },
                      ],
                    });
                  },
                },
              ]
            );
          }, 1500);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Save profile error:", error);
        Alert.alert("Error", "An unexpected error occurred");
      }
    }
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

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
          <Text style={styles.headerText}>Edit Profile</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.formScrollView}
        contentContainerStyle={styles.formContentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleUserInteraction}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.form}>
            {/* Profile Image Section */}
            <TouchableWithoutFeedback onPress={handleUserInteraction}>
              <View style={styles.imageContainer}>
                <Image
                  source={newImage || AVATAR_MAP["default"]}
                  style={styles.profileImage}
                />
                <TouchableOpacity
                  style={styles.avatarIcon}
                  onPress={() => {
                    resetTimer();
                    setShowAvatarModal(true);
                  }}
                >
                  <View style={styles.iconCircle}>
                    <Feather name="user" size={22} color="#0C6478" />
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>

            {/* Form Fields */}
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
                onFocus={handleUserInteraction}
              />
            </View>
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}

            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={profileData.phone}
                onChangeText={(text) => handleChange("phone", text)}
                keyboardType="phone-pad"
                onFocus={handleUserInteraction}
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}

            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={[styles.inputContainer, styles.datePickerContainer]}
              onPress={() => {
                resetTimer();
                setShowDatePicker(true);
              }}
            >
              <View style={styles.datePickerButton}>
                <Text
                  style={[
                    styles.datePickerText,
                    !profileData.dateOfBirth && styles.placeholderText,
                  ]}
                >
                  {profileData.dateOfBirth
                    ? formatDateForDisplay(profileData.dateOfBirth)
                    : "Select date of birth"}
                </Text>
                <MaterialIcons name="date-range" size={24} color="#0C6478" />
              </View>
            </TouchableOpacity>
            {errors.dateOfBirth && (
              <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
            )}

            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity
              style={[styles.inputContainer, styles.genderPickerContainer]}
              onPress={() => {
                resetTimer();
                setShowGenderModal(true);
              }}
            >
              <View style={styles.genderPickerButton}>
                <Text
                  style={[
                    styles.genderPickerText,
                    !profileData.gender && styles.placeholderText,
                  ]}
                >
                  {profileData.gender || "Select gender"}
                </Text>
                <Ionicons name="chevron-down" size={24} color="#0C6478" />
              </View>
            </TouchableOpacity>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}

            <Text style={styles.inputLabel}>Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your address"
                value={profileData.address}
                onChangeText={(text) => handleChange("address", text)}
                onFocus={handleUserInteraction}
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
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={profileData.dateOfBirth || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()} // Prevent future dates
          minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
        />
      )}

      {/* Gender Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showGenderModal}
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.genderModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity
                onPress={() => setShowGenderModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.genderOptionsContainer}>
              {genderOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.genderOption,
                    profileData.gender === option &&
                      styles.selectedGenderOption,
                  ]}
                  onPress={() => handleGenderSelect(option)}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      profileData.gender === option &&
                        styles.selectedGenderOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  {profileData.gender === option && (
                    <Ionicons name="checkmark" size={20} color="#35AFEA" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Avatar Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAvatarModal}
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.avatarModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Avatar</Text>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.avatarOptionsContainer}>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.avatarOption,
                      profileData.profileImageKey === option.key &&
                        styles.selectedAvatarOption,
                    ]}
                    onPress={() => selectAvatar(option.key)}
                  >
                    <Image
                      source={AVATAR_MAP[option.key]}
                      style={styles.avatarOptionImage}
                    />
                    <Text style={styles.avatarOptionText}>{option.label}</Text>
                    {profileData.profileImageKey === option.key && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#35AFEA"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: "#f0f0f0",
  },
  avatarIcon: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    zIndex: 1,
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
  avatarModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "80%",
  },
  avatarOptionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  avatarOption: {
    width: "30%",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#f8f9fa",
    position: "relative",
  },
  selectedAvatarOption: {
    backgroundColor: "#E9F6FE",
    borderWidth: 2,
    borderColor: "#35AFEA",
  },
  avatarOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  avatarOptionText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  selectedIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
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
  datePickerContainer: {
    height: 50,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  genderPickerContainer: {
    height: 50,
  },
  genderPickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  genderPickerText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  genderModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  genderOptionsContainer: {
    paddingHorizontal: 20,
  },
  genderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedGenderOption: {
    backgroundColor: "#E9F6FE",
  },
  genderOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedGenderOptionText: {
    color: "#35AFEA",
    fontWeight: "bold",
  },
});

export default EditProfile;
