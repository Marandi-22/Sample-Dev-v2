import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Text, TextInput, Button, HelperText, Card } from "react-native-paper";
import { useRouter, Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { API_URL, TOKEN_KEY } from "../services/api";

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
      console.log("[Login] API_URL =", API_URL);
      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      if (!data?.token) throw new Error("No token returned");

      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      // Optional legacy for older code paths:
      // await AsyncStorage.setItem("token", data.token);

      router.replace("/"); // _layout gate will validate
    } catch (e) {
      const msg = e?.response?.data?.error || e.message || "Login failed";
      console.log("[Login] error:", msg, e?.response?.data);
      setErr(msg === "invalid_credentials" ? "Invalid email or password" : String(msg));
      Alert.alert("Login failed", String(setErr));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View style={styles.root}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>Welcome back</Text>
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
              right={<TextInput.Icon icon={secure ? "eye-off" : "eye"} onPress={() => setSecure(s => !s)} />}
            />

            {!!err && <HelperText type="error" visible>{err}</HelperText>}

            <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading || !email || !password} style={styles.button}>
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
  card: { borderRadius: 16, backgroundColor: CARD_BG, borderWidth: 1, borderColor: "#1F2937" },
  title: { color: TEXT, marginBottom: 6, fontWeight: "700" },
  sub: { color: SUBTEXT, marginBottom: 12 },
  input: { backgroundColor: "#0B0B0B", color: TEXT, marginVertical: 8 },
  button: { borderRadius: 10 },
  linkText: { color: ORANGE, textAlign: "center" },
});
