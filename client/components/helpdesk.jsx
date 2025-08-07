// app/fraud.jsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import HelpCard from '../components/HelpCard';

export default function helpdesk() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>🛟 Help Desk – Report a Scam</Text>

      <HelpCard
        title="Cyber Crime Help"
        description="Report UPI fraud, online banking theft, or scam websites."
        phone="1930"
        link="https://cybercrime.gov.in"
        index={0}
      />

      <HelpCard
        title="Banking Fraud Support"
        description="Contact your bank and escalate complaints to RBI if unresolved."
        link="https://cms.rbi.org.in"
        index={1}
      />

      <HelpCard
        title="Investment Scam Support"
        description="Report fake investment platforms or Ponzi schemes."
        link="https://scores.gov.in"
        index={2}
      />

      <HelpCard
        title="Consumer Complaints"
        description="Report e-commerce frauds or product scams to the consumer forum."
        link="https://consumerhelpline.gov.in"
        index={3}
      />

      <HelpCard
        title="PAN / Tax Fraud"
        description="Raise complaints regarding PAN misuse or fake tax calls."
        link="https://incometax.gov.in"
        index={4}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f4f7',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },
});
