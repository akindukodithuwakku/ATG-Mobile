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

const AppointmentHistoryCN = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [searchUsername, setSearchUsername] = useState("");
  const [clientsList, setClientsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [viewMode, setViewMode] = useState("client"); // "client" or "all"

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

  // Helper function to parse API response
  const parseApiResponse = (result) => {
    // console.log("Raw API result:", result);

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

  // Get appointment history for a specific client
  const getClientAppointmentHistory = async (clientUsername) => {
    resetTimer();
    try {
      setIsLoading(true);
      setError("");

      console.log(
        "Fetching appointment history for client:",
        clientUsername.trim().toLowerCase()
      );

      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_client_appointment_history",
          data: {
            client_username: clientUsername.trim().toLowerCase(),
          },
        }),
      });

      const result = await response.json();
      const parsedResult = parseApiResponse(result);

    //   console.log("Parsed appointment history result:", parsedResult);

      if (parsedResult.statusCode === 200 && parsedResult.data) {
        setAppointmentHistory(parsedResult.data);
        setSelectedClient(clientUsername);
      } else if (parsedResult.statusCode === 404) {
        Alert.alert(
          "No Data",
          `No appointment history found for ${clientUsername}`
        );
        setAppointmentHistory([]);
        setSelectedClient(null);
      } else {
        const errorMessage =
          parsedResult.error ||
          parsedResult.message ||
          "Failed to fetch appointment history";
        Alert.alert("Error", errorMessage);
        setAppointmentHistory([]);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error("Error fetching appointment history:", error);
      Alert.alert(
        "Error",
        "Network error: Failed to fetch appointment history"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get all appointments for the care navigator
  const getAllAppointmentHistory = async () => {
    resetTimer();
    try {
      setIsLoading(true);
      setError("");

      const appUser = await AsyncStorage.getItem("appUser");

      if (!appUser) {
        setError("Care navigator not found");
        return;
      }

      console.log(
        "Fetching all appointment history for navigator:",
        appUser.trim().toLowerCase()
      );

      const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_navigator_appointment_history",
          data: {
            care_navigator_username: appUser.trim().toLowerCase(),
          },
        }),
      });

      const result = await response.json();
      const parsedResult = parseApiResponse(result);

      console.log("Parsed all appointment history result:", parsedResult);

      if (parsedResult.statusCode === 200 && parsedResult.data) {
        setAppointmentHistory(parsedResult.data);
        setSelectedClient("All Clients");
      } else if (parsedResult.statusCode === 404) {
        Alert.alert("No Data", "No appointment history found");
        setAppointmentHistory([]);
        setSelectedClient(null);
      } else {
        const errorMessage =
          parsedResult.error ||
          parsedResult.message ||
          "Failed to fetch appointment history";
        Alert.alert("Error", errorMessage);
        setAppointmentHistory([]);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error("Error fetching all appointment history:", error);
      Alert.alert(
        "Error",
        "Network error: Failed to fetch appointment history"
      );
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
    getClientAppointmentHistory(searchUsername);
  };

  // Render client list item
  const renderClientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clientItem}
      onPress={() => getClientAppointmentHistory(item.client_username)}
    >
      <View style={styles.clientItemContent}>
        <Ionicons name="person-outline" size={20} color="#35AFEA" />
        <Text style={styles.clientUsername}>{item.client_username}</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#666666" />
      </View>
    </TouchableOpacity>
  );

  // Render appointment item
  const renderAppointmentItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "completed":
          return "#4CAF50";
        case "cancelled":
          return "#F44336";
        case "active":
          return "#FF9800";
        default:
          return "#666666";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "completed":
          return "checkmark-circle-outline";
        case "cancelled":
          return "close-circle-outline";
        case "active":
          return "time-outline";
        default:
          return "help-circle-outline";
      }
    };

    return (
      <View style={styles.appointmentItem}>
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentInfo}>
            {viewMode === "all" && (
              <Text style={styles.appointmentClient}>
                Client: {item.client_username}
              </Text>
            )}
            <Text style={styles.appointmentDate}>
              {new Date(item.appointment_date_time).toLocaleString()}
            </Text>
            <Text style={styles.appointmentCreated}>
              Created: {new Date(item.created_timestamp).toLocaleString()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(item.status)}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        {item.client_note && (
          <View style={styles.appointmentNote}>
            <Text style={styles.noteLabel}>Client Note:</Text>
            <Text style={styles.noteText}>{item.client_note}</Text>
          </View>
        )}
      </View>
    );
  };

  // Render appointment history
  const renderAppointmentHistory = () => {
    if (!selectedClient || appointmentHistory.length === 0) return null;

    return (
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Ionicons name="calendar-outline" size={24} color="#35AFEA" />
          <Text style={styles.historyTitle}>
            Appointment History - {selectedClient}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setAppointmentHistory([]);
              setSelectedClient(null);
            }}
            style={styles.closeHistoryButton}
          >
            <Ionicons name="close" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.historyCount}>
          Total Appointments: {appointmentHistory.length}
        </Text>

        <FlatList
          data={appointmentHistory}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item.appointment_id.toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
          <Text style={styles.headerText}>Appointment History</Text>
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
        {!selectedClient && (
          <>
            <View style={styles.viewModeSection}>
              <Text style={styles.sectionTitle}>View Mode</Text>
              <View style={styles.viewModeButtons}>
                <TouchableOpacity
                  style={[
                    styles.viewModeButton,
                    viewMode === "client" && styles.activeViewModeButton,
                  ]}
                  onPress={() => setViewMode("client")}
                >
                  <Text
                    style={[
                      styles.viewModeButtonText,
                      viewMode === "client" && styles.activeViewModeButtonText,
                    ]}
                  >
                    By Client
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.viewModeButton,
                    viewMode === "all" && styles.activeViewModeButton,
                  ]}
                  onPress={() => setViewMode("all")}
                >
                  <Text
                    style={[
                      styles.viewModeButtonText,
                      viewMode === "all" && styles.activeViewModeButtonText,
                    ]}
                  >
                    All Appointments
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {viewMode === "all" && (
              <View style={styles.allAppointmentsSection}>
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={getAllAppointmentHistory}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E8E"]}
                    style={styles.gradientButton}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#FFFFFF"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>
                      {isLoading ? "Loading..." : "View All Appointments"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {viewMode === "client" && (
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
                        {isLoading ? "Searching..." : "View History"}
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
          </>
        )}

        {renderAppointmentHistory()}
      </ScrollView>

      <BottomNavigationCN navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
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
    padding: 5,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  viewModeSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewModeButtons: {
    flexDirection: "row",
    marginTop: 10,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#35AFEA",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeViewModeButton: {
    backgroundColor: "#35AFEA",
  },
  viewModeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#35AFEA",
  },
  activeViewModeButtonText: {
    color: "#FFFFFF",
  },
  allAppointmentsSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewAllButton: {
    marginTop: 10,
  },
  searchSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  errorText: {
    color: "#F44336",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  searchButton: {
    marginTop: 10,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
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
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  clientItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  clientItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientUsername: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  noClientsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666666",
    fontStyle: "italic",
    marginTop: 20,
  },
  historyContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 15,
    marginBottom: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  historyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 10,
  },
  closeHistoryButton: {
    padding: 5,
  },
  historyCount: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 15,
    fontWeight: "600",
  },
  appointmentItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  appointmentDate: {
    fontSize: 15,
    color: "#333333",
    marginBottom: 3,
  },
  appointmentCreated: {
    fontSize: 13,
    color: "#666666",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  appointmentNote: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});

export default AppointmentHistoryCN;
