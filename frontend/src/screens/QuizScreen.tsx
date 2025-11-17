import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import api from '../api/api';
import { log } from '../utils/logger';

export default function QuizScreen({ route, navigation }) {
  const { trickId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        log('QuizScreen loading quiz for', trickId);
        const { data } = await api.get(`/quiz/${trickId}`);
        setQuiz(data);
      } catch (err) {
        log('QuizScreen error', err);
        alert('Could not load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [trickId]);

  const submit = async () => {
    try {
      const { data } = await api.post('/quiz/validate', {
        trickId,
        answerIndex: selected,
      });
      setResult(data);

      if (data.success) {
        alert('Correct! You unlocked this trick 🎉');
        navigation.replace('TrickLearn', { trickId });
      } else {
        alert(data.message || 'Wrong answer');
      }
    } catch (err) {
      log('QuizScreen.submit error', err);
      alert('Validation error');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Loading quiz…</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>No quiz available.</Text>

        {/* 🔵 Retour au park */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.backBtnText}>← Back to Park</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* TITLE */}
      <Text style={styles.title}>QUIZ</Text>
      <Text style={styles.question}>{quiz.question}</Text>

      {/* ANSWERS */}
      <View style={styles.answersWrap}>
        {quiz.answers.map((a, i) => {
          const isSelected = selected === i;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelected(i)}
              style={[
                styles.answerCard,
                isSelected && styles.answerSelected,
                isSelected && { borderColor: '#FF355E' },
              ]}
            >
              <Text
                style={[
                  styles.answerText,
                  isSelected && styles.answerTextSelected,
                ]}
              >
                {a}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        disabled={selected === null}
        onPress={submit}
        style={[
          styles.submitBtn,
          selected === null && { opacity: 0.3 },
        ]}
      >
        <Text style={styles.submitText}>Validate</Text>
      </TouchableOpacity>

      {/* RESULT */}
      {result && (
        <View style={styles.resultBox}>
          <Text
            style={[
              styles.resultText,
              result.success ? styles.resultSuccess : styles.resultError,
            ]}
          >
            {result.message}
          </Text>
        </View>
      )}

      {/* 🔵 RETOUR AU PARK — IDENTIQUE AUX AUTRES PAGES */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
      >
        <Text style={styles.backBtnText}>← Back to Park</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

/* 🎨 SANTA CRUZ POP PUNK STYLES */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
    backgroundColor: '#111215',
  },

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

  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0AA5FF',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 20,
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  question: {
    fontSize: 18,
    color: '#EDEDF5',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },

  answersWrap: {
    marginBottom: 20,
  },

  answerCard: {
    backgroundColor: '#1A1B20',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#0AA5FF',
  },
  answerSelected: {
    backgroundColor: '#FF355E33',
  },
  answerText: {
    color: '#EDEDF5',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  answerTextSelected: {
    color: '#FFD600',
    fontWeight: '900',
  },

  submitBtn: {
    backgroundColor: '#0AA5FF',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },

  resultBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#1A1B20',
    borderRadius: 14,
  },
  resultText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
  resultSuccess: {
    color: '#00FF9C',
  },
  resultError: {
    color: '#FF355E',
  },

  /* 🔵 BOUTON RETOUR AU PARK */
  backBtn: {
    marginTop: 26,
    alignSelf: 'center',
    backgroundColor: '#0AA5FF',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 50,
  },
  backBtnText: {
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
