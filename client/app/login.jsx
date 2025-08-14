import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, HelperText, Card } from "react-native-paper";
import { useRouter, Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const TOKEN_KEY = "@fw_auth_token";
// NOTE: Do NOT set @fw_onboarded_v3 here. Let onboarding screen write it once.

const API_URL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  "http://127.0.0.1:5000";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.token) {
        throw new Error(
          body?.error === "invalid_credentials"
            ? "Invalid email or password"
            : `Login failed (${body?.error || res.status})`
        );
      }

      await AsyncStorage.setItem(TOKEN_KEY, body.token);
      // 👉 Let Gate decide: if user hasn't onboarded => show onboarding; else => tabs
      router.replace("/");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.root}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              Welcome back
            </Text>
            <Text style={styles.sub}>Sign in to continue</Text>

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
              right={<TextInput.Icon icon={secure ? "eye-off" : "eye"} onPress={() => setSecure((s) => !s)} />}
            />

            {!!err && <HelperText type="error" visible>{err}</HelperText>}

            <Button
              mode="contained"
              onPress={onSubmit}
              loading={loading}
              disabled={loading || !email || !password}
              style={styles.button}
            >
              Login
            </Button>

            <View style={{ height: 12 }} />
            <Link href="/register">
              <Text style={styles.linkText}>New here? Create an account</Text>
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
