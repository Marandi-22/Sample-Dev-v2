// client/app/(tabs)/play.jsx
import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

/* ---------- thumbnails ---------- */
const IMG = {
  quizHero : require("../../assets/thumbnails/quiz-hero.png"),
  bankGame : require("../../assets/thumbnails/bank-placeholder.png"),
  stock    : require("../../assets/thumbnails/stock-market.png"),   // 🆕
  kyc      : require("../../assets/thumbnails/sim-kyc.png"),
  job      : require("../../assets/thumbnails/sim-job.png"),
  upi      : require("../../assets/thumbnails/sim-upi.png"),
};

/* ---------- overlays ---------- */
import BankGame          from "../../components/games/bank";
import StockExchange     from "../../components/games/StockExchange";   // 🆕
import JobStorySimulator from "../../components/scam/job-scam/JobStorySimulator";
import KYCStorySimulator from "../../components/scam/kyc-scam/KYCStorySimulator";
import UPIStorySimulator from "../../components/scam/upi-scam/UPIStorySimulator";
import KBCQuiz           from "../../components/quiz/KBCQuiz";

export default function Play() {
  const navigation = useNavigation();

  /* overlay state
     'quiz' | 'bank' | 'stock' | 'kyc' | 'job' | 'upi' | null  */
  const [overlay, setOverlay] = React.useState(null);

  /* hide tab-bar while an overlay is visible */
  React.useEffect(() => {
    const tabs = navigation.getParent?.();
    const hide = !!overlay;
    navigation.setParams?.({ hideTabBar: hide });
    tabs?.setOptions({ tabBarStyle: { display: hide ? "none" : "flex" } });

    return () => {
      navigation.setParams?.({ hideTabBar: false });
      tabs?.setOptions({ tabBarStyle: { display: "flex" } });
    };
  }, [navigation, overlay]);

  /* Android back → close overlay first */
  React.useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (overlay) { setOverlay(null); return true; }
      return false;
    });
    return () => sub.remove();
  }, [overlay]);

  /* ----------- overlay router ----------- */
  if (overlay === "quiz")   return <KBCQuiz           onExit={() => setOverlay(null)} />;
  if (overlay === "bank")   return <BankGame          onExit={() => setOverlay(null)} />;
  if (overlay === "stock")  return <StockExchange     onExit={() => setOverlay(null)} />; // 🆕
  if (overlay === "job")    return <JobStorySimulator onExit={() => setOverlay(null)} />;
  if (overlay === "kyc")    return <KYCStorySimulator onExit={() => setOverlay(null)} />;
  if (overlay === "upi")    return <UPIStorySimulator onExit={() => setOverlay(null)} />;

  /* ---------- cards data ---------- */
  const games = [
    {
      id   : "bank",
      title: "Banking Tycoon",
      desc : "Grow deposits, create FDs, top the leaderboard.",
      img  : IMG.bankGame,
      likes: "720",
      plays: "12k",
    },
    {
      id   : "stock",                          // 🆕
      title: "Stock Exchange",
      desc : "Buy & sell virtual shares, build wealth.",
      img  : IMG.stock,
      likes: "2.3k",
      plays: "91k",
    },
  ];

  const simulators = [
    { id:"kyc", title:"KYC Scam", desc:"Fake KYC expiry prompts that hijack your device.", img:IMG.kyc, likes:"1.2k", plays:"52k" },
    { id:"job", title:"Job Scam", desc:"Too-good offers that ask for ‘training fees’.",     img:IMG.job, likes:"980",  plays:"38k" },
    { id:"upi", title:"UPI QR Scam", desc:"They send a QR; you lose ₹ on scan.",            img:IMG.upi, likes:"1.6k", plays:"75k" },
  ];

  /* ---------- hub ---------- */
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        {/* HERO (quiz) */}
        <View style={styles.heroWrap}>
          <ImageBackground
            source={IMG.quizHero}
            style={styles.heroImg}
            imageStyle={styles.heroRadius}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Quiz Arena</Text>
              <Text style={styles.heroSubtitle}>Test your scam instincts</Text>
              <Button
                mode="contained"
                buttonColor="#FF9900"
                textColor="#111"
                style={styles.heroBtn}
                icon="play"
                onPress={() => setOverlay("quiz")}
              >
                Start Quiz
              </Button>
            </View>
          </ImageBackground>
        </View>

        {/* GAMES */}
        <Section title="Games" items={games} onPress={setOverlay} />

        {/* SIMULATORS */}
        <Section title="Simulators" items={simulators} onPress={setOverlay} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- reusable sub-components ---------- */
const Section = ({ title, items, onPress }) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.list}>
      {items.map((c) => (
        <TouchableOpacity key={c.id} activeOpacity={0.9} style={styles.listItem}
          onPress={() => onPress(c.id)}>
          <Image source={c.img} style={styles.thumb} />
          <CardBody card={c} />
        </TouchableOpacity>
      ))}
    </View>
  </>
);

const CardBody = ({ card }) => (
  <View style={styles.itemBody}>
    <Text style={styles.itemTitle} numberOfLines={1}>{card.title}</Text>
    <Text style={styles.itemDesc}  numberOfLines={2}>{card.desc}</Text>
    <View style={styles.itemMeta}>
      <View style={styles.metaLeft}>
        <MetaChip icon="thumbs-up-outline" text={card.likes} />
        <MetaChip icon="play-outline"      text={card.plays} />
      </View>
      <View style={styles.playPill}>
        <Ionicons name="play" size={16} color="#111" />
      </View>
    </View>
  </View>
);

const MetaChip = ({ icon, text }) => (
  <View style={styles.metaChip}>
    <Ionicons name={icon} size={14} color="#D1D5DB" />
    <Text style={styles.metaText}>{text}</Text>
  </View>
);

/* ---------- styles ---------- */
const BG = "#0A0A0A";
const ORANGE = "#FF9900";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  /* hero */
  heroWrap: { padding: 16, paddingTop: 12 },
  heroImg: { height: 200, justifyContent: "flex-end" },
  heroRadius: { borderRadius: 16 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 16 },
  heroContent: { padding: 16 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  heroSubtitle: { color: "#E5E7EB", marginTop: 4, marginBottom: 10, fontSize: 13 },
  heroBtn: { alignSelf: "flex-start", borderRadius: 10 },

  /* section */
  sectionHeader: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  sectionTitle: { color: "#F3F4F6", fontSize: 16, fontWeight: "800" },

  /* list */
  list: { paddingHorizontal: 16, gap: 12, marginTop: 8 },
  listItem: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
    overflow: "hidden",
  },
  thumb: { width: 120, height: 120 },
  itemBody: { flex: 1, padding: 12, gap: 6, justifyContent: "space-between" },
  itemTitle: { color: "#F3F4F6", fontSize: 16, fontWeight: "800" },
  itemDesc: { color: "#D1D5DB", fontSize: 12 },
  itemMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaLeft: { flexDirection: "row", gap: 10 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#151515",
    borderRadius: 999,
  },
  metaText: { color: "#D1D5DB", fontSize: 12 },
  playPill: { backgroundColor: ORANGE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
});
