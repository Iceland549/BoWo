import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import api from '../api/api';
import { getProfile } from '../services/authService';
import { log } from '../utils/logger';

export default function MiniGameUnlockChoice({ route, navigation }) {
  const { selected } = route.params || {};
  const [loading, setLoading] = useState(false);

  const MINI_GAME_LABELS: Record<string, string> = {
    'coin-flip': 'Flip Coin',
    'magic-8ball': 'Magic 8-Ball',
    'fortune-cookie': 'Fortune Cookie',
    'casino-slot': 'Casino Trick Slot',
  };

  const readableName = MINI_GAME_LABELS[selected] || "Mini-Game";

  const unlock = async () => {
    try {
      setLoading(true);

      const { data } = await api.post('/progress/unlock-mini-game', {
        key: selected,
      });

      log("Mini-game unlocked", data);

      // On recharge la progression globale
      await getProfile();

      // On navigue immédiatement vers le mini-jeu
      switch (selected) {
        case 'coin-flip':
          navigation.replace('KillerTimeCoinFlip');
          break;
        case 'magic-8ball':
          navigation.replace('Magic8Ball');
          break;
        case 'fortune-cookie':
          navigation.replace('FortuneCookie');
          break;
        case 'casino-slot':
          navigation.replace('CasinoSlot');
          break;
      }
    } catch (err) {
      log("Unlock mini-game error", err);
      alert("Impossible de débloquer ce mini-jeu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Débloquer un mini-jeu ?</Text>

      <View style={styles.card}>
        <Text style={styles.gameName}>{readableName}</Text>

        <Text style={styles.desc}>
          Tu as débloqué 2 tricks 🎉{"\n"}
          Tu peux débloquer ce mini jeu si tu veux{"\n"}
          <Text style={{ fontWeight: '900' }}>{readableName}</Text> ?
        </Text>
      </View>

      {/* Boutons */}
      <TouchableOpacity
        disabled={loading}
        style={[styles.btnUnlock, loading && { opacity: 0.4 }]}
        onPress={unlock}
      >
        {loading ? (
          <ActivityIndicator color="#111" />
        ) : (
          <Text style={styles.btnUnlockText}>Débloquer maintenant</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnCancel}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btnCancelText}>Annuler</Text>
      </TouchableOpacity>
    </View>
  );
}

/* 🎨 STYLE SANTA CRUZ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0AA5FF',
    textTransform: 'uppercase',
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
    marginBottom: 30,
  },

  card: {
    backgroundColor: '#1A1B20',
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD600',
    width: '100%',
    marginBottom: 30,
  },

  gameName: {
    color: '#FFD600',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
  },

  desc: {
    color: '#EDECF8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },

  btnUnlock: {
    backgroundColor: '#FFD600',
    paddingVertical: 14,
    width: '80%',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#111',
    marginBottom: 20,
  },
  btnUnlockText: {
    color: '#111',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 16,
  },

  btnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF355E',
  },
  btnCancelText: {
    color: '#FF355E',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 15,
  },
});
