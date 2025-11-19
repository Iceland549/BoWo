import React, { useState, useRef } from "react";
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

import ScreenWrapper from "../../components/ScreenWrapper";

// LOGOS + IMAGES
const casinoLogo = require("../../../assets/logos/casino_logo.png");
const slotImg = require("../../../assets/casino/casino_slot.png");
const casinoWallpaper = require("../../../assets/casino/casino_wallpaper.png");

// LISTE DES 20 TRICKS
const TRICKS = [
  "Ollie",
  "Pop Shove-it",
  "Kickflip",
  "Heelflip",
  "Frontside Pop Shove-it",
  "Frontside 180",
  "Backside 180",
  "Nollie",
  "Halfcab",
  "Boardslide",
  "50-50 Grind",
  "360 Flip",
  "Hardflip",
  "Impossible",
  "Varial Kickflip",
  "Crook Grind",
  "Nose Slide",
  "Tail Slide",
  "Five-O Grind",
  "Fakie Backside 180",
];


export default function CasinoTrickSlot({ navigation }) {
  const [current, setCurrent] = useState("—");
  const [isRolling, setIsRolling] = useState(false);

  // 🔥 ANIMATION DU ROULEAU
  const rollY = useRef(new Animated.Value(0)).current;

  // ANIMATION DE L’APPARITION DU TRICK FINAL
  const trickOpacity = useRef(new Animated.Value(0)).current;
  const trickScale = useRef(new Animated.Value(0.8)).current;

  // LISTE MULTIPLIÉE (pour simuler un long rouleau)
  const FULL_LIST = [...TRICKS, ...TRICKS, ...TRICKS];
  const ITEM_HEIGHT = 54; // hauteur par élément

  const spinReel = (finalIndex: number) => {
    rollY.setValue(0);

    const randomSpins = 18 * ITEM_HEIGHT; // nombre de tours rapides avant ralentissement
    const finalOffset = finalIndex * ITEM_HEIGHT;

    Animated.timing(rollY, {
      toValue: -(randomSpins + finalOffset),
      duration: 2300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rollY.setValue(-finalOffset);
    });
  };

  const roll = () => {
    if (isRolling) return;

    setIsRolling(true);

    trickOpacity.setValue(0);
    trickScale.setValue(0.7);

    const finalIndex = Math.floor(Math.random() * TRICKS.length);
    const final = TRICKS[finalIndex];

    spinReel(finalIndex);

    setTimeout(() => {
      setCurrent(final);

      Animated.parallel([
        Animated.timing(trickOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(trickScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRolling(false);
      });
    }, 2200);
  };

  return (
    <ImageBackground
      source={casinoWallpaper}
      style={styles.bg}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.25 }}
    >
      <ScreenWrapper>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>

            {/* 🔥 LOGO CASINO EN HAUT */}
            <Image source={casinoLogo} style={styles.casinoLogo} resizeMode="contain" />

            {/* 🎰 SLOT MACHINE */}
            <View style={styles.slotWrapper}>
              <Image source={slotImg} style={[styles.slotImg, { backgroundColor: "transparent" }]} resizeMode="contain" />

              {/* ROULEAU ANIMÉ */}
              <View style={styles.reelMask}>
                <Animated.View
                  style={{
                    transform: [{ translateY: rollY }],
                  }}
                >
                  {FULL_LIST.map((name, idx) => (
                    <View key={idx} style={styles.reelItem}>
                      <Text style={styles.reelText}>{name}</Text>
                    </View>
                  ))}
                </Animated.View>
              </View>

              {/* TEXTE FINAL PAR-DESSUS */}
              <Animated.Text
                style={[
                  styles.trickName,
                  { opacity: trickOpacity, transform: [{ scale: trickScale }] },
                ]}
              >
                {current}
              </Animated.Text>
            </View>

            {/* BOUTON */}
            <TouchableOpacity style={styles.spinBtn} onPress={roll} disabled={isRolling}>
              <Text style={styles.spinText}>
                {isRolling ? "..." : "LANCE LA MANIVELLE"}
              </Text>
            </TouchableOpacity>

            {/* RÈGLES */}
            <View style={styles.rulesBox}>
              <Text style={styles.rulesText}>
                Avec ton pote, faites le trick affiché.{"\n"}
                Celui qui rate prend une lettre.{"\n"}
                Premier à  S-K-A-T-E → PERD !
              </Text>
            </View>

            {/* RETOUR */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>BACK TO ROOTS</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenWrapper>
    </ImageBackground>
  );
}

// STYLES
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#000",
  },

  scroll: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 120,
  },

  container: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  /* LOGO */
  casinoLogo: {
    width: 350,
    height: 180,
    marginBottom: 20,
  },

  /* SLOT */
  slotWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "transparent", // ⬅️ ajout important

  },

  slotImg: {
    width: 420,
    height: 330,
  },

  /* ZONE DU ROULEAU ANIMÉ */
  reelMask: {
    position: "absolute",
    top: 138,
    width: 310,
    height: 54,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  reelItem: {
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },

  reelText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "#000",
    textShadowRadius: 4,
  },

  trickName: {
    position: "absolute",
    top: 138,
    width: 300,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "900",
    color: "#FFD600",
    textShadowColor: "#000",
    textShadowRadius: 10,
  },

  /* BUTTON */
  spinBtn: {
    backgroundColor: "#FF355E",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFD600",
    marginTop: 10,
  },
  spinText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  /* RULES */
  rulesBox: {
    marginTop: 30,
    backgroundColor: "#1A1A1Acc",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFD600",
    width: "92%",
  },
  rulesText: {
    color: "#FFD600",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 15,
  },

  backBtn: {
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFD600",
    backgroundColor: "#0AA5FF",
  },
  backText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 16,
    textTransform: "uppercase",
  },
});
