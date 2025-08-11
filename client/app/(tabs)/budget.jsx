// client/app/budget.jsx (or BudgetScreen file)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function BudgetScreen() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [itemCost, setItemCost] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [monthlySaved, setMonthlySaved] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState('');
  const [weeklySpent, setWeeklySpent] = useState('');

  const [selectedGoal, setSelectedGoal] = useState(null); // 'monthly' | 'weekly' | null
  const [dailyChecklist, setDailyChecklist] = useState([]); // [{date, done}]

  const [chatMessages, setChatMessages] = useState([
    { id: '1', from: 'bot', text: 'Hi! How can I help with your budget today?' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const scrollViewRef = useRef(null);

  // load saved
  useEffect(() => {
    (async () => {
      try {
        const mg = await AsyncStorage.getItem('monthlyGoal');
        const ms = await AsyncStorage.getItem('monthlySaved');
        const wt = await AsyncStorage.getItem('weeklyTarget');
        const ws = await AsyncStorage.getItem('weeklySpent');
        const sel = await AsyncStorage.getItem('selectedGoal');
        const checklist = await AsyncStorage.getItem('dailyChecklist');

        if (mg) setMonthlyGoal(mg);
        if (ms) setMonthlySaved(ms);
        if (wt) setWeeklyTarget(wt);
        if (ws) setWeeklySpent(ws);
        if (sel) setSelectedGoal(sel);
        if (checklist) setDailyChecklist(JSON.parse(checklist));
      } catch (e) {
        console.log('Failed to load data', e);
      }
    })();
  }, []);

  // persist
  useEffect(() => { AsyncStorage.setItem('monthlyGoal', monthlyGoal); }, [monthlyGoal]);
  useEffect(() => { AsyncStorage.setItem('monthlySaved', monthlySaved); }, [monthlySaved]);
  useEffect(() => { AsyncStorage.setItem('weeklyTarget', weeklyTarget); }, [weeklyTarget]);
  useEffect(() => { AsyncStorage.setItem('weeklySpent', weeklySpent); }, [weeklySpent]);
  useEffect(() => { AsyncStorage.setItem('selectedGoal', selectedGoal ?? ''); }, [selectedGoal]);
  useEffect(() => { AsyncStorage.setItem('dailyChecklist', JSON.stringify(dailyChecklist)); }, [dailyChecklist]);

  // auto-scroll chat
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const calculateBudget = () => {
    const inc = parseFloat(income);
    const exp = parseFloat(expenses);
    const cost = parseFloat(itemCost);

    if (isNaN(inc) || isNaN(exp) || isNaN(cost)) {
      setRecommendation('Please enter valid numbers');
      return;
    }
    const leftover = inc - exp - cost;
    setRecommendation(
      leftover >= 0
        ? `You can afford this! You'll have ₹${leftover.toFixed(2)} left.`
        : `Not recommended. You will be short ₹${Math.abs(leftover).toFixed(2)}.`
    );
  };

  const monthlyProgress =
    monthlyGoal && monthlySaved
      ? Math.min((parseFloat(monthlySaved) / parseFloat(monthlyGoal)) * 100, 100)
      : 0;

  const weeklyProgress =
    weeklyTarget && weeklySpent
      ? Math.min(
          ((parseFloat(weeklyTarget) - parseFloat(weeklySpent)) / parseFloat(weeklyTarget)) * 100,
          100
        )
      : 0;

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [...prev, { id: Date.now().toString(), from: 'user', text: chatInput }]);

    const inputLower = chatInput.toLowerCase();
    let botReply = "Sorry, I don't understand that.";

    if (inputLower.includes('buy') || inputLower.includes('purchase')) {
      botReply = recommendation || 'Use the calculator above to check if you can buy an item.';
    } else if (inputLower.includes('goal')) {
      botReply = `You have completed ${monthlyProgress.toFixed(1)}% of your monthly goal and ${weeklyProgress.toFixed(
        1
      )}% of your weekly target.`;
    } else if (inputLower.includes('help')) {
      botReply =
        'Enter income, expenses, and item cost above to check purchases. Set monthly/weekly goals below.';
    }

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { id: (Date.now()+1).toString(), from: 'bot', text: botReply }]);
    }, 800);

    setChatInput('');
  };

  // ensure today exists in checklist once a goal is selected
  useEffect(() => {
    if (!selectedGoal) return;
    const today = new Date().toISOString().slice(0, 10);
    const exists = dailyChecklist.find((i) => i.date === today);
    if (!exists) setDailyChecklist((prev) => [...prev, { date: today, done: false }]);
  }, [selectedGoal]); // eslint-disable-line

  const toggleTodayDone = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDailyChecklist((prev) =>
      prev.map((i) => (i.date === today ? { ...i, done: !i.done } : i))
    );
  };

  const completionPercent =
    dailyChecklist.length === 0
      ? 0
      : (dailyChecklist.filter((i) => i.done).length / dailyChecklist.length) * 100;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>FinWise</Text>
          <TouchableOpacity onPress={() => Alert.alert('Profile', 'Coming soon')}>
            <Ionicons name="person-circle-outline" size={28} color="#FFD600" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Budget Calculator */}
          <View style={[styles.card, { backgroundColor: '#ffdede' }]}>
            <Text style={styles.cardTitle}>💰 Budget Calculator & Purchase Decision</Text>
            <TextInput
              placeholder="Monthly Income (₹)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={income}
              onChangeText={setIncome}
              style={styles.input}
            />
            <TextInput
              placeholder="Monthly Expenses (₹)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={expenses}
              onChangeText={setExpenses}
              style={styles.input}
            />
            <TextInput
              placeholder="Item Cost (₹)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={itemCost}
              onChangeText={setItemCost}
              style={styles.input}
            />
            <Button color="#FFD600" title="Check Purchase" onPress={calculateBudget} />
            {recommendation ? <Text style={styles.resultText}>{recommendation}</Text> : null}
          </View>

          {/* Goals Tracker */}
          <View style={[styles.card, { backgroundColor: '#e5f4db' }]}>
            <Text style={styles.cardTitle}>📊 Monthly & Weekly Financial Goals</Text>
            <TextInput
              placeholder="Monthly Savings Goal (₹)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={monthlyGoal}
              onChangeText={setMonthlyGoal}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount Saved So Far (₹)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={monthlySaved}
              onChangeText={setMonthlySaved}
              style={styles.input}
            />
            <Text style={styles.progressText}>Monthly Goal Completion: {monthlyProgress.toFixed(1)}%</Text>

            <TextInput
              placeholder="Weekly Spending Target (₹)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={weeklyTarget}
              onChangeText={setWeeklyTarget}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount Spent This Week (₹)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={weeklySpent}
              onChangeText={setWeeklySpent}
              style={styles.input}
            />
            <Text style={styles.progressText}>Weekly Target Completion: {weeklyProgress.toFixed(1)}%</Text>

            {/* Goal select */}
            <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-around' }}>
              <Button
                color={selectedGoal === 'monthly' ? '#FFD600' : '#999'}
                title="Track Monthly Goal"
                onPress={() => setSelectedGoal('monthly')}
              />
              <Button
                color={selectedGoal === 'weekly' ? '#FFD600' : '#999'}
                title="Track Weekly Goal"
                onPress={() => setSelectedGoal('weekly')}
              />
            </View>
          </View>

          {/* Daily Checklist */}
          {selectedGoal && (
            <View style={[styles.card, { backgroundColor: '#d7f9e3' }]}>
              <Text style={styles.cardTitle}>
                📅 Daily Checklist for {selectedGoal === 'monthly' ? 'Monthly' : 'Weekly'} Goal
              </Text>

              {dailyChecklist.length === 0 ? (
                <Text>No checklist items yet.</Text>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={toggleTodayDone}
                    style={[
                      styles.checkbox,
                      dailyChecklist[dailyChecklist.length - 1]?.done ? styles.checkboxDone : styles.checkboxUndone,
                    ]}
                  >
                    {dailyChecklist[dailyChecklist.length - 1]?.done && <Text style={{ color: '#fff' }}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={{ marginLeft: 10, color: '#111' }}>
                    {new Date(dailyChecklist[dailyChecklist.length - 1]?.date).toDateString()} -{' '}
                    {dailyChecklist[dailyChecklist.length - 1]?.done ? 'Completed' : 'Not Completed'}
                  </Text>
                </View>
              )}

              <Text style={{ marginTop: 10, color: '#111' }}>
                Completion: {completionPercent.toFixed(1)}%
              </Text>
            </View>
          )}

          {/* Chatbot */}
          <View style={[styles.card, { backgroundColor: '#f9f2d7' }]}>
            <Text style={styles.cardTitle}>🤖 Chatbot Assistant</Text>
            <ScrollView
              ref={scrollViewRef}
              style={{ maxHeight: 250, marginBottom: 10 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((item) => (
                <View
                  key={item.id}
                  style={[styles.chatBubble, item.from === 'user' ? styles.userBubble : styles.botBubble]}
                >
                  <Text style={{ color: '#000' }}>{item.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputContainer}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Ask me about budgeting..."
                placeholderTextColor="#555"
                style={styles.chatInput}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <Button color="#FFD600" title="Send" onPress={sendMessage} />
            </View>
          </View>

          {/* bottom spacer so we never clash with the bulged Play tab */}
          <View style={{ height: 96 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 12, // SafeArea handles the rest
    paddingBottom: 8,
  },
  headerText: {
    color: '#FFD600',
    fontSize: 28,
    fontWeight: 'bold',
  },

  container: {
    paddingHorizontal: 15,
    paddingBottom: 0,
  },

  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#111',
  },
  resultText: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
  },
  progressText: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },

  chatBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#FFD600',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },

  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
    color: '#111',
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: { backgroundColor: '#4caf50' },
  checkboxUndone: { backgroundColor: '#ccc' },
});
