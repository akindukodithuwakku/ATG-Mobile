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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import SideNavigationClient from "../Components/SideNavigationClient";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationClient from "../Components/BottomNavigationClient";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { database } from "../firebaseConfig.js"; // 👈 Adjust this path if firebaseConfig.js is elsewhere
import { ref, onValue, push } from "firebase/database";

const ChatScreen = ({ navigation, route }) => {
  const { userId } = route.params; // <-- Receive userId from LoginScreen

  const [currentUser, setCurrentUser] = useState({
    id: userId,
    name: "User",
    avatar: "https://i.pravatar.cc/150?img=1",
  });

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState("client");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scheme = useColorScheme();
  const scrollViewRef = useRef(null);

  // Define receiver ID based on user type
  const RECEIVER_ID = userType === "cn" ? "client_user" : "cn_user";

  // Detect user type and set current user info on component mount
  useEffect(() => {
    const detectUserType = async () => {
      try {
        const username = await AsyncStorage.getItem("appUser");
        if (username) {
          // Check if username contains 'cn_' prefix for care navigators
          if (username.startsWith("cn_")) {
            setUserType("cn");
            setCurrentUser({
              id: userId,
              name: username.replace("cn_", "").replace(/_/g, " "),
              avatar: "https://i.pravatar.cc/150?img=2",
            });
          } else {
            setUserType("client");
            setCurrentUser({
              id: userId,
              name: username.replace(/_/g, " "),
              avatar: "https://i.pravatar.cc/150?img=3",
            });
          }
        }
      } catch (error) {
        console.error("Error detecting user type:", error);
        setUserType("client"); // Default to client
      }
    };

    detectUserType();
  }, [userId]);

  // Toggle side menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Load initial messages
  useEffect(() => {
    const messagesRef = ref(database, "messages");

    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const parsedMessages = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));

            // Filter messages for current conversation
            const filteredMessages = parsedMessages.filter(
              (message) =>
                (message.senderId === currentUser.id &&
                  message.receiverId === RECEIVER_ID) ||
                (message.senderId === RECEIVER_ID &&
                  message.receiverId === currentUser.id)
            );

            // Sort messages by timestamp
            const sortedMessages = filteredMessages.sort(
              (a, b) => a.timestamp - b.timestamp
            );
            setMessages(sortedMessages);
          }
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error("Error loading messages:", err);
          setError("Failed to load messages");
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Firebase error:", error);
        setError("Connection error");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser.id, RECEIVER_ID]);

  // Handle sending new messages
  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      text: inputText,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: RECEIVER_ID,
      avatar: currentUser.avatar,
      isUser: true,
      timestamp: Date.now(), // optional, for sorting later
    };

    try {
      const messagesRef = ref(database, "messages");
      await push(messagesRef, newMessage);
      setInputText(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  // Handle long press on messages
  const handleLongPress = (message) => {
    Alert.alert(
      "Message Options",
      "What would you like to do with this message?",
      [
        {
          text: "Copy",
          onPress: () => {
            // Copy message text to clipboard
            console.log("Copy message:", message.text);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  // Render side navigation based on user type
  const renderSideNavigation = () => {
    if (userType === "cn") {
      return <SideNavigationCN navigation={navigation} onClose={toggleMenu} />;
    } else {
      return (
        <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
      );
    }
  };

  // Render bottom navigation based on user type
  const renderBottomNavigation = () => {
    if (userType === "cn") {
      return <BottomNavigationCN navigation={navigation} />;
    } else {
      return <BottomNavigationClient navigation={navigation} />;
    }
  };

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
            {renderSideNavigation()}
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
          {isLoading && (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          )}

          {error && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => window.location.reload()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                No messages yet. Start a conversation!
              </Text>
            </View>
          )}

          {!isLoading &&
            !error &&
            messages.map((message) => (
              <TouchableOpacity
                key={message.id}
                onLongPress={() => handleLongPress(message)}
                delayLongPress={500}
              >
                <View
                  style={[
                    styles.messageContainer,
                    message.senderId === currentUser.id
                      ? styles.userMessage
                      : styles.otherMessage,
                  ]}
                >
                  {/* Profile Photo
                <Image source={{ uri: message.avatar }} style={styles.avatar} /> */}

                  {/* Message Bubble */}
                  <View
                    style={[
                      styles.messageBubble,
                      message.senderId === currentUser.id
                        ? styles.userMessageBubble
                        : styles.otherMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.senderName,
                        message.senderId === currentUser.id
                          ? styles.userSenderName
                          : styles.otherSenderName,
                      ]}
                    >
                      {message.senderName}
                    </Text>
                    <Text
                      style={[
                        styles.messageText,
                        message.senderId === currentUser.id
                          ? styles.userMessageText
                          : styles.otherMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
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
            multiline={false} // Prevents multi-line input
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      {renderBottomNavigation()}
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
  // avatar: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   marginRight: 10,
  // },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userMessageBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 2,
  },
  otherMessageBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 12,
  },
  userSenderName: {
    color: "#fff",
  },
  otherSenderName: {
    color: "#333",
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ChatScreen;
