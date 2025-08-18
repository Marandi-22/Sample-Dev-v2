// ProtectYourData.jsx
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
    title: "Use Strong Passwords",
    short: "Avoid weak or reused passwords.",
    details:
      "Create long, unique passwords for each account. Use a mix of letters, numbers, and special characters.",
    tag: "Passwords",
    icon: "lock",
  },
  {
    id: "2",
    title: "Enable Two-Factor Authentication",
    short: "Extra security matters.",
    details:
      "Even if passwords leak, 2FA prevents access. Always enable for banking, email, and social accounts.",
    tag: "Security",
    icon: "lock-check",
  },
  {
    id: "3",
    title: "Beware Public Wi-Fi",
    short: "Hackers love open networks.",
    details:
      "Avoid financial transactions on public Wi-Fi. If necessary, use a trusted VPN for encryption.",
    tag: "Network",
    icon: "wifi-off",
  },
  {
    id: "4",
    title: "Update Software Regularly",
    short: "Patches fix vulnerabilities.",
    details:
      "Keep OS, apps, and antivirus updated. Updates often fix security loopholes exploited by attackers.",
    tag: "Updates",
    icon: "update",
  },
  {
    id: "5",
    title: "Be Wary of Email Links",
    short: "Phishing is everywhere.",
    details:
      "Never click unknown links or download attachments. Verify sender before opening emails.",
    tag: "Phishing",
    icon: "email-alert",
  },
  {
    id: "6",
    title: "Limit Data Sharing",
    short: "Think before sharing online.",
    details:
      "Don’t overshare personal info like address, DOB, or location on social media. Scammers use it for fraud.",
    tag: "Privacy",
    icon: "account-off",
  },
  {
    id: "7",
    title: "Lock Your Devices",
    short: "Secure phones and laptops.",
    details:
      "Enable biometric locks or strong PINs. Lost devices are prime targets for identity theft.",
    tag: "Devices",
    icon: "cellphone-lock",
  },
  {
    id: "8",
    title: "Backup Important Data",
    short: "Don’t lose it forever.",
    details:
      "Keep regular backups in secure cloud storage or encrypted drives to protect against ransomware or loss.",
    tag: "Backup",
    icon: "cloud-upload",
  },
  {
    id: "9",
    title: "Use Trusted Apps Only",
    short: "Avoid unverified APKs.",
    details:
      "Download apps only from official app stores. Random links may install spyware or steal banking info.",
    tag: "Apps",
    icon: "cellphone-alert",
  },
  {
    id: "10",
    title: "Check App Permissions",
    short: "Less is safer.",
    details:
      "Revoke unnecessary permissions like mic, location, or contacts. Malicious apps misuse them.",
    tag: "Permissions",
    icon: "shield-key",
  },
  {
    id: "11",
    title: "Monitor Bank Alerts",
    short: "Every SMS matters.",
    details:
      "Turn on SMS/email alerts for transactions. Quick action can stop fraud if something looks suspicious.",
    tag: "Banking",
    icon: "bank",
  },
  {
    id: "12",
    title: "Shred Old Documents",
    short: "Prevent identity theft.",
    details:
      "Destroy old bills, bank statements, or ID copies before discarding. Fraudsters can misuse them.",
    tag: "Documents",
    icon: "file-lock",
  },
];

export default function ProtectYourData() {
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
          Protect Your Data
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Simple steps to keep your data private and safe.
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
    color: "#4f79c1ff",
    marginTop: 4,
    fontStyle: "italic",
  },
});
