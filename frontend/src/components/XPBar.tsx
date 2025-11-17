import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type XPBarProps = {
  xp: number;
  nextLevelXP: number;
};

export default function XPBar({ xp, nextLevelXP }: XPBarProps) {
  const ratio = nextLevelXP > 0 ? Math.min(xp / nextLevelXP, 1) : 0;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.xpText}>
        {xp} / {nextLevelXP} XP
      </Text>

      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    marginBottom: 10,
  },
  xpText: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  barBackground: {
    height: 20,
    width: '100%',
    backgroundColor: '#1A1B20',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD600',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#0AA5FF',
    borderRadius: 20,
    shadowColor: '#FF355E',
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
});
