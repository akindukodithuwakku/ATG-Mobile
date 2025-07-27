import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TimelineItem = ({
  title,
  description,
  start,
  end,
  status,
  isLast,
  onEdit,
  id,
  onDelete,
}) => {
  // Parse date/time as local (remove the + 'Z')
  const startObj = start ? new Date(start.replace(" ", "T")) : null;
  const endObj = end ? new Date(end.replace(" ", "T")) : null;

  // Format date label (e.g., "12 Tue")
  const dayLabel =
    startObj && !isNaN(startObj)
      ? `${startObj.getDate()} ${startObj.toLocaleDateString("en-US", {
          weekday: "short",
        })}`
      : "No date";

  // Show time as stored in DB (local)
  const startTimeLabel =
    startObj && !isNaN(startObj)
      ? startObj.getHours().toString().padStart(2, "0") +
        ":" +
        startObj.getMinutes().toString().padStart(2, "0")
      : "";
  const endTimeLabel =
    endObj && !isNaN(endObj)
      ? endObj.getHours().toString().padStart(2, "0") +
        ":" +
        endObj.getMinutes().toString().padStart(2, "0")
      : "";

  // Status color and icon
  let statusColor = "#BDBDBD";
  let statusIcon = <Ionicons name="time" size={18} color={statusColor} />;
  if (status === "completed") {
    statusColor = "#4CAF50";
    statusIcon = (
      <Ionicons name="checkmark-circle" size={18} color={statusColor} />
    );
  } else if (status === "overdue") {
    statusColor = "#F44336";
    statusIcon = <Ionicons name="close-circle" size={18} color={statusColor} />;
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              console.log(`Attempting to delete task with ID: ${id}`);
              const response = await fetch(
                `https://sue7dsbf09.execute-api.ap-south-1.amazonaws.com/dev/tasks?id=${id}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              console.log(`Delete response status: ${response.status}`);

              if (!response.ok) {
                const errorText = await response.text();
                console.log(`Delete error response: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();
              console.log(`Task deleted successfully: ${result.message}`);

              // ======== Place notification code here ========
              // e.g. await sendNotificationToClient(id);
              // ==============================================

              if (onDelete) onDelete(id);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", `Failed to delete task: ${error.message}`);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.row}>
      {/* Timeline section */}
      <View style={styles.leftColumn}>
        <View style={styles.dotContainer}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.dateLabel, { color: statusColor }]}>
            {dayLabel}
          </Text>
        </View>
        {!isLast && (
          <View style={[styles.line, { backgroundColor: statusColor }]} />
        )}
      </View>

      {/* Task info section */}
      <View style={styles.rightColumn}>
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.title}>{title}</Text>
            {/* Removed statusIcon from here */}
          </View>
          <Text style={styles.time}>
            {startTimeLabel && endTimeLabel
              ? `${startTimeLabel} - ${endTimeLabel}`
              : startTimeLabel || ""}
          </Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Text style={[styles.status, { color: statusColor }]}>
              Status: {status}
            </Text>
            <View style={{ marginLeft: 6 }}>{statusIcon}</View>
          </View>
        </View>
      </View>

      {/* Edit and Delete buttons */}
      <View style={{ flexDirection: "row", marginLeft: 10 }}>
        <TouchableOpacity onPress={onEdit} style={{ marginRight: 10 }}>
          <Ionicons name="create-outline" size={24} color="#00BCD4" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  leftColumn: {
    width: 60,
    alignItems: "center",
  },
  dotContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "bold",
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  rightColumn: {
    flex: 1,
  },
  card: {
    backgroundColor: "#F2FDFF",
    padding: 12,
    borderRadius: 8,
    borderColor: "#B2EBF2",
    borderWidth: 1,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  time: { fontSize: 13, color: "#666", marginTop: 2 },
  description: { marginTop: 4, color: "#333" },
  status: { marginTop: 4, fontStyle: "italic" },
  editButton: {
    marginLeft: 10,
  },
});

export default TimelineItem;
