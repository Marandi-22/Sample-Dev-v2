// FeedCard.js (example)
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function FeedCard({ post, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {/* No image here */}

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {post.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#222",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    // no extra padding for image
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#ddd",
  },
});
