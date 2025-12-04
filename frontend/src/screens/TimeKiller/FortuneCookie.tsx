// frontend/src/screens/TimeKiller/FortuneCookie.tsx

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  ImageBackground,
  ScrollView,
} from "react-native";

const banner = require("../../../assets/fortune/fortune_message.png");
const wallpaper = require("../../../assets/fortune/fortune_wallpaper.png");
const logoFortune = require("../../../assets/logos/fortune2_logo.png");

type FortuneRarity = "common" | "rare" | "ultra";

type Fortune = {
  text: string;
  rarity: FortuneRarity;
};

const MESSAGES: Fortune[] = [
  { text: "La chance sourit à celui qui avance sans peur.", rarity: "common" },
  { text: "Une petite action vaut mieux qu’un grand rêve immobile.", rarity: "common" },
  { text: "Le calme ouvre les portes que la force ne peut pas forcer.", rarity: "common" },
    { text: "Tu es plus proche du succès que tu ne le crois.", rarity: "common" },
  { text: "Ta créativité va faire des étincelles.", rarity: "rare" },
  { text: "Un nouveau départ commence discrètement.", rarity: "common" },
  { text: "Ton intuition sait déjà.", rarity: "common" },
  { text: "Ton avenir dépend de ce que tu choisis maintenant.", rarity: "common" },
  { text: "La glisse révèle ce que les mots n’expliquent pas.", rarity: "rare" },
  { text: "Chaque ride t'amène plus loin que tu ne l'imagines.", rarity: "common" },
  { text: "Ton équilibre intérieur trace ton équilibre sur la board.", rarity: "common" },
  { text: "Le vent t’offre un conseil : avance sans hésiter.", rarity: "common" },
  { text: "Ta board sait déjà ce que tu veux faire.", rarity: "common" },
  { text: "Un trick comprend toujours une part de magie.", rarity: "rare" },
  { text: "Un obstacle est souvent une opportunité déguisée.", rarity: "common" },
  { text: "La patience est ton alliée invisible.", rarity: "common" },
  { text: "Une nouvelle trajectoire t’attend, garde les yeux ouverts.", rarity: "common" },
  { text: "L’énergie suit ceux qui osent pousser un peu plus loin.", rarity: "common" },
  { text: "Le flow vient quand l’esprit arrête de forcer.", rarity: "common" },
  { text: "Chaque petit pas te rapproche du style que tu veux créer.", rarity: "common" },
  { text: "Ton style inspire déjà plus que tu ne le penses.", rarity: "rare" },
  { text: "Observe : le hasard te glisse un message.", rarity: "common" },
  { text: "Un bon ride commence avec un bon état d’esprit.", rarity: "common" },
  { text: "Ton moment parfait arrive, prépare-toi.", rarity: "common" },
  { text: "Une idée lumineuse ne tardera pas à te trouver.", rarity: "common" },
  { text: "Les réponses arrivent quand l’esprit se relâche.", rarity: "common" },
  { text: "Tu vas surprendre quelqu’un prochainement.", rarity: "rare" },
  { text: "Un détail maîtrisé deviendra ta signature.", rarity: "common" },
  { text: "La constance est ton véritable super-pouvoir.", rarity: "rare" },
  { text: "Un changement subtil t’amène vers quelque chose de grand.", rarity: "ultra" },
];

// Tips skate pour le bloc “Skate Tip”
const SKATE_TIPS: string[] = [
  "Pense à fléchir les genoux avant le pop, pas après.",
  "Fixe ton regard là où tu veux atterrir, pas sur ta board.",
  "Respire avant chaque tentative, ça stabilise ton corps.",
  "Travaille ton ollie tous les jours, même 5 minutes.",
  "Commence tes sessions par 5 minutes de flat simple.",
  "Tes trucks doivent être serrés comme TOI tu le sens, pas comme les autres.",
  "Filme un trick pour voir ce qui cloche vraiment.",
  "Un bon échauffement évite un mauvais arrêt.",
  "Pose d’abord tes pieds, la rotation viendra après.",
  "Accepte de tomber, mais apprends à tomber bien.",
];

export default function FortuneCookie({ navigation }) {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [rarity, setRarity] = useState<FortuneRarity | null>(null);
  const [skateTip, setSkateTip] = useState<string>("");

  /* ===================== ANIMATIONS ===================== */
  const paperOpacity = useRef(new Animated.Value(0)).current;
  const paperScaleX = useRef(new Animated.Value(0.1)).current;
  const paperScaleY = useRef(new Animated.Value(0.8)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const haloOpacity = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.6)).current;

  const dustOpacity = useRef(new Animated.Value(0)).current;
  const dustY = useRef(new Animated.Value(0)).current;

  // Particules qui sortent du bouton
  const buttonParticlesOpacity = useRef(new Animated.Value(0)).current;
  const buttonParticlesY = useRef(new Animated.Value(0)).current;

  const [buttonParticlesConfig] = useState(
    () =>
      new Array(7).fill(0).map((_, i) => ({
        left: -50 + Math.random() * 100,
        char: i % 3 === 0 ? "✦" : i % 3 === 1 ? "★" : "✧",
      }))
  );

  const openCookie = () => {
    // Choix d'une fortune
    const f = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(f.text);
    setRarity(f.rarity);
    setOpened(true);

    // Tip skate (random)
    const tip = SKATE_TIPS[Math.floor(Math.random() * SKATE_TIPS.length)];
    setSkateTip(tip);

    /* Reset animations */
    paperOpacity.setValue(0);
    paperScaleX.setValue(0.1);
    paperScaleY.setValue(0.8);

    textOpacity.setValue(0);
    floatAnim.setValue(0);

    sparkleOpacity.setValue(0);
    flashOpacity.setValue(0);

    haloOpacity.setValue(0);
    haloScale.setValue(0.6);

    dustOpacity.setValue(0);
    dustY.setValue(0);

    buttonParticlesOpacity.setValue(0);
    buttonParticlesY.setValue(0);

    /* Flash */
    const flash = Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]);

    /* Banner expand */
    const bannerAnim = Animated.parallel([
      Animated.timing(paperOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(paperScaleX, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(paperScaleY, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
    ]);

    /* Text + particle effects */
    const text = Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(sparkleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(dustOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(haloOpacity, {
        toValue: 0.8,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(haloScale, {
        toValue: 1.2,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    /* Floating animation */
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    /* Dust float */
    const dustLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dustY, {
          toValue: -20,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(dustY, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    // Particules qui sortent du bouton
    const buttonParticlesAnim = Animated.sequence([
      Animated.parallel([
        Animated.timing(buttonParticlesOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(buttonParticlesY, {
          toValue: -24,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonParticlesOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    flash.start(() => {
      bannerAnim.start(() => {
        text.start(() => {
          floatLoop.start();
          dustLoop.start();
        });
      });
    });

    buttonParticlesAnim.start(() => {
      buttonParticlesY.setValue(0);
    });
  };

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const getRarityStyle = () => {
    if (!rarity) return styles.rarityCommon;
    if (rarity === "rare") return styles.rarityRare;
    if (rarity === "ultra") return styles.rarityUltra;
    return styles.rarityCommon;
  };

  const getRarityLabel = () => {
    if (!rarity) return "";
    if (rarity === "rare") return "Rare ✨";
    if (rarity === "ultra") return "Ultra 🔥";
    return "Fortune";
  };

  /* =====================================
   *   NO SCREENWRAPPER — FULLSCREEN BG
   * ===================================== */
  return (
    <ImageBackground
      source={wallpaper}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.32 }}
      style={styles.bg}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Image source={logoFortune} style={styles.gameLogo} resizeMode="contain" />

          {opened && (
            <Animated.View
              style={[
                styles.bannerWrapper,
                {
                  opacity: paperOpacity,
                  transform: [
                    { scaleX: paperScaleX },
                    { scaleY: paperScaleY },
                  ],
                },
              ]}
            >
              <Image source={banner} style={styles.bannerImage} />

              <Animated.View
                style={[
                  styles.halo,
                  {
                    opacity: haloOpacity,
                    transform: [{ scale: haloScale }],
                  },
                ]}
              />

              <View style={styles.bannerContent}>
                {/* Rarity pill */}
                {rarity && (
                  <View style={[styles.rarityPill, getRarityStyle()]}>
                    <Text style={styles.rarityText}>{getRarityLabel()}</Text>
                  </View>
                )}

                <Animated.Text style={[styles.sparkles, { opacity: sparkleOpacity }]}>
                  ✨ ✨ ✨
                </Animated.Text>

                {/* Fond lisible pour le message */}
                <View style={styles.messageCard}>
                  <Animated.Text
                    style={[
                      styles.messageText,
                      { opacity: textOpacity, transform: [{ translateY: floatY }] },
                    ]}
                  >
                    {message}
                  </Animated.Text>
                </View>

                <Animated.Text
                  style={[
                    styles.dust,
                    { opacity: dustOpacity, transform: [{ translateY: dustY }] },
                  ]}
                >
                  ✧ ✦ ✧ ✦ ✧
                </Animated.Text>
              </View>
            </Animated.View>
          )}

          {/* BOUTON + PARTICULES */}
          <View style={styles.mainBtnWrapper}>
            {/* Particules au-dessus du bouton */}
            <View style={styles.buttonParticlesLayer} pointerEvents="none">
              {buttonParticlesConfig.map((p, idx) => (
                <Animated.Text
                  key={idx}
                  style={[
                    styles.buttonParticle,
                    {
                      left: p.left,
                      opacity: buttonParticlesOpacity,
                      transform: [{ translateY: buttonParticlesY }],
                    },
                  ]}
                >
                  {p.char}
                </Animated.Text>
              ))}
            </View>

            {!opened && (
              <TouchableOpacity style={styles.mainBtn} onPress={openCookie}>
                <Text style={styles.mainBtnText}>🍪 OUVRIR LE COOKIE</Text>
              </TouchableOpacity>
            )}

            {opened && (
              <TouchableOpacity style={styles.mainBtn} onPress={openCookie}>
                <Text style={styles.mainBtnText}>🔁 ENCORE UNE FORTUNE</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* SKATE TIP BOX */}
          {opened && (
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Skate Tip 🛹</Text>
              <Text style={styles.tipText}>{skateTip}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("Main", { screen: "Profile" })}
          >
            <Text style={styles.backText}>BACK TO ROOTS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#1A1110",
  },

  scroll: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingBottom: 150,
  },

  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  gameLogo: {
    width: 370,
    height: 230,
    marginBottom: 10,
  },

  bannerWrapper: {
    marginBottom: 25,
  },

  bannerImage: {
    width: 450,
    height: 300,
  },

  bannerContent: {
    position: "absolute",
    top: 80,
    height: 160,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  halo: {
    position: "absolute",
    top: 105,
    width: 180,
    height: 120,
    backgroundColor: "rgba(255,240,200,0.8)",
    borderRadius: 80,
    opacity: 0,
    // @ts-ignore (web only)
    filter: "blur(12px)",
    alignSelf: "center",
  },

  sparkles: {
    fontSize: 20,
    marginBottom: 4,
    color: "#DDA83A",
  },

  messageCard: {
    maxWidth: 260,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  messageText: {
    textAlign: "center",
    fontSize: 20,
    lineHeight: 26,
    color: "#3A2614",
    fontFamily: "Ninja",
  },

  dust: {
    marginTop: 10,
    fontSize: 18,
    color: "#E8C56A",
  },

  // Raretés
  rarityPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 6,
  },
  rarityCommon: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  rarityRare: {
    backgroundColor: "rgba(255,214,0,0.8)",
  },
  rarityUltra: {
    backgroundColor: "rgba(255,53,94,0.9)",
  },
  rarityText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Bouton & particules
  mainBtnWrapper: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonParticlesLayer: {
    position: "absolute",
    bottom: 52,
    width: 120,
    alignItems: "center",
  },

  buttonParticle: {
    position: "absolute",
    bottom: 0,
    fontSize: 18,
    color: "#FFD600",
    textShadowColor: "#FF355E",
    textShadowRadius: 4,
  },

  mainBtn: {
    backgroundColor: "#FF355E",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFD600",
  },

  mainBtnText: {
    fontFamily: "Ninja",
    color: "#111",
    fontSize: 20,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // Skate Tip
  tipBox: {
    backgroundColor: "#111215",
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: "#0AA5FF",
    marginBottom: 26,
    width: "95%",
  },
  tipTitle: {
    fontFamily: "Bangers",
    color: "#0AA5FF",
    fontSize: 20,
    marginBottom: 6,
    letterSpacing: 1,
  },
  tipText: {
    color: "#EDECF8",
    fontSize: 14,
    lineHeight: 20,
  },

  backBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    backgroundColor: "#0AA5FF",
    borderWidth: 3,
    borderColor: "#FFD600",
  },

  backText: {
    fontFamily: "Bangers",
    color: "#111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
