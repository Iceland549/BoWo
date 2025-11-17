import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { getProfile, logout } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { log } from '../utils/logger';
import XPBar from '../components/XPBar';

export default function ProfileScreen({ navigation }) {
  const { clearCredentials } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        log('Profile loaded', data);
      } catch (err) {
        log('ProfileScreen error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onLogout = async () => {
    await logout();
    clearCredentials();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  // fallback pour supporter XP / xp, Level / level, etc.
  const xp = profile?.xp ?? profile?.XP ?? 0;
  const level = profile?.level ?? profile?.Level ?? 0;
  const totalUnlocked = profile?.totalUnlocked ?? profile?.TotalUnlocked ?? 0;
  const totalTricksAvailable =
    profile?.totalTricksAvailable ?? profile?.TotalTricksAvailable ?? 0;
  const completionPercent =
    profile?.completionPercent ?? profile?.CompletionPercent ?? 0;

  const nextLevelXP = (level + 1) * 500;

  return (
    <View style={styles.container}>
      {/* TITLE */}
      <Text style={styles.title}>My Board, My World</Text>

      {/* PROFILE CARD */}
      <View style={styles.card}>
        <Text style={styles.label}>Niveau</Text>
        <Text style={styles.value}>{level}</Text>

        {/* XP BAR */}
        <XPBar xp={xp} nextLevelXP={nextLevelXP} />

        <Text style={styles.label}>Tricks débloqués</Text>
        <Text style={styles.value}>
          {totalUnlocked}/{totalTricksAvailable}
        </Text>

        <Text style={styles.label}>Progression globale</Text>
        <Text style={styles.value}>{completionPercent}%</Text>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

/* --------------- SANTA CRUZ STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    padding: 20,
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
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
    textShadowColor: '#FF355E',
    textShadowRadius: 4,
  },
  logoutBtn: {
    backgroundColor: '#FF355E',
    paddingVertical: 14,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFD600',
    alignSelf: 'center',
    width: '70%',
  },
  logoutText: {
    color: '#111215',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
