import React, { useRef, useEffect } from "react";
import { Platform, TextInput } from "react-native";

const WebInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  spellCheck,
  ...props
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    // Ensure input is properly initialized on web
    if (Platform.OS === "web" && inputRef.current) {
      // Force focus handling
      const input = inputRef.current;
      input.addEventListener("focus", () => {
        if (onFocus) onFocus();
      });
      input.addEventListener("blur", () => {
        if (onBlur) onBlur();
      });
    }
  }, [onFocus, onBlur]);

  if (Platform.OS === "web") {
    return (
      <input
        ref={inputRef}
        type={secureTextEntry ? "password" : "text"}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => {
          if (onChangeText) {
            onChangeText(e.target.value);
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        style={{
          outline: "none",
          border: "none",
          background: "transparent",
          fontFamily: "inherit",
          fontSize: "16px",
          color: "inherit",
          width: "100%",
          height: "100%",
          padding: "0",
          margin: "0",
          boxSizing: "border-box",
          display: "block",
          position: "relative",
          zIndex: 1,
          ...style,
        }}
        {...props}
      />
    );
  }

  return (
    <TextInput
      ref={inputRef}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      onFocus={onFocus}
      onBlur={onBlur}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      style={style}
      {...props}
    />
  );
};

export default WebInput;
