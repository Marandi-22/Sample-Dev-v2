// client/app/_layout.jsx
import React from 'react';
import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0066CC',
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="budget"
        options={{ title: 'Budget', tabBarLabel: 'Budget' }}
      />
      <Tabs.Screen
        name="lessons"
        options={{ title: 'Lessons', tabBarLabel: 'Lessons' }}
      />
       <Tabs.Screen
        name="quiz"
        options={{ title: 'Quiz', tabBarLabel: 'Quiz' }}
      />
      <Tabs.Screen
        name="fraud"
        options={{ title: 'Fraud', tabBarLabel: 'Fraud' }}
      />
    </Tabs>
  );
}
