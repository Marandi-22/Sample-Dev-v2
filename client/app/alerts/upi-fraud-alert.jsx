// UPIFraudAlerts.jsx
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
    title: "Never Share UPI PIN",
    short: "UPI PIN is only for sending money.",
    details:
      "UPI PIN is not required to receive money. Anyone asking for it is trying to scam you.",
    tag: "PIN Safety",
    icon: "lock-alert",
  },
  {
    id: "2",
    title: "Verify Before Paying",
    short: "Always double-check receiver name.",
    details:
      "Fraudsters may use similar-looking names. Confirm merchant or friend details before approving.",
    tag: "Verification",
    icon: "account-search",
  },
  {
    id: "3",
    title: "Decline Unknown Requests",
    short: "Don’t approve random money requests.",
    details:
      "Scammers may send ₹1 test requests. Decline all unknown UPI collect requests immediately.",
    tag: "UPI Request",
    icon: "close-octagon",
  },
  {
    id: "4",
    title: "Don’t Fall for Screen-Share Apps",
    short: "Fraudsters ask to install screen-share tools.",
    details:
      "These apps let them see your screen & steal OTPs. Never install AnyDesk/TeamViewer for banking.",
    tag: "Screen Share",
    icon: "cellphone-screenshot",
  },
  {
    id: "5",
    title: "Ignore Fake Support Calls",
    short: "Banks don’t ask for remote access.",
    details:
      "Fraudsters pretend to be support agents. Call back only on official bank helplines.",
    tag: "Support Scam",
    icon: "phone-off",
  },
  {
    id: "6",
    title: "Beware Cashback/Prize Links",
    short: "Too-good-to-be-true offers are scams.",
    details:
      "Fraudsters send fake cashback or prize links that steal UPI details. Ignore such SMS/WhatsApp links.",
    tag: "Cashback Scam",
    icon: "gift-off",
  },
  {
    id: "7",
    title: "Use Trusted Apps Only",
    short: "Avoid modded/third-party UPI apps.",
    details:
      "Install apps only from Play Store/App Store. Fake APKs can capture your banking data.",
    tag: "Trusted Apps",
    icon: "cellphone-off",
  },
  {
    id: "8",
    title: "Enable App Lock",
    short: "Extra protection for payment apps.",
    details:
      "Set fingerprint/Face ID locks on UPI apps. Adds security if your phone gets stolen.",
    tag: "App Lock",
    icon: "shield-lock",
  },
  {
    id: "9",
    title: "Check SMS/Alerts",
    short: "Enable notifications for every transaction.",
    details:
      "Keep SMS/email alerts active to instantly detect unauthorized payments.",
    tag: "Alerts",
    icon: "bell-alert",
  },
  {
    id: "10",
    title: "Report Frauds Quickly",
    short: "Act fast to reduce loss.",
    details:
      "Report to your bank, NPCI, or cybercrime.gov.in immediately. Faster action means higher chance of recovery.",
    tag: "Action",
    icon: "alert-octagon",
  },
];

export default function UPIFraudAlerts() {
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
          UPI Fraud Alerts
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Stay safe. Use UPI wisely. Outsmart fraudsters.
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
    color: "#ff9800",
    marginTop: 4,
    fontStyle: "italic",
  },
});
