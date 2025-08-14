// client/components/quiz/KBCQuiz.jsx
// Landscape full-screen KBC with orientation lock, fixed ladder, smooth bottom sheet.
// deps: expo-screen-orientation, expo-linear-gradient

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  Chip,
  IconButton,
  ProgressBar,
  Button,
  useTheme,
  Portal,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";

const STORAGE_KEY = "@kbc_quiz_land_v1";

// ---- Demo questions (edit/extend)
const BANK = [
  {
    q: "A stranger sends you a QR to 'receive' ₹500. If you scan and enter your UPI PIN, what happens?",
    choices: ["You receive ₹500", "Nothing happens", "You pay the stranger", "UPI blocks it"],
    answer: 2,
    hint: "UPI PIN authorizes a debit from YOUR account.",
  },
  {
    q: "Official bank KYC links usually belong to…",
    choices: ["Shortened URLs", "Random subdomains", "Bank’s verified domain", "WhatsApp media links"],
    answer: 2,
    hint: "Check the root domain (e.g., bankname.com).",
  },
  {
    q: "Recruiter wants a 'refundable training fee'. You should…",
    choices: ["Pay quickly", "Request UPI collect", "Verify offer & employer first", "Send PAN & Aadhaar"],
    answer: 2,
    hint: "Never pay to get a job; verify employer first.",
  },
  {
    q: "‘Support agent’ asks to install AnyDesk to fix KYC. This is…",
    choices: ["Normal support", "Risky but okay", "Remote access scam", "Bank-required"],
    answer: 2,
    hint: "Banks don’t ask for remote control.",
  },
  {
    q: "Lottery SMS says you won ₹10L; asks a ‘processing fee’. Best move?",
    choices: ["Pay and hope", "Share OTP to confirm", "Ignore / report as scam", "Call back from your phone"],
    answer: 2,
    hint: "Upfront fee for prize = scam.",
  },
];

const LADDER = [
  "₹1,000","₹2,000","₹3,000","₹5,000","₹10,000",
  "₹20,000","₹40,000","₹80,000","₹1,60,000","₹3,20,000"
];
const MILESTONES = new Set([4, 9]); // after Q5/Q10

export default function KBCQuiz({ onExit }) {
  const theme = useTheme();
  const ACCENT = theme?.colors?.primary || "#FF9900";
  const TEXT = theme?.colors?.onSurface || "#F3F4F6";

  // state
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState(null);
  const [seconds, setSeconds] = useState(45);
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [audienceUsed, setAudienceUsed] = useState(false);
  const [phoneUsed, setPhoneUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [audiencePoll, setAudiencePoll] = useState(null);
  const [bestSafe, setBestSafe] = useState(0);

  // sheet animations
  const resultOpen = useRef(false);
  const resultY = useRef(new Animated.Value(400)).current;  // bottom sheet
  const dimOpacity = useRef(new Animated.Value(0)).current; // backdrop
  const timerRef = useRef(null);

  const q = BANK[idx];
  const correctIdx = q?.answer ?? null;

  // ---- lock to LANDSCAPE on mount; restore PORTRAIT on unmount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } catch {}
    })();
    return () => {
      if (!active) return;
      (async () => {
        try {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
        } catch {}
      })();
    };
  }, []);

  // ---- restore/persist progress
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (typeof s.idx === "number") setIdx(Math.min(s.idx, BANK.length - 1));
          if (typeof s.bestSafe === "number") setBestSafe(s.bestSafe);
        }
      } catch {}
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ idx, bestSafe }));
      } catch {}
    })();
  }, [idx, bestSafe]);

  // ---- back button: close sheet > exit quiz
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (resultOpen.current) { closeResult(); return true; }
      onExit?.();
      return true;
    });
    return () => sub.remove();
  }, [onExit]);

  // ---- setup per-question
  useEffect(() => {
    setLocked(false);
    setPicked(null);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setSeconds(45);
  }, [idx]);

  // ---- timer
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          if (picked === null) handlePick(-1); // timeout
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, picked]);

  const prizeNow = LADDER[Math.min(idx, LADDER.length - 1)];
  const safePrize = bestSafe > 0 ? LADDER[bestSafe - 1] : "₹0";

  // ---- lifelines
  const use5050 = () => {
    if (fiftyUsed || locked) return;
    const wrongs = [0,1,2,3].filter(i => i !== correctIdx);
    shuffleInPlace(wrongs);
    setHiddenOptions([wrongs[0], wrongs[1]]);
    setFiftyUsed(true);
  };
  const useAudience = () => {
    if (audienceUsed || locked) return;
    setAudiencePoll(calcAudiencePoll(correctIdx));
    setAudienceUsed(true);
  };
  const usePhone = () => {
    if (phoneUsed || locked) return;
    setAudiencePoll({ hintOnly: true, text: `“${q?.hint || "Think first principles."}”` });
    setPhoneUsed(true);
  };

  // ---- answer flow (smooth)
  const handlePick = (i) => {
    if (locked) return;
    setPicked(i);
    setLocked(true);
    const ok = i === correctIdx;
    if (ok && MILESTONES.has(idx)) setBestSafe(idx + 1);
    setTimeout(() => openResult(ok), 500);
  };

  // ---- result sheet
  const openResult = () => {
    resultOpen.current = true;
    Animated.parallel([
      Animated.timing(resultY, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(dimOpacity, { toValue: 0.35, duration: 240, useNativeDriver: true }),
    ]).start();
  };
  const closeResult = () => {
    resultOpen.current = false;
    Animated.parallel([
      Animated.timing(resultY, { toValue: 400, duration: 220, useNativeDriver: true }),
      Animated.timing(dimOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const goNextOrEnd = () => {
    closeResult();
    if (idx === BANK.length - 1 || picked !== correctIdx) return;
    setIdx((v) => v + 1);
  };

  const resetGame = () => {
    closeResult();
    setIdx(0);
    setBestSafe(0);
    setFiftyUsed(false);
    setAudienceUsed(false);
    setPhoneUsed(false);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setPicked(null);
    setLocked(false);
    setSeconds(45);
  };

  const canShow = (i) => !hiddenOptions.includes(i);

  return (
    <View style={{ flex: 1 }}>
      {/* Fullscreen animated neon background */}
      <NeonBG />

      <SafeAreaView style={styles.root} edges={["left","right","top"]}>
        {/* LANDSCAPE GRID: Left = game, Right = ladder */}
        <View style={styles.row}>
          {/* LEFT PANEL */}
          <View style={styles.left}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <IconButton icon="close" onPress={onExit} />
              <View style={{ flex: 1, paddingHorizontal: 8 }}>
                <ProgressBar progress={seconds/45} color={ACCENT} />
                <Text style={{ opacity: 0.7, marginTop: 2 }}>{seconds}s</Text>
              </View>
              <Chip style={styles.prizeChip} textStyle={{ color: TEXT }}>{prizeNow}</Chip>
            </View>

            {/* Question card (takes small space) */}
            <Card style={styles.question}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.qText}>{q?.q}</Text>
              </Card.Content>
            </Card>

            {/* Options grid (2x2; flexible height) */}
            <View style={styles.optionsGrid}>
              {[0,1,2,3].map((i) => {
                if (!canShow(i)) return <View key={i} style={styles.optCell} />;
                const isPicked = picked === i;
                const isCorrect = locked && i === correctIdx;
                const bg = isCorrect
                  ? "rgba(34,197,94,0.16)"
                  : isPicked
                  ? "rgba(255,153,0,0.16)"
                  : "rgba(255,255,255,0.04)";
                const border = isCorrect
                  ? "#22c55e"
                  : isPicked
                  ? ACCENT
                  : "rgba(255,255,255,0.08)";
                return (
                  <View key={i} style={styles.optCell}>
                    <TouchableOpacity activeOpacity={0.92} onPress={() => handlePick(i)} disabled={locked} style={{ flex: 1 }}>
                      <LinearGradient
                        colors={["rgba(255,255,255,0.05)","rgba(255,255,255,0.02)"]}
                        start={{x:0,y:0}} end={{x:1,y:1}}
                        style={[styles.optPill, { backgroundColor: bg, borderColor: border }]}
                      >
                        <Text style={styles.optLetter}>{String.fromCharCode(65+i)}</Text>
                        <Text style={styles.optText}>{q?.choices[i]}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Lifelines row */}
            <View style={styles.toolsRow}>
              <Life label="50:50" icon="close-circle-outline" onPress={use5050} disabled={fiftyUsed || locked} accent={ACCENT} />
              <Life label="Audience" icon="people-outline" onPress={useAudience} disabled={audienceUsed || locked} accent={ACCENT} />
              <Life label="Phone" icon="call-outline" onPress={usePhone} disabled={phoneUsed || locked} accent={ACCENT} />
            </View>

            {/* Audience / Hint panel if used */}
            {audiencePoll && !audiencePoll.hintOnly ? (
              <Card style={styles.panel}>
                <Card.Title title="Audience Poll" titleStyle={{ color: TEXT }} />
                <Card.Content>
                  {[0,1,2,3].map((i) => (
                    <View key={i} style={{ marginBottom: 6 }}>
                      <Text style={{ color: TEXT, marginBottom: 4 }}>
                        {String.fromCharCode(65+i)} — {audiencePoll[i]}%
                      </Text>
                      <ProgressBar progress={audiencePoll[i]/100} color={ACCENT} />
                    </View>
                  ))}
                </Card.Content>
              </Card>
            ) : audiencePoll?.hintOnly ? (
              <Card style={styles.panel}>
                <Card.Title title="Phone-a-Friend" titleStyle={{ color: TEXT }} />
                <Card.Content>
                  <Text style={{ color: TEXT }}>{audiencePoll.text}</Text>
                </Card.Content>
              </Card>
            ) : null}
          </View>

          {/* RIGHT: Ladder column (fixed width) */}
          <Card style={styles.ladder}>
            <View style={styles.ladderHeader}>
              <Text style={{ fontWeight: "800" }}>Money Ladder</Text>
            </View>
            <View style={{ paddingHorizontal: 12, paddingBottom: 10 }}>
              {[...LADDER].map((p, i) => ({ p, i })).reverse().map((item) => {
                const active = item.i === idx;
                const milestone = MILESTONES.has(item.i);
                return (
                  <View key={item.i} style={styles.ladderRow}>
                    <Text style={{ width: 32, textAlign: "right", opacity: 0.7 }}>
                      {item.i + 1 < 10 ? `0${item.i + 1}` : item.i + 1}
                    </Text>
                    <Text
                      style={{
                        marginLeft: 8,
                        fontWeight: active ? "800" : "600",
                        color: active ? TEXT : (milestone ? ACCENT : "#A3A3A3"),
                      }}
                    >
                      {item.p}
                    </Text>
                    {active ? <Ionicons name="ellipse" size={6} color={ACCENT} style={{ marginLeft: 6 }} /> : null}
                  </View>
                );
              })}
            </View>
          </Card>
        </View>
      </SafeAreaView>

      {/* DIM BACKDROP for result sheet */}
      <Portal>
        <Animated.View
          pointerEvents={resultOpen.current ? "auto" : "none"}
          style={[styles.dim, { opacity: dimOpacity }]}
        />
      </Portal>

      {/* RESULT SHEET (slides from bottom) */}
      <Portal>
        <Animated.View style={[styles.resultSheet, { transform: [{ translateY: resultY }] }]}>
          <View style={styles.resultGrip} />
          <Text style={{ fontWeight: "800", fontSize: 18, marginBottom: 6 }}>
            {picked === correctIdx
              ? (idx === BANK.length - 1 ? "Champion!" : "Correct ✅")
              : "Incorrect ❌"}
          </Text>
          <Text style={{ opacity: 0.8, marginBottom: 12 }}>
            Guaranteed winnings: <Text style={{ fontWeight: "bold" }}>{bestSafe > 0 ? LADDER[bestSafe - 1] : "₹0"}</Text>
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {picked === correctIdx && idx < BANK.length - 1 ? (
              <>
                <Button mode="contained" onPress={goNextOrEnd}>Next Question</Button>
                <Button mode="outlined" onPress={resetGame}>Restart</Button>
                <Button onPress={onExit}>Exit</Button>
              </>
            ) : (
              <>
                <Button mode="contained" onPress={resetGame}>Retry</Button>
                <Button mode="outlined" onPress={onExit}>Exit</Button>
              </>
            )}
          </View>
          <Button onPress={closeResult} style={{ marginTop: 8 }}>Close</Button>
        </Animated.View>
      </Portal>
    </View>
  );
}

/* ---------- UI bits ---------- */
function NeonBG() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 6000, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0, duration: 6000, useNativeDriver: false }),
      ])
    ).start();
  }, [a]);
  const left = a.interpolate({ inputRange: [0,1], outputRange: ["-10%", "5%"] });
  const top = a.interpolate({ inputRange: [0,1], outputRange: ["-12%", "-6%"] });
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={["#0a0a0a", "#090909"]} style={StyleSheet.absoluteFill} />
      <Animated.View style={{ position: "absolute", width: 280, height: 280, borderRadius: 220, left, top, opacity: 0.55 }}>
        <LinearGradient colors={["#FF990033", "#FF990000"]} style={{ flex: 1, borderRadius: 220 }} />
      </Animated.View>
      <View style={{ position: "absolute", width: 320, height: 320, borderRadius: 260, right: -60, bottom: -40, opacity: 0.6 }}>
        <LinearGradient colors={["#6b21a855", "#6b21a800"]} style={{ flex: 1, borderRadius: 260 }} />
      </View>
    </View>
  );
}

function Life({ icon, label, disabled, onPress, accent }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <LinearGradient
        colors={disabled ? ["#1a1a1a", "#151515"] : ["#1d1d1d", "#141414"]}
        start={{x:0,y:0}} end={{x:1,y:1}}
        style={[styles.lifeBtn, { borderColor: disabled ? "#333" : accent, opacity: disabled ? 0.55 : 1 }]}
      >
        <Ionicons name={icon} size={18} color={disabled ? "#777" : accent} />
        <Text style={{ color: "#E5E7EB", marginLeft: 6, fontWeight: "700" }}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ---------- helpers ---------- */
function shuffleInPlace(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}
function calcAudiencePoll(correct) {
  const base = [0,0,0,0];
  let remaining = 100;
  const correctPct = rand(45, 70);
  base[correct] = correctPct; remaining -= correctPct;
  const others = [0,1,2,3].filter(i => i !== correct);
  shuffleInPlace(others);
  const a = rand(10, Math.min(40, remaining)); remaining -= a;
  const b = rand(5, Math.min(30, remaining)); remaining -= b;
  const c = remaining;
  base[others[0]] = a; base[others[1]] = b; base[others[2]] = c;
  return base;
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 10, paddingTop: 6 },
  row: { flex: 1, flexDirection: "row" },

  left: { flex: 1, paddingRight: 10 },
  topBar: { flexDirection: "row", alignItems: "center" },

  question: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,20,20,0.45)",
  },
  qText: { color: "#fff", textAlign: "center", lineHeight: 22 },

  optionsGrid: {
    flex: 1,
    marginTop: 10,
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optCell: { width: "48.5%", height: "48%", minHeight: 76 },
  optPill: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  optLetter: { width: 22, textAlign: "center", color: "#A3A3A3", fontWeight: "800", marginRight: 8 },
  optText: { color: "#F3F4F6", fontWeight: "600", flexShrink: 1 },

  toolsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },

  ladder: {
    width: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,20,20,0.55)",
    overflow: "hidden",
  },
  ladderHeader: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  ladderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 7 },

  prizeChip: { backgroundColor: "rgba(20,20,20,0.6)" },

  lifeBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },

  // dim backdrop
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "black" },

  // result sheet (bottom)
  resultSheet: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    padding: 16,
    backgroundColor: "#101014",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  resultGrip: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 12,
  },
});
