//careplanmgtCN
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import SideNavigationCN from "../Components/SideNavigationCN";
import ArticleCard from "../Components/ArticleCard";
import TaskCard from "../Components/TaskCard";
import { useIsFocused } from "@react-navigation/native";
import TimelineItem from "../Components/TimelineItem";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CarePlanOverview = ({ navigation, carePlanId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [searchText, setSearchText] = useState("");
  const isFocused = useIsFocused();

  const fetchTasks = async () => {
    try {
      if (!carePlanId) {
        console.error("No care plan ID provided");
        setTasks([]);
        setLoading(false);
        return;
      }

      // Use the actual care plan ID if available, otherwise extract from identifier
      let actualCarePlanId = carePlanId;
      let clientUsername = "";

      // If carePlanId is a string identifier (format: "client_username_date_created")
      if (typeof carePlanId === "string" && carePlanId.includes("_")) {
        const parts = carePlanId.split("_");
        clientUsername = parts.slice(0, -1).join("_"); // Join all parts except the last one (date)

        // Map client usernames to their actual care plan IDs
        const carePlanIdMap = {
          testuser_01: 1,
          Kavindya_02: 2,
          kavindya_02: 2,
          rakeeb_03: 3,
          indumini_05: 6,
        };
        actualCarePlanId = carePlanIdMap[clientUsername] || carePlanId;
      }

      // Fetch tasks for the specific care plan ID
      const apiUrl = `https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/tasks?care_plan_id=${actualCarePlanId}`;
      console.log("Fetching tasks for care plan ID:", actualCarePlanId);
      console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl);
      const result = await response.json();

      const sortedTasks = (result || []).sort((a, b) => {
        return new Date(a.start || 0) - new Date(b.start || 0);
      });

      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused, carePlanId]);

  const articleData = [
    {
      id: "1",
      type: "Article",
      duration: "5 min",
      title: "What is a care plan?",
    },
  ];

  // Filter tasks by selected month and search text (date)
  const filteredTasks = tasks.filter((task) => {
    // If no start date, show the task in current month by default
    if (!task.start) {
      const shouldShow = selectedMonth === new Date().getMonth();
      if (searchText.trim() === "") {
        return shouldShow; // Show in current month
      }
      return false; // Hide tasks without start dates when searching
    }

    const taskDate = new Date(task.start.replace(" ", "T"));
    const matchesMonth = taskDate.getMonth() === selectedMonth;

    if (searchText.trim() === "") {
      return matchesMonth;
    }

    // Check if searchText matches the date part of the task (YYYY-MM-DD)
    const taskDateString = task.start.split(" ")[0];
    return matchesMonth && taskDateString.includes(searchText.trim());
  });

  const renderTaskItem = ({ item, index }) => (
    <TimelineItem
      id={item.id}
      title={item.title}
      description={item.description}
      start={item.start}
      end={item.end}
      status={item.status}
      isLast={index === filteredTasks.length - 1}
      onEdit={() => navigation.navigate("UpdateTaskScreen", { task: item })}
      onDelete={(deletedId) => {
        setTasks((prev) => prev.filter((task) => task.id !== deletedId));
      }}
    />
  );

  const renderHeader = () => (
    <View>
      {/* Articles Section */}
      <FlatList
        data={articleData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <View style={{ minHeight: 180, justifyContent: "center" }}>
            <ArticleCard
              title={item.title}
              duration={item.duration}
              type={item.type}
              onPress={() => navigation.navigate("Details", { item })}
            />
          </View>
        )}
        scrollEnabled={false}
      />

      <Text style={styles.taskHeader}>Tasks for {MONTHS[selectedMonth]}</Text>

      {/* Month filter row */}
      <View style={styles.monthRow}>
        {MONTHS.map((m, idx) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.monthButton,
              selectedMonth === idx && styles.monthButtonSelected,
            ]}
            onPress={() => setSelectedMonth(idx)}
          >
            <Text
              style={[
                styles.monthButtonText,
                selectedMonth === idx && styles.monthButtonTextSelected,
              ]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search bar for date */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#B3E5FC"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by date (YYYY-MM-DD)..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
      No tasks for this month.
    </Text>
  );

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#00BCD4" style={{ flex: 1 }} />
    );
  }

  return (
    <FlatList
      data={filteredTasks}
      renderItem={renderTaskItem}
      keyExtractor={(item) =>
        item.id ? item.id.toString() : Math.random().toString()
      }
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyComponent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    />
  );
};

const CarePlanScreen = ({ route, navigation }) => {
  const scheme = useColorScheme();
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);

  // Get dynamic care plan ID and client username
  const { carePlanId, actualCarePlanId, clientUsername } = route.params;

  const closeSideNav = () => setIsSideNavVisible(false);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => setIsSideNavVisible(!isSideNavVisible)}
        >
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Care Plan Overview</Text>
          <Text style={styles.headersec}>What you can do for yourself?</Text>
        </View>
      </View>

      {isSideNavVisible && (
        <SideNavigationCN navigation={navigation} onClose={closeSideNav} />
      )}

      <CarePlanOverview navigation={navigation} carePlanId={carePlanId} />

      <BottomNavigationCN navigation={navigation} />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (!actualCarePlanId) {
            alert("Unable to determine care plan ID. Please try again.");
            return;
          }
          navigation.navigate("AddTaskScreen", {
            care_plan_id: actualCarePlanId, // Pass the actual numeric care plan ID
            updated_by: clientUsername, // Use the client username so the task shows up in their list
          });
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FDFF" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#00BCD4",
    paddingTop: 40,
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  headersec: {
    fontSize: 15,
    paddingTop: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 60,
    marginTop: 0,
    marginBottom: 10,
    backgroundColor: "#00BCD4",
    paddingHorizontal: 10,
  },
  searchInput: {
    height: 40,
    flex: 1,
    borderColor: "#CCCCCC",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#E0F7FA",
  },
  searchIcon: { marginRight: 10 },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 30,
    backgroundColor: "#00BCD4",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  taskHeader: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingTop: 10,
    color: "#007B9F",
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    flexWrap: "wrap",
  },
  monthButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00BCD4",
    marginHorizontal: 4,
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  monthButtonSelected: {
    backgroundColor: "#00BCD4",
  },
  monthButtonText: {
    color: "#00BCD4",
    fontWeight: "bold",
  },
  monthButtonTextSelected: {
    color: "#fff",
  },
});

export default CarePlanScreen;
