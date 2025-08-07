// client/components/QuizCard.jsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

export default function QuizCard({ item, onAnswer }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.question}>
          {item.question}
        </Text>
        <View style={styles.options}>
          {item.options.map((opt, idx) => (
            <Button
              key={idx}
              mode="outlined"
              style={styles.optionBtn}
              onPress={() => onAnswer(opt.correct)}
            >
              {opt.text}
            </Button>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  question: {
    marginBottom: 12,
  },
  options: {
    flexDirection: 'column',
  },
  optionBtn: {
    marginVertical: 6,
  },
});
