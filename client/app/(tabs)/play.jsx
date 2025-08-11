// client/app/play.jsx
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

// Thumbnails (your folder: client/assets/thumbnails)
const IMG = {
  quizHero: require("../../assets/thumbnails/quiz-hero.png"),
  kyc: require("../../assets/thumbnails/sim-kyc.png"),
  job: require("../../assets/thumbnails/sim-job.png"),
  upi: require("../../assets/thumbnails/sim-upi.png"),
};

// Simulators (from client/components/scam/*)
import JobStorySimulator from "../../components/scam/job-scam/JobStorySimulator";
import KYCStorySimulator from "../../components/scam/kyc-scam/KYCStorySimulator";
import UPIStorySimulator from "../../components/scam/upi-scam/UPIStorySimulator";

export default function Play() {
  const [currentSim, setCurrentSim] = React.useState(null); // 'kyc' | 'job' | 'upi' | null

  // Android back button: exit simulator -> return to Play list
  React.useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (currentSim) {
        setCurrentSim(null);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [currentSim]);

  const simulators = [
    {
      id: "kyc",
      title: "KYC Scam",
      desc: "Fake KYC expiry prompts that hijack your device.",
      img: IMG.kyc,
      likes: "1.2k",
      plays: "52k",
    },
    {
      id: "job",
      title: "Job Scam",
      desc: "Too-good offers that ask for ‘training fees’.",
      img: IMG.job,
      likes: "980",
      plays: "38k",
    },
    {
      id: "upi",
      title: "UPI QR Scam",
      desc: "They send a QR; you lose ₹ on scan.",
      img: IMG.upi,
      likes: "1.6k",
      plays: "75k",
    },
  ];

  // If a simulator is active, render it full-screen here
  if (currentSim === "job") return <JobStorySimulator onExit={() => setCurrentSim(null)} />;
  if (currentSim === "kyc") return <KYCStorySimulator onExit={() => setCurrentSim(null)} />;
  if (currentSim === "upi") return <UPIStorySimulator onExit={() => setCurrentSim(null)} />;

  // Otherwise render the Play hub (hero + stacked list)
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }} // keep clear of bulged Play tab
        showsVerticalScrollIndicator={false}
      >
        {/* HERO (Quiz) */}
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
                onPress={() => {
                  // Hook your quiz route/logic here later
                }}
              >
                Start Quiz
              </Button>
            </View>
          </ImageBackground>
        </View>

        {/* SECTION TITLE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Simulators</Text>
        </View>

        {/* STACKED LIST (image left, text right) */}
        <View style={styles.list}>
          {simulators.map((s) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.9}
              style={styles.listItem}
              onPress={() => setCurrentSim(s.id)}
            >
              {/* Left thumbnail */}
              <Image source={s.img} style={styles.thumb} />

              {/* Right content */}
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {s.title}
                </Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {s.desc}
                </Text>

                {/* Stats + small play pill */}
                <View style={styles.itemMeta}>
                  <View style={styles.metaLeft}>
                    <View style={styles.metaChip}>
                      <Ionicons name="thumbs-up-outline" size={14} color="#D1D5DB" />
                      <Text style={styles.metaText}>{s.likes}</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Ionicons name="play-outline" size={14} color="#D1D5DB" />
                      <Text style={styles.metaText}>{s.plays}</Text>
                    </View>
                  </View>

                  <View style={styles.playPill}>
                    <Ionicons name="play" size={16} color="#111" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#0A0A0A";
const ORANGE = "#FF9900";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // hero
  heroWrap: { padding: 16, paddingTop: 12 },
  heroImg: { height: 200, justifyContent: "flex-end" },
  heroRadius: { borderRadius: 16 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 16 },
  heroContent: { padding: 16 },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  heroSubtitle: { color: "#E5E7EB", marginTop: 4, marginBottom: 10, fontSize: 13 },
  heroBtn: { alignSelf: "flex-start", borderRadius: 10 },

  // section
  sectionHeader: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  sectionTitle: { color: "#F3F4F6", fontSize: 16, fontWeight: "800" },

  // list
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
