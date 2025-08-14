// client/app/(tabs)/fraud.jsx
import React, { useState } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Button,
  Card,
  TextInput,
  Chip,
  List,
  ActivityIndicator,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { classify, classifyImage } from "../../services/fraud";

const BG = "#0C0C0C",
  CARD_BG = "#161616",
  TEXT = "#F5F5F5",
  SUBTEXT = "#A1A1AA",
  ORANGE = "#F97316",
  RED = "#EF4444",
  GREEN = "#22C55E",
  BORDER = "#27272A";

const ResultCard = ({ result }) => {
  if (!result) return null;

  let borderColor = BORDER;
  let titleColor = TEXT;
  let icon = "shield-check";

  if (result.score >= 0.7) {
    borderColor = RED;
    titleColor = RED;
    icon = "alert-octagon";
  } else if (result.score >= 0.4) {
    borderColor = ORANGE;
    titleColor = ORANGE;
    icon = "alert";
  } else {
    borderColor = GREEN;
    titleColor = GREEN;
    icon = "shield-check";
  }

  return (
    <Card style={[styles.card, { marginTop: 24, borderColor, borderWidth: 2 }]}>
      <Card.Title
        title="Analysis Result"
        titleStyle={{ color: titleColor, fontWeight: "bold" }}
        left={(props) => <List.Icon {...props} icon={icon} color={titleColor} />}
      />
      <Card.Content>
        <Text style={{ color: TEXT, marginBottom: 8 }}>
          {result.explanation}
        </Text>
        {result.text ? (
          <Text style={{ color: SUBTEXT, fontStyle: "italic", marginTop: 8 }}>
            Detected Text: "{result.text}"
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );
};

export default function FraudScannerScreen() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTextClassify = async () => {
    console.log(`Analyzing text: "${input}"`);
    if (!input.trim()) {
      Alert.alert("Empty", "Paste suspicious text or a URL first.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resultData = await classify(input, "phishing");
      setResult(resultData);
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Analysis Failed",
        e.response?.data?.error || "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageClassify = async () => {
    console.log("--- UPLOAD PROCESS STARTED ---");
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Allow access to your photos to upload a screenshot."
      );
      return;
    }

    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (pickerResult.canceled) return;

      if (pickerResult.assets && pickerResult.assets.length > 0) {
        const imageAsset = pickerResult.assets[0];
        setLoading(true);
        setResult(null);
        setInput("");
        try {
          const resultData = await classifyImage(imageAsset);
          setResult(resultData);
          if (resultData?.text) setInput(resultData.text);
        } catch (e) {
          console.error("Image classify error:", e);
          Alert.alert(
            "Analysis Failed",
            e.response?.data?.error || "Could not process the image."
          );
        } finally {
          setLoading(false);
        }
      } else {
        Alert.alert(
          "Image Not Selected",
          "No image asset was returned. Please try again."
        );
      }
    } catch (pickerError) {
      console.error("Picker error:", pickerError);
      Alert.alert(
        "Error",
        "Could not open the gallery. Try restarting the app."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="headlineMedium" style={styles.header}>
            Fraud Scanner
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Paste text / URL"
                mode="outlined"
                value={input}
                onChangeText={setInput}
                multiline
                style={styles.input}
                outlineStyle={{ borderColor: BORDER, borderRadius: 12 }}
                activeOutlineColor={ORANGE}
                placeholder="Paste text or upload a screenshot..."
                placeholderTextColor={SUBTEXT}
                theme={{ colors: { onSurfaceVariant: SUBTEXT } }}
              />
              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleTextClassify}
                  disabled={loading}
                  style={styles.button}
                  buttonColor={ORANGE}
                  textColor="#000"
                  icon="shield-search"
                  labelStyle={{ fontWeight: "bold" }}
                >
                  Analyze Text
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleImageClassify}
                  disabled={loading}
                  style={[styles.button, styles.uploadButton]}
                  textColor={ORANGE}
                  icon="image-search"
                  labelStyle={{ fontWeight: "bold" }}
                >
                  Upload
                </Button>
              </View>
            </Card.Content>
          </Card>

          {loading && (
            <ActivityIndicator animating color={ORANGE} style={{ marginTop: 24 }} />
          )}
          {result && <ResultCard result={result} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    color: TEXT,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 16,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  input: {
    backgroundColor: "#0C0C0C",
    minHeight: 100,
    marginBottom: 12,
    color: TEXT,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: { borderRadius: 12, paddingVertical: 4, flex: 1, marginHorizontal: 4 },
  uploadButton: { borderColor: ORANGE },
});
