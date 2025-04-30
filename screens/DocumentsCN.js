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
  FlatList,
} from "react-native";
import SideNavigationCN from "../Components/SideNavigationCN";
import BottomNavigationCN from "../Components/BottomNavigationCN";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

// ← HTTP API uses $default stage, so /UploadDocumentHandler directly
const API_URL =
  "https://pbhcgeu119.execute-api.ap-south-1.amazonaws.com/UploadDocumentHandler";

const DocumentsCN = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentsData, setDocumentsData] = useState([]);
  const [search, setSearch] = useState("");
  const [sortedBy, setSortedBy] = useState("Client");
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      const payload = await res.json();
      // payload might already be an array (HTTP API defaults to JSON array)
      const docs = Array.isArray(payload) ? payload : payload.body;
      const list = typeof docs === "string" ? JSON.parse(docs) : docs;

      const formatted = list.map((doc) => ({
        id: String(doc.id),
        name: doc.user_name || doc.user_id || "Unknown",
        fileName: doc.document_url.split("/").pop(),
        uploadDate: doc.created_at.split("T")[0],
        downloadUrl: doc.document_url,
      }));
      setDocumentsData(formatted);
    } catch (err) {
      console.error("Error fetching documents:", err);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = documentsData.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = (() => {
    switch (sortedBy) {
      case "Client":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "File Name":
        return filtered.sort((a, b) => a.fileName.localeCompare(b.fileName));
      case "Upload Date":
        return filtered.sort(
          (a, b) => new Date(a.uploadDate) - new Date(b.uploadDate)
        );
      default:
        return filtered;
    }
  })();

  const confirmDownload = (fn, url) => {
    Alert.alert(
      "Download?",
      `Download ${fn}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => console.log("Download:", url) /* implement RNFS here */ },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tableRow}
      onPress={() => confirmDownload(item.fileName, item.downloadUrl)}
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
        translucent
        backgroundColor="transparent"
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsMenuOpen((v) => !v)}>
          <Ionicons
            name={isMenuOpen ? "close" : "menu"}
            size={30}
            color="black"
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Documents</Text>
      </View>
      {isMenuOpen && (
        <View style={styles.overlay}>
          <SideNavigationCN navigation={navigation} onClose={() => setIsMenuOpen(false)} />
          <TouchableOpacity style={styles.overlayBackground} onPress={() => setIsMenuOpen(false)} />
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
          <FlatList
            data={sorted}
            keyExtractor={(i) => i.id}
            renderItem={renderItem}
          />
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
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    zIndex: 1,
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
  columnHeader: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  cell: { flex: 1, textAlign: "center" },
});

export default DocumentsCN;
