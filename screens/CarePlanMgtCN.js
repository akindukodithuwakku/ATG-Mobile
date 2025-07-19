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
  useColorScheme,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import SideNavigationCN from "../Components/SideNavigationCN";
import ArticleCard from "../Components/ArticleCard";
import TaskCard from "../Components/TaskCard";
import { useIsFocused } from "@react-navigation/native";
import TimelineItem from "../Components/TimelineItem";

const CarePlanOverview = ({ navigation, carePlanId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/tasks?care_plan_id=${carePlanId}`
      );
      const result = await response.json();

      const sortedTasks = (result.data || []).sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
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
  }, [isFocused]);

  const articleData = [
    {
      id: "1",
      type: "Article",
      duration: "5 min",
      title: "What is a care plan?",
    },
  ];

  const renderArticleItem = ({ item }) => (
    <ArticleCard
      title={item.title}
      duration={item.duration}
      type={item.type}
      onPress={() => navigation.navigate("Details", { item })}
    />
  );

  const renderTaskItem = ({ item, index }) => (
    <TimelineItem
      title={item.title}
      description={item.description}
      start={item.start}
      end={item.end} // <-- Add this line
      status={item.status}
      isLast={index === tasks.length - 1}
      onEdit={() => navigation.navigate("UpdateTask", { task: item })}
    />
  );

  const combinedData = [
    { type: "header", title: "Articles" },
    ...articleData.map((item) => ({ ...item, type: "article" })),
    { type: "header", title: "Tasks" },
    ...tasks.map((item) => ({ ...item, type: "task" })),
  ];

  const renderItem = ({ item, index }) => {
    if (item.type === "header") {
      return <Text style={styles.taskHeader}>{item.title}</Text>;
    } else if (item.type === "article") {
      return renderArticleItem({ item });
    } else if (item.type === "task") {
      return renderTaskItem({ item, index: index - 2 }); // Adjust index for header items
    }
    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#00BCD4" />
      ) : (
        <FlatList
          data={combinedData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : `header-${index}`
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const CarePlanScreen = ({ navigation }) => {
  const scheme = useColorScheme();
  const [isSideNavVisible, setIsSideNavVisible] = useState(false);
  const carePlanId = 2; // Hardcoded for now

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

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#B3E5FC"
          style={styles.searchIcon}
        />
        <TextInput style={styles.searchInput} placeholder="Search..." />
      </View>

      {isSideNavVisible && (
        <SideNavigationCN navigation={navigation} onClose={closeSideNav} />
      )}

      <View style={styles.scrollContainer}>
        <CarePlanOverview navigation={navigation} carePlanId={carePlanId} />
      </View>

      <BottomNavigationCN navigation={navigation} />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate("AddTask", {
            care_plan_id: carePlanId,
          })
        }
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
    height: 90,
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
  scrollContainer: { flexGrow: 1, paddingBottom: 150 },
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
});

export default CarePlanScreen;
