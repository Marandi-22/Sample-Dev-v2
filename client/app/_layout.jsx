// client/app/_layout.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL, TOKEN_KEY, ONBOARD_KEY } from "../services/api";
import { WalletProvider } from "../context/WalletContext";

/* ---------------- Auth ---------------- */
const AuthContext = createContext(undefined);
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 5000) {
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
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const pairs = await AsyncStorage.multiGet([TOKEN_KEY, ONBOARD_KEY]);
        const map = Object.fromEntries(pairs || []);
        const token = map[TOKEN_KEY];
        const ob = map[ONBOARD_KEY];
        setOnboarded(ob === "true");

        if (!token) {
          setStatus("signedOut");
          return;
        }

        try {
          // Validate token; if network fails, allow offline entry
          const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!mounted.current) return;

          if (res?.ok) {
            setStatus("signedIn");
          } else {
            console.log("[Gate] /auth/me not ok -> signing out");
            await AsyncStorage.removeItem(TOKEN_KEY);
            setStatus("signedOut");
          }
        } catch (e) {
          console.log("[Gate] /auth/me failed (offline? timeout?):", e?.name || e?.message);
          if (!mounted.current) return;
          // Allow offline usage if a token exists
          setStatus("signedIn");
        }
      } catch (e) {
        console.log("[Gate] init failed:", e?.message);
        if (!mounted.current) return;
        setStatus("signedOut");
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, []);

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setStatus("signedOut");
  };

  return (
    <AuthContext.Provider value={{ status, onboarded, setOnboarded, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/* --------------- Gate --------------- */
function Gate() {
  const { status, onboarded } = useAuth();

  if (status === "loading") {
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

/* --------------- Theme --------------- */
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#00C8FF",
    background: "#000000",
    surface: "#111111",
    onSurface: "#FFFFFF",
  },
};

/* ------------- Root layout ------------ */
export default function RootLayout() {
  return (
    <PaperProvider theme={darkTheme}>
      <WalletProvider>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </WalletProvider>
    </PaperProvider>
  );
}
