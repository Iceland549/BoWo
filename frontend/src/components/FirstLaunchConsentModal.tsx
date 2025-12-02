import React from "react";
import { View, Modal, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FirstLaunchConsentModal({ visible, onAccept, onOpenLegal }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Welcome to BoWo 🛹🔥</Text>
          <Text style={styles.text}>
            En utilisant l’application, vous acceptez les CGU et la Politique de Confidentialité.
          </Text>

          <TouchableOpacity onPress={onOpenLegal}>
            <Text style={styles.link}>Voir les documents</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={onAccept}>
            <Text style={styles.btnText}>J’accepte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#1A1B20",
    padding: 25,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFD600",
    width: "85%",
  },
  title: {
    fontSize: 24,
    color: "#0AA5FF",
    fontWeight: "900",
    textAlign: "center",
  },
  text: {
    color: "#EDECF8",
    textAlign: "center",
    marginVertical: 12,
  },
  link: {
    color: "#FFD600",
    textAlign: "center",
    textDecorationLine: "underline",
    marginBottom: 18,
  },
  btn: {
    backgroundColor: "#FFD600",
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: "#111",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 18,
  },
});
