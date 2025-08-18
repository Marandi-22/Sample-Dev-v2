// client/app/profile.jsx
import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  TextInput,
  Button,
  Chip,
  ActivityIndicator,
  IconButton,
  Divider,
  Snackbar,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL, TOKEN_KEY } from "../services/api";

/* ─── palette ─────────────────────────────────────────── */
const BG = "#000000",
  CARD_BG = "#111111",
  TEXT = "#FFFFFF";
const SUBTEXT = "#9CA3AF",
  ACCENT = "#00C8FF",
  BORDER = "#1F2937";

/* ─── storage keys (match budget.jsx exactly) ─────────── */
const EVENTS_KEY = "@fw_life_events_v1";
const K = {
  salary: "@fw_salary",
  baseExpense: "@fw_base_expense",
  currentSavings: "@fw_current_savings",
  goals: "@fw_goals_v1",
};

/* ─── tiny helpers ────────────────────────────────────── */
const toStr = (v) => (v === null || v === undefined ? "" : String(v));

export default function ProfileScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null); // { id, name, email }

  // Core numbers used by Speedometer/Budget
  const [salary, setSalary] = useState("");
  const [baseExpense, setBaseExpense] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");

  // Goals list used by Budget
  const [goals, setGoals] = useState([]);

  // UI
  const [toast, setToast] = useState("");

  const loadAll = useCallback(async () => {
    try {
      // Load core numbers
      const map = Object.fromEntries(await AsyncStorage.multiGet(Object.values(K)));
      setSalary(toStr(map[K.salary] || ""));
      setBaseExpense(toStr(map[K.baseExpense] || ""));
      setCurrentSavings(toStr(map[K.currentSavings] || ""));
      try {
        setGoals(JSON.parse(map[K.goals] || "[]"));
      } catch {
        setGoals([]);
      }

      // Load server account using token
      const token = await AsyncStorage.getItem(TOKEN_KEY);
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
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveCore = async () => {
    await AsyncStorage.multiSet([
      [K.salary, salary || "0"],
      [K.baseExpense, baseExpense || "0"],
      [K.currentSavings, currentSavings || "0"],
    ]);
    setToast("Numbers saved");
  };

  const saveGoals = async (next) => {
    setGoals(next);
    await AsyncStorage.setItem(K.goals, JSON.stringify(next));
    setToast("Goals updated");
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    router.replace("/login");
  };

  const logoutAndWipe = async () => {
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      EVENTS_KEY,
      K.salary,
      K.baseExpense,
      K.currentSavings,
      K.goals,
      "@fw_profile_v3",
      "@fw_profile_v2",
      "@fw_profile_v1",
      "@fw_onboarded_v3",
      "@fw_onboarded_v2",
      "@fw_onboarded_v1",
    ]);
    router.replace("/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: SUBTEXT, marginTop: 8 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text variant="headlineLarge" style={styles.title}>
          Profile
        </Text>

        {/* Account */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>
              Account
            </Text>
            {account ? (
              <>
                <Text style={styles.muted}>
                  Name: <Text style={styles.value}>{account.name}</Text>
                </Text>
                <Text style={styles.muted}>
                  Email: <Text style={styles.value}>{account.email}</Text>
                </Text>
              </>
            ) : (
              <Text style={styles.muted}>Signed out</Text>
            )}
          </Card.Content>
        </Card>

        {/* Core Numbers (used by Speedometer/Budget) */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>
              Core Numbers
            </Text>
            <Text style={styles.muted}>
              These drive your Speedometer and Budget calculations.
            </Text>

            <TextInput
              label="Salary / month (₹)"
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.outline}
              activeOutlineColor={ACCENT}
            />
            <TextInput
              label="Base expense / month (₹)"
              value={baseExpense}
              onChangeText={setBaseExpense}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.outline}
              activeOutlineColor={ACCENT}
            />
            <TextInput
              label="Current savings (₹)"
              value={currentSavings}
              onChangeText={setCurrentSavings}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.outline}
              activeOutlineColor={ACCENT}
            />

            <Button
              mode="contained"
              buttonColor={ACCENT}
              textColor="#000"
              onPress={saveCore}
              style={{ marginTop: 8 }}
            >
              Save
            </Button>
          </Card.Content>
        </Card>

        {/* Goals (used by Budget) */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text variant="titleMedium" style={styles.label}>
                Goals
              </Text>
              {goals.length > 0 && (
                <Button
                  mode="text"
                  textColor={ACCENT}
                  onPress={() => saveGoals([])}
                >
                  Clear all
                </Button>
              )}
            </View>

            <GoalsEditor goals={goals} onChange={saveGoals} />
          </Card.Content>
        </Card>

        {/* Danger zone */}
        <Card style={styles.cardDanger}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.labelDanger}>
              Danger Zone
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Button mode="contained" onPress={logout}>
                Log out
              </Button>
              <Button mode="outlined" onPress={logoutAndWipe}>
                Log out & wipe
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast("")}
        duration={1600}
        style={{ backgroundColor: "#0F0F0F" }}
      >
        <Text style={{ color: TEXT }}>{toast}</Text>
      </Snackbar>
    </SafeAreaView>
  );
}

/* ─── Goals editor (same schema Budget expects) ───────── */
function GoalsEditor({ goals, onChange }) {
  const [items, setItems] = useState(goals || []);
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");

  const add = () => {
    const a = +amt;
    if (!name.trim() || !a) return;
    const next = [...items, { id: `g_${Date.now()}`, name: name.trim(), amount: a }];
    setItems(next);
    onChange(next);
    setName("");
    setAmt("");
  };

  const remove = (id) => {
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    onChange(next);
  };

  return (
    <>
      <TextInput
        label="Goal name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.outline}
        activeOutlineColor={ACCENT}
      />
      <TextInput
        label="Amount (₹)"
        value={amt}
        onChangeText={setAmt}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        outlineStyle={styles.outline}
        activeOutlineColor={ACCENT}
      />
      <Button
        mode="contained"
        buttonColor={ACCENT}
        textColor="#000"
        onPress={add}
      >
        Add goal
      </Button>

      <Divider style={{ backgroundColor: BORDER, marginVertical: 10 }} />
      <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
        {!items.length && <Text style={styles.muted}>No goals yet.</Text>}
        {items.map((g) => (
          <View
            key={g.id}
            style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}
          >
            <Text style={{ color: TEXT }}>
              • {g.name} · ₹{Number(g.amount || 0).toLocaleString()}
            </Text>
            <IconButton
              icon="delete"
              size={18}
              iconColor={ACCENT}
              onPress={() => remove(g.id)}
            />
          </View>
        ))}
      </ScrollView>
    </>
  );
}

/* ─── styles ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center: { flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" },
  title: { color: TEXT, marginBottom: 12, fontWeight: "800" },

  card: {
    backgroundColor: CARD_BG,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardDanger: {
    backgroundColor: "#1a0f0f",
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#5a1f1f",
  },

  label: { color: TEXT, marginBottom: 8, fontWeight: "700" },
  labelDanger: { color: "#ff6666", marginBottom: 8, fontWeight: "700" },

  input: { backgroundColor: "#0f0f0f", marginTop: 8 },
  outline: { borderColor: BORDER },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  muted: { color: SUBTEXT, marginTop: 4 },
  value: { color: TEXT },
});
