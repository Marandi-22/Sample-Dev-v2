// FinancialAwareness.jsx
import React, { useEffect, useRef, useState } from "react";
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
    title: "Emergency Savings",
    short: "Keep 3–6 months of expenses.",
    details:
      "Park this in a high-liquidity, low-risk account. Automate transfers after payday. Refill it after any withdrawal.",
    tag: "Safety",
    icon: "shield-check",
  },
  {
    id: "2",
    title: "50-30-20 Rule",
    short: "Needs 50%, Wants 30%, Savings 20%.",
    details:
      "Treat savings as a fixed ‘expense’. If income is irregular, base percentages on your minimum assured income.",
    tag: "Budgeting",
    icon: "chart-donut",
  },
  {
    id: "3",
    title: "Compound Interest",
    short: "Small savings grow big over time.",
    details:
      "Start early and contribute regularly. Longer time horizon + consistent deposits = outsized results.",
    tag: "Growth",
    icon: "trending-up",
  },
  {
    id: "4",
    title: "Good vs Bad Debt",
    short: "Good: education/home. Bad: credit cards/personal loans.",
    details:
      "Good debt builds assets or earning power. Bad debt funds consumption. Pay high-interest debt first.",
    tag: "Debt",
    icon: "scale-balance",
  },
  {
    id: "5",
    title: "Avoid Loans for Depreciating Items",
    short: "Skip EMI for gadgets/luxury.",
    details:
      "If it loses value quickly, pay cash or wait. Don’t pay interest on items that won’t appreciate.",
    tag: "Discipline",
    icon: "cellphone",
  },
  {
    id: "6",
    title: "Know Your Credit Score",
    short: "Check regularly & keep it healthy.",
    details:
      "Pay bills on time, keep utilization <30%, avoid unnecessary hard inquiries, and maintain long credit history.",
    tag: "Credit",
    icon: "credit-card-check",
  },
  {
    id: "7",
    title: "Never Invest Blindly",
    short: "Understand the product before investing.",
    details:
      "Read key risks, lock-ins, costs, and tax treatment. If you can’t explain it simply, don’t buy it yet.",
    tag: "Risk",
    icon: "book-search",
  },
  {
    id: "8",
    title: "Diversify Investments",
    short: "Don’t put all money in one place.",
    details:
      "Diversify across assets (equity/debt/cash), sectors, and geographies to reduce risk of large drawdowns.",
    tag: "Portfolio",
    icon: "view-grid",
  },
  {
    id: "9",
    title: "Avoid Get-Rich-Quick",
    short: "If it sounds too good, it is.",
    details:
      "Promises of guaranteed high returns are red flags. Verify licenses, and never rush due to FOMO.",
    tag: "Fraud",
    icon: "alert-decagram",
  },
  {
    id: "10",
    title: "Basics of Taxation",
    short: "Know how your income is taxed.",
    details:
      "Understand slabs, regimes, deductions (80C etc.), and capital gains. Tax-aware planning boosts net returns.",
    tag: "Tax",
    icon: "file-document",
  },
  {
    id: "11",
    title: "Separate Personal & Business",
    short: "Different accounts & clean bookkeeping.",
    details:
      "Makes compliance easy, improves clarity, and protects you during audits or funding discussions.",
    tag: "Business",
    icon: "briefcase-variant",
  },
  {
    id: "12",
    title: "Understand Inflation",
    short: "Money loses value over time.",
    details:
      "Aim for returns above inflation. Keep only necessary cash; invest the rest based on your goals and horizon.",
    tag: "Macro",
    icon: "chart-line",
  },
  {
    id: "13",
    title: "Review Goals Regularly",
    short: "Revisit every 6–12 months.",
    details:
      "Life changes. Rebalance, increase SIPs after hikes, and update milestones and risk levels.",
    tag: "Planning",
    icon: "calendar-refresh",
  },
  {
    id: "14",
    title: "Digital Hygiene",
    short: "Use strong, unique passwords.",
    details:
      "Enable 2FA, avoid public Wi-Fi for transactions, and keep devices updated to protect financial accounts.",
    tag: "Security",
    icon: "shield-lock",
  },
  {
    id: "15",
    title: "Set UPI/Card Limits",
    short: "Reduce fraud risk with sensible limits.",
    details:
      "Configure per-transaction and daily limits. Enable transaction alerts. Lock cards when not in use.",
    tag: "Security",
    icon: "lock-check",
  },
];

export default function FinancialAwareness() {
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
          Financial Awareness
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Practical rules, clean habits, smarter money moves.
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
