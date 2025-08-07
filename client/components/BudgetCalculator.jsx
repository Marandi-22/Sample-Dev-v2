import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function BudgetCalculator() {
  const [income, setIncome] = useState('');
  const [rent, setRent] = useState('');
  const [groceries, setGroceries] = useState('');
  const [misc, setMisc] = useState('');
  const [chartData, setChartData] = useState([]);

  const handleCalculate = () => {
    const inc = parseFloat(income) || 0;
    const r = parseFloat(rent) || 0;
    const g = parseFloat(groceries) || 0;
    const m = parseFloat(misc) || 0;
    const others = Math.max(inc - r - g - m, 0);

    const data = [
      { name: 'Rent',      amount: r, color: '#FF6384', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Groceries', amount: g, color: '#36A2EB', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Misc',      amount: m, color: '#FFCE56', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Other',     amount: others, color: '#8BC34A', legendFontColor: '#333', legendFontSize: 12 },
    ];
    setChartData(data);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Budget Calculator
      </Text>

      <TextInput
        label="Monthly Income"
        value={income}
        onChangeText={setIncome}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Rent / Housing"
        value={rent}
        onChangeText={setRent}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Groceries"
        value={groceries}
        onChangeText={setGroceries}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Miscellaneous"
        value={misc}
        onChangeText={setMisc}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button mode="contained" onPress={handleCalculate} style={styles.button}>
        Calculate
      </Button>

      {chartData.length > 0 && (
        <PieChart
          data={chartData}
          width={screenWidth * 0.9}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: 'center' },
  heading: { marginBottom: 16, fontWeight: '600' },
  input: { width: '100%', marginBottom: 12 },
  button: { marginVertical: 12, width: '50%' },
});
