import React from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useGlobalProgress } from "../context/GlobalProgressContext";
import useAds from '../hooks/useAds';
import { log } from '../utils/logger';
import useModal from '../hooks/useModal';
import useInterstitialNavigation from '../hooks/useInterstitialNavigation';

// === AJOUTS DUOLINGO-LIKE ===
import { useProgress } from "../context/ProgressContext";
import { useQuestion } from "../hooks/useQuestion";
import { useModalContext } from "../context/ModalContext";
import BoWoXPBar from "../components/BoWoXPBar";

export default function TrickDetailScreen({ route, navigation }) {
  const trick = route.params.trick;
  const { showRewardedAndUnlock } = useAds();
  const userId = localStorage.getItem('userId');
  const { showModal } = useModal();
  const navigateWithAd = useInterstitialNavigation();
  const { refreshProgress } = useGlobalProgress();

  // === PROGRESSION / QUESTIONS ===
  const { progress } = useProgress();
  const { openQuestionModal, showLevelUp } = useModalContext();
  const { loadQuestion, submit } = useQuestion(trick._id || trick.id);

  const current = progress[trick._id || trick.id] ?? { level: 0, totalXp: 0 };

  const onWatchAd = async () => {
    log('TrickDetailScreen.onWatchAd', trick.id || trick._id);
    try {
      const resp = await showRewardedAndUnlock({
        trickId: trick._id || trick.id,
        userId,
      });
      log('ad reward resp', resp);
      if (resp.success) {
        showModal({
          type: 'success',
          title: 'Trick débloqué 🎉',
          message: 'Nice, ce trick est maintenant à toi !',
          confirmText: 'Back to park',
          onConfirm: () => navigation.goBack(),
        });
      } else {
        showModal({
          type: 'error',
          title: 'Pas de récompense',
          message: resp.message || 'La vidéo n’a pas été validée.',
          confirmText: 'OK',
        });
      }
    } catch (e) {
      console.warn('Ad failed or was not watched', e);
      showModal({
        type: 'error',
        title: 'Pub non validée',
        message: 'La pub a échoué ou n’a pas été regardée jusqu’au bout.',
      });
    }
  };

  // ---------------------------------------------------------
  // QUESTION : DUOLINGO-LIKE
  // ---------------------------------------------------------
  const askQuestion = async () => {
    const res = await loadQuestion();
    if (!res?.question) return;

    openQuestionModal({
      trickId: trick._id || trick.id,
      question: res.question,
      onAnswer: async (selected) => {
        const result = await submit(res.question.level, selected);
        await refreshProgress();  // 🔥 synchronise la XP globale

        if (result.correct && result.newLevel > current.level) {
          showLevelUp({
            trickId: trick._id || trick.id,
            newLevel: result.newLevel,
            xpGained: result.xpGained,
          });
        }
        return result.correct;
      },
    });
  };

  if (!trick)
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FFD600" />
      </View>
    );

  return (
    <ScrollView
      style={{ backgroundColor: '#3a1a6b' }}
      contentContainerStyle={styles.container}
    >
      <ScreenWrapper>

        {/* TITLE */}
        <Text style={styles.title}>{trick.name}</Text>

        {/* XP BAR */}
        <View style={{ marginTop: 8, marginBottom: 20 }}>
          <BoWoXPBar currentXp={current.totalXp} nextLevelXp={100} />
        </View>

        {/* IMAGES */}
        {(trick.images || []).map((src, i) => (
          <Image key={i} style={styles.image} source={{ uri: src }} />
        ))}

        {/* BUTTONS */}
        <View style={styles.buttonsWrap}>
          {/* UNLOCK BUTTON */}
          <TouchableOpacity style={styles.adBtn} onPress={onWatchAd}>
            <Text style={styles.adBtnText}>Pay Only 0.49e to Unlock</Text>
          </TouchableOpacity>

          {/* OPEN QUIZ */}
          <TouchableOpacity
            style={styles.quizBtn}
            onPress={() =>
              navigateWithAd(() =>
                navigation.navigate('Quiz', { trickId: trick._id || trick.id })
              )
            }
          >
            <Text style={styles.quizBtnText}>Open Quiz</Text>
          </TouchableOpacity>

          {/* QUESTION */}
          <TouchableOpacity
            style={{
              backgroundColor: "#FFD600",
              paddingVertical: 14,
              borderRadius: 18,
              marginBottom: 14,
              borderWidth: 2,
              borderColor: "#15803D",
            }}
            onPress={askQuestion}
          >
            <Text
              style={{
                fontWeight: "900",
                color: "#111215",
                fontSize: 16,
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Répondre à une question
            </Text>
          </TouchableOpacity>
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.backBtnText}>← Back to Park</Text>
        </TouchableOpacity>

      </ScreenWrapper>
    </ScrollView>
  );
}


/* 🎨 SANTA CRUZ POP PUNK STYLES */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
        backgroundColor: '#3a1a6b',

  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#111215',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* TITLE */
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0AA5FF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  /* IMAGE */
  image: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFD600',
  },

  /* BUTTON AREA */
  buttonsWrap: {
    marginTop: 20,
    marginBottom: 18,
  },

  /* WATCH AD BUTTON */
  adBtn: {
    backgroundColor: '#FF355E',
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  adBtnText: {
    fontWeight: '900',
    color: '#111215',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* OPEN QUIZ BUTTON */
  quizBtn: {
    backgroundColor: '#0AA5FF',
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#FF355E',
  },
  quizBtnText: {
    fontWeight: '900',
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* BACK BUTTON */
  backBtn: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: '#0AA5FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  backBtnText: {
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
