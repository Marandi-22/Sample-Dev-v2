// client/services/fraud.js
import axios from 'axios';
import Constants from 'expo-constants';

// ... (API_URL setup is the same) ...
const extra = (Constants.manifest && Constants.manifest.extra) || (Constants.expoConfig && Constants.expoConfig.extra) || {};
const API_URL = extra.API_URL;
if (!API_URL) console.warn("API_URL missing in expo.extra");

const API = axios.create({ baseURL: API_URL, timeout: 15000 }); // Increased timeout for uploads

// Text classification function (Unchanged)
export const classify = (text, scenario) => {
  return API.post('/classify', { text, scenario }).then(response => response.data);
}

// --- NEW: Image classification function ---
/**
 * Uploads an image for OCR and classification.
 * @param {object} imageAsset - The asset object from expo-image-picker.
 * @returns {Promise<object>} - The analysis result from the API.
 */
export const classifyImage = (imageAsset) => {
  // Use FormData to send the file
  const formData = new FormData();

  // The backend expects a file with the key 'image'
  formData.append('image', {
    uri: imageAsset.uri,
    name: `upload_${Date.now()}.jpg`, // A generic name
    type: 'image/jpeg', // Or 'image/png', etc.
  });

  // When sending FormData, Axios needs a specific header
  return API.post('/classify-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => response.data);
}