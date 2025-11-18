import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function FunFactScreen({ route, navigation }) {
  const { funFact } = route.params || {};

  const onBack = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>Fun Fact ✨</Text>

      {/* BOX */}
      <View style={styles.card}>
        <Text style={styles.factText}>{funFact}</Text>

        <Text style={styles.subText}>
          Cool man 😎  
          {"\n"}Tu as atteint la limite d’essais pour aujourd’hui.
          {"\n"}Reviens demain pour retenter ta chance !
        </Text>
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonsWrapper}>

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={onBack}
        >
          <Text style={styles.retryText}>Réessayer demain</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
        >
          <Text style={styles.backText}>← Retour au park</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

/* 🎨 STYLE SANTA CRUZ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  header: {
    color: '#0AA5FF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#FF355E',
    textShadowRadius: 8,
    textTransform: 'uppercase',
    marginBottom: 30,
  },

  card: {
    backgroundColor: '#1A1B20',
    padding: 22,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD600',
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  factText: {
    color: '#EDECF8',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 16,
    fontWeight: '700',
  },

  subText: {
    color: '#9FA0A8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  buttonsWrapper: {
    marginTop: 35,
  },

  retryBtn: {
    backgroundColor: '#FFD600',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  retryText: {
    fontWeight: '900',
    textAlign: 'center',
    color: '#1A1B20',
    fontSize: 16,
    textTransform: 'uppercase',
  },

  backBtn: {
    borderColor: '#FF355E',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backText: {
    color: '#FF355E',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 15,
  },
});
