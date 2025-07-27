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
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import SideNavigationClient from "../Components/SideNavigationClient";
import BottomNavigationClient from "../Components/BottomNavigationClient";

const DocumentUpload = () => {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [confirmedFiles, setConfirmedFiles] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const scheme = useColorScheme();
  const scrollViewRef = useRef(null);

  const AWS_BACKEND_URL =
    "https://pbhcgeu119.execute-api.ap-south-1.amazonaws.com/dev/UploadDocumentHandler";
  const DELETE_DOCUMENT_URL =
    "https://pbhcgeu119.execute-api.ap-south-1.amazonaws.com/dev/deleteDocument";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
      });
      if (!result.canceled) {
        const file = result.assets[0];
        setPendingFiles((prev) => [...prev, file]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const uploadDocument = (uri, name) => {
    return new Promise(async (resolve, reject) => {
      try {
        const clientUsername = await AsyncStorage.getItem("appUser"); // or fetch dynamically if you have auth
        setUploadingFiles((prev) => ({
          ...prev,
          [name]: { progress: 0 },
        }));

        const xhr = new XMLHttpRequest();
        xhr.open("POST", AWS_BACKEND_URL);
        xhr.setRequestHeader("userid", clientUsername);
        xhr.setRequestHeader("filename", name);
        xhr.setRequestHeader("Accept", "application/json");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadingFiles((prev) => ({
              ...prev,
              [name]: { progress },
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              const documentData = {
                name,
                fileUrl: responseData.fileUrl,
                s3Key: responseData.fileUrl
                  ? "uploads/" + responseData.fileUrl.split("uploads/")[1]
                  : null,
                documentId: responseData.documentId,
              };
              setConfirmedFiles((prev) => [...prev, documentData]);
              scrollToEnd();
              resolve();
            } catch (err) {
              console.error("Failed to parse response:", err);
              reject(err);
            }
          } else {
            console.error("Upload failed:", xhr.responseText);
            reject(new Error("Upload failed"));
          }

          setUploadingFiles((prev) => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        };

        xhr.onerror = (e) => {
          console.error("Upload error:", e);
          reject(e);
          setUploadingFiles((prev) => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
          });
        };

        const fileType = name.endsWith(".pdf")
          ? "application/pdf"
          : name.endsWith(".jpg") || name.endsWith(".jpeg")
          ? "image/jpeg"
          : name.endsWith(".png")
          ? "image/png"
          : "application/octet-stream";

        const formData = new FormData();
        formData.append("file", {
          uri,
          type: fileType,
          name,
        });

        xhr.send(formData);
      } catch (error) {
        console.error("Error uploading file:", error);
        reject(error);
      }
    });
  };

  const confirmUpload = async () => {
    if (pendingFiles.length === 0) return;

    try {
      for (const file of pendingFiles) {
        await uploadDocument(file.uri, file.name);
      }
      setPendingFiles([]);
      setIsSuccess(true);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Failed", "Some files could not be uploaded.");
    }
  };

  const resetUpload = () => {
    setIsSuccess(false);
    setPendingFiles([]);
  };

  const removeFile = async (index, fileObj) => {
    try {
      let s3Key = fileObj.s3Key;
      if (!s3Key && fileObj.fileUrl) {
        const url = decodeURIComponent(fileObj.fileUrl);
        const urlParts = url.split("uploads/");
        if (urlParts.length > 1) {
          s3Key = "uploads/" + urlParts[1].replace(/\+/g, " ");
        }
      }

      const documentId = fileObj.documentId;

      if (
        !s3Key ||
        documentId === undefined ||
        documentId === null ||
        documentId === 0
      ) {
        Alert.alert(
          "Delete Not Allowed",
          "This file cannot be deleted because it does not have a valid document ID."
        );
        return;
      }

      const payload = {
        s3Key,
        documentId: Number(documentId),
      };

      const response = await fetch(DELETE_DOCUMENT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to delete document.");
        return;
      }

      Alert.alert("Success", "Document deleted successfully.");
      setConfirmedFiles((prev) => prev.filter((_, idx) => idx !== index));
    } catch (error) {
      Alert.alert("Error", "An error occurred while deleting.");
    }
  };

  const scrollToEnd = () => {
    setTimeout(
      () => scrollViewRef.current?.scrollToEnd({ animated: true }),
      50
    );
  };

  const isUploading = () => {
    return Object.keys(uploadingFiles).length > 0;
  };

  const renderSuccessPage = () => (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle-outline" size={80} color="#00AEEF" />
      <Text style={styles.successTitle}>Upload Successful!</Text>
      <Text style={styles.successMessage}>
        Your files have been uploaded successfully!
      </Text>
      <TouchableOpacity style={styles.successButton} onPress={resetUpload}>
        <Text style={styles.successButtonText}>Upload More</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        translucent
        backgroundColor={scheme === "dark" ? "black" : "transparent"}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Document Upload</Text>
      </View>

      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationClient navigation={navigation} onClose={toggleMenu} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={toggleMenu}
          />
        </View>
      )}

      {isSuccess ? (
        renderSuccessPage()
      ) : (
        <View style={styles.scrollContainer}>
          <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
            <Ionicons name="cloud-upload-outline" size={30} color="#00AEEF" />
            <Text style={styles.uploadText}>Upload Files</Text>
            <Text style={styles.subText}>
              Tap to upload PDFs or images (JPG, PNG)
            </Text>
          </TouchableOpacity>

          {pendingFiles.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Pending Files</Text>
              {pendingFiles.map((item, index) => (
                <View key={index} style={styles.fileItem}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#00AEEF"
                  />
                  <Text style={styles.fileName}>{item.name}</Text>
                </View>
              ))}
            </>
          )}

          {Object.entries(uploadingFiles).map(([name, { progress }]) => (
            <View key={name} style={styles.uploadSuccessBox}>
              <Text style={styles.uploadSuccessText}>
                <Ionicons
                  name="document-text-outline"
                  size={25}
                  color="#00AEEF"
                />{" "}
                {name}
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
                <Text style={styles.progressText}>{`${progress}%`}</Text>
              </View>
            </View>
          ))}

          {confirmedFiles.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recently Uploaded</Text>
              {confirmedFiles.map((item, index) => (
                <View key={index} style={styles.fileItem}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#00AEEF"
                  />
                  <Text style={styles.fileName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFile(index, item)}
                  >
                    <Ionicons name="trash-outline" size={25} color="#FF0000" />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              pendingFiles.length === 0 && styles.confirmButtonDisabled,
              isUploading() && styles.confirmButtonLoading,
            ]}
            onPress={confirmUpload}
            disabled={pendingFiles.length === 0 || isUploading()}
          >
            {isUploading() ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.confirmButtonText}>Uploading...</Text>
              </>
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Upload</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <BottomNavigationClient />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 30,
  },
  headerText: { fontSize: 20, fontWeight: "bold", marginLeft: 15 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flexDirection: "row",
    zIndex: 1,
  },
  overlayBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  scrollContainer: { flex: 1, paddingHorizontal: 10 },
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
  subText: { fontSize: 12, color: "gray", textAlign: "center" },
  uploadSuccessBox: {
    borderWidth: 2,
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
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  progressBar: { height: 8, backgroundColor: "#00AEEF", borderRadius: 5 },
  progressText: { marginLeft: 20, fontSize: 12, color: "#00AEEF" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  fileItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  fileName: { flex: 1, marginLeft: 10 },
  removeButton: { paddingHorizontal: 8 },
  confirmButton: {
    backgroundColor: "#00AEEF",
    padding: 15,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
  },
  confirmButtonLoading: {
    backgroundColor: "#FFA500",
  },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successTitle: { fontSize: 24, fontWeight: "bold", marginVertical: 10 },
  successMessage: { fontSize: 16, textAlign: "center", marginBottom: 30 },
  successButton: {
    backgroundColor: "#00AEEF",
    padding: 10,
    borderRadius: 5,
  },
  successButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default DocumentUpload;
