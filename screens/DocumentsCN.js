import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

// Replace this with your real API URL
const API_URL = "https://pbhcgeu119.execute-api.<region>.amazonaws.com/UploadDocumentHandler";

const MedicationMgtCN = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentsData, setDocumentsData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedBy, setSortedBy] = useState('Client');
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      const documents = JSON.parse(data.body);
      console.log("Fetched Documents:", documents);

      // Mapping to expected format (your frontend expects `name`, `fileName`, `uploadDate`)
      const formattedDocs = documents.map((doc) => ({
        id: doc.id.toString(),
        name: doc.user_id || "Unknown User",
        fileName: doc.document_url.split("/").pop(), // Extract filename from URL
        uploadDate: doc.created_at.split("T")[0], // Only date part
        downloadUrl: doc.document_url, // full URL for download
      }));

      setDocumentsData(formattedDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Alert.alert("Error", "Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documentsData.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortDocuments = (data) => {
    switch (sortedBy) {
      case 'Client':
        return [...data].sort((a, b) => a.name.localeCompare(b.name));
      case 'File Name':
        return [...data].sort((a, b) => a.fileName.localeCompare(b.fileName));
      case 'Upload Date':
        return [...data].sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
      default:
        return data;
    }
  };

  const sortedDocuments = sortDocuments(filteredDocuments);

  const handleDownloadConfirmation = (fileName, downloadUrl) => {
    Alert.alert(
      "Download Confirmation",
      `Do you want to download ${fileName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            console.log(`Downloading from ${downloadUrl}`);
            // TODO: Implement file download logic using RNFS or expo-file-system
          },
        },
      ],
      { cancelable: true }
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

      {/* Search and Sort */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search client name"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort By:</Text>
          <Picker
            selectedValue={sortedBy}
            onValueChange={(value) => setSortedBy(value)}
            style={styles.picker}
          >
            <Picker.Item label="Client" value="Client" />
            <Picker.Item label="File Name" value="File Name" />
            <Picker.Item label="Upload Date" value="Upload Date" />
          </Picker>
        </View>
      </View>

      {/* Documents Table */}
      {loading ? (
        <ActivityIndicator size="large" color="#00AEEF" style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { flex: 2 }]}>Client</Text>
            <Text style={[styles.columnHeader, { flex: 3 }]}>File Name</Text>
            <Text style={[styles.columnHeader, { flex: 2 }]}>Upload Date</Text>
          </View>
          {sortedDocuments.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={styles.tableRow}
              onPress={() => handleDownloadConfirmation(doc.fileName, doc.downloadUrl)}
            >
              <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{doc.name}</Text>
              <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>{doc.fileName}</Text>
              <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{doc.uploadDate}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigationCN navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    marginTop: 30,
  },
  headerText: { fontSize: 20, fontWeight: "bold", marginLeft: 15 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e9ecef",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    marginRight: 10,
  },
  sortContainer: { flexDirection: "row", alignItems: "center" },
  sortLabel: { fontSize: 14, fontWeight: "bold", marginRight: 5 },
  picker: {
    height: 50,
    width: 150,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00AEEF",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  columnHeader: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  tableContainer: { flex: 1, marginTop: 5 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  cell: { textAlign: "center", fontSize: 14 },
  overlay: {
    position: "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    flexDirection: "row", zIndex: 1,
  },
  overlayBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
});

export default MedicationMgtCN;
