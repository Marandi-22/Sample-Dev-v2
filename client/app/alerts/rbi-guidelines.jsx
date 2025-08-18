// RbiGuidelines.jsx
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  Easing,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, IconButton, Divider } from "react-native-paper";

const POINTS = [
  {
    id: "1",
    title: "KYC Compliance",
    short: "Banks must verify identity.",
    details:
      "Always complete KYC (PAN, Aadhaar, documents) when requested by your bank. It ensures account safety & legal compliance.",
    tag: "KYC",
    icon: "account-badge",
  },
  {
    id: "2",
    title: "No OTP/Password Sharing",
    short: "RBI warns never to share credentials.",
    details:
      "RBI strictly states that banks never ask for OTPs, passwords, CVVs, or PINs over calls, SMS, or email.",
    tag: "Safety",
    icon: "lock-alert",
  },
  {
    id: "3",
    title: "Free Credit Report",
    short: "One free report every year.",
    details:
      "As per RBI, you can access one free credit report annually from each credit bureau (CIBIL, Equifax, Experian, CRIF).",
    tag: "Credit",
    icon: "file-document",
  },
  {
    id: "4",
    title: "Report Unauthorized Transactions",
    short: "Zero liability if reported quickly.",
    details:
      "If you report unauthorized digital transactions within 3 working days, RBI guidelines protect you from losses.",
    tag: "Fraud",
    icon: "alert-circle-check",
  },
  {
    id: "5",
    title: "Loan Transparency",
    short: "Banks must disclose all charges.",
    details:
      "RBI requires banks/NBFCs to clearly show loan interest rates, fees, foreclosure charges, and repayment schedules.",
    tag: "Loans",
    icon: "scale-balance",
  },
  {
    id: "6",
    title: "No Forced Insurance",
    short: "Optional, not compulsory.",
    details:
      "Banks cannot force you to buy insurance or investment products as a condition for loans or account opening.",
    tag: "Consumer Rights",
    icon: "shield-check",
  },
  {
    id: "7",
    title: "ATM & Card Safety",
    short: "Secure use of debit/credit cards.",
    details:
      "RBI mandates EMV chip cards, PIN authentication, and lets you set ATM, POS, and online usage limits.",
    tag: "Cards",
    icon: "credit-card-check",
  },
  {
    id: "8",
    title: "Fair Practices Code",
    short: "Transparency in lending.",
    details:
      "Lenders must follow RBI’s Fair Practices Code – no hidden charges, harassment-free recovery, and clear communication.",
    tag: "Fairness",
    icon: "handshake",
  },
  {
    id: "9",
    title: "Grievance Redressal",
    short: "Every bank must have a system.",
    details:
      "Banks must display grievance contacts. If unresolved within 30 days, escalate to RBI’s Banking Ombudsman.",
    tag: "Support",
    icon: "account-voice",
  },
  {
    id: "10",
    title: "Digital Lending Rules",
    short: "Protecting borrowers online.",
    details:
      "RBI requires loan apps to disclose lenders, interest rates, and repayment terms. User consent is mandatory.",
    tag: "Digital",
    icon: "cellphone-information",
  },
  {
    id: "11",
    title: "Dormant Accounts",
    short: "Accounts inactive for 2+ years.",
    details:
      "Banks must notify customers before classifying an account as dormant. No charges without informing you.",
    tag: "Accounts",
    icon: "account-alert",
  },
  {
    id: "12",
    title: "Safe Digital Payments",
    short: "RBI promotes UPI & 2FA.",
    details:
      "All online transactions require 2FA (like OTP + PIN). RBI constantly upgrades rules to make UPI & netbanking safer.",
    tag: "UPI",
    icon: "cellphone-lock",
  },
];

export default function RbiGuidelines() {
  const animRefs = useRef(POINTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animRefs.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 420,
        delay: i * 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(70, animations).start();
  }, [animRefs]);

  const renderItem = ({ item, index }) => {
    const opacity = animRefs[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const translateY = animRefs[index].interpolate({
      inputRange: [0, 1],
      outputRange: [12, 0],
    });

    return (
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <Card style={styles.card} mode="elevated">
          <Card.Title
            title={item.title}
            subtitle={item.short}
            titleNumberOfLines={2}
            subtitleNumberOfLines={2}
            left={(props) => <IconButton {...props} icon={item.icon} />}
          />
          <Divider />
          <Card.Content style={{ paddingTop: 10 }}>
            <Text variant="bodyMedium" style={styles.details}>
              {item.details}
            </Text>
            <Text variant="labelSmall" style={styles.tag}>
              #{item.tag}
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
      />
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          RBI Guidelines
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Know your rights. Follow safe banking practices.
        </Text>
      </View>

      <FlatList
        data={POINTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0E1116" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  title: { color: "white", fontWeight: "700" },
  subtitle: { color: "#C7CBD1", marginTop: 4 },
  card: {
    backgroundColor: "#121725",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2c3c4aff",
  },
  details: { color: "white", opacity: 0.9, lineHeight: 20, marginBottom: 6 },
  tag: {
    color: "#4cafef",
    marginTop: 4,
    fontStyle: "italic",
  },
});
