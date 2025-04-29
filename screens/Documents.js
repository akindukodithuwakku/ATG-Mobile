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
import * as FileSystem from "expo-file-system";

const DocumentUpload = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [confirmedFiles, setConfirmedFiles] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const scheme = useColorScheme();
  const scrollViewRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const AWS_BACKEND_URL = "https://pbhcgeu119.execute-api.ap-south-1.amazonaws.com/dev/UploadDocumentHandler";

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled) {
        const file = result.assets[0];
        const fileUri = file.uri;
        const fileName = file.name;
        uploadDocument(fileUri, fileName);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const uploadDocument = async (uri, name) => {
    try {
      const userId = "demo-user-123"; // ✅ Hardcoded user ID for testing

      setUploadingFiles((prev) => ({
        ...prev,
        [name]: { progress: 0 },
      }));

      const fileBlob = await fetch(uri).then((res) => res.blob());

      const xhr = new XMLHttpRequest();
      xhr.open("POST", AWS_BACKEND_URL);

      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log("Upload successful:", xhr.responseText);
          setConfirmedFiles((prev) => [...prev, name]);
          scrollToEnd();
        } else {
          console.error("Upload failed:", xhr.responseText);
        }
        setUploadingFiles((prev) => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      };

      xhr.onerror = (e) => {
        console.error("Upload error:", e);
        setUploadingFiles((prev) => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      };

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadingFiles((prev) => ({
            ...prev,
            [name]: { progress },
          }));
        }
      };

      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "application/pdf",
        name,
      });
      formData.append("userId", userId); // ✅ Append userId to formData

      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const confirmUpload = () => {
    if (confirmedFiles.length > 0) {
      setIsSuccess(true);
    }
  };

  const removeFile = (index) => {
    setConfirmedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToEnd = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const resetUpload = () => {
    setIsSuccess(false);
    setUploadingFiles({});
  };

  const renderSuccessPage = () => (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle-outline" size={80} color="#00AEEF" />
      <Text style={styles.successTitle}>Upload Successful!</Text>
      <Text style={styles.successMessage}>Your files have been uploaded successfully!</Text>
      <TouchableOpacity style={styles.successButton} onPress={resetUpload}>
        <Text style={styles.successButtonText}>Upload More</Text>
      </TouchableOpacity>
    </View>
  );

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

      {isSuccess ? (
        renderSuccessPage()
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
            <Ionicons name="cloud-upload-outline" size={30} color="#00AEEF" />
            <Text style={styles.uploadText}>Drag & Drop</Text>
            <Text style={styles.subText}>You Can Drag And Drop or Click Here To Browse</Text>
          </TouchableOpacity>

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

          {confirmedFiles.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recently Uploaded</Text>
              <FlatList
                data={confirmedFiles}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.fileItem}>
                    <Ionicons name="document-text-outline" size={20} color="#00AEEF" />
                    <Text style={styles.fileName}>{item}</Text>
                    <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeIconContainer}>
                      <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}
        </ScrollView>
      )}

      {!isSuccess && (
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.confirmButton, confirmedFiles.length === 0 && styles.disabledButton]}
            onPress={confirmUpload}
            disabled={confirmedFiles.length === 0}
          >
            <Text style={styles.confirmButtonText}>Confirm Upload</Text>
          </TouchableOpacity>
          <BottomNavigationCN navigation={navigation} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 15, marginTop: 30 },
  headerText: { fontSize: 20, fontWeight: "bold", marginLeft: 15 },
  overlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", flexDirection: "row", zIndex: 1 },
  overlayBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  scrollContainer: { flex: 1, paddingHorizontal: 10 },
  uploadBox: { borderWidth: 2, borderStyle: "dashed", borderColor: "#00AEEF", borderRadius: 10, alignItems: "center", justifyContent: "center", padding: 30, marginVertical: 10 },
  uploadText: { fontSize: 18, fontWeight: "bold", color: "#00AEEF", marginTop: 10 },
  subText: { fontSize: 12, color: "gray", textAlign: "center" },
  uploadSuccessBox: { borderWidth: 2, borderColor: "#00AEEF", borderRadius: 10, alignItems: "center", justifyContent: "center", padding: 20, marginVertical: 10 },
  uploadSuccessText: { fontSize: 18, fontWeight: "bold", color: "#00AEEF", marginTop: 10 },
  progressBarContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, width: "100%" },
  progressBar: { height: 8, backgroundColor: "#00AEEF", borderRadius: 5 },
  progressText: { marginLeft: 20, fontSize: 12, color: "#00AEEF" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  fileItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  fileName: { flex: 1, marginLeft: 10 },
  removeIconContainer: { width: 30, height: 30, backgroundColor: "red", borderRadius: 15, alignItems: "center", justifyContent: "center" },
  bottomSection: { position: "absolute", bottom: 0, left: 0, right: 0 },
  confirmButton: { backgroundColor: "#00AEEF", padding: 15, alignItems: "center", borderRadius: 5, margin: 10 },
  confirmButtonText: { color: "#fff", fontWeight: "bold" },
  disabledButton: { backgroundColor: "#cccccc" },
  successContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  successTitle: { fontSize: 24, fontWeight: "bold", marginVertical: 10 },
  successMessage: { fontSize: 16, color: "gray", marginBottom: 20, textAlign: "center" },
  successButton: { backgroundColor: "#00AEEF", padding: 10, borderRadius: 5 },
  successButtonText: { color: "white", fontWeight: "bold" },
});

export default DocumentUpload;
