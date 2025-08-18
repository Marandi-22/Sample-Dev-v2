// DontShareOTPs.jsx
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
    title: "Never Share OTPs",
    short: "OTP = One-Time Password, just for you.",
    details:
      "Banks, UPI apps, and officials never ask for OTPs. Anyone asking for OTP is trying to steal your money.",
    tag: "Safety",
    icon: "shield-lock",
  },
  {
    id: "2",
    title: "No Sharing with Bank Staff",
    short: "Even bank employees won’t ask.",
    details:
      "Fraudsters pretend to be bank staff. Remember: real banks already have your details – they don’t need your OTP.",
    tag: "Fraud",
    icon: "bank-off",
  },
  {
    id: "3",
    title: "Beware Caller Scams",
    short: "Scammers sound professional.",
    details:
      "They may say your account is blocked and need an OTP. Hang up and call the official bank helpline instead.",
    tag: "Calls",
    icon: "phone-alert",
  },
  {
    id: "4",
    title: "Job & Loan Scams",
    short: "Don’t give OTPs for loans/jobs.",
    details:
      "Fake agents trick people into sharing OTPs for ‘verification’. Real companies don’t ask for it.",
    tag: "Job Scam",
    icon: "briefcase-off",
  },
  {
    id: "5",
    title: "Online Shopping Traps",
    short: "Fraudsters pose as sellers/buyers.",
    details:
      "They’ll send fake payment links asking for OTP. Always use official marketplaces’ payment systems.",
    tag: "E-commerce",
    icon: "cart-off",
  },
  {
    id: "6",
    title: "UPI Fraud Alerts",
    short: "‘Request Money’ OTPs = Scam.",
    details:
      "If you didn’t initiate a payment, decline OTP-based requests. OTPs are for sending money, not receiving.",
    tag: "UPI",
    icon: "cellphone-arrow-down",
  },
  {
    id: "7",
    title: "Delivery Scams",
    short: "Fake courier calls are rising.",
    details:
      "Scammers pretend to be delivery agents asking for OTP to ‘confirm address’. OTP is never required for delivery.",
    tag: "Delivery",
    icon: "truck-alert",
  },
  {
    id: "8",
    title: "Link-Based OTP Theft",
    short: "Don’t enter OTP on unknown sites.",
    details:
      "Fraud links mimic official portals. Always type the bank/UPI URL manually or use the official app.",
    tag: "Phishing",
    icon: "link-variant-off",
  },
  {
    id: "9",
    title: "Never Share with Friends/Family",
    short: "OTP is personal & private.",
    details:
      "Even trusted people should not ask for OTPs. Treat it like your fingerprint – it’s only for you.",
    tag: "Privacy",
    icon: "account-lock",
  },
  {
    id: "10",
    title: "Report Immediately",
    short: "Quick action saves money.",
    details:
      "If you shared an OTP mistakenly, call your bank and block your account/cards immediately. File a report at cybercrime.gov.in.",
    tag: "Action",
    icon: "alert-circle",
  },
];

export default function DontShareOTPs() {
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
          Don’t Share OTPs
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          OTP = Only To Person (YOU). Keep it safe, protect your money.
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
    color: "#ffb84d",
    marginTop: 4,
    fontStyle: "italic",
  },
});
