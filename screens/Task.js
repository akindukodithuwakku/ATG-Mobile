import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, StatusBar, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationClient from "../Components/BottomNavigationClient"; // Assuming you have this component

const TaskScreen = ({ navigation }) => {
    const bubbleScale = useRef(new Animated.Value(0)).current; // Initial scale value
    const scheme = useColorScheme(); // Get the current color scheme

    const handleComplete = () => {
        Alert.alert("Task marked as complete!");
    };

    const handleDelete = () => {
        Alert.alert("Task deleted!");
    };

    useEffect(() => {
        // Start the animation when the component mounts
        Animated.timing(bubbleScale, {
            toValue: 1, // Scale to full size
            duration: 300, // Duration of the animation
            useNativeDriver: true, // Use native driver for better performance
        }).start();
    }, [bubbleScale]);

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
                <Text style={styles.headerTitle}>Task Id</Text>
            </View>

            <View style={styles.taskContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="flash" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.taskTextContainer}>
                    <Text style={styles.taskLabel}>Task</Text>
                    <Animated.View style={[styles.cloudBubble, { transform: [{ scale: bubbleScale }] }]}>
                        <Text style={styles.taskDescription}>
                            lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </Text>
                        <View style={styles.bubbleTail} />
                    </Animated.View>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <Text style={styles.completeButtonText}>Mark as complete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>Delete task</Text>
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
        backgroundColor: "#E0F7FA",
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
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flex: 1,
        paddingVertical: 20,
        padding: 10,
    },
    iconContainer: {
        backgroundColor: "#4A90E2",
        borderRadius: 50,
        padding: 10,
        marginRight: 10,
    },
    cloudBubble: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 15,
        paddingTop: 20,
        shadowColor: "#000",
        width: 250,
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
    taskLabel: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    taskDescription: {
        fontSize: 16,
        color: "#333",
        textAlign: 'left',
    },
    buttonContainer: {
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    completeButton: {
        backgroundColor: "#00BCD4",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        marginBottom: 10,
    },
    completeButtonText: {
        fontSize: 18,
 color: "white",
        fontWeight: "bold",
    },
    deleteButton: {
        backgroundColor: "white",
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: "center",
        borderColor: "#00BFFF",
        borderWidth: 1,
        marginBottom: 40,
    },
    deleteButtonText: {
        fontSize: 18,
        color: "#00BFFF",
        fontWeight: "bold",
    },
});

export default TaskScreen;