import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function Header({ onProfilePress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FinWise</Text>
      <TouchableOpacity onPress={onProfilePress}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }} // replace with user's profile URL
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#121212",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
});
