import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const colors = {
  background: "#F9F6F1",
  primaryYellow: "#e8e5ddff",
  accentOrange: "#c3c3d6ff",
  gentleGreen: "#6FCF97",
  textPrimary: "#333333",
  textSecondary: "#555555",
  cardBackground: "#59179bff",
};

const fraudCategories = [
  { key: "Phishing Scam", icon: "alert-circle-outline" },
  { key: "UPI Fraud", icon: "card-outline" },
  { key: "Credit Card Fraud", icon: "wallet-outline" },
  { key: "Loan Fraud", icon: "cash-outline" },
  { key: "OTP Scam", icon: "lock-closed-outline" },
  { key: "Investment Fraud", icon: "trending-up-outline" },
];

export default function FraudCategoryList({ onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fraud Categories</Text>
      <FlatList
        data={fraudCategories}
        numColumns={2}
        keyExtractor={(item) => item.key}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelect(item.key)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={48} color={colors.primaryYellow} />
            <Text style={styles.label}>{item.key}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    color: colors.primaryYellow,
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    margin: 8,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: colors.accentOrange,
    textAlign: "center",
  },
});
