// client/app/profile.jsx
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  TextInput,
  Switch,
  Button,
  Chip,
  ActivityIndicator,
  IconButton,
  Divider,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Constants from "expo-constants";

const TOKEN_KEY = "@fw_auth_token";
const ONBOARD_KEY = "@fw_onboarded_v3";
const PROFILE_KEY = "@fw_profile_v3"; // legacy prefs blob

// NEW budget (Life Ribbon) keys — must match budget.jsx
const K = {
  age: "@fw_life_age",
  income: "@fw_life_income",
  savings: "@fw_life_savings",
  spendAuto: "@fw_life_spend",
  goal: "@fw_life_goal",
  autopilot: "@fw_life_autopilot",
  expectancy: "@fw_life_expectancy",
  goals: "@fw_goals_v1",
};

const API_URL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  "http://127.0.0.1:5000";

// tiny helpers
const n = (v) => (v === null || v === undefined || v === "" ? "" : String(v));

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // server account
  const [account, setAccount] = useState(null); // { id, name, email }

  // legacy
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [legacy, setLegacy] = useState({}); // { monthlyIncome, fixedBills, savingsPercent, monthlyInvest, goal, ... }

  // life ribbon (the one budget uses)
  const [lr, setLR] = useState({
    age: "",
    income: "",
    savings: "",
    spendAuto: "",
    autopilot: "",
    expectancy: "80",
  });

  // misc prefs kept in legacy blob
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [currency, setCurrency] = useState("₹");

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);

        // load legacy blob (if any)
        const rawLegacy = await AsyncStorage.getItem(PROFILE_KEY);
        const L = rawLegacy ? JSON.parse(rawLegacy) : {};
        setLegacy(L || {});
        setRemindersEnabled(!!L?.remindersEnabled);
        setCurrency(L?.currency || "₹");

        // load life ribbon keys
        const pairs = await AsyncStorage.multiGet([
          K.age,
          K.income,
          K.savings,
          K.spendAuto,
          K.autopilot,
          K.expectancy,
        ]);
        const map = Object.fromEntries(pairs || []);
        setLR({
          age: n(map[K.age] ?? ""),
          income: n(map[K.income] ?? ""),
          savings: n(map[K.savings] ?? ""),
          spendAuto: n(map[K.spendAuto] ?? ""),
          autopilot: n(map[K.autopilot] ?? ""),
          expectancy: n(map[K.expectancy] ?? "80"),
        });

        // server account (optional)
        if (token) {
          try {
            const res = await fetch(`${API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setAccount(await res.json());
            else await AsyncStorage.removeItem(TOKEN_KEY);
          } catch {
            // offline ok
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateLR = (k, v) => setLR((p) => ({ ...p, [k]: v }));
  const updateLegacy = (k, v) => setLegacy((p) => ({ ...(p || {}), [k]: v }));

  // Save life ribbon keys (used by Budget)
  const saveLifeRibbon = async () => {
    await AsyncStorage.multiSet([
      [K.age, lr.age || ""],
      [K.income, lr.income || ""],
      [K.savings, lr.savings || ""],
      [K.spendAuto, lr.spendAuto || ""],
      [K.autopilot, lr.autopilot || ""],
      [K.expectancy, lr.expectancy || "80"],
      [ONBOARD_KEY, "true"],
    ]);
    Alert.alert("Saved", "Life Ribbon settings updated.");
  };

  // Save legacy blob (kept for your other screens, if any)
  const saveLegacy = async () => {
    const blob = {
      ...(legacy || {}),
      remindersEnabled,
      currency,
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(blob));
    await AsyncStorage.setItem(ONBOARD_KEY, "true");
    Alert.alert("Saved", "Profile (legacy) updated.");
  };

  // One-click sync: Legacy -> Life Ribbon
  const syncFromLegacy = async () => {
    const L = legacy || {};
    const income = Number(L.monthlyIncome || 0);
    const fixedBills = Number(L.fixedBills || 0);
    const p = Number(L.savingsPercent || 0);
    const monthlyInvest =
      L.goal === "invest"
        ? Number(L.monthlyInvest || 0)
        : Math.max(0, Math.round((income * p) / 100));

    const next = {
      ...lr,
      income: income ? String(income) : lr.income,
      spendAuto: fixedBills ? String(fixedBills) : lr.spendAuto,
      autopilot: String(monthlyInvest || lr.autopilot || ""),
    };
    setLR(next);

    await AsyncStorage.multiSet([
      [K.income, next.income || ""],
      [K.spendAuto, next.spendAuto || ""],
      [K.autopilot, next.autopilot || ""],
      [ONBOARD_KEY, "true"],
    ]);
    Alert.alert("Synced", "Copied legacy income/spend to Life Ribbon.");
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    router.replace("/login");
  };

  const logoutAndWipe = async () => {
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      PROFILE_KEY,
      ONBOARD_KEY,
      K.age,
      K.income,
      K.savings,
      K.spendAuto,
      K.autopilot,
      K.expectancy,
      "@fw_profile_v2",
      "@fw_profile_v1",
      "@fw_onboarded_v2",
      "@fw_onboarded_v1",
    ]);
    router.replace("/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text variant="headlineLarge" style={styles.title}>Profile</Text>

        {/* Account */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Account</Text>
            {account ? (
              <>
                <Text style={styles.muted}>Name: <Text style={styles.value}>{account.name}</Text></Text>
                <Text style={styles.muted}>Email: <Text style={styles.value}>{account.email}</Text></Text>
              </>
            ) : (
              <Text style={styles.muted}>Signed out</Text>
            )}
          </Card.Content>
        </Card>

        {/* LIFE RIBBON (Budget) SETTINGS — the source of truth for Budget tab */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text variant="titleMedium" style={styles.label}>Life Ribbon Settings</Text>
              <Button compact mode="text" onPress={() => router.push("/onboarding")}>
                Onboarding
              </Button>
            </View>
            <Text style={styles.muted}>
              These values are used by the <Text style={styles.value}>Budget</Text> tab (Life Ribbon).
            </Text>

            <TextInput
              label="Current age"
              value={lr.age}
              onChangeText={(t) => updateLR("age", t)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Monthly income (₹)"
              value={lr.income}
              onChangeText={(t) => updateLR("income", t)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Current savings (₹)"
              value={lr.savings}
              onChangeText={(t) => updateLR("savings", t)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Autopilot invest / month (₹)"
              value={lr.autopilot}
              onChangeText={(t) => updateLR("autopilot", t)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Usual monthly spend (₹)"
              value={lr.spendAuto}
              onChangeText={(t) => updateLR("spendAuto", t)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Life expectancy (years)"
              value={lr.expectancy}
              onChangeText={(t) => updateLR("expectancy", t)}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.rowBetween}>
              <Button mode="contained" onPress={saveLifeRibbon}>Save Life Ribbon</Button>
              <Button mode="outlined" onPress={syncFromLegacy}>Sync from Legacy</Button>
            </View>
          </Card.Content>
        </Card>

        {/* LEGACY PROFILE (optional) — collapsed by default */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text variant="titleMedium" style={styles.label}>Legacy Profile (optional)</Text>
              <IconButton
                icon={legacyOpen ? "chevron-up" : "chevron-down"}
                onPress={() => setLegacyOpen((o) => !o)}
              />
            </View>

            {!legacyOpen ? (
              <Text style={styles.muted}>
                Keep for older screens; Budget uses Life Ribbon above.
              </Text>
            ) : (
              <>
                <TextInput
                  label={`Monthly Income (${currency})`}
                  value={n(legacy.monthlyIncome)}
                  onChangeText={(t) => updateLegacy("monthlyIncome", t)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label={`Fixed Bills (${currency})`}
                  value={n(legacy.fixedBills)}
                  onChangeText={(t) => updateLegacy("fixedBills", t)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Savings Goal (%)"
                  value={n(legacy.savingsPercent ?? 20)}
                  onChangeText={(t) => updateLegacy("savingsPercent", Number(t) || 0)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Invest / month (if goal = invest)"
                  value={n(legacy.monthlyInvest)}
                  onChangeText={(t) => updateLegacy("monthlyInvest", t)}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <View style={styles.rowBetween}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.value}>Enable Reminders</Text>
                    <Switch
                      value={remindersEnabled}
                      onValueChange={(v) => setRemindersEnabled(v)}
                    />
                  </View>
                  <Chip>{currency}</Chip>
                </View>

                <Divider style={{ backgroundColor: "#232323", marginVertical: 10 }} />
                <Button mode="contained" onPress={saveLegacy}>Save Legacy</Button>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Danger zone */}
        <Card style={styles.cardDanger}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.labelDanger}>Danger Zone</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button mode="contained" onPress={logout}>Log out</Button>
              <Button mode="outlined" onPress={logoutAndWipe}>Log out & wipe</Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", marginBottom: 12, fontWeight: "800" },

  card: { backgroundColor: "#111", marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: "#1F2937" },
  cardDanger: { backgroundColor: "#1a0f0f", marginBottom: 12, borderRadius: 16, borderWidth: 1, borderColor: "#5a1f1f" },

  label: { color: "#fff", marginBottom: 8, fontWeight: "700" },
  labelDanger: { color: "#ff6666", marginBottom: 8, fontWeight: "700" },

  input: { backgroundColor: "#0f0f0f", marginBottom: 10 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  muted: { color: "#9CA3AF", marginTop: 4 },
  value: { color: "#FFFFFF" },
});
