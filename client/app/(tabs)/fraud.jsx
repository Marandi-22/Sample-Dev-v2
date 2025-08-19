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
  List,
  ActivityIndicator,
} from "react-native-paper";
// Removed ImagePicker import
import { classify } from "../../services/fraud"; // removed classifyImage

const BG = "#0C0C0C",
  CARD_BG = "#161616",
  TEXT = "#F5F5F5",
  SUBTEXT = "#A1A1AA",
  ACCENT = "#00C8FF", // 🔵 new accent
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
    borderColor = ACCENT; // mid-risk → accent instead of orange
    titleColor = ACCENT;
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
        e?.response?.data?.error || "Could not connect to the server."
      );
    } finally {
      setLoading(false);
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
                activeOutlineColor={ACCENT}   // 🔵 accent
                placeholder="Paste text to analyze…"
                placeholderTextColor={SUBTEXT}
                theme={{ colors: { onSurfaceVariant: SUBTEXT } }}
              />

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleTextClassify}
                  disabled={loading}
                  style={styles.button}
                  buttonColor={ACCENT}        // 🔵 accent
                  textColor="#000"
                  icon="shield-search"
                  labelStyle={{ fontWeight: "bold" }}
                >
                  Analyze Text
                </Button>

                {/* Removed the scan/upload button for now */}
              </View>
            </Card.Content>
          </Card>

          {loading && (
            <ActivityIndicator animating color={ACCENT} style={{ marginTop: 24 }} />
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
});
