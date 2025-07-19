import React from "react";
import { Platform } from "react-native";

// Import web-specific styles only on web platform
if (Platform.OS === "web") {
  // This will be handled by the CSS file
  // The styles are applied via CSS classes and data-testid attributes
}

const WebStyles = ({ children }) => {
  return children;
};

export default WebStyles;
