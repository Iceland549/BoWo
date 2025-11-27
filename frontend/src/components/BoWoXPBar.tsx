import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BoWoXPBar({
  currentXp,
  nextLevelXp,
}: {
  currentXp: number;
  nextLevelXp: number;
}) {
  // on sécurise : éviter division par 0
  const safeNext = nextLevelXp > 0 ? nextLevelXp : 80;

  // ratio pour la largeur
  const ratio = Math.max(0, Math.min(1, currentXp / safeNext));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>XP</Text>

      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
      </View>

      <Text style={styles.value}>
        {currentXp}/{safeNext}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    color: "#FFD600",
    fontWeight: "bold",
    marginBottom: 4,
  },
  barBackground: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#222",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#00FFA3",
  },
  value: {
    marginTop: 4,
    color: "#fff",
    fontSize: 12,
  },
});
