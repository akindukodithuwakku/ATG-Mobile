import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  useColorScheme,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { database } from "../firebaseConfig.js";
import { ref, onValue } from "firebase/database";

const API_ENDPOINT = "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const MessagingCN = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [recentMessages, setRecentMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    const loadCareNavigator = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedId = await AsyncStorage.getItem("appUser");
        if (!storedId || !storedId.startsWith("cn_")) {
          setError("Not a care navigator account.");
          setLoading(false);
          return;
        }
        setCurrentUser({ id: storedId });
        // Fetch client list
        const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_care_navigator_clients",
            data: { care_navigator_username: storedId },
          }),
        });
        const result = await response.json();
        const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
        if (result.statusCode === 200 && Array.isArray(parsedBody.clients)) {
          setClients(parsedBody.clients);
        } else {
          setError(parsedBody.error || "No clients found.");
        }
      } catch (err) {
        setError("Failed to fetch clients.");
      } finally {
        setLoading(false);
      }
    };
    loadCareNavigator();
  }, []);

  // Fetch most recent message for each client
  useEffect(() => {
    if (!currentUser || clients.length === 0) return;
    const unsubscribes = [];
    clients.forEach((clientId) => {
      const chatPath = [currentUser.id, clientId].sort().join('_');
      const messagesRef = ref(database, `messages/${chatPath}`);
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        let lastMsg = null;
        if (data) {
          const messagesArr = Object.values(data);
          messagesArr.sort((a, b) => b.timestamp - a.timestamp);
          lastMsg = messagesArr[0];
        }
        setRecentMessages((prev) => ({ ...prev, [clientId]: lastMsg }));
      });
      unsubscribes.push(unsubscribe);
    });
    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [currentUser, clients]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading clients...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chats</Text>
      </View>
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}
      <ScrollView style={styles.content}>
        {clients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No clients found</Text>
          </View>
        ) : (
          clients.map((clientId) => {
            const lastMsg = recentMessages[clientId];
            return (
              <TouchableOpacity
                key={clientId}
                style={styles.chatListItem}
                onPress={() => navigation.navigate("Messaging", { clientId })}
              >
                <View style={styles.chatListTextContainer}>
                  <Text style={styles.clientName}>{clientId}</Text>
                  {lastMsg ? (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {lastMsg.senderName}: {lastMsg.text}
                    </Text>
                  ) : (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      No messages yet
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <BottomNavigationCN navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    marginTop: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    zIndex: 1,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  chatListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  chatListTextContainer: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
});

export default MessagingCN;
