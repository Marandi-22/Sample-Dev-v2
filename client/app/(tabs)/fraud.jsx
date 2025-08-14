// client/app/fraud.jsx
import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card, TextInput, Chip, List, ActivityIndicator } from 'react-native-paper';

import * as ImagePicker from 'expo-image-picker';
import { classify, classifyImage } from '../../services/fraud';

const SCENARIOS = [ { id: 'phishing', title: 'Phishing', example: 'Your bank account is at risk...' } ];
const BG = '#0C0C0C', CARD_BG = '#161616', TEXT = '#F5F5F5', SUBTEXT = '#A1A1AA', ORANGE = '#F97316', RED = '#EF4444', GREEN = '#22C55E', BORDER = '#27272A';

// --- NEW UPGRADED RESULT CARD with Dynamic Colors ---
const ResultCard = ({ result }) => {
    if (!result) return null;

    let borderColor = BORDER;
    let titleColor = TEXT;
    let icon = "shield-check";

    // Determine colors and icon based on the fraud score
    if (result.score >= 0.7) { // High Risk
        borderColor = RED;
        titleColor = RED;
        icon = "alert-octagon";
    } else if (result.score >= 0.4) { // Medium Risk
        borderColor = ORANGE;
        titleColor = ORANGE;
        icon = "alert";
    } else { // Safe
        borderColor = GREEN;
        titleColor = GREEN;
        icon = "shield-check";
    }

    return (
        <Card style={[styles.card, { marginTop: 24, borderColor: borderColor, borderWidth: 2 }]}>
            <Card.Title
                title="Analysis Result"
                titleStyle={{ color: titleColor, fontWeight: 'bold' }}
                left={(props) => <List.Icon {...props} icon={icon} color={titleColor} />}
            />
            <Card.Content>
                <Text style={{ color: TEXT, marginBottom: 8 }}>{result.explanation}</Text>
                {result.text && <Text style={{ color: SUBTEXT, fontStyle: 'italic', marginTop: 8 }}>Detected Text: "{result.text}"</Text>}
            </Card.Content>
        </Card>
    );
};
// --------------------------------------------------------------------

export default function FraudScannerScreen() {
    const [scenario, setScenario] = useState('phishing');
    const [input, setInput] = useState(''); // Start with an empty input
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTextClassify = async () => {
        console.log(`Analyzing text: "${input}"`);
        if (!input.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const resultData = await classify(input, scenario);
            setResult(resultData);
        } catch (e) {
            Alert.alert('Analysis Failed', e.response?.data?.error || 'Could not connect to the server.');
        } finally { setLoading(false); }
    };

    // --- FINAL VERSION of the image handler with full debugging ---
    // client/app/fraud.jsx

  // --- FINAL CORRECTED VERSION of the image handler ---
  const handleImageClassify = async () => {
    console.log('--- UPLOAD PROCESS STARTED ---');
    console.log('Step 1: Requesting media library permissions...');
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
        console.log('Step 1 FAILED: Permission denied.');
        Alert.alert("Permission Required", "You need to allow access to your photos to upload a screenshot.");
        return;
    }
    console.log('Step 1 SUCCESS: Permissions granted.');

    console.log('Step 2: Launching image picker...');
    try {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            // THIS IS THE CORRECTED LINE:
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            quality: 0.7,
        });
        console.log('Step 2 SUCCESS: Picker returned a result:', pickerResult);

        if (pickerResult.canceled) {
            console.log('Step 3: User cancelled the picker.');
            return;
        }

        if (pickerResult.assets && pickerResult.assets.length > 0) {
            const imageAsset = pickerResult.assets[0];
            console.log('Step 3: Image asset selected:', imageAsset.uri);
            setLoading(true);
            setResult(null);
            setInput('');
            try {
                console.log('Step 4: Calling classifyImage service...');
                const resultData = await classifyImage(imageAsset);
                console.log('Step 4 SUCCESS: Analysis complete.', resultData);
                setResult(resultData);
                setInput(resultData.text);
            } catch (e) {
                console.error('Step 4 FAILED: An error occurred during image classification:', e);
                Alert.alert('Analysis Failed', e.response?.data?.error || 'Could not process the image.');
            } finally {
                setLoading(false);
            }
        } else {
            console.log('Step 3 FAILED: No image asset was returned by the picker.');
            Alert.alert('Image Not Selected', 'Could not get the selected image. Please try again.');
        }
    } catch (pickerError) {
        console.error('Step 2 FAILED: The image picker itself threw an error:', pickerError);
        Alert.alert('Error', 'Could not open the image gallery. Please try restarting the app.');
    }
};
    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
              <Text variant="headlineMedium" style={styles.header}>Fraud Scanner</Text>
              <Card style={styles.card}>
                <Card.Content>
                  <TextInput
                    mode="outlined" value={input} onChangeText={setInput} multiline
                    style={styles.input} outlineStyle={{ borderColor: BORDER, borderRadius: 12 }}
                    activeOutlineColor={ORANGE} placeholder="Paste text or upload a screenshot..."
                    placeholderTextColor={SUBTEXT} theme={{ colors: { onSurfaceVariant: SUBTEXT } }}
                  />
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="contained" onPress={handleTextClassify} disabled={loading} style={styles.button}
                      buttonColor={ORANGE} textColor="#000" icon="shield-search"
                      labelStyle={{ fontWeight: 'bold' }}
                    >
                      Analyze Text
                    </Button>
                    <Button
                      mode="outlined" onPress={handleImageClassify} disabled={loading} style={[styles.button, styles.uploadButton]}
                      textColor={ORANGE} icon="image-search"
                      labelStyle={{ fontWeight: 'bold' }}
                    >
                      Upload
                    </Button>
                  </View>
                </Card.Content>
              </Card>
    
              {loading && <ActivityIndicator animating color={ORANGE} style={{ marginVertical: 24 }} />}
              {result && <ResultCard result={result} />}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      );
    }
    
    // Styles are unchanged
    const styles = StyleSheet.create({
      safe: { flex: 1, backgroundColor: BG },
      header: { color: TEXT, fontWeight: '800', textAlign: 'center', marginVertical: 16 },
      card: { backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER },
      input: { backgroundColor: '#0C0C0C', minHeight: 100, marginBottom: 12, color: TEXT },
      buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      button: { borderRadius: 12, paddingVertical: 4, flex: 1, marginHorizontal: 4 },
      uploadButton: { borderColor: ORANGE },
    });