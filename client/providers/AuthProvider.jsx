import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | signedOut | signedIn
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // fail-safe: never stay in loading > 3.5s
    const watchdog = setTimeout(() => {
      if (!cancelled) setStatus("signedOut");
    }, 3500);

    (async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        if (!t) { if (!cancelled) setStatus("signedOut"); return; }

        const me = await api.get("/auth/me"); // 200 or 401
        if (!cancelled) { setUser(me.data); setStatus("signedIn"); }
      } catch (e) {
        await AsyncStorage.removeItem("token");
        if (!cancelled) setStatus("signedOut");
      } finally {
        clearTimeout(watchdog);
      }
    })();

    return () => { cancelled = true; clearTimeout(watchdog); };
  }, []);

  const signIn = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    await AsyncStorage.setItem("token", data.token);
    setUser(data.user);
    setStatus("signedIn");
  };

  const signUp = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    await AsyncStorage.setItem("token", data.token);
    setUser(data.user);
    setStatus("signedIn");
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setStatus("signedOut");
  };

  return (
    <AuthCtx.Provider value={{ status, user, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
