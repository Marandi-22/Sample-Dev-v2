// client/app/profile.jsx
import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, TextInput, Switch, Button, Chip } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const readProfile = async () => {
  const raw =
    (await AsyncStorage.getItem("@fw_profile_v3")) ||
    (await AsyncStorage.getItem("@fw_profile_v2")) ||
    (await AsyncStorage.getItem("@fw_profile_v1"));
  return raw ? JSON.parse(raw) : null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const p = await readProfile();
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      if (!profile) return;
      // Always persist to v3 moving forward
      await AsyncStorage.setItem("@fw_profile_v3", JSON.stringify(profile));
      await AsyncStorage.setItem("@fw_onboarded_v3", "true");
      Alert.alert("Saved", "Profile updated.");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to save profile.");
    }
  };

  const rerunOnboarding = async () => {
    await AsyncStorage.multiRemove([
      "@fw_onboarded_v3", "@fw_profile_v3",
      "@fw_onboarded_v2", "@fw_profile_v2",
      "@fw_onboarded_v1", "@fw_profile_v1",
    ]);
    router.replace("/onboarding");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading…</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No profile found.</Text>
        <Button mode="contained" style={{ marginTop: 10 }} onPress={() => router.replace("/onboarding")}>
          Start Onboarding
        </Button>
      </SafeAreaView>
    );
  }

  const currency = profile.currency || "₹";
  const categories = Array.isArray(profile.categories) ? profile.categories : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text variant="headlineLarge" style={styles.title}>Profile</Text>
        <Chip mode="flat" style={{ alignSelf: "flex-start", marginBottom: 8 }}>
          {(profile.goal || "budget").toUpperCase()}
        </Chip>

        {/* Basics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Basics</Text>

            <TextInput
              label="Age"
              value={String(profile.age ?? "")}
              onChangeText={(t) => update("age", t)}
              keyboardType="numeric"
              inputMode="numeric"
              style={styles.input}
            />
            <TextInput
              label={`Monthly Income (${currency})`}
              value={String(profile.monthlyIncome ?? "")}
              onChangeText={(t) => update("monthlyIncome", t)}
              keyboardType="numeric"
              inputMode="numeric"
              style={styles.input}
            />
            <TextInput
              label={`Fixed Bills (${currency})`}
              value={String(profile.fixedBills ?? "")}
              onChangeText={(t) => update("fixedBills", t)}
              keyboardType="numeric"
              inputMode="numeric"
              style={styles.input}
            />
            <TextInput
              label="Savings Goal (%)"
              value={String(profile.savingsPercent ?? 20)}
              onChangeText={(t) => update("savingsPercent", Number(t) || 0)}
              keyboardType="numeric"
              inputMode="numeric"
              style={styles.input}
            />
            {profile.goal === "invest" && (
              <TextInput
                label={`Invest / month (${currency})`}
                value={String(profile.monthlyInvest ?? 0)}
                onChangeText={(t) => update("monthlyInvest", Number(t) || 0)}
                keyboardType="numeric"
                inputMode="numeric"
                style={styles.input}
              />
            )}
            <View style={styles.row}>
              <Text>Enable Reminders</Text>
              <Switch
                value={!!profile.remindersEnabled}
                onValueChange={(v) => update("remindersEnabled", v)}
              />
            </View>

            <Button mode="contained" onPress={save}>
              Save Changes
            </Button>
          </Card.Content>
        </Card>

        {/* Categories */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Categories</Text>
            <View style={styles.chips}>
              {categories.length ? (
                categories.map((c) => (
                  <Chip key={c} style={{ margin: 4 }} mode="flat">
                    {c}
                  </Chip>
                ))
              ) : (
                <Text style={styles.muted}>No categories selected</Text>
              )}
            </View>
            <Button mode="text" onPress={() => router.push("/onboarding")} style={{ marginTop: 6 }}>
              Adjust via Onboarding
            </Button>
          </Card.Content>
        </Card>

        {/* Computed + meta */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>Computed</Text>
            <Text style={styles.muted}>Currency: {currency}</Text>
            <Text style={styles.muted}>
              Created: {new Date(profile.createdAt || Date.now()).toLocaleString()}
            </Text>
          </Card.Content>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.cardDanger}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.labelDanger}>Danger Zone</Text>
            <Button mode="contained" onPress={rerunOnboarding}>
              Rerun Onboarding
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center", padding: 20 },
  title: { color: "#fff", marginBottom: 12 },
  card: { backgroundColor: "#111", marginBottom: 12 },
  cardDanger: { backgroundColor: "#1a0f0f", marginBottom: 12, borderWidth: 1, borderColor: "#5a1f1f" },
  label: { color: "#fff", marginBottom: 8 },
  labelDanger: { color: "#ff6666", marginBottom: 8 },
  input: { backgroundColor: "#0f0f0f", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  muted: { color: "#9CA3AF", marginTop: 4 },
});
