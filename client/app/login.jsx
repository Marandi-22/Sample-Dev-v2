import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, Link } from "expo-router";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setErr("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");        // <-- force switch to tabs
    } catch {
      setErr("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.c}>
      <Text variant="headlineMedium">Welcome back</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.i}/>
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.i}/>
      {!!err && <Text style={{color:"red"}}>{err}</Text>}
      <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading}>Login</Button>
      <View style={{height:16}}/>
      <Link href="/register">No account? Register</Link>
    </View>
  );
}
const styles = StyleSheet.create({ c:{flex:1,justifyContent:"center",padding:16}, i:{marginVertical:8} });
