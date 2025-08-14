// client/app/(tabs)/budget.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text, TextInput, Button, Card, Chip, HelperText, Divider, Snackbar, FAB, IconButton
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import LifeRibbon from "../../components/LifeRibbon";

const BG = "#000000";
const CARD_BG = "#111111";
const TEXT = "#FFFFFF";
const SUBTEXT = "#9CA3AF";
const ORANGE = "#FF9900";

const EVENTS_KEY = "@fw_life_events_v1";
const ONBOARD_KEY = "@fw_onboarded_v3";
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
const CATS = ["Food", "Travel", "Bills", "Shopping", "Fun", "Other"];

export default function Budget() {
  const router = useRouter();

  // ---------- setup detection ----------
  const [setupDone, setSetupDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const checkSetup = useCallback(async () => {
    setChecking(true);
    try {
      const pairs = await AsyncStorage.multiGet([K.goal, K.income, K.savings, K.autopilot, K.expectancy, ONBOARD_KEY]);
      const map = Object.fromEntries(pairs);
      const goal = Number(map[K.goal] || 0);
      const income = Number(map[K.income] || 0);
      const savings = Number(map[K.savings] || 0);
      setSetupDone(goal > 0 && (income > 0 || savings > 0));
    } finally { setChecking(false); }
  }, []);
  useEffect(() => { checkSetup(); }, [checkSetup]);
  useFocusEffect(React.useCallback(() => { checkSetup(); }, [checkSetup]));

  // ---------- events ----------
  const [events, setEvents] = useState([]);
  const [type, setType] = useState("spend");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState(CATS[0]);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(EVENTS_KEY);
      try { setEvents(raw ? JSON.parse(raw) : []); } catch { setEvents([]); }
    })();
  }, []);
  const persist = async (list) => {
    setEvents(list);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(list));
  };
  const add = async () => {
    setErr("");
    const a = Number(amount);
    if (!a || a <= 0) { setErr("Enter a valid amount"); return; }
    const e = { type, amount: a, cat: type === "spend" ? cat : undefined, ts: new Date().toISOString() };
    const next = [e, ...(events || [])];
    await persist(next);
    setToast(`${type[0].toUpperCase()+type.slice(1)} ₹${a.toLocaleString()} logged`);
    setAmount("");
  };
  const sums = useMemo(() => {
    const now = new Date(); const mth = now.getMonth(); const yr = now.getFullYear();
    const m = (events || []).filter(e => { const d = new Date(e.ts); return d.getMonth() === mth && d.getFullYear() === yr; });
    const spend = m.filter(e => e.type === "spend").reduce((s, e) => s + e.amount, 0);
    const invest = m.filter(e => e.type === "invest").reduce((s, e) => s + e.amount, 0);
    const credit = m.filter(e => e.type === "credit").reduce((s, e) => s + e.amount, 0);
    return { spend, invest, credit };
  }, [events]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!setupDone && !checking && (
          <InlineOnboarding onDone={checkSetup} onOpenFull={() => router.push("/onboarding")} />
        )}

        <LifeRibbon />
        <GoalsManager />

        {/* Quick event input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.h}>Quick update</Text>

            <Text style={[styles.sub, { marginTop: 8 }]}>Type</Text>
            <ScrollChips value={type} onChange={setType} options={["spend","invest","credit"]} />

            {type === "spend" && (
              <>
                <Text style={[styles.sub, { marginTop: 8 }]}>Category</Text>
                <ScrollChips value={cat} onChange={setCat} options={CATS} />
              </>
            )}

            <TextInput
              label={type==="spend" ? "Amount spent (₹)" : type==="invest" ? "Amount invested (₹)" : "Credit received (₹)"}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              style={styles.input}
              outlineStyle={{ borderColor:"#1F2937" }}
              activeOutlineColor={ORANGE}
              disabled={!setupDone}
            />
            {!!err && <HelperText type="error" visible>{err}</HelperText>}

            <Button mode="contained" onPress={add} disabled={!setupDone}>
              {setupDone ? "Add" : "Set up first"}
            </Button>

            <Divider style={{backgroundColor:"#1F2937", marginVertical:8}}/>

            <Text style={styles.sub}>
              This month · Spent: ₹{sums.spend.toFixed(0)} · Invested: ₹{sums.invest.toFixed(0)} · Credits: ₹{sums.credit.toFixed(0)}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Always-available onboarding entry */}
      <FAB
        icon="cog"
        style={styles.fab}
        onPress={() => router.push("/onboarding")}
        color="#111"
        size={52}
        mode="elevated"
      />

      <Snackbar visible={!!toast} onDismiss={()=>setToast("")} duration={2200} style={{ backgroundColor:"#0F0F0F" }}>
        <Text style={{ color:TEXT }}>{toast}</Text>
      </Snackbar>
    </SafeAreaView>
  );
}

function ScrollChips({ value, onChange, options }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
      {options.map((opt) => (
        <Chip
          key={opt}
          selected={value === opt}
          onPress={() => onChange(opt)}
          style={{ marginRight: 6, backgroundColor: BG, borderColor: "#1F2937" }}
          selectedColor={ORANGE}
          mode="outlined"
        >
          {opt[0].toUpperCase() + opt.slice(1)}
        </Chip>
      ))}
    </ScrollView>
  );
}

/** Inline onboarding (only shows until saved once) */
function InlineOnboarding({ onDone, onOpenFull }) {
  const [age, setAge] = useState("20");
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [goal, setGoal] = useState(""); // <-- fixed: removed hidden char
  const [autopilot, setAutopilot] = useState("5000");
  const [spend, setSpend] = useState("0");
  const [expectancy, setExpectancy] = useState("80");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [a,i,s,g,ap,sp,ex] = await AsyncStorage.multiGet([
        K.age, K.income, K.savings, K.goal, K.autopilot, K.spendAuto, K.expectancy
      ]);
      if (a?.[1]) setAge(String(a[1]));
      if (i?.[1]) setIncome(String(i[1]));
      if (s?.[1]) setSavings(String(s[1]));
      if (g?.[1]) setGoal(String(g[1]));
      if (ap?.[1]) setAutopilot(String(ap[1]));
      if (sp?.[1]) setSpend(String(sp[1]));
      if (ex?.[1]) setExpectancy(String(ex[1]));
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await AsyncStorage.multiSet([
        [K.age, age || "20"],
        [K.income, income || "0"],
        [K.savings, savings || "0"],
        [K.goal, goal || "0"],
        [K.autopilot, autopilot || "0"],
        [K.spendAuto, spend || "0"],
        [K.expectancy, expectancy || "80"],
        [ONBOARD_KEY, "true"],
      ]);
      // seed first goal from "goal" if empty
      try {
        const raw = await AsyncStorage.getItem(K.goals);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr) || arr.length === 0) {
          const seed = [{ id:`g_${Date.now()}`, name:"Primary Goal", amount: Number(goal||0) }];
          await AsyncStorage.setItem(K.goals, JSON.stringify(seed));
        }
      } catch {}
      onDone && onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.h}>Set your Life Ribbon</Text>
        <Text style={styles.sub}>
          You stay centered. Time moves. Goals are flags ahead.
          Save/invest to pull them closer; overspend pushes them away.
        </Text>

        <TextInput label="Current age" keyboardType="numeric" value={age} onChangeText={setAge}
          mode="outlined" style={styles.input} outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE} />
        <TextInput label="Monthly income (₹)" keyboardType="numeric" value={income} onChangeText={setIncome}
          mode="outlined" style={styles.input} outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE} />
        <TextInput label="Current savings (₹)" keyboardType="numeric" value={savings} onChangeText={setSavings}
          mode="outlined" style={styles.input} outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE} />
        <TextInput label="Goal amount (₹)" keyboardType="numeric" value={goal} onChangeText={setGoal}
          mode="outlined" style={styles.input} outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE} />
        <TextInput label="Autopilot invest / month (₹)" keyboardType="numeric" value={autopilot} onChangeText={setAutopilot}
          mode="outlined" style={styles.input} outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE} />
        <TextInput label="Usual monthly spend (₹)" keyboardType="numeric" value={spend} onChangeText={setSpend}
          mode="outlined" style={styles.input} outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE} />
        <TextInput label="Life expectancy (years)" keyboardType="numeric" value={expectancy} onChangeText={setExpectancy}
          mode="outlined" style={styles.input} outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE} />

        <Button mode="contained" onPress={save} loading={saving} disabled={saving} style={{ marginTop: 8 }}>
          Save & continue
        </Button>
        <Button mode="text" onPress={() => router.push("/onboarding")} style={{ marginTop: 4 }}>
          Open full onboarding
        </Button>
      </Card.Content>
    </Card>
  );
}

/** Goals Manager — collapsed by default to reduce clutter */
function GoalsManager() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => { (async () => {
    try { const raw = await AsyncStorage.getItem(K.goals); const g = raw ? JSON.parse(raw) : []; setItems(Array.isArray(g)?g:[]); }
    catch { setItems([]); }
  })(); }, []);
  const saveAll = async (next) => { setItems(next); await AsyncStorage.setItem(K.goals, JSON.stringify(next)); };
  const add = async () => {
    const a = Number(amt);
    if (!name.trim() || !a || a <= 0) return;
    const next = [...items, { id: `g_${Date.now()}`, name: name.trim(), amount: a }];
    await saveAll(next); setName(""); setAmt("");
  };
  const remove = async (id) => { await saveAll(items.filter(g => g.id !== id)); };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={{ flexDirection:"row", alignItems:"center" }}>
          <Text style={[styles.h, { flex:1 }]}>Goals</Text>
          <IconButton icon={open ? "chevron-up" : "chevron-down"} size={20} onPress={()=>setOpen(o=>!o)} />
        </View>
        {!open ? (
          <Text style={styles.sub}>
            {items.length ? `${items.length} goal${items.length>1?"s":""} set · tap to edit` : "No goals yet · tap to add"}
          </Text>
        ) : (
          <>
            <Text style={styles.sub}>Add the flags you want to reach. The ribbon reads these live.</Text>
            <TextInput
              label="Goal name"
              value={name} onChangeText={setName}
              mode="outlined" style={styles.input}
              outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE}
            />
            <TextInput
              label="Amount (₹)"
              value={amt} keyboardType="numeric"
              onChangeText={setAmt}
              mode="outlined" style={styles.input}
              outlineStyle={{ borderColor:"#1F2937" }} activeOutlineColor={ORANGE}
            />
            <Button mode="contained" onPress={add} disabled={!name || !amt}>Add goal</Button>

            {items.length ? (
              <View style={{ marginTop: 10 }}>
                {items.map(g => (
                  <Card key={g.id} style={{ backgroundColor:"#0F0F0F", borderWidth:1, borderColor:"#1F2937", marginBottom:8 }}>
                    <Card.Content style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
                      <View>
                        <Text style={{ color:"#FFFFFF", fontWeight:"700" }}>{g.name}</Text>
                        <Text style={{ color:"#9CA3AF" }}>₹ {Number(g.amount||0).toLocaleString()}</Text>
                      </View>
                      <Button mode="text" onPress={() => remove(g.id)}>Remove</Button>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            ) : (
              <Text style={[styles.sub, { marginTop: 6 }]}>No goals yet — add your first one above.</Text>
            )}
          </>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  card: { backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: "#1F2937", marginBottom: 14 },
  h: { color: TEXT, fontWeight: "700" },
  sub: { color: SUBTEXT },
  input: { backgroundColor: "#0B0B0B", color: TEXT, marginTop: 8 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 86, // above the bottom tabs
    backgroundColor: ORANGE,
  },
});
