// client/app/(tabs)/_layout.jsx
import React from "react";
import { View, Platform, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const baseTabBarStyle = {
    height: 76,
    paddingBottom: 12,
    paddingTop: 10,
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 20 },
    }),
  };

  return (
    <>
      {/* Edge-to-edge safe top fill */}
      <View style={{ height: insets.top, backgroundColor: "#000" }} />
      <StatusBar style="light" />{/* no bgColor / translucent */}

      <Tabs
        screenOptions={({ route }) => {
          const hide = route?.params?.hideTabBar === true;
          return {
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: "#00C8FF",
            tabBarInactiveTintColor: "#9CA3AF",
            sceneContainerStyle: { backgroundColor: "#000000" },
            tabBarStyle: hide ? [{ ...baseTabBarStyle }, { display: "none" }] : baseTabBarStyle,
            tabBarItemStyle: { paddingVertical: 2 },
          };
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            tabBarIcon: ({ color, size }) => <Ionicons name="cash" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="play"
          options={{
            title: "Play",
            tabBarLabel: "Play",
            tabBarIcon: () => <Ionicons name="play" size={26} color="#FFFFFF" />,
          }}
        />
        {/* Lifeline (route still points to lessons.jsx) */}
        <Tabs.Screen
          name="lifeline"
          options={{
            title: "Lifeline",
            tabBarLabel: "Lifeline",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="help-buoy" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="fraud"
          options={{
            title: "Fraud",
            tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
