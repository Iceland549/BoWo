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
  "La glisse parlera pour toi aujourd’hui.",
  "Une bonne session commence dans la tête.",
  "Le prochain trick te choisit déjà.",
  "La chance préfère ceux qui poussent fort.",
  "Un détail deviendra ton style signature.",
  "Ta créativité est ton meilleur allié.",
  "Observe : un signe t’est destiné.",
  "Tu vas surprendre quelqu’un bientôt.",
  "Une idée lumineuse te suit déjà.",
  "La magie est plus proche que tu ne le crois.",
];

export default function FortuneCookie({ navigation }) {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState<string>("");

  /* ANIMATIONS — tout en useNativeDriver: true */
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

    /* Reset */
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

    /* ───────────────────────────── */
    /* 1) FLASH DIVIN                */
    /* ───────────────────────────── */
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

    /* ───────────────────────────── */
    /* 2) BANNIÈRE QUI SE DÉROULE   */
    /* ───────────────────────────── */
    const paper = Animated.parallel([
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

    /* ───────────────────────────── */
    /* 3) MESSAGE + PARTICULES      */
    /* ───────────────────────────── */
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

    /* LOOPS : flottement & particules */
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

    /* LANCEMENT GLOBAL */
    flash.start(() => {
      paper.start(() => {
        text.start(() => {
          floatLoop.start();
          dustLoop.start();
        });
      });
    });
  };

  /* FLOAT interpolation */
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <ImageBackground
      source={wallpaper}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.32 }}
      style={styles.bg}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>

          {/* ▶ LOGO EN HAUT */}
          <Image source={logoFortune} style={styles.gameLogo} resizeMode="contain" />

          {/* ▶ PARCHEMIN */}
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

              {/* HALO DERRIÈRE LE MESSAGE */}
              <Animated.View
                style={[
                  styles.halo,
                  {
                    opacity: haloOpacity,
                    transform: [{ scale: haloScale }],
                  },
                ]}
              />

              {/* CONTENU DU MESSAGE */}
              <View style={styles.bannerContent}>

                <Animated.Text
                  style={[
                    styles.sparkles,
                    { opacity: sparkleOpacity },
                  ]}
                >
                  ✨ ✨ ✨
                </Animated.Text>

                <Animated.Text
                  style={[
                    styles.messageText,
                    {
                      opacity: textOpacity,
                      transform: [{ translateY: floatY }],
                    },
                  ]}
                >
                  {message}
                </Animated.Text>

                <Animated.Text
                  style={[
                    styles.dust,
                    {
                      opacity: dustOpacity,
                      transform: [{ translateY: dustY }],
                    },
                  ]}
                >
                  ✧ ✦ ✧ ✦ ✧
                </Animated.Text>

              </View>
            </Animated.View>
          )}

          {/* Bouton initial */}
          {!opened && (
            <TouchableOpacity style={styles.mainBtn} onPress={openCookie}>
              <Text style={styles.mainBtnText}>Ouvrir le Cookie</Text>
            </TouchableOpacity>
          )}

          {/* Encore une fortune */}
          {opened && (
            <TouchableOpacity style={styles.mainBtn} onPress={openCookie}>
              <Text style={styles.mainBtnText}>Encore une Fortune</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
          >
            <Text style={styles.backText}>BACK TO ROOTS</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#1A1110" },

  scroll: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingBottom: 150,
  },

  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  /* LOGO */
  gameLogo: {
    width: 370,
    height: 230,
    marginBottom: 10,
  },

  /* PARCHEMIN */
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

  /* HALO animé */
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
