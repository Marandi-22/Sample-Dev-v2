import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

const colors = {
  background: "#603965ff",
  primaryYellow: "#e8e6e1ff",
  accentOrange: "#d5c5eaff",
  gentleGreen: "#6FCF97",
  textPrimary: "#000000ff",
  textSecondary: "#f3f3f3ff",
  cardBackground: "#59179bff",
};

export default function ActionSteps({ steps }) {
  const openLink = async (action) => {
    try {
      await action();
    } catch {
      Alert.alert("Error", "Unable to perform this action");
    }
  };

  const renderStepSection = (title, stepList) => {
    if (!stepList || stepList.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {stepList.map(({ label, description, action }, i) => (
          <View key={label + i} style={styles.card}>
            <Text style={styles.desc}>{description}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => openLink(action)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{label}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStepSection("Immediate Actions", steps.immediate)}
      {renderStepSection("Within a Few Days", steps.shortTerm)}
      {renderStepSection("Long Term Actions", steps.longTerm)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.primaryYellow,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  desc: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.accentOrange,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: colors.textPrimary,
    fontWeight: "900",
    fontSize: 16,
  },
});
