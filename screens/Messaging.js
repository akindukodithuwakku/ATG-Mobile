import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { database } from "../firebaseConfig.js";
import { ref, onValue, push, remove, ref as dbRef } from "firebase/database";

const API_ENDPOINT = "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";

const ChatScreen = ({ navigation, route }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [loadingReceiver, setLoadingReceiver] = useState(true);
  const [receiverError, setReceiverError] = useState(null);

  // Detect user type and fetch care navigator if client
  useEffect(() => {
    const loadUser = async () => {
      const storedId = await AsyncStorage.getItem("appUser");
      const userId = storedId || "defaultUser";
      const isCareNavigator = userId.startsWith("cn_");
      setCurrentUser({
        id: userId,
        name: "You",
        avatar: "https://i.pravatar.cc/150?img=2",
        isCareNavigator,
      });

      if (!isCareNavigator) {
        // Fetch care navigator for this client
        setLoadingReceiver(true);
        setReceiverError(null);
        try {
          const response = await fetch(`${API_ENDPOINT}/dbHandling`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "get_client_care_navigator",
              data: { client_username: userId },
            }),
          });
          const result = await response.json();
          const parsedBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
          if (result.statusCode === 200 && parsedBody.care_navigator_username) {
            setReceiverId(parsedBody.care_navigator_username);
          } else {
            setReceiverError(parsedBody.error || "Care navigator not found");
          }
        } catch (err) {
          setReceiverError("Failed to fetch care navigator");
        } finally {
          setLoadingReceiver(false);
        }
      } else {
        // For care navigator, receiverId will be set via props (when opening a chat with a client)
        setLoadingReceiver(false);
      }
    };
    loadUser();
  }, []);

  // If care navigator, get clientId from route params
  useEffect(() => {
    if (currentUser && currentUser.isCareNavigator && route?.params?.clientId) {
      setReceiverId(route.params.clientId);
    }
  }, [currentUser, route]);

  // Compose chat path (sorted)
  const chatPath = currentUser && receiverId
    ? [currentUser.id, receiverId].sort().join('_')
    : null;

  // Chat logic
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scheme = useColorScheme();
  const scrollViewRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Load messages for this chat
  useEffect(() => {
    if (!chatPath) return;
    const messagesRef = ref(database, `messages/${chatPath}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedMessages = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMessages(parsedMessages);
      } else {
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, [chatPath]);

  // Handle sending new messages
  const handleSend = () => {
    if (inputText.trim() === "" || !currentUser || !receiverId) return;
    const newMessage = {
      text: inputText,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: receiverId,
      avatar: currentUser.avatar,
      isUser: !currentUser.isCareNavigator,
      timestamp: Date.now(),
    };
    const messagesRef = ref(database, `messages/${chatPath}`);
    push(messagesRef, newMessage);
    setInputText("");
  };

  const handleLongPress = (message) => {
    if (message.senderId !== currentUser.id) return;
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMessage(message.id),
        },
      ]
    );
  };

  const deleteMessage = async (messageId) => {
    const messageRef = dbRef(database, `messages/${chatPath}/${messageId}`);
    try {
      await remove(messageRef);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Loading and error states
  if (!currentUser || loadingReceiver) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading chat...</Text>
      </View>
    );
  }
  if (!currentUser.isCareNavigator && receiverError) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{receiverError}</Text>
      </View>
    );
  }
  if (!receiverId) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'gray', textAlign: 'center', marginTop: 40 }}>Waiting for chat partner...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Status Bar */}
        <StatusBar
          barStyle={scheme === "dark" ? "light-content" : "dark-content"}
          translucent={true}
          backgroundColor={scheme === "dark" ? "black" : "transparent"}
        />

        {/* Header with Hamburger Icon */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleMenu}>
            <Ionicons
              name={isMenuOpen ? "close" : "menu"}
              size={30}
              color="black"
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Chat</Text>
        </View>

        {/* Overlay for Side Navigation */}
        {isMenuOpen && (
          <View style={styles.overlay}>
            <SideNavigationCN navigation={navigation} onClose={toggleMenu} />
            <TouchableOpacity
              style={styles.overlayBackground}
              onPress={toggleMenu}
            />
          </View>
        )}

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <TouchableOpacity
              key={message.id}
              onLongPress={() => handleLongPress(message)}
              delayLongPress={500}
            >
              <View
                style={[
                  styles.messageContainer,
                  message.senderId === currentUser.id ? styles.userMessage : styles.otherMessage,
                ]}
              >
                {/* Message Bubble */}
                <View style={styles.messageBubble}>
                  <Text style={styles.senderName}>{message.senderName}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Field and Send Button */}
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            style={styles.inputField}
            multiline={false}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    marginTop: 0,
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
  chatContent: {
    flexGrow: 1,
    padding: 10,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    backgroundColor: "#E5E5EA",
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  inputField: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
});

export default ChatScreen;