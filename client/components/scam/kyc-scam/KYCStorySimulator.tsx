import React, { useEffect, useState } from 'react';
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

// ---------- Types ----------
interface Choice {
  text: string;
  next?: number; // next scene id
  result?: EndingKey; // jump to ending
}
interface Scene {
  id: number;
  image: ImageSourcePropType; // background image
  textSegments: string[]; // progressive narration/chat
  choices: Choice[]; // shown after last segment
}

type EndingKey = 'success' | 'failure';

// ---------- Assets ----------
const IMG = {
  sms: require('../../../assets/scam/kyc-scam/kyc-scam-sms.png'),
  login: require('../../../assets/scam/kyc-scam/kyc-scam-login.png'),
  otp: require('../../../assets/scam/kyc-scam/kyc-scam-otp.png'),
  success: require('../../../assets/scam/kyc-scam/kyc-scam-success.png'),
  failure: require('../../../assets/scam/kyc-scam/kyc-scam-failure.png'),
};

// ---------- Story ----------
const scenes: Scene[] = [
  {
    id: 1,
    image: IMG.sms,
    textSegments: [
      "SMS • YourBank: URGENT — Your account will be SUSPENDED if KYC isn't updated by midnight.",
      "Link inside: bit.ly/update-kyc-bank",
      "You feel that jolt of panic. Midnight is… soon."
    ],
    choices: [
      { text: 'Tap the link', next: 2 },
      { text: 'Ignore — looks suspicious', result: 'success' },
      { text: 'Call bank via official app', result: 'success' },
    ],
  },
  {
    id: 2,
    image: IMG.login,
    textSegments: [
      "A page that looks exactly like YourBank loads.",
      "It asks for Customer ID and Password to \"update KYC\".",
      "The URL bar is cropped by the site’s banner. Huh."
    ],
    choices: [
      { text: 'Enter credentials', next: 3 },
      { text: 'Inspect URL first', next: 4 },
      { text: 'Back to home / official app', result: 'success' },
    ],
  },
  {
    id: 3,
    image: IMG.otp,
    textSegments: [
      "You submit credentials. Instant redirect to an OTP screen.",
      "Message on phone: •YourBank OTP: 483920. DO NOT SHARE.",
      "The site says: \"Verify to prevent suspension.\" The timer ticks."
    ],
    choices: [
      { text: 'Enter OTP', result: 'failure' },
      { text: 'Cancel — something’s off', result: 'success' },
    ],
  },
  {
    id: 4,
    image: IMG.login,
    textSegments: [
      "You long-press the address bar.",
      "It reveals: update.yourbank-secure.online — not yourbank.com.",
      "Classic look‑alike domain."
    ],
    choices: [
      { text: 'Close page & report phishing', result: 'success' },
      { text: 'Proceed anyway', next: 3 },
    ],
  },
];

const endings: Record<EndingKey, { image: ImageSourcePropType; text: string } > = {
  success: {
    image: IMG.success,
    text: 'Phishing blocked! You kept your data safe. ✅',
  },
  failure: {
    image: IMG.failure,
    text: 'Account compromised. You shared credentials + OTP. ❌',
  },
};

// ---------- Component ----------
export default function KYCStorySimulator({ onExit }: { onExit: () => void }) {
  const [sceneIndex, setSceneIndex] = useState(0); // 0-based for scenes[]
  const [segIndex, setSegIndex] = useState(0); // progressive text index
  const [ending, setEnding] = useState<EndingKey | null>(null);

  const scene = scenes[sceneIndex];
  const segments = scene.textSegments;
  const atChoices = segIndex >= segments.length - 1;

  useEffect(() => {
    setSegIndex(0);
  }, [sceneIndex, ending]);

  // Endings UI
  if (ending) {
    const end = endings[ending];
    return (
      <SafeAreaView style={styles.safeArea}>
        <ImageBackground source={end.image} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay}>
            <Text style={styles.bubble}>{end.text}</Text>
            <TouchableOpacity style={styles.btn} onPress={onExit}>
              <Text style={styles.btnText}>🔙 Back to Safety</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // Story UI
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={scene.image} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.bubble}>{segments[segIndex]}</Text>

          {atChoices ? (
            scene.choices.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={styles.btn}
                onPress={() => {
                  if (c.result) return setEnding(c.result);
                  if (typeof c.next === 'number') {
                    const nextIdx = scenes.findIndex(s => s.id === c.next);
                    if (nextIdx !== -1) setSceneIndex(nextIdx);
                  }
                }}
              >
                <Text style={styles.btnText}>{c.text}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity style={styles.btn} onPress={() => setSegIndex(prev => prev + 1)}>
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'black' },
  bg: {
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
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  btn: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
