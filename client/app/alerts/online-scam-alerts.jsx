// OnlineScamAlerts.jsx
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
    short: "Banks never ask for OTPs.",
    details:
      "Do not share OTPs, CVV, or passwords with anyone – not even bank staff. Real institutions never ask for them.",
    tag: "Safety",
    icon: "shield-lock",
  },
  {
    id: "2",
    title: "Beware Fake Job Offers",
    short: "Quick money offers are traps.",
    details:
      "Fraudsters lure victims with fake jobs and demand a ‘registration fee’. Verify company credentials first.",
    tag: "Job Scam",
    icon: "briefcase-off",
  },
  {
    id: "3",
    title: "Check Website Links",
    short: "Look out for fake URLs.",
    details:
      "Scammers create lookalike websites. Always type URLs manually or use official apps for payments.",
    tag: "Phishing",
    icon: "web",
  },
  {
    id: "4",
    title: "Avoid Suspicious Links",
    short: "Don’t trust random SMS/WhatsApp links.",
    details:
      "Fraud links install malware or redirect to fake payment pages. Delete such messages immediately.",
    tag: "Malware",
    icon: "link-variant-off",
  },
  {
    id: "5",
    title: "Fake UPI Requests",
    short: "Decline unknown money requests.",
    details:
      "Scammers send ₹1 ‘test’ UPI requests. Decline all unknown requests and double-check before approving.",
    tag: "UPI",
    icon: "cellphone-arrow-down",
  },
  {
    id: "6",
    title: "Charity Frauds",
    short: "Verify before donating.",
    details:
      "During crises, fake donation sites emerge. Donate only via official government or verified NGO portals.",
    tag: "Charity",
    icon: "hand-heart",
  },
  {
    id: "7",
    title: "Too-Good Investments",
    short: "No guaranteed double money schemes.",
    details:
      "High-return, no-risk investments are scams. Check SEBI/RBI registrations before investing.",
    tag: "Fraud",
    icon: "trending-down",
  },
  {
    id: "8",
    title: "Don’t Install APKs",
    short: "Unverified apps steal data.",
    details:
      "Never install apps from random links. Only use Play Store or App Store to avoid spyware/malware.",
    tag: "Apps",
    icon: "cellphone-off",
  },
  {
    id: "9",
    title: "Use Official Apps",
    short: "Banking/payments only via trusted apps.",
    details:
      "Avoid logging in through links or modded apps. Always download from official stores.",
    tag: "Banking",
    icon: "bank",
  },
  {
    id: "10",
    title: "Enable 2FA",
    short: "Extra protection matters.",
    details:
      "Two-factor authentication secures accounts even if passwords leak. Always turn it on for banking & email.",
    tag: "Security",
    icon: "lock-check",
  },
  {
    id: "11",
    title: "Caller ID Spoofing",
    short: "Don’t trust unknown callers.",
    details:
      "Fraudsters fake caller IDs to look like banks/police. Always call back official numbers to verify.",
    tag: "Calls",
    icon: "phone-alert",
  },
  {
    id: "12",
    title: "Report Scams",
    short: "Act quickly to reduce loss.",
    details:
      "Report scams at cybercrime.gov.in or local police helplines immediately to block transactions faster.",
    tag: "Action",
    icon: "alert-circle",
  },
];

export default function OnlineScamAlerts() {
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
          Online Scam Alerts
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Stay alert. Protect your money. Outsmart fraudsters.
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
