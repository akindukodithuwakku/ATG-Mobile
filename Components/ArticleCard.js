import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
} from "react-native";

const ArticleCard = ({ title, duration, type, onPress }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const articleContent = `
        A care plan is a document that outlines the care and services a patient will receive. 
        It is created by healthcare professionals and is tailored to meet the individual needs of the patient. 
        The care plan includes information about the patient's medical history, current health status, 
        treatment goals, and the specific interventions that will be implemented to achieve those goals. 
        Care plans are essential for ensuring that patients receive coordinated and effective care.
    `;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>
          ☰ {"  "} {type || "Article"}
        </Text>
        <Text style={styles.meta}> {duration || "5 min"}</Text>
      </View>
      <Text style={styles.title}>{title || "What is a care plan?"}</Text>
      <TouchableOpacity onPress={handlePress}>
        <Text style={styles.readLink}>Read</Text>
      </TouchableOpacity>

      {/* Modal for displaying the article */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {title || "What is a care plan?"}
            </Text>
            <Text style={styles.modalText}>{articleContent}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e6f7ff", // Light blue background
    borderRadius: 10,
    padding: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 320,
    elevation: 2, // For Android
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: 20,
    color: "#6cbbff", // Icon color
  },
  meta: {
    marginHorizontal: 10,
    marginLeft: 10,
    color: "#555",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginLeft: 20,
  },
  readLink: {
    color: "#007bff", // Link color
    marginTop: 8,
    fontSize: 16,
    marginLeft: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default ArticleCard;
