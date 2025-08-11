import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView, Image } from "react-native";

const { width } = Dimensions.get("window");

const banners = [
  {
    id: "1",
    title: "🚨 Beware of Phishing",
    description: "Never click links from unknown sources claiming to be banks.",
    colors: ["#FDE2E4", "#FAD2E1"],
    image: require("../assets/images/fraud1.jpeg")
  },
  {
    id: "2",
    title: "⚠ Online Scam Alerts",
    description: "Stay updated on latest scam techniques and protect your money.",
    colors: ["#E0F7FA", "#B2EBF2"],
    image: require("../assets/images/fraud2.jpeg"),
  },
  {
    id: "3",
    title: "🔒 Protect Your Data",
    description: "Strong passwords & 2FA are your best friends online.",
    colors: ["#FFF3B0", "#FFD6A5"],
    image: require("../assets/images/fraud3.jpeg")
  },
  {
    id: "4",
    title: "📞 Don’t Share OTPs",
    description: "RBI warns: No bank will ever ask for your OTP over phone.",
    colors: ["#E0F7FA", "#A7FFEB"],
    image: require("../assets/images/fraud4.jpeg")
  },
  {
    id: "5",
    title: "💳 Keep Cards Safe",
    description: "Block lost/stolen cards immediately via your bank’s helpline.",
    colors: ["#F3E5F5", "#E1BEE7"],
    image: require("../assets/images/fraud5.jpeg")
  },
  {
    id: "6",
    title: "🛑 Fake Loan Offers",
    description: "Avoid instant loan apps without RBI registration verification.",
    colors: ["#FFF3B0", "#FFD6A5"],
    image: require("../assets/images/fraud6.jpeg")
  },
  {
    id: "7",
    title: "🔔 UPI Fraud Alert",
    description: "Never approve a collect request from an unknown UPI ID.",
    colors: ["#FFECB3", "#FFE082"],
    image: require("../assets/images/fraud7.jpeg")
  },
  {
    id: "8",
    title: "🏦 Verify Bank Numbers",
    description: "Always call your bank using the number on its official website.",
    colors: ["#C8E6C9", "#A5D6A7"],
    image: require("../assets/images/fraud8.jpeg")
  },
  {
    id: "9",
    title: "📲 App Download Safety",
    description: "Only install banking apps from official app stores.",
    colors: ["#D1C4E9", "#B39DDB"],
    image: require("../assets/images/fraud9.jpeg")
  },
  {
    id: "10",
    title: "💼 Investment Caution",
    description: "RBI: Avoid schemes promising unrealistic high returns.",
    colors: ["#F0F4C3", "#E6EE9C"],
    image: require("../assets/images/fraud10.jpeg")
  }
];

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = (item) => {
    const bgColor = Array.isArray(item.colors) && item.colors.length > 0
      ? item.colors[0]
      : "#FFFFFF";

    return (
      <View key={item.id} style={[styles.card, { backgroundColor: bgColor }]}>
        {item.image ? (
          <Image source={item.image} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <Text style={styles.title}>{item.title || ""}</Text>
        <Text style={styles.description}>{item.description || ""}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / (width * 0.85)
          );
          setActiveIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {banners.map((item) => renderItem(item))}
      </ScrollView>

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
  container: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 250,
    width: width * 0.85,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    backgroundColor: "#ddd",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 18,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#FF6F00",
    width: 10,
    height: 10,
  },
});