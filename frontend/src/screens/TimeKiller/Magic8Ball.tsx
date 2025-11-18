import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

const RESPONSES = [
  "Oui, envoie du lourd ! 🔥🛹",
  "Pas aujourd’hui… tu vas baisser le pied. ❌🙃",
  "Fonce, t’es chaud ! ⚡️🔥",
  "Hmm… c’est bancal, réessaye. 🤔🌀",
  "Seulement si tu t’engages à fond ! 💪🛹",
  "Ton board approuve. 😎🛹",
  "Nope. Absolument nope. 🚫😅",
  "Ça sent le style… vas-y ! ✨🛹",
  "Travaille encore un peu. 📈🧠",
  "Tu vas le stomp bolts ! 🛹⚡️",
  "La tête d’abord, le trick ensuite. 🧠➡️🛹",
  "Tu es à un push de la réussite. 🏁🛹",
  "Pas assez de pop aujourd’hui. 🫥⬆️",
  "Les dieux du street te donnent le go. 🏙️✨",
  "Vibes du park : feu vert. 🟢😎",
  "Essaie en switch… ou pas. 🤷‍♂️🛹",
  "Mets du wax et retente. 🧼🛹",
  "Aujourd’hui t’es en feu ! 🔥🔥🔥",
  "Fais une pause, puis drop. ☕🛹",
  "Tes chevilles ne valident pas. 🦶❌😂"
];

export default function Magic8Ball({ navigation }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [answer, setAnswer] = useState("");

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 90, useNativeDriver: true }),
    ]).start(() => {
      const random = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
      setAnswer(random);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Magic 8-Ball 🔮</Text>

      <Animated.View
        style={[
          styles.ball,
          { transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <Text style={styles.ballText}>8</Text>
      </Animated.View>

      {answer !== "" && (
        <Text style={styles.answer}>{answer}</Text>
      )}

      <TouchableOpacity style={styles.btn} onPress={shake}>
        <Text style={styles.btnText}>Shake it!</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

/* 🎨 Santa Cruz Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 28,
    color: '#0AA5FF',
    fontWeight: '900',
    marginBottom: 30,
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  ball: {
    width: 160,
    height: 160,
    backgroundColor: '#000',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFD600',
    marginBottom: 20,
  },

  ballText: {
    color: '#FFF',
    fontSize: 60,
    fontWeight: '900',
  },

  answer: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  btn: {
    backgroundColor: '#FFD600',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginBottom: 20,
  },

  btnText: {
    color: '#111',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  backBtn: {
    marginTop: 20,
    borderColor: '#FF355E',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },

  backText: {
    color: '#FF355E',
    fontSize: 16,
    fontWeight: '800',
  },
});
