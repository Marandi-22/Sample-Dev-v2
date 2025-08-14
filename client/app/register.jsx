import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, HelperText, Card } from "react-native-paper";
import { useRouter, Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const TOKEN_KEY = "@fw_auth_token";
// NOTE: Do NOT set @fw_onboarded_v3 here. Let onboarding screen write it after completion.

const API_URL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  "http://127.0.0.1:5000";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setErr("");
    setLoading(true);
    try {
      if (!name.trim() || !email.trim() || !password) {
        throw new Error("Please fill all fields");
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.token) {
        const msg =
          body?.error === "email_in_use"
            ? "Email already in use"
            : `Registration failed (${body?.error || res.status})`;
        throw new Error(msg);
      }

      // Save JWT so authenticated endpoints work immediately
      await AsyncStorage.setItem(TOKEN_KEY, body.token);

      // Let Gate decide next screen:
      // - New user without @fw_onboarded_v3 -> shows Onboarding once
      // - If flag already set (dev), goes straight to tabs
      router.replace("/");
    } catch (e) {
      setErr(e.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.root}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>Create account</Text>
            <Text style={styles.sub}>Join FinWise — stay scam-safe</Text>

            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              outlineStyle={{ borderColor: "#1F2937" }}
              activeOutlineColor="#FF9900"
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
              outlineStyle={{ borderColor: "#1F2937" }}
              activeOutlineColor="#FF9900"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
              mode="outlined"
              style={styles.input}
              outlineStyle={{ borderColor: "#1F2937" }}
              activeOutlineColor="#FF9900"
              right={<TextInput.Icon icon={secure ? "eye-off" : "eye"} onPress={() => setSecure(s => !s)} />}
            />

            {!!err && <HelperText type="error" visible>{err}</HelperText>}

            <Button
              mode="contained"
              onPress={onSubmit}
              loading={loading}
              disabled={loading || !name || !email || !password}
              style={styles.button}
            >
              Register
            </Button>

            <View style={{ height: 12 }} />
            <Link href="/login">
              <Text style={styles.linkText}>Have an account? Login</Text>
            </Link>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const BG = "#000000";
const CARD_BG = "#111111";
const TEXT = "#FFFFFF";
const SUBTEXT = "#9CA3AF";
const ORANGE = "#FF9900";

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: BG },
  card: {
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  title: { color: TEXT, marginBottom: 6, fontWeight: "700" },
  sub: { color: SUBTEXT, marginBottom: 12 },
  input: {
    backgroundColor: "#0B0B0B",
    color: TEXT,
    marginVertical: 8,
  },
  button: { borderRadius: 10 },
  linkText: { color: ORANGE, textAlign: "center" },
});
