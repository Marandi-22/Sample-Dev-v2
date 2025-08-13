// client/app/splash.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper"; // use Paper so it follows MD3 sizing
import { StatusBar } from "expo-status-bar";

export default function Splash() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" translucent={false} />
      <ActivityIndicator animating size="large" color="#FF9900" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",     // match Paper dark theme
    justifyContent: "center",
    alignItems: "center",
  },
});
