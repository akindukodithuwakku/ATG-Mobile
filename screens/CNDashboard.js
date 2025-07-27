import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import {
  Ionicons,
  Foundation,
  Feather,
  FontAwesome,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAutomaticLogout } from "../screens/AutoLogout";


const CNDashboard = ({ navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reset timer when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      resetTimer();
    }, [])
  );

  // Handle user interactions to reset the timer
  const handleUserInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const toggleMenu = useCallback(() => {
    resetTimer();
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen, resetTimer]);

  const navigateToScreen = useCallback(
    (screenName, params = {}) => {
      resetTimer();
      navigation.navigate(screenName, params);
    },
    [navigation, resetTimer]
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleUserInteraction}
      style={styles.container}
    >
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
          <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
            <Ionicons
              name={isMenuOpen ? "close" : "menu"}
              size={30}
              color="black"
            />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["#09D1C7", "#0C6478"]}
              style={styles.circleGradient}
            />
            <Image
              source={require("../assets/Ayman_Logo.png")}
              style={styles.logo}
            />
          </View>

          <Text style={styles.headerText}>DASHBOARD</Text>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigateToScreen("NotificationsCN")}
          >
            <Ionicons name="notifications-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

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

      {/* Dashboard Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={handleUserInteraction}
      >
        {/* Main Navigation Cards */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigateToScreen("CNCarePlansScreen")}
          >
            <LinearGradient
              colors={["#6a3093", "#a044ff"]}
              style={styles.cardGradient}
            >
              <View style={styles.carePlanIcon}>
                {/* Heart */}
                <FontAwesome
                  name="plus"
                  size={24}
                  color="black"
                  style={styles.heartIcon}
                />
                {/* Hands */}
                <FontAwesome5
                  name="hands"
                  size={24}
                  color="black"
                  style={styles.handIcon}
                />
              </View>
              <Text style={styles.cardTitle}>Care Plan Management</Text>
              <Text style={styles.cardSubtitle}>
                Create and manage care plans.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigateToScreen("MedicationCN")}
          >
            <LinearGradient
              colors={["#FF512F", "#DD2476"]}
              style={styles.cardGradient}
            >
              <Foundation name="clipboard-notes" size={32} color="black" />
              <Text style={styles.cardTitle}>Medication Adherence</Text>
              <Text style={styles.cardSubtitle}>
                Follow up client tasks and medications.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigateToScreen("HandleAppointmentsCN")}
          >
            <LinearGradient
              colors={["#1FA2FF", "#12D8FA"]}
              style={styles.cardGradient}
            >
              <Ionicons name="calendar-outline" size={32} color="black" />
              <Text style={styles.cardTitle}>Appointments</Text>
              <Text style={styles.cardSubtitle}>
                View the scheduled appointments.
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          {/* View Documents Button */}
          <TouchableOpacity
            style={styles.documentsButton}
            onPress={() => navigateToScreen("DocumentsCN")}
          >
            <Ionicons name="document-text-outline" size={24} color="white" />
            <Text style={styles.documentsButtonText}>View Documents</Text>
          </TouchableOpacity>

          {/* Navigate to Messaging screen when chat icon is pressed */}
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigateToScreen("Messaging", { userId: "cn_user" })}
          >
            <View style={styles.chatIconContainer}>
              <Feather
                name="message-circle"
                size={62}
                color="#09D1C7"
                style={styles.mirroredIcon}
              />
              <Image
                source={require("../assets/ChatAvatar.png")}
                style={styles.chatAvatar}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationCN navigation={navigation} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    justifyContent: "space-between",
  },
  menuButton: {
    width: 40,
  },
  logoContainer: {
    position: "relative",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  circleGradient: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 50,
  },
  logo: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    zIndex: 1,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
    color: "white",
  },
  notificationButton: {
    width: 30,
    alignItems: "flex-end",
    marginRight: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  cardContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.85,
  },
  cardGradient: {
    padding: 20,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
    marginTop: 5,
  },
  carePlanIcon: {
    alignItems: "center",
  },
  handIcon: {
    marginTop: -5,
  },
  heartIcon: {
    marginBottom: -10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  documentsButton: {
    backgroundColor: "#666",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    flex: 0.8, // Take up 80% of the row
  },
  documentsButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  chatButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0.2,
  },
  chatIconContainer: {
    position: "relative",
    width: 62,
    height: 62,
  },
  mirroredIcon: {
    transform: [{ scaleX: -1 }], // Flip the icon
    position: "absolute",
  },
  chatAvatar: {
    width: 45,
    height: 45,
    position: "absolute",
    top: 7,
    left: 7,
    borderRadius: 17.5,
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
});

export default CNDashboard;
