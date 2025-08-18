// client/services/api.js
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export const TOKEN_KEY = "@fw_auth_token";
export const ONBOARD_KEY = "@fw_onboarded_v3";

const LOCAL =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://127.0.0.1:5000";

export const API_URL =
  Constants?.expoConfig?.extra?.API_URL ??
  Constants?.manifest?.extra?.API_URL ??
  LOCAL;

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
