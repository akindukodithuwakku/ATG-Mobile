import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useAutomaticLogout } from "../screens/AutoLogout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_ENDPOINT =
  "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const ViewReadinessDetailsCN = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [clientsList, setClientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [readinessDetails, setReadinessDetails] = useState(null);

  const questions = [
    "Experiencing any new or worsening symptoms?",
    "Faced any challenges in following your care plan or medications?",
    "Need assistance in understanding or managing your care plan?",
    "Are there changes in lifestyle or health goals that you'd like to discuss?",
    "Already tried resolving concerns with available resources?",
  ];

  // Reset timer when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
      loadClientsList();
    }, [])
  );

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const toggleMenu = () => {
    resetTimer();
    setIsMenuOpen(!isMenuOpen);
  };

  // Helper function to parse API response
  const parseApiResponse = (result) => {
    // console.log("Raw API result:", result);

    // If result has a body field (Lambda proxy integration)
    if (result.body) {
      try {
        const parsedBody =
          typeof result.body === "string"
            ? JSON.parse(result.body)
            : result.body;
        return {
          statusCode: result.statusCode || 200,
          data: parsedBody.data || parsedBody,
          error: parsedBody.error,
          message: parsedBody.message,
        };
      } catch (e) {
        console.error("Error parsing response body:", e);
        return {
          statusCode: result.statusCode || 500,
          error: "Failed to parse response",
        };
      }
    }

    // Direct response format
    return {
      statusCode: 200,
      data: result.data || result,
      error: result.error,
      message: result.message,
    };
  };

  // Load clients list belonging to this care navigator
  const loadClientsList = async () => {
    try {
      setIsLoading(true);
      setError("");

      const appUser = await AsyncStorage.getItem("appUser");

      if (!appUser) {
        setError("Care navigator not found");
        return;
      }

      console.log(
        "Loading clients for navigator:",
        appUser.trim().toLowerCase()
      );

      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_navigator_clients",
          data: {
            care_navigator_username: appUser.trim().toLowerCase(),
          },
        }),
      });

      const result = await response.json();
      const parsedResult = parseApiResponse(result);

    //   console.log("Parsed clients list result:", parsedResult);

      if (parsedResult.statusCode === 200 && parsedResult.data) {
        setClientsList(parsedResult.data);
        if (parsedResult.data.length === 0) {
          setError("No clients assigned to you");
        }
      } else {
        console.warn("Failed to load clients list:", parsedResult);
        setError(
          parsedResult.error ||
            parsedResult.message ||
            "Failed to load clients list"
        );
      }
    } catch (error) {
      console.error("Error loading clients list:", error);
      setError("Network error: Failed to load clients list");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadClientsList();
    setIsRefreshing(false);
  }, []);

  // View readiness details for a specific client
  const viewClientReadinessDetails = async (clientUsername) => {
    resetTimer();
    try {
      setIsLoading(true);
      setError("");

      console.log(
        "Fetching readiness details for client:",
        clientUsername.trim().toLowerCase()
      );

      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_client_readiness_details",
          data: {
            client_username: clientUsername.trim().toLowerCase(),
          },
        }),
      });

      const result = await response.json();
      const parsedResult = parseApiResponse(result);

    //   console.log("Parsed readiness details result:", parsedResult);

      if (parsedResult.statusCode === 200 && parsedResult.data) {
        setReadinessDetails(parsedResult.data);
        setSelectedClient(clientUsername);
      } else if (parsedResult.statusCode === 404) {
        Alert.alert(
          "No Data",
          `No active appointment or readiness questionnaire found for ${clientUsername}`
        );
        setReadinessDetails(null);
        setSelectedClient(null);
      } else {
        const errorMessage =
          parsedResult.error ||
          parsedResult.message ||
          "Failed to fetch readiness details";
        Alert.alert("Error", errorMessage);
        setReadinessDetails(null);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error("Error fetching readiness details:", error);
      Alert.alert("Error", "Network error: Failed to fetch readiness details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search by username
  const handleSearchByUsername = () => {
    if (!searchUsername.trim()) {
      setError("Please enter a client username");
      return;
    }
    viewClientReadinessDetails(searchUsername);
  };

  // Render client list item
  const renderClientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clientItem}
      onPress={() => viewClientReadinessDetails(item.client_username)}
    >
      <View style={styles.clientItemContent}>
        <Ionicons name="person-outline" size={20} color="#35AFEA" />
        <Text style={styles.clientUsername}>{item.client_username}</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#666666" />
      </View>
    </TouchableOpacity>
  );

  // Render readiness details
  const renderReadinessDetails = () => {
    if (!readinessDetails) return null;

    const { questionnaire_data, client_note, appointment_date_time } =
      readinessDetails;
    let parsedQuestionnaire = null;

    try {
      parsedQuestionnaire =
        typeof questionnaire_data === "string"
          ? JSON.parse(questionnaire_data)
          : questionnaire_data;
    } catch (e) {
      console.error("Error parsing questionnaire data:", e);
    }

    return (
      <View style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <Ionicons name="document-text" size={24} color="#35AFEA" />
          <Text style={styles.detailsTitle}>
            Readiness Details - {selectedClient}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setReadinessDetails(null);
              setSelectedClient(null);
            }}
            style={styles.closeDetailsButton}
          >
            <Ionicons name="close" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {appointment_date_time && (
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentLabel}>Appointment Date:</Text>
            <Text style={styles.appointmentDate}>
              {new Date(appointment_date_time).toLocaleString()}
            </Text>
          </View>
        )}

        {parsedQuestionnaire && parsedQuestionnaire.answers && (
          <View style={styles.questionnaireSection}>
            <Text style={styles.sectionTitle}>Questionnaire Responses</Text>
            {questions.map((question, index) => (
              <View key={index} style={styles.questionItem}>
                <Text style={styles.questionText}>
                  {index + 1}. {question}
                </Text>
                <View style={styles.answerContainer}>
                  <Text
                    style={[
                      styles.answerText,
                      parsedQuestionnaire.answers[index]
                        ? styles.yesAnswer
                        : styles.noAnswer,
                    ]}
                  >
                    {parsedQuestionnaire.answers[index] ? "YES" : "NO"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {client_note && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Client Note</Text>
            <Text style={styles.noteText}>{client_note}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container} onTouchStart={handleUserInteraction}>
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
          <Text style={styles.headerText}>Readiness Details</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        onScrollBeginDrag={handleUserInteraction}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {!readinessDetails && (
          <>
            <View style={styles.searchSection}>
              <Text style={styles.inputLabel}>Search by Username</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter client username"
                  value={searchUsername}
                  onChangeText={(text) => {
                    resetTimer();
                    setSearchUsername(text);
                    if (error) setError("");
                  }}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchByUsername}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#6C5CE7", "#A29BFE"]}
                  style={styles.gradientButton}
                >
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>
                    {isLoading ? "Searching..." : "View Details"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.clientsListSection}>
              <Text style={styles.sectionTitle}>Your Clients</Text>
              {clientsList.length > 0 ? (
                <FlatList
                  data={clientsList}
                  renderItem={renderClientItem}
                  keyExtractor={(item) => item.client_username}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                />
              ) : (
                <Text style={styles.noClientsText}>
                  {isLoading ? "Loading clients..." : "No clients found"}
                </Text>
              )}
            </View>
          </>
        )}

        {renderReadinessDetails()}
      </ScrollView>

      <BottomNavigationCN navigation={navigation} />
    </View>
  );
};

// Add your existing styles here
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  backButton: {
    padding: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  searchSection: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: 15,
  },
  searchButton: {
    marginTop: 10,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  clientsListSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 15,
  },
  clientItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  clientItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientUsername: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    marginLeft: 12,
  },
  separator: {
    height: 10,
  },
  noClientsText: {
    textAlign: "center",
    color: "#666666",
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 20,
  },
  detailsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  detailsTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 10,
  },
  closeDetailsButton: {
    padding: 5,
  },
  appointmentInfo: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  appointmentLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  questionnaireSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  questionItem: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 15,
    color: "#333333",
    marginBottom: 8,
  },
  answerContainer: {
    alignSelf: "flex-start",
  },
  answerText: {
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  yesAnswer: {
    backgroundColor: "#E8F5E8",
    color: "#4CAF50",
  },
  noAnswer: {
    backgroundColor: "#FFEBEE",
    color: "#F44336",
  },
  noteSection: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
  },
  noteText: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 22,
  },
});

export default ViewReadinessDetailsCN;
