// client/components/scam/upi-scam/UPIStorySimulator.tsx
import React, { useState } from 'react';
import {
  View,
  ImageBackground,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ImageSourcePropType,
} from 'react-native';

interface Choice {
  text: string;
  result: EndingKey;
}
interface Scene {
  id: number;
  image: ImageSourcePropType;
  text: string;
  choices: Choice[] | null;
}

const scenes: Scene[] = [
  {
    id: 1,
    image: require('../../../assets/scam/upi-scam/scene1-room-phone.png'),
    text: "You're a college student. Exams are over, and you're low on cash. You decide to sell your old bike on OLX...",
    choices: null,
  },
  {
    id: 2,
    image: require('../../../assets/scam/upi-scam/scene2-boy-phone.png'),
    text: 'A few minutes later, someone messages you on WhatsApp. They sound serious. Too serious?',
    choices: null,
  },
  {
    id: 3,
    image: require('../../../assets/scam/upi-scam/scene3-buyer-message.png'),
    text: 'Buyer: Hi! I saw your bike listing. Still available?',
    choices: null,
  },
  {
    id: 4,
    image: require('../../../assets/scam/upi-scam/scene3-buyer-message.png'),
    text: "You: Yeah, it's still available.",
    choices: null,
  },
  {
    id: 5,
    image: require('../../../assets/scam/upi-scam/scene3-buyer-message.png'),
    text: 'Buyer: Cool. I’ll pay ₹10,000. Scan this QR to receive.',
    choices: [
      { text: 'Scan the QR code', result: 'scammed' },
      { text: 'Ask for UPI ID instead', result: 'safe' },
    ],
  },
];

const endings = {
  scammed: {
    image: require('../../../assets/scam/upi-scam/scene4a-bad-ending.png'),
    text: 'The money never came. That QR was a collect request. ₹10,000 gone.',
  },
  safe: {
    image: require('../../../assets/scam/upi-scam/scene4b-good-ending.png'),
    text: 'You asked for UPI ID instead. You verified the payment before giving the bike. Scam avoided.',
  },
} as const;

type EndingKey = keyof typeof endings;

export default function UPIStorySimulator({ onExit }: { onExit: () => void }) {
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<EndingKey | null>(null);
  const scene = scenes[step];

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={scene.image} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.bubbleText}>{scene.text}</Text>
          {scene.choices ? (
            scene.choices.map((c, i) => (
              <TouchableOpacity key={i} style={styles.button} onPress={() => setResult(c.result)}>
                <Text style={styles.buttonText}>{c.text}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep((prev) => Math.min(prev + 1, scenes.length - 1))}
            >
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
    padding: 20,
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
