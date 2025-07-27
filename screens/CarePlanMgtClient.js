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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import SideNavigationClient from "../Components/SideNavigationClient";
import ArticleCard from "../Components/ArticleCard";
import TimelineItemClient from "../Components/TimelineItemClient";

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

const CarePlanClientScreen = ({ route, navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [searchText, setSearchText] = useState("");
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);

  // Get carePlanId and clientUsername from route params
  const carePlanId = route?.params?.carePlanId;
  const clientUsername = route?.params?.clientUsername;
  const isFocused = useIsFocused();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      console.log("=== CLIENT TASK FETCH DEBUG ===");
      console.log("carePlanId:", carePlanId);
      console.log("clientUsername:", clientUsername);
      console.log("Type of carePlanId:", typeof carePlanId);
      
      if (!carePlanId) {
        console.error("No care plan ID provided");
        setTasks([]);
        return;
      }

      // Fetch tasks for the specific care plan ID
      const apiUrl = `https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/tasks?care_plan_id=${carePlanId}`;
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      console.log("Response status:", response.status);
      
      const result = await response.json();
      console.log("API Response:", result);
      console.log("Number of tasks received:", result ? result.length : 0);
      
      const sortedTasks = (result || []).sort((a, b) => new Date(a.start || 0) - new Date(b.start || 0));
      console.log("Sorted tasks:", sortedTasks);
      console.log("=== END CLIENT TASK FETCH DEBUG ===");
      
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reload tasks when screen focused or carePlanId changes
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

  const filteredTasks = tasks.filter(task => {
    // If no start date, show the task in current month by default
    if (!task.start) {
      const shouldShow = selectedMonth === new Date().getMonth();
      if (searchText.trim() === '') {
        return shouldShow; // Show in current month
      }
      return false; // Hide tasks without start dates when searching
    }
    
    const taskDate = new Date(task.start.replace(' ', 'T'));
    const matchesMonth = taskDate.getMonth() === selectedMonth;

    if (searchText.trim() === '') {
      return matchesMonth;
    }

    // Check if searchText matches the date part of the task (YYYY-MM-DD)
    const taskDateString = task.start.split(' ')[0];
    return matchesMonth && taskDateString.includes(searchText.trim());
  });

  const renderTaskItem = ({ item, index }) => (
    <TimelineItemClient
      id={item.id}
      title={item.title}
      description={item.description}
      start={item.start}
      end={item.end}
      status={item.status}
      isLast={index === filteredTasks.length - 1}
      onEdit={null} // Clients cannot edit
      onDelete={null} // Clients cannot delete
      onMarkComplete={() => {
        navigation.navigate("TaskScreen", {
          taskId: item.id,
          taskTitle: item.title,
          taskDescription: item.description,
          taskStart: item.start,
          taskEnd: item.end,
          carePlanId, // pass carePlanId here!
        });
      }}
      isClientView={true}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#00BCD4" />

      {/* Header with menu button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setIsSideNavVisible(!isSideNavVisible)}
          style={{ position: "absolute", left: 20, top: 45, zIndex: 10 }}
        >
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Care Plan Tasks</Text>
        <Text style={styles.headerSubtitle}>View and track your tasks</Text>
      </View>

      {/* Side Navigation */}
      {isSideNavVisible && (
        <SideNavigationClient
          navigation={navigation}
          onClose={() => setIsSideNavVisible(false)}
        />
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Articles Section */}
        <View style={{ marginVertical: 5 }}>
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
                  content={item.content}
                />
              </View>
            )}
          />
        </View>

        {/* Tasks Section */}
        <Text style={styles.taskHeader}>Tasks for {MONTHS[selectedMonth]}</Text>

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

        {loading ? (
          <ActivityIndicator size="large" color="#00BCD4" />
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) =>
              item.id ? item.id.toString() : Math.random().toString()
            }
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#888" }}
              >
                No tasks found for this month.
              </Text>
            }
            scrollEnabled={false} // disable scrolling inside FlatList because inside ScrollView
          />
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationClient navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FDFF" },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#00BCD4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 4,
  },
  taskHeader: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
    color: "#0a0efff3",
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
    color: "#000",
  },
  searchIcon: {
    marginRight: 10,
  },
});

export default CarePlanClientScreen;
