import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
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

  /* -------------------------------------------------------------------------- */
  /*                                   🔮 Animations                             */
  /* -------------------------------------------------------------------------- */

  const rotationAnim = useRef(new Animated.Value(0)).current;
  const auraOpacity = useRef(new Animated.Value(0)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;
  const answerScale = useRef(new Animated.Value(0.7)).current;

  const [answer, setAnswer] = useState("");

  const shake = () => {
    // Reset apparition
    answerOpacity.setValue(0);
    answerScale.setValue(0.7);

    // Random answer after animation
    const randomAnswer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    /* ------------------------------- Rotation 80's ------------------------------- */
    Animated.sequence([
      Animated.parallel([
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.bezier(0.2, 0.9, 0.3, 1.3),
          useNativeDriver: true,
        }),
        Animated.timing(auraOpacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.ease,
          useNativeDriver: true,
        })
      ]),
      Animated.timing(auraOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start(() => {
      setAnswer(randomAnswer);

      // apparition fantôme du texte
      Animated.parallel([
        Animated.timing(answerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(answerScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      ]).start();

      rotationAnim.setValue(0); // reset
    });
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Magic 8-Ball 🔮</Text>

      {/* 🌫️ Aura mystique */}
      <Animated.View
        style={[
          styles.aura,
          { opacity: auraOpacity }
        ]}
      />

      {/* 🔮 Boule */}
      <Animated.View
        style={[
          styles.ball,
          {
            transform: [
              { rotate: spin },
              { scale: auraOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.15]
                })
              }
            ]
          }
        ]}
      >
        <Text style={styles.ballText}>8</Text>
      </Animated.View>

      {/* ✨ Réponse mystique */}
      {answer !== "" && (
        <Animated.Text
          style={[
            styles.answer,
            { opacity: answerOpacity, transform: [{ scale: answerScale }] }
          ]}
        >
          {answer}
        </Animated.Text>
      )}

      <TouchableOpacity style={styles.btn} onPress={shake}>
        <Text style={styles.btnText}>Ask me...</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Back to Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

/* 🎨 Santa Cruz + Stranger Things 80's vibes */
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
    marginBottom: 20,
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  /* 🌫️ Aura mystique */
  aura: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 200,
    backgroundColor: '#FF355E55',
    shadowColor: '#FF355E',
    shadowRadius: 60,
    shadowOpacity: 0.9,
  },

  /* 🔮 Boule noire */
  ball: {
    width: 170,
    height: 170,
    backgroundColor: '#000',
    borderRadius: 100,
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

  /* ✨ Réponse mystique */
  answer: {
    color: '#FFF',
    fontSize: 19,
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
    marginTop: 10,
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
