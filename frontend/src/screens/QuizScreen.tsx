import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

import api from '../api/api';
import { log } from '../utils/logger';
import ScreenWrapper from '../components/ScreenWrapper';
import useModal from '../hooks/useModal';
import { useGlobalProgress } from "../context/GlobalProgressContext";

/* ----------------------------------------------------------
 * 🔥 ULTRA BOWO SANTA CRUZ — ANIMATIONS
 * ---------------------------------------------------------- */

const usePulse = () => {
  const scale = new Animated.Value(1);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 2.05,
        duration: 210,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 210,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { scale, pulse };
};

const useFlames = () => {
  const opacity = new Animated.Value(0);

  const ignite = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.2,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { opacity, ignite };
};

/* ----------------------------------------------------------
 * 🔥 QUIZSCREEN — VERSION ULTRA BOWO
 * ---------------------------------------------------------- */
export default function QuizScreen({ route, navigation }) {
  const { trickId } = route.params;

  const [quiz, setQuiz] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selected, setSelected] = useState(null);

  const { refreshProgress } = useGlobalProgress();
  const { showModal } = useModal();

  const { scale: pulsateScale, pulse: triggerPulse } = usePulse();
  const { opacity: flamesOpacity, ignite } = useFlames();

  const shuffle = (arr) =>
    arr
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);

  /* ----------------------------------------------------------
   * LOAD QUIZ
   * ---------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        log('QuizScreen loading quiz for', trickId);

        const { data } = await api.get(`/quiz/${trickId}`);
        setQuiz(data);

        const answers = data.answers.map((text, index) => ({
          text,
          originalIndex: index,
        }));

        setShuffledAnswers(shuffle(answers));

      } catch (err) {
        log("QuizScreen.loadQuiz error", err);
        showModal({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger le quiz.',
          confirmText: 'OK',
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trickId]);

  /* ----------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------- */
  const submit = async () => {
    try {
      if (!selected) return;

      const { data } = await api.post('/quiz/validate', {
        trickId,
        answerIndex: selected.originalIndex,
      });

      if (data.maxAttemptsReached) {
        navigation.replace('FunFact', {
          funFact: data.funFact || '',
          trickId,
        });
        return;
      }

      if (data.success) {
        showModal({
          type: 'success',
          title: 'Bonne réponse 🔥',
          message: 'Trick débloqué !',
          confirmText: 'Continuer',
          onConfirm: async () => {
            await refreshProgress();
            navigation.replace('TrickLearn', { trickId });
            return true;
          },
        });
        return;
      }

      showModal({
        type: 'warning',
        title: 'Mauvaise réponse',
        message: 'Réessaie !',
        confirmText: 'OK',
      });

    } catch (err) {
      log("QuizScreen.loadQuiz error", err);
      showModal({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de valider.',
        confirmText: 'OK',
      });
    }
  };

  if (!quiz)
    return (
      <View style={{ flex: 1, backgroundColor: '#3a1a6b' }}>
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>
          Loading…
        </Text>
      </View>
    );

  /* ----------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------- */
  return (
    <View style={styles.screen}>
      <ScreenWrapper>

        <Text style={styles.questionTitle}>🔥 Quiz Time ! 🔥</Text>
        <Text style={styles.question}>{quiz.question}</Text>

        {shuffledAnswers.map((ans, i) => {
          const isActive = selected === ans;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                setSelected(ans);
                triggerPulse();
                ignite();
              }}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.answerBox,
                  isActive && styles.answerActive,
                  isActive && { transform: [{ scale: pulsateScale }] }
                ]}
              >
                <Text style={styles.answerText}>{ans.text}</Text>

                {/* 🔥 Flames effect */}
                {isActive && (
                  <Animated.Text
                    style={[styles.flames, { opacity: flamesOpacity }]}
                  >
                    🔥🔥🔥
                  </Animated.Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.submitBtn,
            !selected && { opacity: 0.3 },
          ]}
          disabled={!selected}
          onPress={submit}
        >
          <Text style={styles.submitText}>Valider</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.backBtnText}>← Retour au park</Text>
        </TouchableOpacity>

      </ScreenWrapper>
    </View>
  );
}

/* ----------------------------------------------------------
 * 🎨 ULTRA BOWO SANTA CRUZ STYLE
 * ---------------------------------------------------------- */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#3a1a6b',
  },

  questionTitle: {
    fontSize: 28,
    textAlign: 'center',
    color: '#FFD600',
    fontWeight: '900',
    textShadowColor: '#FF355E',
    textShadowRadius: 8,
    marginBottom: 6,
  },

  question: {
    fontSize: 18,
    color: '#0AA5FF',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 24,
  },

  answerBox: {
    backgroundColor: '#111827',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#0AA5FF',
    marginVertical: 10,
    shadowColor: '#0AA5FF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  answerActive: {
    backgroundColor: '#1F2937',
    borderColor: '#FFD600',
    shadowColor: '#FFD600',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },

  answerText: {
    color: '#F9FAFB',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  flames: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 16,
  },

  submitBtn: {
    backgroundColor: '#FFD600',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 28,

    shadowColor: '#FFD600',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },

  submitText: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
  },

  backBtn: {
    marginTop: 26,
    paddingVertical: 12,
    borderRadius: 16,
    borderColor: '#FF355E',
    borderWidth: 2,
    backgroundColor: '#1A1B20',

    shadowColor: '#FF355E',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  backBtnText: {
    textAlign: 'center',
    color: '#FF355E',
    fontWeight: '900',
    fontSize: 14,
  },
});
