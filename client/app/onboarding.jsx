// client/app/onboarding.jsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const BG = "#000000", CARD_BG="#111111", TEXT="#FFFFFF", SUBTEXT="#9CA3AF", ORANGE="#FF9900";
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

export default function Onboarding() {
  const router = useRouter();
  const [age, setAge] = useState("20");
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [goal, setGoal] = useState("");
  const [autopilot, setAutopilot] = useState("5000");
  const [spend, setSpend] = useState("0");
  const [expectancy, setExpectancy] = useState("80");
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
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
  })(); }, []);

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
      // seed first goal if needed
      try {
        const raw = await AsyncStorage.getItem(K.goals);
        const arr = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(arr) || arr.length === 0) {
          const seed = [{ id:`g_${Date.now()}`, name:"Primary Goal", amount: Number(goal||0) }];
          await AsyncStorage.setItem(K.goals, JSON.stringify(seed));
        }
      } catch {}
      router.replace("/(tabs)");
    } finally { setSaving(false); }
  };

  return (
    <View style={s.wrap}>
      <Card style={s.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={s.title}>Set your Life Ribbon</Text>
          <Text style={s.sub}>
            You stay centered. Time moves. Goals are flags ahead.
            Save/invest to pull them closer; overspend pushes them away.
          </Text>

          <TextInput label="Current age" keyboardType="numeric" value={age} onChangeText={setAge} mode="outlined" style={s.i} outlineStyle={{borderColor:"#1F2937"}} activeOutlineColor={ORANGE}/>
          <TextInput label="Monthly income (₹)" keyboardType="numeric" value={income} onChangeText={setIncome} mode="outlined" style={s.i} outlineStyle={{borderColor:"#1F2937"}} activeOutlineColor={ORANGE}/>
          <TextInput label="Current savings (₹)" keyboardType="numeric" value={savings} onChangeText={setSavings} mode="outlined" style={s.i} outlineStyle={{borderColor:"#1F2937"}} activeOutlineColor={ORANGE}/>
          <TextInput label="Goal amount (₹)" keyboardType="numeric" value={goal} onChangeText={setGoal} mode="outlined" style={s.i} outlineStyle={{borderColor:"#1F2937"}} activeOutlineColor={ORANGE}/>
          <TextInput label="Autopilot invest / month (₹)" keyboardType="numeric" value={autopilot} onChangeText={setAutopilot} mode="outlined" style={s.i} outlineStyle={{borderColor:"#1F2937"}} activeOutlineColor={ORANGE}/>
          <TextInput label="Usual monthly spend (₹)" keyboardType="numeric" value={spend} onChangeText={setSpend} mode="outlined" style={s.i} outlineStyle={{borderColor:"#1F2937"}} activeOutlineColor={ORANGE}/>
          <TextInput label="Life expectancy (years)" keyboardType="numeric" value={expectancy} onChangeText={setExpectancy} mode="outlined" style={s.i} outlineStyle={{borderColor:"#1F2937"}} activeOutlineColor={ORANGE}/>

          <Button mode="contained" onPress={save} loading={saving} disabled={saving} style={{ marginTop: 8 }}>
            Save
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: BG, padding: 16, justifyContent: "center" },
  card: { backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: "#1F2937" },
  title: { color: TEXT, fontWeight: "800", marginBottom: 6 },
  sub: { color: SUBTEXT, marginBottom: 10 },
  i: { backgroundColor: "#0B0B0B", color: TEXT, marginVertical: 6 },
});
