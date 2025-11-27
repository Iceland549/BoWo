import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Image
} from 'react-native';

const logoMagic = require('../../../assets/logos/magic-ball_logo.png');

const RESPONSES = [
  "Les astres du street te donnent le go. 🌌🛹",
  "Ta board vibre “oui”. Fort. ⚡️🛹",
  "Pas aujourd’hui, rider… la vibe est off. ❌😶‍🌫️",
  "La poussière du park murmure un non. 🌫️🚫",
  "Le vent du bowl dit : “Fonce.” 💨🔥",
  "Ton équilibre intérieur hésite encore… ⚖️🤔",
  "Négatif, ton style n’est pas aligné. ❌🌀",
  "La nuit t’accorde un léger oui. 🌙✨",
  "L’ombre du rail dit : pas maintenant. 🛹🌑",
  "Les esprits du flat sourient : vas-y. 👻🛹",
  "Ton destin fait un manual… il vacille. 🛹😬",
  "Les dieux du vert ramp applaudissent. 🏄‍♂️🔥",
  "Non. Tes trucks grincent une mise en garde. 🚫🛹",
  "La lune trace un flip : signe positif. 🌙🌀",
  "Mystère total… réessaie. ❓🌫️",
  "Ton aura poppe un “OUI !” net. ✨🛹",
  "Le karma du curb grince un refus. 🚫🪬",
  "Le futur est flou, comme une session nocturne. 🌌🛹",
  "Go ! Le cosmos te dit “Bolts landing”. 🌠⚡️",
  "Un non… mais un non stylé. 😎❌",
  "Réponse incertaine. 🔮",
  "Oui, clairement. ✔️✨",
  "Non, absolument pas. ❌🕳️",
  "Les signes pointent vers oui. ➕🌟",
  "Les signes pointent vers non. ➖🌑",
  "Tu peux compter dessus. 👍🔮",
  "Peu probable… ⚠️🌀",
  "Mieux vaut attendre. ⏳🌫️",
  "Sans aucun doute. 💯✨",
  "Impossible à dire. ❓🕳️"
];

export default function Magic8Ball({ navigation }) {

  // ✨ Animations
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const auraOpacity = useRef(new Animated.Value(0)).current;

  const answerOpacity = useRef(new Animated.Value(0)).current;
  const answerScale = useRef(new Animated.Value(0.7)).current;
  const answerFloat = useRef(new Animated.Value(0)).current;
  const particlesOpacity = useRef(new Animated.Value(0)).current;
  const particlesY = useRef(new Animated.Value(0)).current;

  const [answer, setAnswer] = useState("");

  const shake = () => {
    answerOpacity.setValue(0);
    answerScale.setValue(0.7);
    answerFloat.setValue(0);
    particlesOpacity.setValue(0);
    particlesY.setValue(0);

    const randomAnswer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.elastic(1.5),
        useNativeDriver: true,
      }),
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

      Animated.parallel([
        Animated.timing(answerOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(answerScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(answerFloat, {
              toValue: -4,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(answerFloat, {
              toValue: 0,
              duration: 1400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            })
          ])
        ),
        Animated.sequence([
          Animated.timing(particlesOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(particlesY, {
                toValue: -12,
                duration: 1200,
                useNativeDriver: true,
              }),
              Animated.timing(particlesY, {
                toValue: 0,
                duration: 1200,
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ]).start();

      rotationAnim.setValue(0);
    });
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const shakeX = shakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -12, 12, -8, 0],
  });

  return (
    <View style={styles.pageContainer}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>

          <Image source={logoMagic} style={styles.gameLogo} resizeMode="contain" />

          <Text style={styles.title}>Magic 8-Ball</Text>

          <Animated.View style={[styles.aura, { opacity: auraOpacity }]} />

          <Animated.View
            style={[
              styles.ball,
              { transform: [{ rotate: spin }, { translateX: shakeX }] }
            ]}
          >
            <Text style={styles.ballText}>8</Text>
          </Animated.View>

          {answer !== "" && (
            <View style={{ alignItems: "center", minHeight: 80 }}>

              <Animated.Text
                style={[
                  styles.particles,
                  {
                    opacity: particlesOpacity,
                    transform: [{ translateY: particlesY }],
                  }
                ]}
              >
                ✧ ✦ ✧
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.answer,
                  {
                    opacity: answerOpacity,
                    transform: [
                      { scale: answerScale },
                      { translateY: answerFloat },
                    ]
                  }
                ]}
              >
                {answer}
              </Animated.Text>

            </View>
          )}

          <TouchableOpacity style={styles.btn} onPress={shake}>
            <Text style={styles.btnText}>ASK YOUR DESTINY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>BACK TO ROOTS</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#000', // Full black background
    paddingTop: 10,
  },
  scroll: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingBottom: 100,
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  gameLogo: {
    width: 380,
    height: 230,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    color: '#FFD600',
    fontWeight: '900',
    marginBottom: 25,
    textAlign: 'center',
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  aura: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: '#FF355E55',
    shadowColor: '#FF355E',
    shadowRadius: 60,
    shadowOpacity: 0.8,
  },

  ball: {
    width: 175,
    height: 175,
    backgroundColor: '#000',
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFD600',
    marginBottom: 20,
  },

  ballText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#FFF',
  },

  particles: {
    fontSize: 20,
    marginBottom: 4,
    color: '#FFD966',
  },

  answer: {
    color: '#FFF',
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  btn: {
    backgroundColor: '#FF355E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD600',
    marginBottom: 20,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
    textTransform: 'uppercase',
  },

  backBtn: {
    borderColor: '#FFD600',
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 40,
    backgroundColor: '#0AA5FF',
  },
  backText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
