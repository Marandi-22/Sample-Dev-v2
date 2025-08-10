import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

const colors = {
  background: "#F9F6F1",
  primaryYellow: "#2d6586ff",
  accentOrange: "#F2994A",
  gentleGreen: "#e7dbe5ff",
  textPrimary: "#333333",
  textSecondary: "#555555",
  cardBackground: "#FFFFFF",
};

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    if (input.trim()) {
      onSearch(input.trim());
      setInput("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search fraud type..."
        placeholderTextColor={colors.textSecondary}
        value={input}
        onChangeText={setInput}
        style={styles.input}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity onPress={handleSearch} style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 18,
  },
  button: {
    backgroundColor: colors.primaryYellow,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: "900",
    fontSize: 18,
  },
});
