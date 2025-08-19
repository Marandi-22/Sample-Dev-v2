import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.88;

// 🎨 Theme Colors
const SURFACE = "#121212";
const BORDER = "#1E293B";
const TEXT = "#E5E7EB";
const SUBTEXT = "#94A3B8";
const BLUE = "#3B82F6";
const SLATE = "#64748B";

// Helper: create slug from title
const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // replace spaces & emojis
    .replace(/(^-|-$)/g, ""); // trim - at ends

// Banners with auto-generated routes
const banners = [
  {
    id: "1",
    title: "🚨 Financial Awareness",
    description: "Never click links from unknown sources claiming to be banks.",
    image: require("../assets/images/fraud1.jpeg"),
  },
  {
    id: "2",
    title: "⚠ Online Scam Alerts",
    description: "Stay updated on latest scam techniques and protect your money.",
    image: require("../assets/images/fraud2.jpeg"),
  },
  {
    id: "3",
    title: "🔒 Protect Your Data",
    description: "Strong passwords & 2FA are your best friends online.",
    image: require("../assets/images/fraud3.jpeg"),
  },
  {
    id: "4",
    title: "📞 Do not Share OTPs",
    description: "RBI warns: No bank will ever ask for your OTP over phone.",
    image: require("../assets/images/fraud4.jpeg"),
  },
  {
    id: "5",
    title: "💳 Keep Cards Safe",
    description: "Block lost/stolen cards immediately via your bank’s helpline.",
    image: require("../assets/images/fraud5.jpeg"),
  },
  {
    id: "6",
    title: "🛑 Fake Loan Offers",
    description: "Avoid instant loan apps without RBI registration verification.",
    image: require("../assets/images/fraud6.jpeg"),
  },
  {
    id: "7",
    title: "🔔 UPI Fraud Alert",
    description: "Never approve a collect request from an unknown UPI ID.",
    image: require("../assets/images/fraud7.jpeg"),
  },
  {
    id: "8",
    title: "🏦 Verify Bank Numbers",
    description: "Always call your bank using the number on its official website.",
    image: require("../assets/images/fraud8.jpeg"),
  },
  {
    id: "9",
    title: "📲 App Download Safety",
    description: "Only install banking apps from official app stores.",
    image: require("../assets/images/fraud9.jpeg"),
  },
  {
    id: "10",
    title: "💼 Investment Caution",
    description: "RBI: Avoid schemes promising unrealistic high returns.",
    image: require("../assets/images/fraud10.jpeg"),
  },
  {
    id: "11",
    title: "📝 RBI Guidelines",
    description: "Follow RBI guidelines to ensure safe, regulated, and transparent financial transactions.",
    image: require("../assets/images/fraud11.jpeg"),
  },
].map((item) => ({
  ...item,
  route: `/alerts/${slugify(item.title)}`, // ✅ auto-route from title
}));

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const router = useRouter();

  // Auto-slide every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (activeIndex + 1) % banners.length;
      scrollRef.current?.scrollTo({
        x: nextIndex * (CARD_W + 16),
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        snapToInterval={CARD_W + 16}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const i = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_W + 16)
          );
          setActiveIndex(i);
        }}
        scrollEventThrottle={16}
      >
        {banners.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => router.push(item.route)} // ✅ now navigates based on title
          >
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            <View style={styles.overlay} />
            <View style={styles.textWrap}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ALERT</Text>
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center", marginVertical: 8 },
  card: {
    width: CARD_W,
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 8,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  image: { width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  textWrap: { position: "absolute", left: 16, right: 16, bottom: 16 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: SLATE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeText: {
    color: TEXT,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: { color: TEXT, fontSize: 18, fontWeight: "900", marginBottom: 6 },
  description: { color: SUBTEXT, fontSize: 13, lineHeight: 18 },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: SLATE,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  activeDot: { backgroundColor: BLUE, width: 9, height: 9, opacity: 1 },
});