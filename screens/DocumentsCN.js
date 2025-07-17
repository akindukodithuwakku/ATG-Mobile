import React, { useState, useEffect, useMemo } from "react";
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
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";

const API_URL = "https://pbhcgeu119.execute-api.ap-south-1.amazonaws.com/dev/UploadDocumentHandler";
const SIGNED_URL_API = "https://pbhcgeu119.execute-api.ap-south-1.amazonaws.com/dev/DocumentDownloadHandler";

const DocumentsCN = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentsData, setDocumentsData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortedBy, setSortedBy] = useState("Client");
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme();

  // Replace this with the actual logged-in care navigator ID
  const careNavigatorId ='cn_alecbenjamin';

  useEffect(() => {
    fetchDocuments();
  }, [search]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}?careNavigatorId=${encodeURIComponent(careNavigatorId)}&search=${encodeURIComponent(search)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents");

      const json = await res.json();
      const docs = Array.isArray(json) ? json : json.body;
      const list = typeof docs === "string" ? JSON.parse(docs) : docs;

      const formatted = list.map((doc) => {
        const s3Key = decodeURIComponent(
          doc.document_url.split("amazonaws.com/")[1].split("?")[0]
        );
        return {
          id: String(doc.doc_id || doc.id),
          name: doc.full_name || doc.user_name || doc.user_id || "Unknown",
          fileName: s3Key.split("/").pop(),
          uploadDate: doc.created_at?.split("T")[0] || "N/A",
          s3Key,
        };
      });

      setDocumentsData(formatted);
    } catch (err) {
      console.error("Fetch Error:", err);
      Alert.alert("Error", "Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  const downloadAndSaveFile = async (fileName, s3Key) => {
    try {
      const encodedKey = encodeURIComponent(s3Key);
      const response = await fetch(`${SIGNED_URL_API}?s3Key=${encodedKey}`);
      const { downloadUrl } = await response.json();

      if (!downloadUrl) throw new Error("Invalid download URL");

      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri);

      Alert.alert("Download Complete", `File saved to: ${uri}`, [
        {
          text: "Open",
          onPress: async () => {
            try {
              await Sharing.shareAsync(uri);
            } catch (err) {
              console.error("Sharing error:", err);
              Alert.alert("Error", "Unable to open the file.");
            }
          },
        },
        {
          text: "OK",
          onPress: () => {},
        },
      ]);
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Error", "Could not download the file.");
    }
  };

  const confirmDownload = (fileName, s3Key) => {
    Alert.alert("Download", `Download ${fileName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => downloadAndSaveFile(fileName, s3Key) },
    ]);
  };

  const filtered = useMemo(
    () =>
      documentsData.filter((doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase())
      ),
    [documentsData, search]
  );

  const sorted = useMemo(() => {
    switch (sortedBy) {
      case "Client":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "File Name":
        return [...filtered].sort((a, b) => a.fileName.localeCompare(b.fileName));
      case "Upload Date":
        return [...filtered].sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
      default:
        return filtered;
    }
  }, [filtered, sortedBy]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => confirmDownload(item.fileName, item.s3Key)}
    >
      <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
      <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>
        {item.fileName}
      </Text>
      <Text style={[styles.cell, { flex: 2 }]}>{item.uploadDate}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
          <Ionicons name={isMenuOpen ? "close" : "menu"} size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Documents</Text>
      </View>

      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={() => setIsMenuOpen(false)} />
          <TouchableOpacity
            style={styles.overlayBackground}
            onPress={() => setIsMenuOpen(false)}
          />
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search client"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort By:</Text>
          <Picker
            selectedValue={sortedBy}
            onValueChange={setSortedBy}
            style={styles.picker}
          >
            <Picker.Item label="Client" value="Client" />
            <Picker.Item label="File Name" value="File Name" />
            <Picker.Item label="Upload Date" value="Upload Date" />
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00AEEF" />
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { flex: 2 }]}>Client</Text>
            <Text style={[styles.columnHeader, { flex: 3 }]}>File Name</Text>
            <Text style={[styles.columnHeader, { flex: 2 }]}>Upload Date</Text>
          </View>
          <FlatList data={sorted} keyExtractor={(item) => item.id} renderItem={renderItem} />
        </View>
      )}

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
    marginTop: 30,
    backgroundColor: "#f8f9fa",
  },
  headerText: { fontSize: 20, marginLeft: 15, fontWeight: "bold" },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    zIndex: 2,
  },
  overlayBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#e9ecef",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  sortContainer: { flexDirection: "row", alignItems: "center" },
  sortLabel: { fontWeight: "bold", marginRight: 5 },
  picker: {
    height: 50,
    width: 150,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
  },
  tableContainer: { flex: 1, marginTop: 5 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#00AEEF",
    padding: 10,
  },
  columnHeader: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  cell: { textAlign: "center" },
});

export default DocumentsCN;
