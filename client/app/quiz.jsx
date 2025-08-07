// client/app/quiz.jsx
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';        // <-- paper Text & Button
import QuizCard from '../components/QuizCard';
import { quizzes } from '../constants/quizzes';

export default function Quiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = quizzes[index];

  const handleAnswer = (correct) => {
    if (correct) setScore((s) => s + 1);
    const next = index + 1;
    if (next < quizzes.length) {
      setIndex(next);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <SafeAreaView style={styles.center}>
        <Text variant="headlineMedium">
          You scored {score} / {quizzes.length}
        </Text>
        <Button
          mode="contained"
          style={styles.retryBtn}
          onPress={() => {
            setIndex(0);
            setScore(0);
            setFinished(false);
          }}
        >
          Retry Quiz
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>
        Question {index + 1} of {quizzes.length}
      </Text>
      <QuizCard item={current} onAnswer={handleAnswer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  retryBtn: { marginTop: 24 },
});
