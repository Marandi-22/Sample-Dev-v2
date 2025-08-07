// components/HelpCard.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

const HelpCard = ({ title, description, phone, link }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleLink = () => {
    Linking.openURL(link);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.buttonContainer}>
        {phone && (
          <TouchableOpacity style={styles.button} onPress={handleCall}>
            <Text style={styles.buttonText}>📞 Call {phone}</Text>
          </TouchableOpacity>
        )}
        {link && (
          <TouchableOpacity style={styles.button} onPress={handleLink}>
            <Text style={styles.buttonText}>🌐 Visit Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default HelpCard;
