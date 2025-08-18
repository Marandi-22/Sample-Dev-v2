// KeepCardsSafe.jsx
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
    title: "Block Lost/Stolen Cards",
    short: "Act immediately to reduce fraud risk.",
    details:
      "If your card is lost or stolen, block it instantly via your bank app or helpline to prevent misuse.",
    tag: "Action",
    icon: "block-helper",
  },
  {
    id: "2",
    title: "Enable Transaction Alerts",
    short: "Stay updated in real-time.",
    details:
      "Turn on SMS/email/app notifications so you know immediately when a transaction happens.",
    tag: "Alerts",
    icon: "bell-alert",
  },
  {
    id: "3",
    title: "Set Spending Limits",
    short: "Protect against overspending or fraud.",
    details:
      "Use per-transaction and daily limits on credit/debit cards to minimize risk of large unauthorized charges.",
    tag: "Control",
    icon: "credit-card-clock",
  },
  {
    id: "4",
    title: "Avoid Public Wi-Fi",
    short: "Unsafe for card payments.",
    details:
      "Hackers can intercept payment data on open Wi-Fi. Always use secure mobile data or VPN.",
    tag: "Security",
    icon: "wifi-off",
  },
  {
    id: "5",
    title: "Never Share Card Details",
    short: "Protect CVV & PIN always.",
    details:
      "Don’t share card numbers, CVV, or expiry dates over phone/email. Banks never ask for them.",
    tag: "Privacy",
    icon: "lock",
  },
  {
    id: "6",
    title: "Use Virtual Cards",
    short: "Extra layer of safety online.",
    details:
      "Generate virtual cards for online purchases to avoid exposing your actual card number.",
    tag: "Online",
    icon: "credit-card-multiple",
  },
  {
    id: "7",
    title: "Check Statements Regularly",
    short: "Spot fraud early.",
    details:
      "Review card statements each month to detect unauthorized transactions and report them immediately.",
    tag: "Monitoring",
    icon: "file-document-search",
  },
  {
    id: "8",
    title: "Enable 2FA",
    short: "Two-step verification for safety.",
    details:
      "Always enable OTP or biometric verification for online card transactions.",
    tag: "2FA",
    icon: "shield-check",
  },
  {
    id: "9",
    title: "Beware of Skimming",
    short: "Check POS machines & ATMs.",
    details:
      "Fraudsters use hidden devices to steal card data. Inspect machines before inserting/swiping your card.",
    tag: "Fraud",
    icon: "credit-card-off",
  },
  {
    id: "10",
    title: "Don’t Save Cards Everywhere",
    short: "Reduce digital footprint.",
    details:
      "Avoid saving card details on random websites/apps. Store only with trusted, verified platforms.",
    tag: "Digital Safety",
    icon: "delete-clock",
  },
];

export default function KeepCardsSafe() {
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
          Keep Cards Safe
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Smart habits, safe payments, stress-free banking.
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
    color: "#4f79c1",
    marginTop: 4,
    fontStyle: "italic",
  },
});
