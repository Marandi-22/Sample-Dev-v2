// client/app/(tabs)/budget.jsx
import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Chip, Button, TextInput, ProgressBar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const todayKey = () => new Date().toISOString().slice(0, 10);
const weekKeys = () => {
  const d = new Date();
  const day = d.getDay(); // 0 Sun..6 Sat
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
};

export default function BudgetScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState("");
  const [checks, setChecks] = useState({}); // { "YYYY-MM-DD": true }
  const [xp, setXp] = useState(0);

  useEffect(() => {
    (async () => {
      const raw =
        (await AsyncStorage.getItem("@fw_profile_v3")) ||
        (await AsyncStorage.getItem("@fw_profile_v2")) ||
        (await AsyncStorage.getItem("@fw_profile_v1"));
      if (raw) setProfile(JSON.parse(raw));

      const notesKey = `@fw_budget_notes_${todayKey()}`;
      const oldNotes = await AsyncStorage.getItem(notesKey);
      if (oldNotes) setNotes(oldNotes);

      const ck = await AsyncStorage.getItem("@fw_budget_checks");
      if (ck) setChecks(JSON.parse(ck));

      const x = await AsyncStorage.getItem("@fw_xp");
      if (x) setXp(parseInt(x, 10) || 0);
    })();
  }, []);

  const goal = profile?.goal || "budget";
  const tagline = useMemo(() => {
    switch (goal) {
      case "invest":
        return "Grow consistently. Track savings and monthly investment.";
      case "impulse":
        return "Beat impulse. Stick to daily caps + habits.";
      case "learn":
        return "Learn first. Explore lessons & news.";
      case "emergency":
        return "Safety first. Use Fraud tools & hotlines.";
      default:
        return "Plan income, bills, savings — keep it simple.";
    }
  }, [goal]);

  if (!profile) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#9CA3AF" }}>No profile yet. Run onboarding.</Text>
        <Button mode="contained" style={{ marginTop: 12 }} onPress={() => router.replace("/onboarding")}>
          Start Onboarding
        </Button>
      </SafeAreaView>
    );
  }

  const {
    currency = "₹",
    monthlyIncome = 0,
    fixedBills = 0,
    savingsPercent = profile.savingsPercent ?? 20,
    monthlyInvest = profile.monthlyInvest ?? 0,
    disposable = profile.disposable ?? 0,
    categories = [],
    weeklyHabitTarget = profile.weeklyHabitTarget ?? 5,
  } = profile;

  // Recompute if needed
  const monthlySavingsCalc = (parseFloat(monthlyIncome) || 0) * (Number(savingsPercent) / 100);
  const disposableCalc = Math.max(
    0,
    (parseFloat(monthlyIncome) || 0) - (parseFloat(fixedBills) || 0) - monthlySavingsCalc - (monthlyInvest || 0)
  );
  const finalDisposable = profile.disposable ?? disposableCalc;
  const suggestedDaily = Math.floor(finalDisposable / 30);

  const wk = weekKeys();
  const completedThisWeek = wk.filter((k) => checks[k]).length;
  const progress = Math.min(1, completedThisWeek / weeklyHabitTarget);

  const toggleDay = async (dayKey) => {
    const newChecks = { ...checks, [dayKey]: !checks[dayKey] };
    setChecks(newChecks);
    await AsyncStorage.setItem("@fw_budget_checks", JSON.stringify(newChecks));
    // award XP only when turning ON
    if (newChecks[dayKey]) {
      const newXp = xp + 10;
      setXp(newXp);
      await AsyncStorage.setItem("@fw_xp", String(newXp));
    }
  };

  const saveNotes = async () => {
    const key = `@fw_budget_notes_${todayKey()}`;
    await AsyncStorage.setItem(key, notes);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text variant="headlineLarge" style={styles.title}>Budget</Text>
        <Text style={styles.muted}>{tagline}</Text>
        <Chip style={{ alignSelf: "flex-start", marginBottom: 8 }} mode="flat">{(goal || "budget").toUpperCase()}</Chip>

        {/* Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Overview</Text>
            <Text style={styles.row}>Income: {currency}{Number(monthlyIncome).toLocaleString()}</Text>
            <Text style={styles.row}>Fixed bills: {currency}{Number(fixedBills).toLocaleString()}</Text>
            <Text style={styles.row}>Savings ({savingsPercent}%): {currency}{Math.round(monthlySavingsCalc).toLocaleString()}</Text>
            {goal === "invest" && (
              <Text style={styles.row}>Invest / month: {currency}{Math.round(monthlyInvest).toLocaleString()}</Text>
            )}
            <Text style={[styles.row, styles.highlight]}>Disposable: {currency}{Math.round(finalDisposable).toLocaleString()}</Text>
            <Text style={styles.muted}>Suggested daily cap ≈ {currency}{suggestedDaily.toLocaleString()}</Text>
            <Button mode="text" onPress={() => router.push("/profile")} style={{ marginTop: 6 }}>
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Weekly habits + XP */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Weekly Habits</Text>
            <Text style={styles.muted}>Target: {weeklyHabitTarget} days · XP: {xp}</Text>
            <View style={styles.weekRow}>
              {wk.map((k) => (
                <TouchableOpacity key={k} style={[styles.dayBox, checks[k] && styles.dayBoxOn]} onPress={() => toggleDay(k)}>
                  <Text style={styles.dayText}>{k.slice(8, 10)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <ProgressBar progress={progress} style={{ marginTop: 8 }} />
          </Card.Content>
        </Card>

        {/* Categories */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Categories</Text>
            <View style={styles.chips}>
              {categories.length
                ? categories.map((c) => (
                    <Chip key={c} style={{ margin: 4 }} mode="flat">
                      {c}
                    </Chip>
                  ))
                : <Text style={styles.muted}>No categories selected</Text>}
            </View>
            <Button mode="text" onPress={() => router.push("/onboarding")} style={{ marginTop: 6 }}>
              Adjust in Onboarding
            </Button>
          </Card.Content>
        </Card>

        {/* Daily Notes */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Daily Notes</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Plan today’s spend or reflect..."
              multiline
              style={{ backgroundColor: "#0f0f0f" }}
            />
            <Button mode="contained" style={{ marginTop: 10 }} onPress={saveNotes}>
              Save Note
            </Button>
          </Card.Content>
        </Card>

        {/* Quick nav based on goal */}
        {goal === "learn" && (
          <Button mode="contained" onPress={() => router.replace("/(tabs)/index")} style={{ marginTop: 6 }}>
            Go to News & Learn
          </Button>
        )}
        {goal === "emergency" && (
          <Button mode="contained" onPress={() => router.replace("/(tabs)/fraud")} style={{ marginTop: 6 }}>
            Open Emergency Tools
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  title: { color: "#fff", marginBottom: 4 },
  muted: { color: "#9CA3AF", marginBottom: 8 },
  card: { backgroundColor: "#111", marginBottom: 12 },
  label: { color: "#fff", marginBottom: 8 },
  row: { color: "#fff", marginBottom: 6 },
  highlight: { color: "#FF9900", fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 20 },

  weekRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  dayBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#222", alignItems: "center", justifyContent: "center" },
  dayBoxOn: { backgroundColor: "#FF9900" },
  dayText: { color: "#fff", fontWeight: "600" },
});
