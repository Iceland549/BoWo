// frontend/src/screens/ProfileScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useIsFocused } from '@react-navigation/native';
import { useModalContext } from '@/context/ModalContext';
import { getProfile } from '../services/authService';
import { log } from '../utils/logger';
import XPBar from '../components/XPBar';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showModal } = useModalContext();
  const isFocused = useIsFocused();

  const logoFlip = require('../../assets/logos/flip-coin2_logo.png');
  const logoMagic = require('../../assets/logos/magic-ball_logo.png');
  const logoFortune = require('../../assets/logos/fortune2_logo.png');
  const logoCasino = require('../../assets/logos/casino_logo.png');

  /* -------------------------------------------------------- */
  /*   🔵 FONCTION DE CHARGEMENT DU PROFIL                    */
  /* -------------------------------------------------------- */
  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      log('Profile refreshed OK', data);
    } catch (err) {
      log('ProfileScreen error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* -------------------------------------------------------- */
  /*   🔵 CHARGER UNE PREMIÈRE FOIS AU MONTAGE                */
  /* -------------------------------------------------------- */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* -------------------------------------------------------- */
  /*   🔵 REFRESH QUAND L’ÉCRAN REVIENT EN FOCUS             */
  /* -------------------------------------------------------- */
  useEffect(() => {
    if (isFocused) {
      // ⚠️ ici on NE remet PAS loading à true pour éviter le flash
      loadProfile();
    }
  }, [isFocused, loadProfile]);

  /* -------------------------------------------------------- */
  /*   🔄 LOADING                                             */
  /* -------------------------------------------------------- */
  if (loading || !profile) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  /* -------------------------------------------------------- */
  /*  📊 MAPPING PROPS BACKEND → UI                           */
  /* -------------------------------------------------------- */
  const xp = profile?.xp ?? 0;
  const level = profile?.level ?? 0;
  const totalUnlocked =
    profile?.totalUnlocked ??
    profile?.unlockedTricks?.length ??
    0;
  const totalTricksAvailable = profile?.totalTricksAvailable ?? 0;
  const completionPercent = profile?.completionPercent ?? 0;

  const nextLevelXP = (level + 1) * 500;
  const xpPercent = Math.min((xp / nextLevelXP) * 100, 100);

  const getLevelTitle = () => {
    if (level >= 5) return 'Skate Legend 👑';
    if (level === 4) return 'Urban Shredder ⚡';
    if (level === 3) return 'Street Soldier 💥';
    if (level === 2) return 'Pop Master 🔥';
    if (level === 1) return 'Street Rat 🛹';
    return 'Rookie 🐣';
  };

  const levelTitle = getLevelTitle();

  const getMotivation = () => {
    if (xpPercent >= 90) return '🔥 Tu touches le prochain niveau !';
    if (xpPercent >= 50) return '⚡ Beau flow, continue comme ça !';
    if (totalUnlocked >= 10)
      return '🛹 Tu commences à avoir un vrai style !';
    if (totalUnlocked >= 5)
      return '💥 Tu montes en puissance, keep pushing !';
    return '🌟 Chaque trick débloqué fait de toi un meilleur rider !';
  };

  const motivation = getMotivation();

  /* -------------------------------------------------------- */
  /*  🔓 LOGIQUE MINI-JEUX (Débloqué après 2 tricks)          */
  /* -------------------------------------------------------- */
  const canUnlockMiniGames = totalUnlocked >= 2;
  const unlockedMiniGames = profile.unlockedMiniGames || [];

  const MINI_GAMES = [
    { name: 'Flip Coin', key: 'coin-flip', screen: 'KillerTimeCoinFlip', logo: logoFlip },
    { name: 'Magic 8-Ball', key: 'magic-8ball', screen: 'Magic8Ball', logo: logoMagic },
    { name: 'Fortune Cookie', key: 'fortune-cookie', screen: 'FortuneCookie', logo: logoFortune },
    { name: 'Casino Trick Slot', key: 'casino-slot', screen: 'CasinoTrickSlot', logo: logoCasino },
  ];

  const onPressMiniGame = (game) => {
    const isUnlocked = unlockedMiniGames.includes(game.key);

    if (isUnlocked) {
      navigation.navigate(game.screen);
      return;
    }

    if (!canUnlockMiniGames) {
      showModal({
        title: 'Mini-jeu verrouillé',
        message: 'Débloque 2 tricks pour jouer à ce mini-jeu !',
        type: 'warning',
        confirmText: 'OK',
      });
      return;
    }

    navigation.navigate('MiniGameUnlockChoice', { selected: game.key });
  };

  /* -------------------------------------------------------- */
  /*  🎨 RENDER                                                */
  /* -------------------------------------------------------- */
  return (
    <View style={styles.container}>
      <ScreenWrapper>
        <Text style={styles.title}>My Board, My World</Text>

        {/* PROFILE CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Niveau</Text>
          {level > 0 && <Text style={styles.value}>{level}</Text>}
          <Text style={styles.levelTitle}>{levelTitle}</Text>

          <XPBar xp={xp} nextLevelXP={nextLevelXP} />

          <Text style={styles.label}>Tricks débloqués</Text>
          <Text style={styles.value}>
            {totalUnlocked}/{totalTricksAvailable}
          </Text>

          <Text style={styles.label}>Progression globale</Text>
          <Text style={styles.value}>{completionPercent}%</Text>

          <Text style={styles.motivation}>{motivation}</Text>
        </View>

        {/* 🔥 TIME-KILLER ZONE */}
        <Text style={styles.killZoneTitle}>TIME-KILLER ZONE</Text>

        <View style={styles.grid}>
          {MINI_GAMES.map((g) => {
            const isUnlocked = unlockedMiniGames.includes(g.key);

            return (
              <TouchableOpacity
                key={g.key}
                style={[
                  styles.gameBtn,
                  !isUnlocked && styles.gameLocked,
                ]}
                onPress={() => onPressMiniGame(g)}
              >
                <Image source={g.logo} style={styles.gameLogo} resizeMode="contain" />
                <Text style={styles.gameName}>{g.name}</Text>

                <Text style={styles.gameInfo}>
                  {isUnlocked
                    ? 'Débloqué ✔'
                    : !canUnlockMiniGames
                    ? 'Débloqué après 2 tricks !'
                    : 'Choisis ce mini-jeu à débloquer'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🔙 BACK TO PARK */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('LegalMenu')}
          style={styles.legalBtn}
        >
          <Text style={styles.legalText}>Informations légales</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    </View>
  );
}


/* -------------------------------------------------------- */
/*              🎨 SANTA CRUZ STYLES                         */
/* -------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3a1a6b', padding: 20 },

  title: {
    fontSize: 32,
    color: '#0AA5FF',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 30,
    textTransform: 'uppercase',
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  card: {
    backgroundColor: '#1A1B20',
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFD600',
    marginBottom: 40,
  },
  label: {
    color: '#FFD600',
    fontSize: 14,
    marginTop: 12,
    opacity: 0.8,
  },
  value: {
    color: '#0AA5FF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    textShadowColor: '#FF355E',
    textShadowRadius: 4,
  },
  levelTitle: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 12,
  },
  motivation: {
    marginTop: 14,
    color: '#EDECF8',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
  },

  /* TIME-KILLER */
  killZoneTitle: {
    color: '#0AA5FF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameBtn: {
    width: '48%',
    backgroundColor: '#0AA5FF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD600',
    marginBottom: 16,
  },
  gameLocked: {
    backgroundColor: '#555',
    opacity: 0.6,
  },
  gameName: {
    color: '#111',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 16,
  },
  gameInfo: {
    color: '#111',
    textAlign: 'center',
    marginTop: 4,
    fontSize: 13,
  },
  gameLogo: {
    width: 70,
    height: 70,
    alignSelf: 'center',
    marginBottom: 8,
  },


  /* BACK */
  backBtn: {
    marginTop: 10,
    marginBottom: 10,
    borderColor: '#FF355E',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'center',
    width: '70%',
  },
  backText: {
    color: '#FF355E',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111215',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFD600',
    fontSize: 14,
  },

  /* LEGAL BUTTON */
  legalBtn: {
    marginTop: 6,
    marginBottom: 20,
    paddingVertical: 10,
    alignSelf: "center",
  },

  legalText: {
    color: "#0AA5FF",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "800",
  },
});
