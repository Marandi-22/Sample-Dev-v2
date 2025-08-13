// client/app/index.jsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BannerSlider from "../../components/BannerSlider";
import { getFeedPosts } from "../../services/feedService";
import { Ionicons } from "@expo/vector-icons";

const BG = "#0B0B0F";
const SURFACE = "#121212";
const BORDER = "#1E293B";
const TEXT = "#E5E7EB";
const MUTED = "#94A3B8";
const BLUE = "#3B82F6";
const AMBER_DOT = "#F59E0B";

const hostname = (url = "") => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
};

export default function Index() {
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    try {
      const data = await getFeedPosts();
      const filtered = data.filter(
        (p) =>
          p.title?.toLowerCase().includes("scam") ||
          p.title?.toLowerCase().includes("fraud") ||
          p.title?.toLowerCase().includes("phishing") ||
          p.description?.toLowerCase().includes("scam") ||
          p.description?.toLowerCase().includes("fraud")
      );
      setPosts(filtered);
    } catch {
      setPosts([]);
    }
  };

  const openNewsArticle = async (url) => {
    try {
      const ok = await Linking.canOpenURL(url);
      if (ok) await Linking.openURL(url);
      else Alert.alert("Error", "Unable to open this link");
    } catch {
      Alert.alert("Error", "Failed to open the article");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandLeft}>
            <View style={styles.logoBadge}>
              <Ionicons name="shield-checkmark" size={18} color={SURFACE} />
            </View>
            <Text style={styles.appName}>FinWise</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/profile")} style={styles.profileBtn}>
            <Ionicons name="person-circle" size={34} color={TEXT} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtnPrimary} onPress={() => router.push("/fraud")}>
            <Ionicons name="shield-outline" size={18} color={SURFACE} />
            <Text style={styles.quickTextPrimary}>Scan Text</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtnGhost} onPress={() => router.push("/lessons")}>
            <Ionicons name="school-outline" size={18} color={TEXT} />
            <Text style={styles.quickTextGhost}>Basics</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Slider */}
        <View style={styles.bannerWrapper}>
          <BannerSlider />
        </View>

        {/* Latest Scam Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Scam Alerts</Text>
          <View style={styles.sectionPill}>
            <Ionicons name="newspaper-outline" size={14} color={TEXT} />
            <Text style={styles.sectionPillText}>From trusted sources</Text>
          </View>
        </View>

        {posts.length > 0 ? (
          posts.map((post, i) => {
            const host = hostname(post.link);
            return (
              <TouchableOpacity
                key={post.id ?? `post-${i}`}
                style={styles.newsCard}
                onPress={() => openNewsArticle(post.link)}
              >
                <View style={styles.newsContent}>
                  <Text style={styles.sourceText} numberOfLines={1}>
                    {host || "Source"}
                  </Text>
                  <Text style={styles.newsTitle} numberOfLines={3}>
                    {post.title}
                  </Text>
                  <Text style={styles.newsDescription} numberOfLines={2}>
                    {post.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.metaDot} />
                    <Text style={styles.metaText}>Scams</Text>
                  </View>
                </View>

                <Ionicons name="open-outline" size={18} color={MUTED} style={styles.linkIcon} />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>No scam alerts available at the moment.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  brandLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 28, fontWeight: "900", color: TEXT, letterSpacing: 0.5 },
  profileBtn: { padding: 6 },

  quickRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  quickBtnPrimary: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickTextPrimary: { color: "#121212", fontWeight: "800" },
  quickBtnGhost: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickTextGhost: { color: TEXT, fontWeight: "800" },

  bannerWrapper: { marginTop: 14, marginBottom: 10, borderRadius: 20, overflow: "hidden" },

  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 20, fontWeight: "900", color: TEXT },
  sectionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sectionPillText: { color: MUTED, fontWeight: "700", fontSize: 12 },

  newsCard: {
    flexDirection: "row",
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },

  newsContent: { flex: 1, marginRight: 8 },
  sourceText: { color: MUTED, fontSize: 12, marginBottom: 2 },
  newsTitle: { color: TEXT, fontSize: 16, fontWeight: "800" },
  newsDescription: { color: MUTED, fontSize: 13, marginTop: 4 },

  cardFooter: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  metaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: AMBER_DOT, opacity: 0.9 },
  metaText: { color: MUTED, fontSize: 12 },

  linkIcon: { marginLeft: 8 },
  noPostsContainer: { padding: 20, alignItems: "center" },
  noPostsText: { color: MUTED, fontSize: 16, textAlign: "center" },
});