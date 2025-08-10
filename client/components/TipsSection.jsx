import React from "react";
import { View, Text, StyleSheet } from "react-native";

const colors = {
  background: "#F9F6F1",
  primaryYellow: "#f6f5f2ff",
  accentOrange: "#F2994A",
  gentleGreen: "#6FCF97",
  textPrimary: "#333333",
  textSecondary: "#080606ff",
  cardBackground: "#4eaac1ea",
};

const tips = [
  "Never share your OTP with anyone.",
  "Verify links before clicking — avoid suspicious URLs.",
  "Use strong, unique passwords for online accounts.",
  "Regularly monitor your bank and transaction statements.",
  "Be cautious of unsolicited calls asking for personal info.",
];

export default function TipsSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fraud Awareness Tips</Text>
      {tips.map((tip, i) => (
        <View key={i} style={styles.tipItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.tipText}>{tip}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontWeight: "900",
    fontSize: 22,
    color: colors.primaryYellow,
    marginBottom: 16,
    textAlign: "center",
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  bullet: {
    color: colors.primaryYellow,
    fontSize: 18,
    marginRight: 8,
    fontWeight: "900",
  },
  tipText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
});
