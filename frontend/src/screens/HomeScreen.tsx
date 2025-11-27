import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import ScreenWrapper from '../components/ScreenWrapper';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import api from '../api/api';
import TrickCard from '../components/TrickCard';
import { log } from '../utils/logger';
import useModal from '../hooks/useModal';
import { getProfile } from '../services/authService';

// === DUOLINGO-LIKE ADDITIONS ===
import { useProgress } from "../context/ProgressContext";
import { useQuestion } from "../hooks/useQuestion";
import { useModalContext } from "../context/ModalContext";
import BoWoXPBar from "../components/BoWoXPBar";

/**
 * ✅ Composant pour UNE ligne de trick dans la liste
 * (on peut y utiliser des Hooks sans violer les règles)
 */
const TrickRow = ({
  item,
  profile,
  navigation,
  progressByTrick,
  openQuestionModal,
  showLevelUp,
}) => {
  const trickId = item._id || item.id;

  // trick débloqué ?
  const isUnlocked =
    profile?.unlockedTricks?.includes(trickId) === true;

  // progression Duolingo-like
  const prog = progressByTrick[trickId] ?? { level: 0, totalXp: 0 };

  // Hook spécifique à ce trick
  const { loadQuestion, submit } = useQuestion(trickId);

  const continueOrAsk = async () => {
    if (!isUnlocked) {
      // pas débloqué → TrickDetail (pub/paiement)
      navigation.navigate("TrickDetail", { trick: item });
      return;
    }

    // Trick débloqué → d’abord une question si dispo
    const q = await loadQuestion();
    if (q?.question) {
      openQuestionModal({
        trickId,
        question: q.question,
        onAnswer: async (selected) => {
          const result = await submit(q.question.level, selected);
          if (result.correct && result.newLevel > prog.level) {
            showLevelUp({
              trickId,
              newLevel: result.newLevel,
              xpGained: result.xpGained,
            });
          }
        },
      });
      return;
    }

    // sinon → TrickLearnScreen
    navigation.navigate("TrickLearn", { trickId });
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("TrickDetail", { trick: item })
        }
      >
        <TrickCard trick={{ ...item, isUnlocked }} />
      </TouchableOpacity>

      {/* XP BAR */}
      <View style={{ marginTop: 6, paddingHorizontal: 6 }}>
        <BoWoXPBar currentXp={prog.totalXp} nextLevelXp={80} />
      </View>

      {/* BOUTON CONTINUER */}
      {isUnlocked && (
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={continueOrAsk}
        >
          <Text style={styles.continueBtnText}>
            {prog.level >= 8
              ? "Mastered 🔥"
              : `Continuer (Lvl ${prog.level}/8)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [tricks, setTricks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 profil utilisateur (unlockedTricks)
  const [profile, setProfile] = useState(null);

  const { token, clearCredentials } = useAuthStore();
  const { showModal } = useModal();

  // === PROGRESSION / QUESTION SYSTEM (global) ===
  const { progress: progressByTrick } = useProgress();
  const { openQuestionModal, showLevelUp } = useModalContext();

  // -----------------------------------------------------------
  // FETCH tricks + profil user
  // -----------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        log('HomeScreen.fetch tricks');
        const { data } = await api.get('/content/tricks');
        setTricks(data);

        const p = await getProfile();
        setProfile(p);

        log('HomeScreen.tricks loaded', data.length);
      } catch (err) {
        log('HomeScreen.fetch error', err);
        showModal({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les tricks.',
          confirmText: 'OK',
        });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------------------------------------
  // LOADING STATE
  // -----------------------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Loading tricks…</Text>
      </SafeAreaView>
    );
  }

  // -----------------------------------------------------------
  // MAIN RENDER
  // -----------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <ScreenWrapper>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔥 TRICKS</Text>
          <Text style={styles.headerSubtitle}>Choose your next move</Text>
        </View>

        {/* LOGIN / LOGOUT */}
        <View style={styles.topButtons}>
          {!token ? (
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.topBtnText}>Login</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                clearCredentials();
                navigation.replace("Login");
              }}
            >
              <Text style={styles.topBtnText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTE DES TRICKS */}
        <FlatList
          data={tricks}
          keyExtractor={(i) => i.id || i._id || i.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TrickRow
              item={item}
              profile={profile}
              navigation={navigation}
              progressByTrick={progressByTrick}
              openQuestionModal={openQuestionModal}
              showLevelUp={showLevelUp}
            />
          )}
        />
      </ScreenWrapper>
    </SafeAreaView>
  );
}

/* 🎨 SANTA CRUZ STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    paddingHorizontal: 6,
  },

  topButtons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 99,
  },
  topBtnText: {
    color: '#FFD600',
    fontWeight: '900',
    fontSize: 14,
    backgroundColor: '#1A1B20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF355E',
  },

  /* LOADING */
  loadingScreen: {
    flex: 1,
    backgroundColor: '#111215',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFD600',
    fontWeight: '700',
  },

  /* HEADER */
  header: {
    marginTop: 12,
    marginBottom: 12,
  },
  headerTitle: {
    color: '#0AA5FF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },
  headerSubtitle: {
    color: '#FFD600',
    fontSize: 14,
    marginTop: -6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* BOUTON CONTINUER */
  continueBtn: {
    marginTop: 8,
    backgroundColor: "#0AA5FF",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FF355E",
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
