import React from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function FunFactScreen({ route, navigation }) {
  const { funFact } = route.params || {};

  const onBack = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenWrapper>
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
            <Text style={styles.backBtnText}>Back to Park</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>    
    </SafeAreaView>
  );
}

/* 🎨 STYLE SANTA CRUZ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a1a6b',
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
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: "#0AA5FF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD600", // outline jaune Santa Cruz
  },

  retryText: {
    fontFamily: "Bangers",
    color: "#FFFFFF",
    fontSize: 24,
    letterSpacing: 1,
    textShadowColor: "#FFD600",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,       // très léger → NET
  }, 

  // BACK BUTTON
  backBtn: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD600",     // jaune neon
    backgroundColor: "#020617",
  },

  backBtnText: {
    fontFamily: "Bangers",
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "#FFD600",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
