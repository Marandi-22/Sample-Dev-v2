// app/post/[id].jsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function PostDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Image source={{ uri: "https://via.placeholder.com/400x200" }} style={styles.image} />
      <Text style={styles.title}>Post #{id}</Text>
      <Text style={styles.desc}>Full post details will go here...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  image: { width: "100%", height: 250, borderRadius: 10, marginBottom: 15 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  desc: { fontSize: 16, color: "#444" }
});
