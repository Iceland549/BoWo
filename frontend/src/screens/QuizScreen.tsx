import React, { useEffect, useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import api from '../api/api';
import { log } from '../utils/logger';

export default function QuizScreen({ route, navigation }) {
  const { trickId } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
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
      const { data } = await api.post('/quiz/validate', { trickId, answerIndex: selected });
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

  if (!quiz) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18 }}>{quiz.question}</Text>
      {quiz.answers.map((a, i) => (
        <TouchableOpacity key={i} onPress={() => setSelected(i)} style={{ padding: 8, backgroundColor: selected === i ? '#ddd' : '#fff', marginVertical: 6 }}>
          <Text>{a}</Text>
        </TouchableOpacity>
      ))}
      <Button title="Submit" onPress={submit} disabled={selected === null} />
      {result && <Text>{result.message}</Text>}
    </View>
  );
}
