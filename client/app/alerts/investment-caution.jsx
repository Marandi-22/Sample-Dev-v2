// InvestmentCaution.jsx
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
    title: "Check Licenses",
    short: "Verify SEBI/RBI registration.",
    details:
      "Only invest in products or platforms regulated by official authorities. Unregistered schemes are risky.",
    tag: "Regulation",
    icon: "shield-check",
  },
  {
    id: "2",
    title: "Avoid High-Return Promises",
    short: "No guaranteed high returns.",
    details:
      "Schemes promising unusually high returns with low risk are likely scams. Investigate thoroughly.",
    tag: "Fraud",
    icon: "trending-up",
  },
  {
    id: "3",
    title: "Read the Fine Print",
    short: "Understand terms & fees.",
    details:
      "Check lock-in periods, penalties, exit loads, and hidden fees before investing.",
    tag: "Transparency",
    icon: "file-document",
  },
  {
    id: "4",
    title: "Diversify Portfolio",
    short: "Don’t put all money in one asset.",
    details:
      "Spread investments across equity, debt, and liquid assets to reduce risk of major loss.",
    tag: "Strategy",
    icon: "view-grid",
  },
  {
    id: "5",
    title: "Beware Ponzi Schemes",
    short: "Returns from new investors are red flags.",
    details:
      "Schemes paying old investors with new money collapse eventually. Avoid such setups.",
    tag: "Fraud",
    icon: "alert-decagram",
  },
  {
    id: "6",
    title: "Avoid Pressure Tactics",
    short: "Never rush into investing.",
    details:
      "Scammers push you to invest quickly. Take time, verify documents, and seek advice if unsure.",
    tag: "Caution",
    icon: "clock-alert",
  },
  {
    id: "7",
    title: "Check Fund Performance",
    short: "Past returns aren’t guarantees.",
    details:
      "Analyze long-term performance, volatility, and fund manager credibility before committing funds.",
    tag: "Research",
    icon: "chart-line",
  },
  {
    id: "8",
    title: "Beware of Phishing",
    short: "Secure online investment accounts.",
    details:
      "Enable 2FA, avoid clicking unknown links, and verify website URLs when logging in to investment platforms.",
    tag: "Security",
    icon: "shield-lock",
  },
  {
    id: "9",
    title: "Understand Tax Implications",
    short: "Know how investments are taxed.",
    details:
      "Capital gains, dividends, and interest income have tax consequences. Factor them in before investing.",
    tag: "Tax",
    icon: "file-document",
  },
  {
    id: "10",
    title: "Keep Records",
    short: "Maintain transaction proofs.",
    details:
      "Store receipts, confirmations, and statements. Useful for audits, tax filings, and dispute resolution.",
    tag: "Documentation",
    icon: "file-cabinet",
  },
  {
    id: "11",
    title: "Avoid Unsolicited Advice",
    short: "Verify before following tips.",
    details:
      "Friends, family, or online forums may suggest investments without understanding risks. Cross-check facts.",
    tag: "Research",
    icon: "account-check",
  },
  {
    id: "12",
    title: "Start Small",
    short: "Test before committing large amounts.",
    details:
      "Begin with smaller amounts to understand risk tolerance and platform reliability before scaling up.",
    tag: "Prudent",
    icon: "cash",
  },
];

export default function InvestmentCaution() {
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
          Investment Caution
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Protect your money. Invest wisely. Avoid scams.
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
    color: "#ff4d4d",
    marginTop: 4,
    fontStyle: "italic",
  },
});
