import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

export default function TrickCard({ trick }) {
  const fallbackImage = require('../../assets/images/home.jpg');

  const finalImage =
    trick?.images?.[0]
      ? { uri: trick.images[0] }
      : fallbackImage;

  return (
    <View style={styles.card}>
      {/* IMAGE */}
      <Image source={finalImage} style={styles.image} />

      {/* NAME */}
      <View style={styles.info}>
        <Text style={styles.title}>{trick.name}</Text>
        {trick?.difficulty && (
          <Text style={styles.difficulty}>Difficulty: {trick.difficulty}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1B20',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0AA5FF',
  },

  image: {
    width: '100%',
    height: 160,
  },

  info: {
    padding: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#0AA5FF',
    letterSpacing: 1,
    textShadowColor: '#FF355E',
    textShadowRadius: 4,
  },

  difficulty: {
    marginTop: 4,
    fontSize: 12,
    color: '#FFD600',
    fontWeight: '700',
  },
});
