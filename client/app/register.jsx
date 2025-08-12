import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useAuth } from "../providers/AuthProvider";
import { useRouter, Link } from "expo-router";

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const onSubmit = async () => {
    setErr("");
    setLoading(true);
    try {
      await signUp(name, email, password);
      router.replace("/(tabs)");        // <-- go to tabs after register
    } catch (e) {
      const code = e?.response?.data?.error;
      setErr(code === "email_in_use" ? "Email already in use" : "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.c}>
      <Text variant="headlineMedium">Create account</Text>
      <TextInput label="Name" value={name} onChangeText={setName} style={styles.i}/>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.i}/>
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.i}/>
      {!!err && <Text style={{color:"red"}}>{err}</Text>}
      <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading}>Register</Button>
      <View style={{height:16}}/>
      <Link href="/login">Have an account? Login</Link>
    </View>
  );
}
const styles = StyleSheet.create({ c:{flex:1,justifyContent:"center",padding:16}, i:{marginVertical:8} });
