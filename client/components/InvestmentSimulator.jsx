import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function InvestmentSimulator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [growthData, setGrowthData] = useState([]);

  const handleSimulate = () => {
    const P = parseFloat(principal) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseInt(years, 10) || 0;
    const values = [];
    for (let year = 0; year <= n; year++) {
      const amount = P * Math.pow(1 + r, year);
      values.push(parseFloat(amount.toFixed(2)));
    }
    setGrowthData(values);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Investment Simulator
      </Text>

      <TextInput
        label="Principal (₹)"
        value={principal}
        onChangeText={setPrincipal}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Annual Rate (%)"
        value={rate}
        onChangeText={setRate}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Years"
        value={years}
        onChangeText={setYears}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button mode="contained" onPress={handleSimulate} style={styles.button}>
        Simulate
      </Button>

      {growthData.length > 0 && (
        <LineChart
          data={{
            labels: growthData.map((_, i) => `Y${i}`),
            datasets: [{ data: growthData }],
          }}
          width={screenWidth * 0.9}
          height={240}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{ marginVertical: 12, borderRadius: 8 }}
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
