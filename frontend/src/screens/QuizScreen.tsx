import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../api/api';
import { log } from '../utils/logger';
import ScreenWrapper from '../components/ScreenWrapper';

export default function QuizScreen({ route, navigation }) {
  const { trickId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const [result, setResult] = useState(null);


  useEffect(() => {
    (async () => {
      try {
        log('QuizScreen loading quiz for', trickId);
        const { data } = await api.get(`/quiz/${trickId}`);
        setQuiz(data);
        log('QuizScreen quiz loaded', data);
      } catch (err) {
        log('QuizScreen error', err);
        alert('Could not load quiz');
      }
    })();
  }, [trickId]);

  const submit = async () => {
    try {
      const { data } = await api.post('/quiz/validate', {
        trickId,
        answerIndex: selected
      });

      setResult(data);

      // 🟥 NOUVEAU : Max attempts reached → navigation Fun Fact
      if (data.maxAttemptsReached) {
        navigation.replace('FunFact', {
          funFact: data.funFact || "Aucun fun fact disponible.",
          trickId
        });
        return;
      }

      // 🟩 Bonne réponse
      if (data.success) {
        alert('Correct! Trick unlocked 🎉');
        navigation.replace('TrickLearn', { trickId });
      } 
      // 🟥 Mauvaise réponse (1ère ou 2ème tentative)
      else {
        alert(data.message)
      }

    } catch (err) {
      log('QuizScreen.submit error', err);
      alert('Validation error');
    }
  };

  if (!quiz) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <ScreenWrapper>
        <Text style={styles.question}>{quiz.question}</Text>

        {quiz.answers.map((a, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSelected(i)}
            style={[
              styles.answer,
              selected === i && styles.answerSelected
            ]}
          >
            <Text style={styles.answerText}>{a}</Text>
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
    padding: 16
  },

  question: {
    fontSize: 20,
    color: '#0AA5FF',
    marginBottom: 20,
    fontWeight: '800',
    textAlign: 'center'
  },

  answer: {
    backgroundColor: '#1A1B20',
    padding: 14,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333'
  },

  answerSelected: {
    borderColor: '#FFD600',
    backgroundColor: '#23252D'
  },

  answerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15
  },

  submitBtn: {
    backgroundColor: '#FFD600',
    padding: 14,
    borderRadius: 12,
    marginTop: 20
  },

  submitDisabled: {
    opacity: 0.4
  },

  submitText: {
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase'
  },

  backBtn: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderColor: '#FF355E',
    borderWidth: 2
  },

  backBtnText: {
    color: '#FF355E',
    textAlign: 'center',
    fontWeight: '700'
  }
});
