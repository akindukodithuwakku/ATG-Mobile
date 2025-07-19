import React, { useState } from "react";
import { View, Text, Platform } from "react-native";

const TestInput = () => {
  const [testValue, setTestValue] = useState("");

  if (Platform.OS === "web") {
    return (
      <View style={{ padding: 20, backgroundColor: "#f0f0f0", margin: 10 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Test Input (Web):
        </Text>
        <input
          type="text"
          value={testValue}
          onChange={(e) => setTestValue(e.target.value)}
          placeholder="Type here to test..."
          style={{
            width: "100%",
            height: 40,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 5,
            fontSize: 16,
          }}
        />
        <Text style={{ marginTop: 10 }}>Value: {testValue}</Text>
      </View>
    );
  }

  return null;
};

export default TestInput;
