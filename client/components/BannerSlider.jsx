import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";

const { width } = Dimensions.get("window");

const banners = [
  {
    id: "1",
    title: "🚨 Beware of Phishing",
    description: "Never click links from unknown sources claiming to be banks.",
    colors: ["#FDE2E4", "#FAD2E1"],
  },
  {
    id: "2",
    title: "⚠ Online Scam Alerts",
    description: "Stay updated on latest scam techniques and protect your money.",
    colors: ["#E0F7FA", "#B2EBF2"],
  },
  {
    id: "3",
    title: "🔒 Protect Your Data",
    description: "Strong passwords & 2FA are your best friends online.",
    colors: ["#FFF3B0", "#FFD6A5"],
  },
];

export default function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = (item, index) => {
    const bgColor = Array.isArray(item.colors) && item.colors.length > 0 
      ? item.colors[0] 
      : "#FFFFFF";

    return (
      <View key={item.id} style={[styles.card, { backgroundColor: bgColor }]}>
        <View style={styles.imagePlaceholder} />
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
          const index = Math.round(event.nativeEvent.contentOffset.x / (width * 0.85));
          setActiveIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {banners.map((item, index) => renderItem(item, index))}
      </ScrollView>
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot
            ]}
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
    minHeight: 200,
    width: width * 0.85,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePlaceholder: {
    width: "100%",
    height: 100,
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