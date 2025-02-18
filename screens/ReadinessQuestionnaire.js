import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAutomaticLogout } from "./AutoLogout";

const ReadinessQuestionnaire = ({ visible, onClose, navigation }) => {
  const { resetTimer } = useAutomaticLogout();
  const questions = [
    "Experiencing any new or worsening symptoms?",
    "Faced any challenges in following your care plan or medications?",
    "Need assistance in understanding or managing your care plan?",
    "Are there changes in lifestyle or health goals that you'd like to discuss?",
    "Already tried resolving concerns with available resources?",
  ];

  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Check if all questions have been answered
  const checkAllAnswered = (newAnswers) => {
    const allAnswered = newAnswers.every((answer) => answer !== null);
    setAllQuestionsAnswered(allAnswered);
  };

  // Handle answer selection for a question
  const handleAnswer = (index, value) => {
    resetTimer();
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    checkAllAnswered(newAnswers);
  }; 

  const handleClose = useCallback(() => {
    if (resetTimer) resetTimer();
    onClose();
  }, [onClose, resetTimer]);

  // Handle submit button press
  const handleSubmit = async () => {
    try {
      // Save answers to AsyncStorage
      // await AsyncStorage.setItem('questionnaireAnswers', JSON.stringify(answers));
      
      // Close the questionnaire
      onClose();
      resetTimer();
      
      // Navigate to appointment scheduling
      navigation.navigate("AppointmentScheduling");
    } catch (error) {
      console.error("Error saving questionnaire answers:", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Readiness Questionnaire</Text>
          </View>

          <ScrollView style={styles.scrollView}>
            {questions.map((question, index) => (
              <View key={index} style={styles.questionContainer}>
                <Text style={styles.questionText}>
                  {index + 1}. {question}
                </Text>
                <View style={styles.answerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      styles.noButton,
                      answers[index] === false && styles.selectedButton,
                    ]}
                    onPress={() => handleAnswer(index, false)}
                  >
                    <Text style={styles.buttonText}>NO</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.answerButton,
                      styles.yesButton,
                      answers[index] === true && styles.selectedButton,
                    ]}
                    onPress={() => handleAnswer(index, true)}
                  >
                    <Text style={styles.buttonText}>YES</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <Text style={styles.confirmationText}>
              Are you sure you need a consultation?
            </Text>

            <View style={styles.bottomButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !allQuestionsAnswered && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={!allQuestionsAnswered}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    !allQuestionsAnswered && styles.disabledButtonText,
                  ]}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
  },
  scrollView: {
    padding: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  answerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  answerButton: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },
  noButton: {
    backgroundColor: "#ED6A5A",
  },
  yesButton: {
    backgroundColor: "#57B894",
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: "#000",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  confirmationText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#333",
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#4CD1C0",
    alignItems: "center",
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default ReadinessQuestionnaire;