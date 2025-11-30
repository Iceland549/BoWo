import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../api/api';
import { log } from '../utils/logger';
import ScreenWrapper from '../components/ScreenWrapper';
import useModal from '../hooks/useModal';
import { useGlobalProgress } from "../context/GlobalProgressContext";

export default function QuizScreen({ route, navigation }) {
  const { trickId } = route.params;
  const [quiz, setQuiz] = useState(null);

  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const { refreshProgress } = useGlobalProgress();

  const { showModal } = useModal();

  // 🔀 Fonction de mélange
  const shuffle = (arr) =>
    arr
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);

  useEffect(() => {
    (async () => {
      try {
        log('QuizScreen loading quiz for', trickId);
        const { data } = await api.get(`/quiz/${trickId}`);

        setQuiz(data);

        // 🔀 préparation des réponses randomisées :
        const answers = data.answers.map((text, index) => ({
          text,
          originalIndex: index,
        }));

        setShuffledAnswers(shuffle(answers));

        log('QuizScreen quiz loaded', data);
      } catch (err) {
        log('QuizScreen error', err);
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

  const submit = async () => {
    try {
      const { data } = await api.post('/quiz/validate', {
        trickId,
        // 🟡 Envoi de l’index original (non randomisé)
        answerIndex: selected.originalIndex,
      });

      // 🟥 Max attempts → Redirection Fun Fact
      if (data.maxAttemptsReached) {
        navigation.replace('FunFact', {
          funFact: data.funFact || 'Aucun fun fact disponible.',
          trickId,
        });
        return;
      }

      // 🟩 Bonne réponse
      if (data.success) {
        showModal({
          type: 'success',
          title: 'Bonne réponse 🎉',
          message: 'Trick débloqué !',
          confirmText: 'Continuer',
          onConfirm: async () => {
            await refreshProgress();
            navigation.replace('TrickLearn', { trickId });
            return true;
          }
        });
        return;
      }

      // 🟥 Mauvaise réponse
      showModal({
        type: 'warning',
        title: 'Mauvaise réponse',
        message: data.message || 'Réessaie !',
        confirmText: 'OK',
      });

    } catch (err) {
      log('QuizScreen.submit error', err);
      showModal({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de valider ta réponse.',
        confirmText: 'OK',
      });
    }
  };

  if (!quiz) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <ScreenWrapper>

        <Text style={styles.question}>{quiz.question}</Text>

        {/* 🔀 Affichage des réponses randomisées */}
        {shuffledAnswers.map((ans, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSelected(ans)}
            style={[styles.answer, selected === ans && styles.answerSelected]}
          >
            <Text style={styles.answerText}>{ans.text}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          disabled={selected === null}
          onPress={submit}
          style={[styles.submitBtn, selected === null && styles.submitDisabled]}
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

/* 🎨 STYLE */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    padding: 16,
  },

  question: {
    fontSize: 20,
    color: '#0AA5FF',
    marginBottom: 20,
    fontWeight: '800',
    textAlign: 'center',
  },

  answer: {
    backgroundColor: '#1A1B20',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },

  answerSelected: {
    borderColor: '#FFD600',
    backgroundColor: '#23252D',
  },

  answerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
  },

  submitBtn: {
    backgroundColor: '#FFD600',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },

  submitDisabled: {
    opacity: 0.4,
  },

  submitText: {
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  backBtn: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderColor: '#FF355E',
    borderWidth: 2,
  },

  backBtnText: {
    color: '#FF355E',
    textAlign: 'center',
    fontWeight: '700',
  },
});
