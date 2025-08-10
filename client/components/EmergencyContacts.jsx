import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const colors = {
  background: "#F9F6F1",
  primaryYellow: "#f3f2f0ff",
  accentOrange: "#f6f5f4ff",
  gentleGreen: "#6FCF97",
  textPrimary: "#333333",
  textSecondary: "#555555",
  cardBackground: "#5c15a8ff",
};

const emergencyContacts = [
  { label: "Police", number: "100", icon: "shield-checkmark-outline" },
  { label: "Cybercrime Helpline", number: "1930", icon: "alert-circle-outline" },
  { label: "Bank Helpline", number: "1800123456", icon: "call-outline" },
];

export default function EmergencyContacts() {
  const callNumber = async (number) => {
    try {
      const url = `tel:${number}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Calling is not supported on this device");
      }
    } catch {
      Alert.alert("Error", "Failed to initiate call");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>
      <View style={styles.contactRow}>
        {emergencyContacts.map(({ label, number, icon }) => (
          <TouchableOpacity
            key={label}
            style={styles.contactButton}
            onPress={() => callNumber(number)}
            activeOpacity={0.8}
          >
            <Ionicons name={icon} size={32} color={colors.primaryYellow} />
            <Text style={styles.contactLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    paddingVertical: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
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
    marginBottom: 12,
    textAlign: "center",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  contactButton: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  contactLabel: {
    color: colors.accentOrange,
    fontWeight: "700",
    marginTop: 6,
    fontSize: 14,
  },
});
