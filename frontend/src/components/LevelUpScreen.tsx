import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  trickId: string;
  newLevel: number;
  xpGained: number;
  onClose: () => void;
}

export default function LevelUpScreen({
  visible,
  trickId,
  newLevel,
  xpGained,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>YOU LEVELED UP !!! 🔥</Text>

          <Text style={styles.text}>Trick : {trickId}</Text>
          <Text style={styles.text}>Nouveau niveau : {newLevel}</Text>
          <Text style={styles.text}>+{xpGained} XP</Text>

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Skate encore plus fort 🛹</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#111",
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFD600",
    width: "85%",
  },
  title: {
    color: "#FF355E",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 2,
  },
  btn: {
    marginTop: 16,
    backgroundColor: "#00FFA3",
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnText: {
    color: "#000",
    fontWeight: "800",
    textAlign: "center",
  },
});
