import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import AuthProvider, { useAuth } from "../providers/AuthProvider";

function Gate() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (status !== "signedIn") {
    // show auth stack
    return (
      <Stack screenOptions={{ headerShown:false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    );
  }

  // signed in -> show the tabs group
  return (
    <Stack screenOptions={{ headerShown:false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />  {/* opened from header icon */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </PaperProvider>
  );
}
