// AppDownloadSafety.jsx
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
    title: "Use Official Stores",
    short: "Only download from Play Store/App Store.",
    details:
      "Avoid third-party stores to reduce malware risk. Official stores verify app authenticity and security.",
    tag: "Safety",
    icon: "store",
  },
  {
    id: "2",
    title: "Check App Permissions",
    short: "Avoid excessive access requests.",
    details:
      "If an app asks for unnecessary permissions (camera, contacts, SMS), it might be malicious. Grant only what’s needed.",
    tag: "Privacy",
    icon: "shield-lock",
  },
  {
    id: "3",
    title: "Read Reviews & Ratings",
    short: "Check user feedback.",
    details:
      "Fake or low-quality apps often have poor or repetitive reviews. Look for genuine feedback and high ratings over time.",
    tag: "Trust",
    icon: "star-circle",
  },
  {
    id: "4",
    title: "Verify Developer Info",
    short: "Check the publisher details.",
    details:
      "Legitimate apps list verified companies. Avoid apps from unknown or suspicious developers.",
    tag: "Developer",
    icon: "account-check",
  },
  {
    id: "5",
    title: "Avoid Cracked Apps",
    short: "Do not use modded APKs.",
    details:
      "Cracked or modified apps often contain malware or spyware. Stick to official versions only.",
    tag: "Malware",
    icon: "cellphone-off",
  },
  {
    id: "6",
    title: "Keep Apps Updated",
    short: "Security patches matter.",
    details:
      "Update apps regularly to patch vulnerabilities. Old versions are more prone to attacks.",
    tag: "Update",
    icon: "update",
  },
  {
    id: "7",
    title: "Use Antivirus Apps",
    short: "Extra layer of protection.",
    details:
      "Install trusted antivirus/security apps to detect malicious apps or suspicious activity.",
    tag: "Protection",
    icon: "shield-check",
  },
  {
    id: "8",
    title: "Check App Size",
    short: "Unexpectedly small or large apps may be suspicious.",
    details:
      "Fake apps may have abnormal file sizes. Compare with official app size listed in store.",
    tag: "Awareness",
    icon: "cellphone-question",
  },
  {
    id: "9",
    title: "Avoid SMS/Email Links",
    short: "Do not download from random links.",
    details:
      "Links sent via SMS, WhatsApp, or email may lead to malware. Always download from verified sources.",
    tag: "Phishing",
    icon: "link-variant-off",
  },
  {
    id: "10",
    title: "Check App Updates Source",
    short: "Update from official store only.",
    details:
      "Never sideload updates. Only use Play Store/App Store updates to ensure security and authenticity.",
    tag: "Updates",
    icon: "download",
  },
  {
    id: "11",
    title: "Read Privacy Policy",
    short: "Know what data the app collects.",
    details:
      "Privacy policies inform how your data is handled. Avoid apps that collect excessive or irrelevant data.",
    tag: "Privacy",
    icon: "file-document",
  },
  {
    id: "12",
    title: "Uninstall Suspicious Apps",
    short: "Act fast if something feels off.",
    details:
      "If an app behaves strangely or asks for unnecessary permissions, uninstall immediately and report.",
    tag: "Action",
    icon: "alert-circle",
  },
];

export default function AppDownloadSafety() {
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
          App Download Safety
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Protect your device. Download smart. Avoid malware.
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
