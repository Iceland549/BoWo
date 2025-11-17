import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

export default function TrickCard({ trick }) {
  const image = trick?.images?.[0] || 'https://via.placeholder.com/400x250';

  return (
    <View style={styles.card}>
      {/* IMAGE */}
      <Image source={{ uri: image }} style={styles.image} />

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
    backgroundColor: '#1A1B20', // fond sombre Santa Cruz
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0AA5FF', // bleu électrique Santa Cruz
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
    color: '#0AA5FF',        // 💙 Nom du trick → BLEU ÉLECTRIQUE
    letterSpacing: 1,
    textShadowColor: '#FF355E', // mini glow rouge
    textShadowRadius: 4,
  },

  difficulty: {
    marginTop: 4,
    fontSize: 12,
    color: '#FFD600',         // jaune Santa Cruz
    fontWeight: '700',
  },
});
