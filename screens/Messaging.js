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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context"; // Import SafeAreaView
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scheme = useColorScheme();
  const scrollViewRef = useRef(null);

  // Toggle side menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Load initial messages
  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! How can I assist you today?",
        sender: "Support Agent",
        avatar: "https://i.pravatar.cc/150?img=1", // Profile photo URL
        isUser: false, // Indicates if the message is from the user
      },
    ]);
  }, []);

  // Handle sending new messages
  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "You",
      avatar: "https://i.pravatar.cc/150?img=2", // Current user's profile photo
      isUser: true, // Indicates if the message is from the user
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText(""); // Clear the input field

    // Scroll to the bottom after sending a message
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}> {/* Wrap everything in SafeAreaView */}
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
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.otherMessage,
              ]}
            >
              {/* Profile Photo */}
              <Image source={{ uri: message.avatar }} style={styles.avatar} />

              {/* Message Bubble */}
              <View style={styles.messageBubble}>
                <Text style={styles.senderName}>{message.sender}</Text>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            </View>
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
    marginBottom: 30,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    backgroundColor: "#E5E5EA", // Default bubble color
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