import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function Loading({ text = 'Loading My Board, My World...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00FFA3" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
});
