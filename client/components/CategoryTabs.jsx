import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onCategoryChange(cat)}
            >
              <Text style={[styles.text, isActive && styles.activeText]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 10, marginBottom: 10 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1f1f1f",
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#4e8ef7",
  },
  text: {
    color: "#bbb",
    fontSize: 14,
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
  },
});
