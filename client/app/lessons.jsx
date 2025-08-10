import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { ProgressBar } from 'react-native-paper'; // For progress bar, install react-native-paper or use your own
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const days = [
  { id: '20', label: 'Mon' },
  { id: '21', label: 'Tue' },
  { id: '22', label: 'Wed' },
  { id: '23', label: 'Thu' },
  { id: '24', label: 'Fri' },
  { id: '25', label: 'Sat' },
];

const upcomingLessons = [
  {
    id: '1',
    day: 'Tomorrow',
    title: 'Food and drinks',
    icon: 'fast-food-outline',
    description: 'Learn healthy eating habits',
  },
  {
    id: '2',
    day: 'Wednesday',
    title: 'Greetings',
    icon: 'gift-outline',
    description: 'Common phrases and etiquette',
  },
  {
    id: '3',
    day: 'Thursday',
    title: 'Fruits & Vegetables',
    icon: 'leaf-outline',
    description: 'Nutrition and benefits',
  },
];

export default function LessonsScreen() {
  const [selectedDay, setSelectedDay] = useState('21');
  const [progress, setProgress] = useState(0.23); // 23% progress example

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reading</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Your Progress</Text>
        <Text style={styles.progressPercent}>23% of French</Text>
        <ProgressBar progress={progress} color="#FFD600" style={styles.progressBar} />
      </View>

      {/* Days Horizontal Scroll */}
      <View style={styles.daysContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((day) => {
            const isSelected = day.id === selectedDay;
            return (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayCircle, isSelected && styles.dayCircleSelected]}
                onPress={() => setSelectedDay(day.id)}
              >
                <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{day.id}</Text>
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{day.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Upcoming Lessons */}
      <Text style={styles.upcomingTitle}>Upcoming Lessons</Text>
      <FlatList
        data={upcomingLessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.lessonCard} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={28} color="#FFD600" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{item.day}</Text>
              <Text style={styles.lessonSubtitle}>{item.title}</Text>
              <Text style={styles.lessonDescription}>{item.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#555" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    color: '#FFD600',
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  progressPercent: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  dayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#222',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#FFD600',
  },
  dayNumber: {
    color: '#aaa',
    fontSize: 18,
    fontWeight: '600',
  },
  dayNumberSelected: {
    color: '#000',
  },
  dayLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  dayLabelSelected: {
    color: '#000',
  },
  upcomingTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  lessonCard: {
    backgroundColor: '#222',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lessonTitle: {
    color: '#FFD600',
    fontWeight: '700',
    fontSize: 16,
  },
  lessonSubtitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lessonDescription: {
    color: '#aaa',
    fontSize: 12,
  },
});
