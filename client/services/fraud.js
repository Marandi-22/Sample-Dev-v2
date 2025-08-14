// client/services/fraud.js
import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const extra =
  (Constants.expoConfig && Constants.expoConfig.extra) ||
  (Constants.manifest && Constants.manifest.extra) ||
  {};
export const API_URL = extra.API_URL || "http://10.0.2.2:5000";

const API = axios.create({ baseURL: API_URL, timeout: 15000 });

// Attach JWT if available (server protects /classify & /classify-image)
API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("@fw_auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Text classification
export const classify = (text, scenario) =>
  API.post("/classify", { text, scenario }).then((r) => r.data);

// Image classification (FormData; let Axios set boundary)
export const classifyImage = (imageAsset) => {
  const formData = new FormData();
  formData.append("image", {
    uri: imageAsset.uri,
    name: `upload_${Date.now()}.jpg`,
    type: "image/jpeg",
  });
  return API.post("/classify-image", formData).then((r) => r.data);
};
