import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar"; // ✅

function PlayTabBarButton({ children, onPress, accessibilityState }) {
  const focused = accessibilityState?.selected;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.playWrapper}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <View style={[styles.playButton, focused && styles.playButtonFocused]}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default function Layout() {
  return (
    <>
      {/* ✅ Force light icons, solid background behind the status bar (Android) */}
      <StatusBar style="light" backgroundColor="#000000" translucent={false} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#FF9900",
          tabBarInactiveTintColor: "#9CA3AF",
          // ✅ Make every screen have a dark background so it doesn't blend with status bar
          sceneContainerStyle: { backgroundColor: "#000000" },

          tabBarStyle: {
            height: 76,
            paddingBottom: 12,
            paddingTop: 10,
            backgroundColor: "#0A0A0A",
            borderTopWidth: 1,
            borderTopColor: "#1A1A1A",
            position: "absolute",
            left: 0, right: 0, bottom: 0,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
              },
              android: { elevation: 20 },
            }),
          },
          tabBarItemStyle: { paddingVertical: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cash" size={size} color={color} />
            ),
          }}
        />

        {/* Center Play */}
        <Tabs.Screen
          name="play"
          options={{
            title: "Play",
            tabBarLabel: "Play",
            tabBarIcon: () => <Ionicons name="play" size={26} color="#FFFFFF" />,
            tabBarButton: (props) => <PlayTabBarButton {...props} />,
          }}
        />

        <Tabs.Screen
          name="lessons"
          options={{
            title: "Lessons",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="fraud"
          options={{
            title: "Fraud",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="alert-circle" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name="post" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  playWrapper: {
    top: -18,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111111",
    borderWidth: 3,
    borderColor: "#FF9900",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: { elevation: 12 },
    }),
  },
  playButtonFocused: {
    transform: [{ scale: 1.04 }],
    borderWidth: 3.5,
  },
});
