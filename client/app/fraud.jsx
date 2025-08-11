// client/app/fraud.jsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  View,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  TextInput,
  Chip,
  Divider,
  List,
  ActivityIndicator,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { classify, fetchHistory } from '../services/fraud';

const SCENARIOS = [
  {
    id: 'phishing',
    title: 'Phishing Email',
    example: 'Your bank account is at risk. Verify now: http://fakebank-login.com',
  },
  {
    id: 'otp',
    title: 'OTP Request Scam',
    example: 'We blocked a transaction. Send your OTP immediately to secure your funds.',
  },
  {
    id: 'social',
    title: 'Social Engineering',
    example: 'Hi, I’m from IT support. Please share your password so I can fix your account.',
  },
];

const BG = '#000';
const CARD_BG = '#0E0E0E';
const TEXT = '#F5F5F5';
const SUBTEXT = '#9CA3AF';
const ORANGE = '#FF9900';

export default function Fraud() {
  const [scenario, setScenario] = useState('phishing');
  const [input, setInput] = useState(SCENARIOS[0].example);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load history on mount & when scenario changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchHistory(scenario);
        if (!cancelled) {
          setHistory(data);
          await AsyncStorage.setItem(`history_${scenario}`, JSON.stringify(data));
        }
      } catch {
        const json = await AsyncStorage.getItem(`history_${scenario}`);
        setHistory(json ? JSON.parse(json) : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [scenario]);

  const handleClassify = async (text) => {
    if (!text.trim()) {
      Alert.alert('Empty', 'Please paste suspicious text or a URL first.');
      return;
    }
    setLoading(true);
    try {
      const rec = await classify(text, scenario);
      setResult(rec);
      setHistory((h) => {
        const updated = [rec, ...h];
        AsyncStorage.setItem(`history_${scenario}`, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Error calling fraud API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 96, paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text variant="headlineMedium" style={styles.header}>
            Fraud Scanner
          </Text>

          {/* Scenario quick picks (kept minimal; helpful presets) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scenarioList}
          >
            {SCENARIOS.map((item) => (
              <Chip
                key={item.id}
                mode="outlined"
                selected={item.id === scenario}
                selectedColor={ORANGE}
                style={[
                  styles.chip,
                  item.id === scenario && { borderColor: ORANGE },
                ]}
                onPress={() => {
                  setScenario(item.id);
                  setInput(item.example);
                }}
              >
                {item.title}
              </Chip>
            ))}
          </ScrollView>

          {/* Chat-like classify box */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.label}>Paste suspicious text / URL</Text>
              <TextInput
                mode="outlined"
                value={input}
                onChangeText={setInput}
                multiline
                style={styles.input}
                outlineStyle={{ borderColor: '#1F2937' }}
                placeholder="e.g., 'Verify your KYC: http://bit.ly/xyz'"
                placeholderTextColor={SUBTEXT}
              />
              <Button
                mode="contained"
                onPress={() => handleClassify(input)}
                disabled={loading}
                style={styles.button}
                buttonColor={ORANGE}
                textColor="#111"
                icon="shield-search"
              >
                {loading ? 'Analyzing…' : 'Analyze'}
              </Button>
            </Card.Content>
          </Card>

          {/* Loading */}
          {loading && <ActivityIndicator animating style={{ marginVertical: 8 }} />}

          {/* Result */}
          {result && (
            <Card style={styles.card}>
              <Card.Title
                titleStyle={{ color: TEXT }}
                subtitleStyle={{ color: SUBTEXT }}
                title={`Label: ${String(result.label || '').toUpperCase()}`}
                subtitle={`Confidence: ${((result.score || 0) * 100).toFixed(1)}%`}
              />
              <Card.Content>
                <Text style={{ color: TEXT }}>
                  {result.explanation || 'No explanation provided.'}
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* History */}
          <Text variant="titleMedium" style={styles.historyTitle}>
            History
          </Text>
          {history?.length ? (
            history.map((item, i) => (
              <List.Item
                key={`${i}-${item.text?.slice(0,10)}`}
                titleNumberOfLines={1}
                descriptionNumberOfLines={1}
                titleStyle={{ color: TEXT }}
                descriptionStyle={{ color: SUBTEXT }}
                style={styles.historyItem}
                title={item.text}
                description={`→ ${String(item.label || '').toUpperCase()} @ ${((item.score || 0) * 100).toFixed(1)}%`}
                left={(props) => (
                  <List.Icon
                    {...props}
                    color={item.label === 'phish' ? ORANGE : '#22C55E'}
                    icon={item.label === 'phish' ? 'alert-circle-outline' : 'check-circle-outline'}
                  />
                )}
              />
            ))
          ) : (
            <Text style={{ color: SUBTEXT, textAlign: 'center', marginTop: 8 }}>
              No history yet.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  wrap: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },

  header: {
    color: TEXT,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '800',
  },

  scenarioList: { paddingHorizontal: 4, paddingBottom: 4 },
  chip: {
    marginHorizontal: 6,
    backgroundColor: BG,
    borderColor: '#1F2937',
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },

  label: { color: SUBTEXT, marginBottom: 8, fontWeight: '600' },

  input: {
    backgroundColor: '#0B0B0B',
    color: TEXT,
    minHeight: 90,
    marginBottom: 12,
  },

  button: {
    alignSelf: 'flex-start',
    borderRadius: 10,
  },

  historyTitle: {
    color: TEXT,
    marginTop: 4,
    marginBottom: 6,
    fontWeight: '700',
  },

  historyItem: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    marginBottom: 8,
  },
});
