// VerifyBankNumbers.jsx
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
    title: "Always Use Official Numbers",
    short: "Verify from bank website or statement.",
    details:
      "Never trust numbers from unknown sources. Always check official bank portals or documents before calling.",
    tag: "Verification",
    icon: "phone-check",
  },
  {
    id: "2",
    title: "Avoid Numbers from SMS/Email",
    short: "Fraudsters often send fake contacts.",
    details:
      "Ignore numbers sent via suspicious emails or SMS claiming to be your bank. Cross-check via official sources.",
    tag: "Safety",
    icon: "email-alert",
  },
  {
    id: "3",
    title: "Check IFSC & Branch Info",
    short: "Match branch details with the number.",
    details:
      "When receiving bank contact info, verify IFSC and branch details from the official website or passbook.",
    tag: "Verification",
    icon: "bank-check",
  },
  {
    id: "4",
    title: "Use Bank Apps",
    short: "Official apps list verified numbers.",
    details:
      "Most banks provide verified contact numbers in their mobile apps. Avoid calling unverified numbers.",
    tag: "Apps",
    icon: "cellphone-arrow-right",
  },
  {
    id: "5",
    title: "Beware of Impersonation Calls",
    short: "Fraudsters pretend to be bank staff.",
    details:
      "If a caller asks for confidential info, hang up and call the official number from your bank statement or website.",
    tag: "Fraud",
    icon: "account-check",
  },
  {
    id: "6",
    title: "Use Helpline Numbers",
    short: "Call numbers listed on official documents.",
    details:
      "Always call numbers printed on passbooks, debit/credit cards, or bank statements. Avoid random online numbers.",
    tag: "Security",
    icon: "phone-classic",
  },
  {
    id: "7",
    title: "Do Not Trust Social Media",
    short: "Bank numbers on social media can be fake.",
    details:
      "Many fake accounts provide wrong numbers. Only use verified pages and cross-check info on official sites.",
    tag: "Fraud",
    icon: "account-alert",
  },
  {
    id: "8",
    title: "Report Suspicious Numbers",
    short: "Help others by reporting fraud numbers.",
    details:
      "If you receive suspicious calls or messages, report them to your bank immediately to prevent fraud.",
    tag: "Action",
    icon: "alert-circle",
  },
  {
    id: "9",
    title: "Keep Emergency Numbers Handy",
    short: "Block fraud numbers proactively.",
    details:
      "Maintain a list of verified emergency bank numbers and block unknown or suspicious numbers.",
    tag: "Prevention",
    icon: "shield-alert",
  },
  {
    id: "10",
    title: "Verify Before Transferring Money",
    short: "Confirm recipient number through official channels.",
    details:
      "Always double-check account and bank numbers with trusted sources before transferring funds to avoid scams.",
    tag: "Safety",
    icon: "swap-horizontal-bold",
  },
  {
    id: "11",
    title: "Enable Call & Transaction Alerts",
    short: "Get notified instantly for any activity.",
    details:
      "Banks provide alerts for calls, messages, and transactions. Keep them on to detect fraud early.",
    tag: "Security",
    icon: "bell-alert",
  },
  {
    id: "12",
    title: "Educate Friends & Family",
    short: "Share verified number practices.",
    details:
      "Spread awareness to prevent fraud attempts. Encourage checking numbers before calling or transferring money.",
    tag: "Awareness",
    icon: "account-group",
  },
];

export default function VerifyBankNumbers() {
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
          Verify Bank Numbers
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Always confirm official contacts before calling or transferring money.
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
