import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, Image } from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = width * 0.88;

const SURFACE = "#121212";
const BORDER = "#1E293B";
const TEXT = "#E5E7EB";
const SUBTEXT = "#94A3B8";
const BLUE = "#3B82F6";
const SLATE = "#64748B";

const banners = [
  {
    id: "1",
    title: "Beware of Phishing",
    description: "Never click links from unknown sources claiming to be banks.",
    image: require("../assets/images/fraud1.jpeg"),
  },
  {
    id: "2",
    title: "Online Scam Alerts",
    description: "Stay updated on the latest scam techniques.",
    image: require("../assets/images/fraud2.jpeg"),
  },
  {
    id: "3",
    title: "Protect Your Data",
    description: "Strong passwords & 2FA are your best friends.",
    image: require("../assets/images/fraud3.jpeg"),
  },
  {
    id: "4",
    title: "Don’t Share OTPs",
    description: "No bank will ever ask for your OTP over the phone.",
    image: require("../assets/images/fraud4.jpeg"),
  },
];

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
          setActiveIndex(i);
        }}
        scrollEventThrottle={16}
      >
        {banners.map((item) => (
          <View key={item.id} style={styles.card}>
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
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View key={index} style={[styles.dot, activeIndex === index && styles.activeDot]} />
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.28)" },
  textWrap: { position: "absolute", left: 16, right: 16, bottom: 16 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: SLATE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeText: { color: TEXT, fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
  title: { color: TEXT, fontSize: 18, fontWeight: "900", marginBottom: 6 },
  description: { color: SUBTEXT, fontSize: 13, lineHeight: 18 },
  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: SLATE, marginHorizontal: 4, opacity: 0.6 },
  activeDot: { backgroundColor: BLUE, width: 9, height: 9, opacity: 1 },
});
