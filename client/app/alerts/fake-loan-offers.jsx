// FakeLoanOffers.jsx
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
    title: "Too-Good-To-Be-True Offers",
    short: "Guaranteed loans without checks are fake.",
    details:
      "Legit lenders always verify credit history and documents. Scammers lure victims with instant approvals.",
    tag: "Fraud",
    icon: "alert-decagram",
  },
  {
    id: "2",
    title: "Advance Fee Scam",
    short: "Never pay money to get a loan.",
    details:
      "Fraudsters demand processing fees or insurance upfront. Genuine banks deduct charges after loan approval.",
    tag: "Fees",
    icon: "cash-remove",
  },
  {
    id: "3",
    title: "Verify Registration",
    short: "Check RBI/NBFC license before trusting.",
    details:
      "Only registered banks and NBFCs can legally give loans. Verify credentials on RBI’s official site.",
    tag: "RBI Check",
    icon: "bank-check",
  },
  {
    id: "4",
    title: "Fake Loan Apps",
    short: "Unverified apps steal data.",
    details:
      "Never download loan apps from random links. Use only Play Store/App Store and check reviews/permissions.",
    tag: "Apps",
    icon: "cellphone-off",
  },
  {
    id: "5",
    title: "Suspicious Websites",
    short: "Check URLs before applying.",
    details:
      "Scam sites mimic real lenders. Look for HTTPS and avoid clicking on loan ads from unknown sources.",
    tag: "Phishing",
    icon: "web-cancel",
  },
  {
    id: "6",
    title: "Read Loan Terms",
    short: "Hidden charges = red flag.",
    details:
      "Fake lenders hide unrealistic interest rates or penalties. Always read sanction letters carefully.",
    tag: "Awareness",
    icon: "file-document-alert",
  },
  {
    id: "7",
    title: "Check Contact Details",
    short: "Generic emails = scam.",
    details:
      "Fraudsters use free email IDs (Gmail, Yahoo) instead of official domains. Verify customer care numbers.",
    tag: "Verification",
    icon: "email-alert",
  },
  {
    id: "8",
    title: "No Physical Address",
    short: "Legit lenders have offices.",
    details:
      "Scam lenders often hide behind PO boxes or fake addresses. Verify the company’s physical presence.",
    tag: "Trust",
    icon: "office-building-remove",
  },
  {
    id: "9",
    title: "High-Pressure Tactics",
    short: "Scammers rush you to decide.",
    details:
      "Beware if they insist you act immediately. Real lenders give time for evaluation.",
    tag: "Pressure",
    icon: "timer-alert",
  },
  {
    id: "10",
    title: "Report Fake Lenders",
    short: "Stop others from falling victim.",
    details:
      "Report fraud apps/websites to RBI, Play Store/App Store, and cybercrime.gov.in immediately.",
    tag: "Action",
    icon: "alert-circle",
  },
];

export default function FakeLoanOffers() {
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
          Fake Loan Offers
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Spot frauds early. Borrow only from trusted lenders.
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
    color: "#ff884d",
    marginTop: 4,
    fontStyle: "italic",
  },
});
