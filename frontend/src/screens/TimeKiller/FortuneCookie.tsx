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

const MESSAGES = [
  "La chance sourit à celui qui avance sans peur.",
  "Une petite action vaut mieux qu’un grand rêve immobile.",
  "Le calme ouvre les portes que la force ne peut pas forcer.",
  "Tu es plus proche du succès que tu ne le crois.",
  "Ta créativité va faire des étincelles.",
  "Un nouveau départ commence discrètement.",
  "Ton intuition sait déjà.",
  "Ton avenir dépend de ce que tu choisis maintenant.",
  "La glisse révèle ce que les mots n’expliquent pas.",
  "Chaque ride t'amène plus loin que tu ne l'imagines.",
  "Ton équilibre intérieur trace ton équilibre sur la board.",
  "Le vent t’offre un conseil : avance sans hésiter.",
  "Ta board sait déjà ce que tu veux faire.",
  "Un trick comprend toujours une part de magie.",
  "Un obstacle est souvent une opportunité déguisée.",
  "La patience est ton alliée invisible.",
  "Une nouvelle trajectoire t’attend, garde les yeux ouverts.",
  "L’énergie suit ceux qui osent pousser un peu plus loin.",
  "Le flow vient quand l’esprit arrête de forcer.",
  "Chaque petit pas te rapproche du style que tu veux créer.",
  "Ton style inspire déjà plus que tu ne le penses.",
  "Observe : le hasard te glisse un message.",
  "Un bon ride commence avec un bon état d’esprit.",
  "Ton moment parfait arrive, prépare-toi.",
  "Une idée lumineuse ne tardera pas à te trouver.",
  "Les réponses arrivent quand l’esprit se relâche.",
  "Tu vas surprendre quelqu’un prochainement.",
  "Un détail maîtrisé deviendra ta signature.",
  "La constance est ton véritable super-pouvoir.",
  "Un changement subtil t’amène vers quelque chose de grand."
];

export default function FortuneCookie({ navigation }) {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState<string>("");

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

  const openCookie = () => {
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(msg);
    setOpened(true);

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

    flash.start(() => {
      bannerAnim.start(() => {
        text.start(() => {
          floatLoop.start();
          dustLoop.start();
        });
      });
    });
  };

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  /* =====================================
   *   NO SCREENWRAPPER — FULLSCREEN BG
   * ===================================== */
  return (
    <ImageBackground
      source={wallpaper}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.32 }}
      style={styles.bg}   // full container
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
                <Animated.Text style={[styles.sparkles, { opacity: sparkleOpacity }]}>
                  ✨ ✨ ✨
                </Animated.Text>

                <Animated.Text
                  style={[
                    styles.messageText,
                    { opacity: textOpacity, transform: [{ translateY: floatY }] },
                  ]}
                >
                  {message}
                </Animated.Text>

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

          {!opened && (
            <TouchableOpacity style={styles.mainBtn} onPress={openCookie}>
              <Text style={styles.mainBtnText}>Ouvrir le Cookie</Text>
            </TouchableOpacity>
          )}

          {opened && (
            <TouchableOpacity style={styles.mainBtn} onPress={openCookie}>
              <Text style={styles.mainBtnText}>Encore une Fortune</Text>
            </TouchableOpacity>
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
    backgroundColor: "#1A1110",  // couleur d'origine conservée
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
    top: 90,
    height: 140,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  halo: {
    position: "absolute",
    top: 105,
    width: 180,
    height: 120,
    backgroundColor: "rgba(255,240,200,0.8)",
    borderRadius: 80,
    opacity: 0,
    filter: "blur(12px)", 
    alignSelf: "center",
  },

  sparkles: {
    fontSize: 20,
    marginBottom: 8,
    color: "#DDA83A",
  },

  messageText: {
    width: 230,
    textAlign: "center",
    fontSize: 20,
    lineHeight: 26,
    color: "#3A2614",
    fontWeight: "700",
  },

  dust: {
    marginTop: 12,
    fontSize: 18,
    color: "#E8C56A",
  },

  mainBtn: {
    backgroundColor: "#FF355E",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFD600",
    marginBottom: 24,
  },

  mainBtnText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
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
    color: "#111",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
