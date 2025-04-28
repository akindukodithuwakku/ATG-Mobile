import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from "../Components/BottomNavigationClient"; // Assuming you have this component

const AppointmentScreen = ({ navigation }) => {
    const scheme = useColorScheme(); // Get the current color scheme

    const bubbleScale = useRef(new Animated.Value(0)).current; // Initial scale value

    useEffect(() => {
        // Animate the bubble to "pop up" when the screen is opened
        Animated.spring(bubbleScale, {
            toValue: 1, // Final scale value
            friction: 5, // Controls the "bounciness"
            useNativeDriver: true, // Use native driver for better performance
        }).start();
    }, []);

    const handleCompletePress = () => {
        Alert.alert("Appointment marked as complete!");
    };

    const handleCancelPress = () => {
        Alert.alert("Appointment has been cancelled.");
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={scheme === "dark" ? "light-content" : "dark-content"}
                translucent={true}
                backgroundColor={scheme === "dark" ? "black" : "transparent"}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Appointment ID</Text>
            </View>

            <View style={styles.appointmentContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="calendar" size={24} color="#00BFFF" />
                    <Text style={styles.appointmentTitle}>Appointment</Text>
                </View>
                <Animated.View
                    style={[
                        styles.cloudBubble,
                        { transform: [{ scale: bubbleScale }] }, // Apply the scale animation
                    ]}
                >
                    <Text style={styles.appointmentDetails}>
                        lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </Text>
                    <View style={styles.bubbleTail} />
                </Animated.View>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.dateText}>Date: Tuesday, 25 May</Text>
                <Text style={styles.timeText}>Time: 16:00 - 16:30</Text>
                <Text style={styles.locationText}>
                    Location: lorem ipsum. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. 
                    Velit officia consequat duis enim velit mollit.
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.completeButton} onPress={handleCompletePress}>
                    <Text style={styles.buttonText1}>Mark as complete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
                    <Text style={styles.buttonText2}>Cancel Appointment</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Navigation */}
            <BottomNavigationClient navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        backgroundColor: "#00BCD4",
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        marginLeft: 20,
    },
    appointmentContainer: {
        padding: 16,
        backgroundColor: '#f6f6f6',
        borderRadius: 8,
        marginBottom: 16,
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    iconContainer: {
        flexDirection: 'row', // Align items in a row
        alignItems: 'center', // Vertically center the items
        marginBottom: 8,
    },
    appointmentTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 8, // Add spacing between the icon and text
    },
    cloudBubble: {
        marginTop: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        paddingTop: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 10,
        position: 'relative', // Position relative for the tail
    },
    bubbleTail: {
        position: 'absolute',
        top: 20, // Adjust this value to position the tail vertically
        left: -10, // Position the tail to the left of the bubble
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFFFFF', // Same color as the bubble
    },
    appointmentDetails: {
        fontSize: 16,
        color: '#333',
        textAlign: 'left',
    },
    infoBox: {
        backgroundColor: "#E0F7FA", // Light blue background
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    dateText: {
        fontSize: 16,
        marginBottom: 4,
        color: "#333",
    },
    timeText: {
        fontSize: 16,
        marginBottom: 4,
        color: "#333",
    },
    locationText: {
        fontSize: 14,
        color: "#555",
    },
    buttonContainer: {
        flexDirection: "column", // Arrange buttons vertically
        justifyContent: "center", // Center buttons vertically
        alignItems: "center", // Center buttons horizontally
        paddingHorizontal: 20,
        marginBottom: 90, // Adjust bottom margin
        position: "absolute", // Position at the bottom
        bottom: 0, // Stick to the bottom
        width: "100%", // Full width of the screen
    },
    completeButton: {
        backgroundColor: "#00BCD4",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        width: "90%", // Full width with some padding
        marginBottom: 10, // Add spacing between buttons
    },
    cancelButton: {
        backgroundColor: "white",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        borderColor: "#00BFFF",
        borderWidth: 1,
        width: "90%", // Full width with some padding
    },
    buttonText1: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    buttonText2: {
        color: "#00BFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default AppointmentScreen;