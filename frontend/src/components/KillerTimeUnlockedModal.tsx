import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function KillerTimeUnlockedModal({ visible, onClose, navigation }) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>

          <Text style={styles.title}>🔥 Nouveau Killer-Time !</Text>
          <Text style={styles.text}>Le mini-jeu “Coin Flip” est débloqué !</Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              onClose();
              navigation.navigate('KillerTimeCoinFlip');
            }}>
            <Text style={styles.btnText}>Jouer maintenant</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Fermer</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  box: {
    width: '80%',
    backgroundColor: '#1A1B20',
    borderRadius: 20,
    padding: 24,
    borderWidth: 3,
    borderColor: '#FFD600',
  },
  title: {
    color: '#0AA5FF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    color: '#FFD600',
    textAlign: 'center',
    marginVertical: 20,
  },
  btn: {
    backgroundColor: '#0AA5FF',
    padding: 12,
    borderRadius: 12,
  },
  btnText: {
    fontWeight: '900',
    textAlign: 'center',
    color: '#111',
  },
  closeBtn: { marginTop: 12 },
  closeText: { color: '#FFD600', textAlign: 'center' },
});
