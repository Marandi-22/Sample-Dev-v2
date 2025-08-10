import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

const colors = {
  background: "#020415ff",
  primaryYellow: "#e6e4e1ff",
  accentOrange: "#ded8d2ff",
  gentleGreen: "#0f763aff",
  textPrimary: "#0e7f3bff",
  textSecondary: "#19115aff",
  cardBackground: "#0fab98ff",
};

export default function FraudHistory({ history, onSelect }) {
  if (!history || history.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Previously Viewed Frauds</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.historyItem}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.historyText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  title: {
    color: colors.primaryYellow,
    fontWeight: "900",
    fontSize: 20,
    marginBottom: 12,
  },
  historyItem: {
    backgroundColor: "#4eaac1ea",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  historyText: {
    color: colors.accentOrange,
    fontWeight: "700",
    fontSize: 16,
  },
});
