// client/app/_layout.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Provider as PaperProvider, MD3DarkTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

// -------------------------
// DEV flags
// -------------------------
const DEV_ALWAYS_ONBOARD = true;   // 👈 set to false when you're done iterating
const DEV_FORCE_RESET = false;     // set to true to open /reset once

const AuthContext = createContext(undefined);

function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");   // "loading" | "signedOut" | "signedIn"
  const [onboarded, setOnboarded] = useState(false); // boolean

  useEffect(() => {
    async function checkAuthAndOnboarding() {
      try {
        await new Promise((r) => setTimeout(r, 300)); // simulate auth check
        if (DEV_ALWAYS_ONBOARD) {
          setOnboarded(false);
        } else {
          const onboardedValue = await AsyncStorage.getItem("@fw_onboarded_v3");
          setOnboarded(onboardedValue === "true");
        }
        setStatus("signedIn");
      } catch (e) {
        console.log("Auth check failed:", e);
        setStatus("signedOut");
      }
    }
    checkAuthAndOnboarding();
  }, []);

  return (
    <AuthContext.Provider value={{ status, onboarded }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function Gate() {
  const { status, onboarded } = useAuth();

  // 🔧 Force-open the reset screen (dev only)
  if (DEV_FORCE_RESET) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="reset" />
      </Stack>
    );
  }

  if (status === "loading") {
    return (
      <Stack key="loading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
      </Stack>
    );
  }

  if (status === "signedOut") {
    return (
      <Stack key="signedOut" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    );
  }

  if (status === "signedIn" && !onboarded) {
    return (
      <Stack key="onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
      </Stack>
    );
  }

  return (
    <Stack key="signedIn" screenOptions={{ headerShown: false }}>
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
