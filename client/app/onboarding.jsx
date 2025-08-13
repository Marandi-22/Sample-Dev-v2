// client/app/onboarding.jsx
import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, TextInput, Card, Chip, Switch } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOALS = [
  { id: "budget",    label: "Save & Budget",        landing: "/(tabs)/budget" },
  { id: "invest",    label: "Invest & Grow",        landing: "/(tabs)/lessons" },
  { id: "impulse",   label: "Impulse Control",      landing: "/(tabs)/budget" },
  { id: "learn",     label: "Learn & Stay Aware",   landing: "/(tabs)/index" },
  { id: "emergency", label: "Emergency-First",      landing: "/(tabs)/fraud" },
];

const CATEGORIES = [
  "Food & Dining","Transportation","Shopping","Entertainment",
  "Bills & Utilities","Healthcare","Education","Travel"
];

export default function Onboarding() {
  const router = useRouter();
  const [goal, setGoal] = useState("budget");
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    age: "",
    monthlyIncome: "",
    fixedBills: "",
    categories: [],
    savingsPercent: 20,
    investPercent: 10,
    weeklyHabitTarget: 5,
    remindersEnabled: true,
    impulseLevel: 3,
  });

  const update = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const toggleCat = (c) =>
    update("categories",
      profile.categories.includes(c)
        ? profile.categories.filter(x => x !== c)
        : [...profile.categories, c]
    );

  const stepsForGoal = useMemo(() => {
    switch (goal) {
      case "budget":    return [1,2,3,4,5];
      case "invest":    return [1,3,4,5];
      case "impulse":   return [2,4,5];
      case "learn":     return [4,5];
      case "emergency": return [4,5];
      default:          return [1,2,3,4,5];
    }
  }, [goal]);

  const idx = stepsForGoal.indexOf(step);
  const isLast = idx === stepsForGoal.length - 1;

  const next = () => setStep(stepsForGoal[Math.min(idx + 1, stepsForGoal.length - 1)]);
  const back = () => setStep(stepsForGoal[Math.max(idx - 1, 0)]);
  const skipStep = () => next();
  const skipAll = () => finish(true);

  const calc = () => {
    const income = parseFloat(profile.monthlyIncome) || 0;
    const bills = parseFloat(profile.fixedBills) || 0;
    const savePct = parseFloat(profile.savingsPercent) || 0;
    const investPct = parseFloat(profile.investPercent) || 0;
    const savings = income * (savePct / 100);
    const invest = income * (investPct / 100);
    const disposable = Math.max(0, income - bills - savings - invest);
    const riskFactor = goal === "impulse" ? profile.impulseLevel * 0.25 : profile.impulseLevel * 0.2;
    const yearlyLeak = disposable * 12 * riskFactor;
    return { disposable, savings, invest, yearlyLeak, riskFactor };
  };

  const finish = async (skipped = false) => {
    const { disposable, savings, invest, riskFactor } = calc();
    const g = GOALS.find(x => x.id === goal) || GOALS[0];

    const full = {
      ...profile,
      goal,
      landing: g.landing,
      currency: "₹",
      disposable,
      monthlySavings: savings,
      monthlyInvest: invest,
      riskFactor,
      createdAt: new Date().toISOString(),
      version: 3,
      skipped,
    };

    await AsyncStorage.setItem("@fw_profile_v3", JSON.stringify(full));
    await AsyncStorage.setItem("@fw_onboarded_v3", "true");
    router.replace(g.landing);
  };

  const GoalPicker = (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>What do you want most right now?</Text>
        <View style={styles.chips}>
          {GOALS.map(g => (
            <Chip
              key={g.id}
              mode={goal === g.id ? "flat" : "outlined"}
              selected={goal === g.id}
              onPress={() => { setGoal(g.id); setStep(stepsForGoal[0]); }}
              style={styles.chip}
            >
              {g.label}
            </Chip>
          ))}
        </View>
        <Button mode="text" onPress={skipAll} style={{ marginTop: 6 }}>
          Skip all & use defaults
        </Button>
      </Card.Content>
    </Card>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.title}>Basics</Text>
              <TextInput
                label="Age"
                value={profile.age}
                onChangeText={t => update("age", t)}
                keyboardType="numeric"
                inputMode="numeric"
                style={styles.input}
              />
              <TextInput
                label="Monthly Income (₹)"
                value={profile.monthlyIncome}
                onChangeText={t => update("monthlyIncome", t)}
                keyboardType="numeric"
                inputMode="numeric"
                style={styles.input}
              />
              <TextInput
                label="Fixed Bills (₹)"
                value={profile.fixedBills}
                onChangeText={t => update("fixedBills", t)}
                keyboardType="numeric"
                inputMode="numeric"
                style={styles.input}
              />
              <Button mode="text" onPress={skipStep}>Skip this step</Button>
            </Card.Content>
          </Card>
        );

      case 2:
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.title}>Spending Categories</Text>
              <View style={styles.chips}>
                {CATEGORIES.map(c => (
                  <Chip
                    key={c}
                    mode={profile.categories.includes(c) ? "flat" : "outlined"}
                    selected={profile.categories.includes(c)}
                    onPress={() => toggleCat(c)}
                    style={styles.chip}
                  >
                    {c}
                  </Chip>
                ))}
              </View>
              <Button mode="text" onPress={skipStep}>Skip this step</Button>
            </Card.Content>
          </Card>
        );

      case 3:
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.title}>Savings & Investment</Text>
              <Text style={styles.label}>Savings Goal: {profile.savingsPercent}%</Text>
              <Slider
                value={profile.savingsPercent}
                onValueChange={v => update("savingsPercent", Math.round(v))}
                minimumValue={5}
                maximumValue={50}
                step={5}
                style={styles.slider}
              />
              <Text style={[styles.label, { marginTop: 14 }]}>Invest Monthly: {profile.investPercent}%</Text>
              <Slider
                value={profile.investPercent}
                onValueChange={v => update("investPercent", Math.round(v))}
                minimumValue={0}
                maximumValue={40}
                step={5}
                style={styles.slider}
              />
              <Button mode="text" onPress={skipStep}>Skip this step</Button>
            </Card.Content>
          </Card>
        );

      case 4:
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.title}>Preferences & Habits</Text>
              <View style={styles.row}>
                <Text>Enable Reminders</Text>
                <Switch value={profile.remindersEnabled} onValueChange={v => update("remindersEnabled", v)} />
              </View>
              <Text style={[styles.label, { marginTop: 8 }]}>Weekly Habit Target: {profile.weeklyHabitTarget} days</Text>
              <Slider
                value={profile.weeklyHabitTarget}
                onValueChange={v => update("weeklyHabitTarget", Math.round(v))}
                minimumValue={1}
                maximumValue={7}
                step={1}
                style={styles.slider}
              />
              <Text style={[styles.label, { marginTop: 8 }]}>Impulse Control Level: {profile.impulseLevel}/5</Text>
              <Text style={styles.muted}>1 = disciplined · 5 = impulse buyer</Text>
              <Slider
                value={profile.impulseLevel}
                onValueChange={v => update("impulseLevel", Math.round(v))}
                minimumValue={1}
                maximumValue={5}
                step={1}
                style={styles.slider}
              />
              <Button mode="text" onPress={skipStep}>Skip this step</Button>
            </Card.Content>
          </Card>
        );

      case 5:
      default: {
        const { yearlyLeak } = calc();
        const landing = (GOALS.find(g => g.id === goal) || GOALS[0]).landing;
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.title}>Snapshot</Text>
              <Text style={styles.muted}>Potential annual leak (est.): ₹{Math.round(yearlyLeak).toLocaleString()}</Text>
              <Text style={styles.muted}>Goal: {GOALS.find(g => g.id === goal)?.label}</Text>
              <Text style={styles.muted}>First screen after finish: {landing}</Text>
              <Button mode="text" onPress={skipStep}>Skip this step</Button>
            </Card.Content>
          </Card>
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="bodySmall" style={styles.progress}>
          Step {idx + 1} of {stepsForGoal.length}
        </Text>
        {GoalPicker}
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {idx > 0 && (
          <Button mode="outlined" onPress={back} style={{ flex: 1 }}>
            Back
          </Button>
        )}
        <Button
          mode="contained"
          onPress={isLast ? () => finish(false) : next}
          style={{ flex: 2, marginLeft: 10 }}
        >
          {isLast ? "Finish" : "Next"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#000" },
  scroll:{ flexGrow:1, padding:20, paddingBottom:120 },
  progress:{ color:"#9CA3AF", textAlign:"center", marginBottom:12 },
  card:{ backgroundColor:"#111", marginBottom:12 },
  title:{ color:"#fff", marginBottom:8 },
  input:{ backgroundColor:"#0f0f0f", marginBottom:10 },
  label:{ color:"#fff" },
  muted:{ color:"#9CA3AF", marginTop:4 },
  chips:{ flexDirection:"row", flexWrap:"wrap", marginTop:6 },
  chip:{ margin:4 },
  slider:{ marginTop:8 },
  row:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginVertical:8 },
  footer:{ flexDirection:"row", padding:20 },
});
