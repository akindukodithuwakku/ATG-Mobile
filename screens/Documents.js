import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { LinearGradient } from "expo-linear-gradient";

const DocumentUpload = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Temporary uploaded files
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track files being uploaded
  const [confirmedFiles, setConfirmedFiles] = useState([]); // Persistently stored files
  const [isSuccess, setIsSuccess] = useState(false); // Track success state
  const scheme = useColorScheme();
  const scrollViewRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled) {
        const fileName = result.assets[0].name;

        // Add the file to uploadingFiles with initial progress
        setUploadingFiles((prev) => ({
          ...prev,
          [fileName]: { progress: 0 },
        }));

        // Simulate upload progress
        simulateUploadProgress(fileName);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const simulateUploadProgress = (fileName) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20); // Random progress increment
      progress = Math.min(progress, 100); // Ensure progress doesn't exceed 100%

      setUploadingFiles((prev) => ({
        ...prev,
        [fileName]: { progress },
      }));

      if (progress >= 100) {
        clearInterval(interval);

        // Once upload is complete, move the file to uploadedFiles
        setUploadingFiles((prev) => {
          const newUploadingFiles = { ...prev };
          delete newUploadingFiles[fileName];
          return newUploadingFiles;
        });

        setUploadedFiles((prev) => [...prev, fileName]);
        scrollToEnd();
      }
    }, 300); // Simulate upload every 300ms
  };

  const confirmUpload = () => {
    if (uploadedFiles.length > 0) {
      setConfirmedFiles((prev) => [...prev, ...uploadedFiles]); // Add uploaded files to confirmedFiles
      setUploadedFiles([]); // Clear temporary uploaded files
      setIsSuccess(true); // Show success page after confirming uploads
    }
  };

  const removeFile = (index) => {
    setConfirmedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToEnd = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const resetUpload = () => {
    setIsSuccess(false); // Reset success state
    setUploadedFiles([]); // Clear temporary uploaded files
    setUploadingFiles({}); // Clear uploading files
  };

  const renderSuccessPage = () => {
    return (
      <View style={styles.successContainer}>
        <Ionicons name="checkmark-circle-outline" size={80} color="#00AEEF" />
        <Text style={styles.successTitle}>Upload Successful!</Text>
        <Text style={styles.successMessage}>
          Your files have been successfully uploaded.
        </Text>
        <TouchableOpacity style={styles.successButton} onPress={resetUpload}>
          <Text style={styles.successButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent={true}
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons name={isMenuOpen ? "close" : "menu"} size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Document Upload</Text>
      </View>
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity style={styles.overlayBackground} onPress={toggleMenu} />
        </View>
      )}

      {/* Success Page */}
      {isSuccess && renderSuccessPage()}

      {/* Main Upload Page */}
      {!isSuccess && (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Upload Box */}
          {Object.keys(uploadingFiles).length === 0 && uploadedFiles.length === 0 && (
            <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
              <Ionicons name="cloud-upload-outline" size={30} color="#00AEEF" />
              <Text style={styles.uploadText}>Drag & Drop</Text>
              <Text style={styles.subText}>You Can Drag And Drop or Click Here To Browse</Text>
            </TouchableOpacity>
          )}

          {/* Uploading Files with Progress Bar */}
          {Object.keys(uploadingFiles).map((fileName) => {
            const { progress } = uploadingFiles[fileName];
            return (
              <View key={fileName} style={styles.uploadSuccessBox}>
                <Text style={styles.uploadSuccessText}>
                  <Ionicons name="document-text-outline" size={25} color="#00AEEF" /> {fileName}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${progress}%` }]} />
                  <Text style={styles.progressText}>{`${progress}%`}</Text>
                </View>
              </View>
            );
          })}

          {/* Uploaded File Success Message */}
          {uploadedFiles.length > 0 && (
            <LinearGradient
              colors={["#09D1C7", "#35AFEA"]}
              style={[styles.uploadSuccessBox, { padding: 20, marginVertical: 10 }]}
            >
              <Ionicons name="checkmark-circle-outline" size={30} color="white" />
              <Text style={styles.uploadSuccessText}>
                <Ionicons name="document-text-outline" size={25} color="#00AEEF" />
                {uploadedFiles[uploadedFiles.length - 1]}
              </Text>
            </LinearGradient>
          )}

          {/* Recently Uploaded Section */}
          <Text style={styles.sectionTitle}>Recently Uploaded</Text>
          <FlatList
            data={confirmedFiles}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.fileItem}>
                <Ionicons name="document-text-outline" size={20} color="#00AEEF" />
                <Text style={styles.fileName}>{item}</Text>
                {/* 🔴 Red Circular Remove Button */}
                <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeIconContainer}>
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
      )}

      {/* Confirm Button */}
      {!isSuccess && (
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.confirmButton, uploadedFiles.length === 0 && styles.disabledButton]}
            onPress={confirmUpload}
            disabled={uploadedFiles.length === 0}
          >
            <Text style={styles.confirmButtonText}>Confirm Upload</Text>
          </TouchableOpacity>
          <BottomNavigationCN navigation={navigation} />
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#00AEEF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginVertical: 10,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00AEEF",
    marginTop: 10,
  },
  subText: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },
  uploadSuccessBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#00AEEF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginVertical: 10,
  },
  uploadSuccessText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00AEEF",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    padding: 0,
    borderRadius: 5,
    marginBottom: 1,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  progressBar: {
    height: 8,
    width: 75,
    backgroundColor: "#00AEEF",
    borderRadius: 5,
  },
  progressText: {
    marginLeft: 20,
    fontSize: 12,
    color: "#00AEEF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 30,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f2f2f2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  bottomSection: {
    paddingVertical: 10,
    backgroundColor: "#fff",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#00AEEF",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    width: "90%",
    marginBottom: 60,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  removeIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00AEEF",
    marginTop: 20,
  },
  successMessage: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  successButton: {
    backgroundColor: "#00AEEF",
    padding: 20,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 40,
  },
  successButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DocumentUpload;