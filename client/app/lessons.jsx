import React, { useState, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import FraudCategoryList from "../components/FraudCategoryList";
import SearchBar from "../components/SearchBar";
import ActionSteps from "../components/ActionSteps";
import EmergencyContacts from "../components/EmergencyContacts";
import FraudHistory from "../components/FraudHistory";
import TipsSection from "../components/TipsSection";

const colors = {
  background: "#000000ff",
  primaryYellow: "#ffffffff",
  accentOrange: "#F2994A",
  gentleGreen: "#6FCF97",
  textPrimary: "#333333",
  textSecondary: "#858585ff",
  cardBackground: "#000000ff",
};

// Dummy actions data — replace with real data & actions (phone calls, links, etc)
const fraudActionsData = {
  "Phishing Scam": {
    immediate: [
      {
        label: "Call Bank Helpline",
        description: "Immediately call your bank's helpline to block your account.",
        action: () => Linking.openURL("tel:1800123456"),
      },
      {
        label: "Change Passwords",
        description: "Change passwords of your bank and email accounts immediately.",
        action: () => alert("Navigate to password reset (simulate)."),
      },
    ],
    shortTerm: [
      {
        label: "Report to Cyber Cell",
        description: "File a complaint at your local cybercrime cell website.",
        action: () => Linking.openURL("https://cybercrime.gov.in/"),
      },
    ],
    longTerm: [
      {
        label: "Monitor Accounts",
        description: "Keep monitoring your accounts for unusual transactions.",
        action: () => alert("Monitoring instructions..."),
      },
    ],
  },
  "UPI Fraud": {
    immediate: [
      {
        label: "Block UPI Payment",
        description: "Block your UPI payment app temporarily to avoid loss.",
        action: () => alert("Open UPI app (simulate)"),
      },
      {
        label: "Call Bank Helpline",
        description: "Call your bank helpline immediately to report fraud.",
        action: () => Linking.openURL("tel:1800123456"),
      },
    ],
    shortTerm: [
      {
        label: "Report to NPCI",
        description: "Report UPI fraud to NPCI via their portal.",
        action: () => Linking.openURL("https://www.npci.org.in/"),
      },
    ],
    longTerm: [
      {
        label: "File Police Complaint",
        description: "File an FIR at your local police station.",
        action: () => alert("Instructions to file FIR."),
      },
    ],
  },
  // Add more fraud types with similar structure here...
};

export default function Lessons() {
  const [selectedFraud, setSelectedFraud] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("fraudHistory").then((stored) => {
      if (stored) setHistory(JSON.parse(stored));
    });
  }, []);

  // Save selected fraud to history
  useEffect(() => {
    if (!selectedFraud) return;
    setHistory((prev) => {
      const newHistory = [selectedFraud, ...prev.filter((h) => h !== selectedFraud)].slice(0, 10);
      AsyncStorage.setItem("fraudHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  }, [selectedFraud]);

  const handleSelectFraud = (fraudName) => {
    setSelectedFraud(fraudName);
  };

  const handleSearch = (searchText) => {
    // Basic case-insensitive match against keys
    const fraudNames = Object.keys(fraudActionsData);
    const found = fraudNames.find(
      (name) => name.toLowerCase() === searchText.toLowerCase()
    );
    if (found) setSelectedFraud(found);
    else alert("No data found for this fraud type.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
      >
        <SearchBar onSearch={handleSearch} />
        <FraudCategoryList onSelect={handleSelectFraud} />
        <FraudHistory history={history} onSelect={handleSelectFraud} />
        {selectedFraud ? (
          <View style={styles.actionContainer}>
            <Text style={styles.fraudTitle}>{selectedFraud}</Text>
            <ActionSteps steps={fraudActionsData[selectedFraud]} />
          </View>
        ) : (
          <Text style={styles.instructions}>
            Select a fraud category or search above to see recommended actions.
          </Text>
        )}
        <EmergencyContacts />
        <TipsSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionContainer: {
    marginVertical: 16,
  },
  fraudTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.primaryYellow,
    marginBottom: 12,
    textAlign: "center",
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: 30,
  },
});
