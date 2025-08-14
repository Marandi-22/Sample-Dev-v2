// client/app/_layout.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { Provider as PaperProvider, MD3DarkTheme, ActivityIndicator, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const TOKEN_KEY = "@fw_auth_token";
const ONBOARD_KEY = "@fw_onboarded_v3";

const API_URL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  "http://127.0.0.1:5000";

const AuthContext = createContext(undefined);
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// small helper to avoid fetch hangs on device
async function fetchWithTimeout(url, opts = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | signedOut | signedIn
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const pairs = await AsyncStorage.multiGet([TOKEN_KEY, ONBOARD_KEY]);
        const map = Object.fromEntries(pairs || []);
        const token = map[TOKEN_KEY];
        const ob = map[ONBOARD_KEY];
        setOnboarded(ob === "true");

        // No token -> always go to Login/Register
        if (!token) {
          setStatus("signedOut");
          return;
        }

        // Validate token quickly; if unreachable -> allow in (offline friendly)
        try {
          const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setStatus("signedIn");
          } else {
            await AsyncStorage.removeItem(TOKEN_KEY);
            setStatus("signedOut");
          }
        } catch {
          // offline or server down -> don't block the app
          setStatus("signedIn");
        }
      } catch {
        setStatus("signedOut");
      }
    })();
  }, []);

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setStatus("signedOut");
  };

  const value = { status, onboarded, setOnboarded, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function Gate() {
  const { status, onboarded } = useAuth();

  if (status === "loading") {
    // Inline loader: no external splash route needed
    return (
      <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ color: "#9CA3AF", marginTop: 8 }}>Starting…</Text>
      </View>
    );
  }

  if (status === "signedOut") {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    );
  }

  if (!onboarded) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#FF9900",
    background: "#000000",
    surface: "#111111",
    onSurface: "#FFFFFF",
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={darkTheme}>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </PaperProvider>
  );
}
