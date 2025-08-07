// client/services/fraud.js
import axios from 'axios';
import Constants from 'expo-constants';

const extra =
  (Constants.manifest && Constants.manifest.extra) ||
  (Constants.expoConfig && Constants.expoConfig.extra) ||
  {};

const API_URL = extra.API_URL;
if (!API_URL) console.warn("API_URL missing in expo.extra");

const API = axios.create({ baseURL: API_URL, timeout: 5000 });

export const classify = (text, scenario) =>
  API.post('/classify', { text, scenario }).then(r => r.data);

export const fetchHistory = (scenario) =>
  API.get('/history', { params: { scenario } }).then(r => r.data);
