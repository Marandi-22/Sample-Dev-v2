import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BannerSlider from "../components/BannerSlider";
import { getFeedPosts } from "../services/feedService";
import { Ionicons } from "@expo/vector-icons";

// Changed from HomeScreen to Index (or just use anonymous default export)
export default function Index() {
  const [posts, setPosts] = useState([]);
  const router = useRouter();
  
  const cardColors = [
    "#FDE2E4", "#E2F0CB", "#FFEBB7", "#CDE7F0", "#E5D4ED", "#FFD6A5"
  ];
  
  useEffect(() => {
    loadPosts();
  }, []);
  
  const loadPosts = async () => {
    try {
      const data = await getFeedPosts();
      const filtered = data.filter(
        (post) =>
          post.title?.toLowerCase().includes("scam") ||
          post.title?.toLowerCase().includes("fraud") ||
          post.title?.toLowerCase().includes("phishing") ||
          post.description?.toLowerCase().includes("scam") ||
          post.description?.toLowerCase().includes("fraud")
      );
      setPosts(filtered);
    } catch (error) {
      console.error("Error loading posts:", error);
      // Set empty array as fallback
      setPosts([]);
    }
  };

  const openNewsArticle = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open this link");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert("Error", "Failed to open the article");
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>FinWise</Text>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons name="person-circle-outline" size={52} color="#FFD700" />
          </TouchableOpacity>
        </View>
        
        {/* Banner Slider */}
        <View style={styles.bannerWrapper}>
          <BannerSlider />
        </View>
        
        {/* Latest Scam Alerts */}
        <Text style={styles.sectionTitle}>Latest Scam Alerts</Text>
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <TouchableOpacity
              key={post.id}
              style={[
                styles.newsCard, 
                { backgroundColor: cardColors[index % cardColors.length] }
              ]}
              onPress={() => openNewsArticle(post.link)}
            >
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{post.title}</Text>
                <Text style={styles.newsDescription} numberOfLines={2}>
                  {post.description}
                </Text>
              </View>
              <Ionicons name="open-outline" size={20} color="#666" style={styles.linkIcon} />
            </TouchableOpacity>
          ))
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
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  appName: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: 1,
  },
  bannerWrapper: {
    marginVertical: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
    marginTop: 4,
  },
  newsCard: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newsContent: {
    flex: 1,
    marginRight: 10,
  },
  newsTitle: {
    color: "#222",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  newsDescription: {
    color: "#444",
    fontSize: 14,
  },
  linkIcon: {
    opacity: 0.7,
  },
  noPostsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noPostsText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});