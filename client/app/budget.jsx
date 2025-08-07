<<<<<<< HEAD
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function BudgetDashboard() {
  // Budget Calculator State
  const [income, setIncome] = useState('');
  const [needs, setNeeds] = useState('');
  const [wants, setWants] = useState('');
  const [suggestion, setSuggestion] = useState('');

  // Goals and Checklist State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCondition, setGoalCondition] = useState('');
  const [goals, setGoals] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [points, setPoints] = useState(0);

  const handleCalculate = () => {
    const monthlyIncome = parseFloat(income);
    const monthlyNeeds = parseFloat(needs);
    const monthlyWants = parseFloat(wants);

    if (isNaN(monthlyIncome) || isNaN(monthlyNeeds) || isNaN(monthlyWants)) {
      setSuggestion('❗ Please fill in all fields with valid numbers.');
      return;
    }

    const idealNeeds = 0.5 * monthlyIncome;
    const idealWants = 0.3 * monthlyIncome;
    const remainingWantsBudget = idealWants - monthlyWants;

    let result = '';

    if (monthlyNeeds > idealNeeds) {
      result += `⚠️ You're overspending on needs. Try to reduce it below ₹${idealNeeds.toFixed(0)}.\n\n`;
    }

    if (monthlyWants > idealWants) {
      result += `⚠️ You're overspending on wants. Your limit is ₹${idealWants.toFixed(0)}.\n\n`;
    } else {
      result += `✅ You're spending within your wants budget.\n\n`;
    }

    if (remainingWantsBudget > 0) {
      result += `🎯 You can safely spend ₹${remainingWantsBudget.toFixed(0)} more on luxuries this month.`;
    } else {
      result += `🚫 Avoid any luxury purchases this month. You've exceeded your wants budget.`;
    }

    setSuggestion(result);
  };

  const addGoal = () => {
    if (goalTitle && goalCondition) {
      setGoals([...goals, { id: Date.now(), title: goalTitle, condition: goalCondition }]);
      setGoalTitle('');
      setGoalCondition('');
    }
  };

  const addChecklistItem = (title) => {
    setChecklist([...checklist, { id: Date.now(), title, completed: false }]);
  };

  const toggleChecklistItem = (id) => {
    const updatedChecklist = checklist.map(item => {
      if (item.id === id) {
        if (!item.completed) setPoints(points + 10);
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    setChecklist(updatedChecklist);
  };
=======
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import BudgetCalculator from '../components/BudgetCalculator';
import InvestmentSimulator from '../components/InvestmentSimulator';
>>>>>>> a65ad52918ea93ee8622ab56c03e881ea4e4cb61

  return (
<<<<<<< HEAD
  <FlatList
    ListHeaderComponent={
      <>
        {/* Budget Calculator */}
        <Text style={styles.heading}>💰 Budget Calculator</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Monthly Income (₹)"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />
        <TextInput
          style={styles.input}
          placeholder="Money Spent on Needs (₹)"
          keyboardType="numeric"
          value={needs}
          onChangeText={setNeeds}
        />
        <TextInput
          style={styles.input}
          placeholder="Money Spent on Wants (₹)"
          keyboardType="numeric"
          value={wants}
          onChangeText={setWants}
        />
        <Button title="Calculate" onPress={handleCalculate} />
        {suggestion ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{suggestion}</Text>
          </View>
        ) : null}

        {/* Financial Goals */}
        <Text style={styles.heading}>🎯 Add Financial Goal</Text>
        <TextInput
          style={styles.input}
          placeholder="Goal Title (e.g., Save for iPhone)"
          value={goalTitle}
          onChangeText={setGoalTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Condition (e.g., Save ₹5000/month)"
          value={goalCondition}
          onChangeText={setGoalCondition}
        />
        <Button title="Add Goal" onPress={addGoal} />

        <Text style={styles.subHeader}>📋 My Goals</Text>
        {goals.map((item) => (
          <View key={item.id} style={styles.goalItem}>
            <Text style={styles.goalText}>🎯 {item.title}</Text>
            <Text>📝 {item.condition}</Text>
            <Button
              title="Add Daily Task"
              onPress={() => addChecklistItem(`Task for ${item.title}`)}
            />
          </View>
        ))}

        <Text style={styles.subHeader}>✅ Daily Checklist</Text>
      </>
    }
    data={checklist}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => toggleChecklistItem(item.id)}
        style={styles.checklistItem}
      >
        <Text
          style={{
            textDecorationLine: item.completed ? 'line-through' : 'none',
          }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    )}
    ListFooterComponent={
      <Text style={styles.points}>🏆 Total Points: {points}</Text>
    }
    contentContainerStyle={styles.container}
  />
);
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    gap: 15,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  goalItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  goalText: {
    fontWeight: 'bold',
  },
  checklistItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
  },
=======
    <ScrollView contentContainerStyle={styles.container}>
      <BudgetCalculator />
      <InvestmentSimulator />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 24, backgroundColor: '#f2f2f2' },
>>>>>>> a65ad52918ea93ee8622ab56c03e881ea4e4cb61
});
