import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const logoMagic = require("../../../assets/logos/magic-ball_logo.png");

// ⚠️ Si tu veux des sons, ajoute des fichiers son dans ton projet,
// puis mets les bons require() à la place des TODO ci-dessous.
// Ensuite : expo install expo-av
// import { Audio } from "expo-av";

type HistoryEntry = {
  question: string;
  answer: string;
};

// Réponses "normales"
const BASE_RESPONSES = [
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
  "Impossible à dire. ❓🕳️",
];

// Réponses rares (≈ 1 chance sur 50)
const RARE_RESPONSES = [
  "🛹 Tony Hawk te dit : “YES BRO.”",
  "🔥 Ton destin vient de poser un tréflip parfait.",
  "👑 La couronne du Skate King brille pour toi.",
  "🧠 Tu viens de débloquer le cerveau d’un pro-rider.",
];

// Réponses ultra rares (≈ 1 chance sur 100)
const ULTRA_RARE_RESPONSES = [
  "🌈✨ ULTRA RARE : Tu viens d’entrer dans le Multivers du Skate.",
  "👑🔥 Légende vivante : ton nom sera gravé dans le park.",
  "🛹⚡ Destin MAX : chaque trick aujourd’hui a +20% de luck.",
];

// Easter-eggs selon l’heure
function getTimeEasterEgg(): string | null {
  const h = new Date().getHours();

  if (h >= 0 && h < 5) {
    return "🌙 L’heure du skate nocturne, seul le vrai rider est encore debout.";
  }
  if (h >= 5 && h < 9) {
    return "🌅 Le soleil approuve ton grind du matin.";
  }
  if (h >= 21 && h <= 23) {
    return "🌌 Le park dort… mais ton destin est wide awake.";
  }

  return null;
}

function isPositiveAnswer(text: string) {
  const lower = text.toLowerCase();
  return (
    lower.includes("oui") ||
    lower.includes("yes") ||
    lower.includes("go") ||
    lower.includes("compter dessus") ||
    lower.includes("sans aucun doute")
  );
}

function isNegativeAnswer(text: string) {
  const lower = text.toLowerCase();
  return (
    lower.includes("non") ||
    lower.includes("pas aujourd") ||
    lower.includes("négatif") ||
    lower.includes("refus")
  );
}

export default function Magic8Ball({ navigation }) {
  // ✨ Animations principales
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const auraOpacity = useRef(new Animated.Value(0)).current;

  // Réponse
  const answerOpacity = useRef(new Animated.Value(0)).current;
  const answerScale = useRef(new Animated.Value(0.7)).current;
  const answerFloat = useRef(new Animated.Value(0)).current;

  // Magic dust
  const particlesOpacity = useRef(new Animated.Value(0)).current;
  const particlesY = useRef(new Animated.Value(0)).current;

  // Charging bar
  const chargeAnim = useRef(new Animated.Value(0)).current;

  const [answer, setAnswer] = useState("");
  const [currentTag, setCurrentTag] = useState<"normal" | "rare" | "ultra">(
    "normal"
  );
  const isUltraRare = currentTag === "ultra";
  const isRare = currentTag === "rare";

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [useCount, setUseCount] = useState(0);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [customQuestion, setCustomQuestion] = useState("");

  // Particules (positions random mais fixes)
  const [particlesConfig] = useState(
    () =>
      new Array(10).fill(0).map((_, i) => ({
        left: -40 + Math.random() * 80,
        top: -10 + Math.random() * 40,
        char: i % 3 === 0 ? "✦" : i % 3 === 1 ? "✧" : "★",
      }))
  );

  const playHaptics = (tag: "normal" | "rare" | "ultra", text: string) => {
    if (tag === "ultra") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (tag === "rare") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      if (isPositiveAnswer(text)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (isNegativeAnswer(text)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // neutre → léger tap
        Haptics.selectionAsync();
      }
    }
  };

  const updateBadges = (
    tag: "normal" | "rare" | "ultra",
    text: string,
    newUseCount: number,
    newYesCount: number,
    newNoCount: number
  ) => {
    setBadges((prev) => {
      const next = [...prev];

      // Lucky Rider : une réponse rare ou ultra
      if ((tag === "rare" || tag === "ultra") && !next.includes("Lucky Rider"))
        next.push("Lucky Rider");

      // Cosmic Shredder : 10 utilisations
      if (newUseCount >= 10 && !next.includes("Cosmic Shredder"))
        next.push("Cosmic Shredder");

      // Skate Prophet : 25 utilisations
      if (newUseCount >= 25 && !next.includes("Skate Prophet"))
        next.push("Skate Prophet");

      // Dark Skate Oracle : 5 réponses négatives
      if (newNoCount >= 5 && !next.includes("Dark Skate Oracle"))
        next.push("Dark Skate Oracle");

      return next;
    });
  };

  const pickAnswer = (): { text: string; tag: "normal" | "rare" | "ultra" } => {
    // Ultra rare ?
    const roll = Math.random();
    if (roll < 0.01 && ULTRA_RARE_RESPONSES.length > 0) {
      const text =
        ULTRA_RARE_RESPONSES[
          Math.floor(Math.random() * ULTRA_RARE_RESPONSES.length)
        ];
      return { text, tag: "ultra" };
    }

    // Rare ?
    if (roll < 0.03 && RARE_RESPONSES.length > 0) {
      const text =
        RARE_RESPONSES[Math.floor(Math.random() * RARE_RESPONSES.length)];
      return { text, tag: "rare" };
    }

    // Easter egg horaire ?
    const easter = getTimeEasterEgg();
    if (easter && Math.random() < 0.2) {
      return { text: easter, tag: "normal" };
    }

    // Standard
    const text =
      BASE_RESPONSES[Math.floor(Math.random() * BASE_RESPONSES.length)];
    return { text, tag: "normal" };
  };

  const shake = () => {
    // Reset visuels
    answerOpacity.setValue(0);
    answerScale.setValue(0.7);
    answerFloat.setValue(0);
    particlesOpacity.setValue(0);
    particlesY.setValue(0);
    auraOpacity.setValue(0);
    chargeAnim.setValue(0);
    rotationAnim.setValue(0);
    shakeAnim.setValue(0);

    // Animation de "rumble" pendant la charge
    const rumble = Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 0.7,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -0.7,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0.4,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]);

    // Glow pulse de l’aura
    const auraPulse = Animated.sequence([
      Animated.timing(auraOpacity, {
        toValue: 0.2,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(auraOpacity, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(auraOpacity, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(auraOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    // Charging bar
    const charging = Animated.timing(chargeAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    Animated.parallel([
      // Rotation principale
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.bezier(0.2, 0.9, 0.3, 1.3),
        useNativeDriver: true,
      }),
      // Rumble répété pendant la rotation
      Animated.loop(rumble, { iterations: 3 }),
      // Glow pulse de l’aura
      Animated.loop(auraPulse, { iterations: 2 }),
      // Charging bar
      charging,
    ]).start(() => {
      // Fin de la rotation → on éteint progressivement l’aura
      Animated.timing(auraOpacity, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }).start();
      rotationAnim.setValue(0);
      shakeAnim.setValue(0);

      // Choix de la réponse
      const { text, tag } = pickAnswer();
      setAnswer(text);
      setCurrentTag(tag);

      // Stats & badges
      const newUseCount = useCount + 1;
      setUseCount(newUseCount);

      let newYesCount = yesCount;
      let newNoCount = noCount;
      if (isPositiveAnswer(text)) {
        newYesCount++;
        setYesCount(newYesCount);
      } else if (isNegativeAnswer(text)) {
        newNoCount++;
        setNoCount(newNoCount);
      }

      updateBadges(tag, text, newUseCount, newYesCount, newNoCount);

      // Ajoute à l’historique
      setHistory((prev) => {
        const entry: HistoryEntry = {
          question:
            customQuestion.trim() !== ""
              ? customQuestion.trim()
              : "Question cosmique",
          answer: text,
        };
        const next = [entry, ...prev];
        return next.slice(0, 10);
      });

      // Animation de l’apparition de la réponse
      Animated.parallel([
        // Pop cartoon avec overshoot
        Animated.sequence([
          Animated.spring(answerScale, {
            toValue: 1.05,
            speed: 1,
            bounciness: 12,
            useNativeDriver: true,
          }),
          Animated.spring(answerScale, {
            toValue: 1,
            speed: 1,
            bounciness: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(answerOpacity, {
          toValue: 1,
          duration: 700,
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
            }),
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

      // Haptics selon le résultat
      playHaptics(tag, text);

      // TODO sons :
      // if (tag === "ultra") playBoomSound();
      // else if (tag === "rare") playTingSound();
      // else playWhooshSound();
    });
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  const shakeX = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10],
  });

  const chargeWidth = chargeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const auraColors: [string, string] =
    isUltraRare
      ? ['#FF00FF', '#00FFFF']        // Rainbow rare
      : isRare
      ? ['#FF355E', '#FFD600']        // Rare orange/rose
      : ['#FF355E', '#0AA5FF']; 

  return (
    <View style={styles.pageContainer}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* LOGO */}
          <Image source={logoMagic} style={styles.gameLogo} resizeMode="contain" />

          <View style={styles.vortexWrapper}>
            <View style={styles.vortexRing} />
            <LinearGradient
              colors={auraColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.auraGradient}
            >
              <Animated.View
                style={[styles.auraOverlay, { opacity: auraOpacity }]}
              />

              {/* 👇👇 BOULE CENTRÉE 👇👇 */}
              <Animated.View
                style={[
                  styles.ball,
                  {
                    transform: [{ rotate: spin }, { translateX: shakeX }],
                  },
                ]}
              >
                <Text style={styles.ballText}>8</Text>
              </Animated.View>
            </LinearGradient>
          </View>

          {/* CHARGING DESTINY BAR */}
          <View style={styles.chargeWrapper}>
            <Text style={styles.chargeLabel}>CHARGING DESTINY...</Text>
            <View style={styles.chargeTrack}>
              <Animated.View
                style={[styles.chargeFill, { width: chargeWidth }]}
              />
            </View>
          </View>

          {/* RÉPONSE + MAGIC DUST */}
          {answer !== "" && (
            <View style={{ alignItems: "center", minHeight: 100 }}>
              {/* Spray de particules */}
              {particlesConfig.map((p, idx) => (
                <Animated.Text
                  key={idx}
                  style={[
                    styles.particleText,
                    {
                      opacity: particlesOpacity,
                      transform: [{ translateY: particlesY }],
                      position: "absolute",
                      top: p.top,
                      left: p.left,
                    },
                  ]}
                >
                  {p.char}
                </Animated.Text>
              ))}

              <Animated.Text
                style={[
                  styles.answer,
                  {
                    opacity: answerOpacity,
                    transform: [
                      { scale: answerScale },
                      { translateY: answerFloat },
                    ],
                  },
                ]}
              >
                {answer}
              </Animated.Text>
            </View>
          )}

          {/* MODE DÉFI : QUESTION PERSONNALISÉE */}
          <View style={styles.questionBox}>
            <Text style={styles.questionLabel}>
              Pose ta question au destin (optionnel) :
            </Text>
            <TextInput
              placeholder="Ex : Est-ce que je vais rentrer mon ollie aujourd’hui ?"
              placeholderTextColor="#888"
              style={styles.questionInput}
              value={customQuestion}
              onChangeText={setCustomQuestion}
            />
          </View>

          {/* BOUTON SHAKE */}
          <TouchableOpacity style={styles.btn} onPress={shake}>
            <Text style={styles.btnText}>ASK YOUR DESTINY</Text>
          </TouchableOpacity>

          {/* HISTORIQUE */}
          {history.length > 0 && (
            <View style={styles.historyBox}>
              <Text style={styles.historyTitle}>Ton destin aujourd’hui :</Text>
              {history.map((item, idx) => (
                <View key={idx} style={styles.historyItem}>
                  <Text style={styles.historyQuestion}>Q: {item.question}</Text>
                  <Text style={styles.historyAnswer}>→ {item.answer}</Text>
                </View>
              ))}
            </View>
          )}

          {/* BADGES */}
          {badges.length > 0 && (
            <View style={styles.badgeBox}>
              <Text style={styles.badgeTitle}>Badges mystiques :</Text>
              <View style={styles.badgeRow}>
                {badges.map((b) => (
                  <View key={b} style={styles.badgePill}>
                    <Text style={styles.badgeText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* BOUTON RETOUR */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
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
    backgroundColor: "#05030D", // fond sombre léger violet
    paddingTop: 10,
  },
  scroll: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingBottom: 100,
  },
  inner: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  gameLogo: {
    width: 320,
    height: 180,
    marginBottom: 10,
  },

  vortexWrapper: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  vortexRing: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 200,
    borderWidth: 4,
    borderColor: "#0AA5FF55",
    transform: [{ rotate: "25deg" }],
    opacity: 0.9,
  },
  auraGradient: {
    width: 220,
    height: 220,
    borderRadius: 200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  auraOverlay: {
    position: "absolute",
    width: "140%",
    height: "140%",
    borderRadius: 300,
    backgroundColor: "#FFFFFF22",
  },

  ball: {
    width: 175,
    height: 175,
    backgroundColor: "#000",
    borderRadius: 200,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "#FFD600",
    shadowColor: "#000",
    shadowRadius: 20,
    shadowOpacity: 0.9,
    elevation: 12,
  },

  ballText: {
    fontSize: 60,
    fontWeight: "900",
    color: "#FFF",
  },

  chargeWrapper: {
    marginTop: 40,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
  },
  chargeLabel: {
    color: "#FFD600",
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: 1,
  },
  chargeTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#1A1B20",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FF355E",
  },
  chargeFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0AA5FF",
  },

  particleText: {
    fontSize: 18,
    color: "#FFD966",
  },

  answer: {
    fontFamily: "Bangers",
    fontSize: 28,
    textAlign: "center",
    color: "#FFFFFF",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,

    // Outline jaune adouci
    textShadowColor: "#FFD600AA", // transparence
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,

    // Ombre rouge plus légère
    shadowColor: "#FF355E88",
    shadowOffset: { width: -1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },

  questionBox: {
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#111215",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#0AA5FF55",
  },
  questionLabel: {
    color: "#EDECF8",
    fontSize: 14,
    marginBottom: 6,
  },
  questionInput: {
    color: "#FFF",
    fontSize: 14,
    paddingVertical: 6,
  },

  btn: {
    backgroundColor: "#FF355E",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFD600",
    marginBottom: 20,
    marginTop: 4,
  },
btnText: {
    fontFamily: "Bangers",
    fontSize: 20,
    color: "#111",
    textTransform: "uppercase",
    letterSpacing: 1.2,
},


  historyBox: {
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#111215",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FF355E55",
  },
  historyTitle: {
    color: "#FFD600",
    fontWeight: "800",
    marginBottom: 8,
  },
  historyItem: {
    marginBottom: 6,
  },
  historyQuestion: {
    color: "#0AA5FF",
    fontSize: 13,
  },
  historyAnswer: {
    color: "#EDECF8",
    fontSize: 13,
  },

  badgeBox: {
    width: "100%",
    marginBottom: 24,
  },
  badgeTitle: {
    color: "#FFD600",
    fontWeight: "800",
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badgePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#0AA5FF",
  },
  badgeText: {
    color: "#111",
    fontWeight: "800",
    fontSize: 12,
  },

  backBtn: {
    borderColor: "#FFD600",
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 40,
    backgroundColor: "#0AA5FF",
    marginBottom: 20,
  },
backText: {
    fontFamily: "Bangers",
    color: "#111",
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 1.2,
},

});

