import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  Linking
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ContactUs = ({ navigation }) => {
  const contactOptions = [
    {
      icon: <MaterialIcons name="email" size={24} color="#09D1C7" />,
      title: "Email",
      details: [
        "support@atghealthcare.com",
        "info@atghealthcare.com"
      ]
    },
    {
      icon: <Feather name="phone" size={24} color="#09D1C7" />,
      title: "Phone",
      details: [
        "+44-734-954-0462",
        "+44-734-632-0462"
      ]
    },
    {
      icon: <Feather name="map-pin" size={24} color="#09D1C7" />,
      title: "Address",
      details: [
        "62 SHELTON STREET",
        "LONDON, COVENT GARDEN",
        "UNITED KINGDOM"
      ]
    }
  ];

  const handleContactMethod = (method, detail) => {
    switch(method) {
      case "Email":
        Linking.openURL(`mailto:${detail}`);
        break;
      case "Phone":
        Linking.openURL(`tel:${detail}`);
        break;
    }
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
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Contact Us</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Get In Touch</Text>
          <Text style={styles.subtitle}>
            We're here to help and answer any question you might have
          </Text>
        </View>

        {contactOptions.map((section, index) => (
          <View key={index} style={styles.contactSection}>
            <View style={styles.sectionHeader}>
              {section.icon}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.details.map((detail, detailIndex) => (
              <TouchableOpacity
                key={detailIndex}
                style={styles.contactDetailItem}
                onPress={() => handleContactMethod(section.title, detail)}
              >
                <Text style={styles.contactDetailText}>{detail}</Text>
                {(section.title === "Email" || section.title === "Phone") && (
                  <Ionicons 
                    name="open-outline" 
                    size={20} 
                    color="#35AFEA" 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            Our support team is available Monday to Friday, 
            9 AM to 6 PM EST
          </Text>
        </View>
      </ScrollView>
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
  backButtonText: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
  },
  titleContainer: {
    marginVertical: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  contactSection: {
    backgroundColor: "#E9F6FE",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },
  contactDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  contactDetailText: {
    fontSize: 16,
    color: "#666",
  },
  noteContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  noteText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  }
});

export default ContactUs;