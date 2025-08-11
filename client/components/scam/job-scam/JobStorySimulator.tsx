import React, { useState, useEffect } from 'react';
import {
  View,
  ImageBackground,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';

interface Choice {
  text: string;
  next?: number;
  result?: EndingKey;
}
interface Scene {
  id: number;
  image: ImageSourcePropType;
  textSegments: string[];
  choices: Choice[];
}

type EndingKey = 'success' | 'failure';

// Extended story scenes
const scenes: Scene[] = [
  {
    id: 1,
    image: require('../../../assets/scam/job-scam/job-scam-poster.png'),
    textSegments: [
      "You walk past the campus notice board. Papers flutter in the breeze.",
      "One bright poster stands out: 'Walk-In Hiring Today! Junior QA Tester – ₹30K/month'.",
      "There's a QR code promising instant application."
    ],
    choices: [
      { text: 'Scan QR Code', next: 2 },
      { text: 'Ignore / Report', result: 'success' }
    ],
  },
  {
    id: 2,
    image: require('../../../assets/scam/job-scam/job-scam-application.png'),
    textSegments: [
      "Your phone opens a slick microsite with the BetaTech logo.",
      "It prompts: 'Complete your profile & pay ₹499 to confirm your seat.'",
      "Fields for name, phone number, and Aadhar upload appear."
    ],
    choices: [
      { text: 'Submit & Pay ₹499', result: 'failure' },
      { text: 'Inspect URL', next: 3 },
      { text: 'Cancel Application', result: 'success' }
    ],
  },
  {
    id: 3,
    image: require('../../../assets/scam/job-scam/job-scam-application.png'),
    textSegments: [
      "You tap the address bar. URL reads 'beta-hr-apply.online' – not the official site.",
      "It looks suspicious: missing 'betatech.com'."
    ],
    choices: [
      { text: 'Go back', result: 'success' },
      { text: 'Proceed anyway', next: 4 }
    ],
  },
  {
    id: 4,
    image: require('../../../assets/scam/job-scam/job-scam-application.png'),
    textSegments: [
      "Despite doubts, you fill in your details and click 'Confirm'.",
      "A new prompt asks: 'Enter OTP from your phone to finalize.'"
    ],
    choices: [
      { text: 'Enter OTP', result: 'failure' },
      { text: 'Cancel', result: 'success' }
    ],
  }
];

const endings: Record<EndingKey, { image: ImageSourcePropType; text: string }> = {
  success: {
    image: require('../../../assets/scam/job-scam/job-scam-success.png'),
    text: 'Great call! You avoided the scam and kept your ₹499. ✅',
  },
  failure: {
    image: require('../../../assets/scam/job-scam/job-scam-failure.png'),
    text: 'Oops! The payment went through, no job offer followed. You lost ₹499. ❌',
  },
};

export default function JobStorySimulator({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [result, setResult] = useState<EndingKey | null>(null);
  const scene = scenes[step];

  // Reset segmentIndex when scene changes or result resets
  useEffect(() => {
    setSegmentIndex(0);
  }, [step, result]);

  // Ending state
  if (result) {
    const ending = endings[result];
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground source={ending.image} style={styles.background} resizeMode="cover">
          <View style={styles.overlay}>
            <Text style={styles.bubbleText}>{ending.text}</Text>
            <TouchableOpacity style={styles.button} onPress={onExit}>
              <Text style={styles.buttonText}>🔙 Back to Safety</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // Main story flow
  const segments = scene.textSegments;
  const showChoices = segmentIndex >= segments.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={scene.image} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.bubbleText}>{segments[segmentIndex]}</Text>
          {showChoices ? (
            scene.choices.map((choice, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.button}
                onPress={() => {
                  if (choice.next !== undefined) {
                    setStep(choice.next - 1);
                  } else if (choice.result) {
                    setResult(choice.result);
                  }
                }}
              >
                <Text style={styles.buttonText}>{choice.text}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setSegmentIndex(prev => prev + 1)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'black' },
  background: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bubbleText: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
