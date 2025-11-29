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
import { useGlobalProgress } from "../../context/GlobalProgressContext";

// === DUOLINGO-LIKE SYSTEM ===
import { useProgress } from "../../context/ProgressContext";
import { useQuestion } from "../../hooks/useQuestion";
import { useModalContext } from "../../context/ModalContext";


// LOGOS + IMAGES
const casinoLogo = require("../../../assets/logos/casino_logo.png");
const slotImg = require("../../../assets/casino/casino_slot.png");
const casinoWallpaper = require("../../../assets/casino/casino_wallpaper.png");

/*  
=========================================
 TRICKS SYNCHRONISÉS BACKEND (✔ GOOD IDs)
=========================================
*/
const TRICKS = [
  { id: "ollie", label: "Ollie" },
  { id: "popshoveit", label: "Pop Shove-it" },
  { id: "kickflip", label: "Kickflip" },
  { id: "heelflip", label: "Heelflip" },
  { id: "fs_popshoveit", label: "Frontside Pop Shove-it" },
  { id: "fs_180", label: "Frontside 180" },
  { id: "bs_180", label: "Backside 180" },
  { id: "nollie", label: "Nollie" },
  { id: "halfcab", label: "Halfcab" },
  { id: "boardslide", label: "Boardslide" },
  { id: "fifty_fifty", label: "50-50 Grind" },
  { id: "tre_flip", label: "360 Flip" },
  { id: "hardflip", label: "Hardflip" },
  { id: "impossible", label: "Impossible" },
  { id: "varial_kickflip", label: "Varial Kickflip" },
  { id: "crook_grind", label: "Crook Grind" },
  { id: "nose_slide", label: "Nose Slide" },
  { id: "tail_slide", label: "Tail Slide" },
  { id: "five_o", label: "Five-O Grind" },
  { id: "fakie_bs_180", label: "Fakie Backside 180" },
];

export default function CasinoTrickSlot({ navigation }) {
  // Back-end ID (ex: "nose_slide")
  const [currentId, setCurrentId] = useState("");
  // Label affiché (ex: "Nose Slide")
  const [currentLabel, setCurrentLabel] = useState("—");
  const [isRolling, setIsRolling] = useState(false);

  // PROGRESSION + MODALES
  const { progress } = useProgress();
  const { refreshProgress } = useGlobalProgress();
  const { openQuestionModal, showLevelUp } = useModalContext();

  // Hook question
  const { loadQuestion, submit } = useQuestion(currentId);

  // Animations
  const rollY = useRef(new Animated.Value(0)).current;
  const trickOpacity = useRef(new Animated.Value(0)).current;
  const trickScale = useRef(new Animated.Value(0.8)).current;

  // List ×3 pour faire un vrai roulement
  const FULL_LIST = [...TRICKS, ...TRICKS, ...TRICKS];
  const ITEM_HEIGHT = 54;

  const spinReel = (finalIndex: number) => {
    rollY.setValue(0);

    Animated.timing(rollY, {
      toValue: -(18 * ITEM_HEIGHT + finalIndex * ITEM_HEIGHT),
      duration: 2300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      rollY.setValue(-finalIndex * ITEM_HEIGHT); // reset pile dessus
    });
  };

  const roll = () => {
    if (isRolling) return;

    setIsRolling(true);
    trickOpacity.setValue(0);
    trickScale.setValue(0.7);

    // Choix aléatoire
    const finalIndex = Math.floor(Math.random() * TRICKS.length);
    const final = TRICKS[finalIndex];

    spinReel(finalIndex);

    setTimeout(() => {
      setCurrentId(final.id); // backend ID
      setCurrentLabel(final.label); // UI label

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

  // DUOLINGO-LIKE QUESTION
  const askQuestionForCurrent = async () => {
    if (!currentId) return;

    const prog = progress[currentId] ?? { level: 0, totalXp: 0 };

    const q = await loadQuestion();
    if (!q?.question) return;

    openQuestionModal({
      trickId: currentId,
      question: q.question,
      onAnswer: async (selected) => {
        const result = await submit(q.question.level, selected);
        await refreshProgress();  // 🔥 synchronise la XP global
        // e
        if (result.correct && result.newLevel > prog.level) {
          showLevelUp({
            trickId: currentId,
            newLevel: result.newLevel,
            xpGained: result.xpGained,
          });
        }
        return result.correct;
      },
    });
  };

  return (
    <ImageBackground
      source={casinoWallpaper}
      style={styles.bg}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.25 }}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>

          {/* LOGO */}
          <Image source={casinoLogo} style={styles.casinoLogo} resizeMode="contain" />

          {/* MACHINE À SOUS */}
          <View style={styles.slotWrapper}>
            <Image
              source={slotImg}
              style={styles.slotImg}
              resizeMode="contain"
            />

            <View style={styles.reelMask}>
              <Animated.View style={{ transform: [{ translateY: rollY }] }}>
                {FULL_LIST.map((t, idx) => (
                  <View key={idx} style={styles.reelItem}>
                    <Text style={styles.reelText}>{t.label}</Text>
                  </View>
                ))}
              </Animated.View>
            </View>

            <Animated.Text
              style={[
                styles.trickName,
                { opacity: trickOpacity, transform: [{ scale: trickScale }] },
              ]}
            >
              {currentLabel}
            </Animated.Text>

            {currentId !== "" && (
              <TouchableOpacity
                style={styles.questionBubble}
                onPress={askQuestionForCurrent}
              >
                <Text style={styles.questionBubbleText}>?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* BOUTON */}
          <TouchableOpacity style={styles.spinBtn} onPress={roll} disabled={isRolling}>
            <Text style={styles.spinText}>{isRolling ? "..." : "LANCE LA MANIVELLE"}</Text>
          </TouchableOpacity>

          {/* RÈGLES */}
          <View style={styles.rulesBox}>
            <Text style={styles.rulesText}>
              Avec ton pote, faites le trick affiché.{"\n"}
              Celui qui rate prend une lettre.{"\n"}
              Premier à S-K-A-T-E → PERD !
            </Text>
          </View>

          {/* RETOUR */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>BACK TO ROOTS</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

// ==================== STYLES ====================
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

  casinoLogo: {
    width: 350,
    height: 180,
    marginBottom: 20,
  },

  slotWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "transparent",
  },

  slotImg: {
    width: 420,
    height: 330,
  },

  reelMask: {
    position: "absolute",
    top: 138,
    width: 310,
    height: 54,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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

  questionBubble: {
    position: "absolute",
    top: 90,
    right: 40,
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: "#FF355E",
    borderWidth: 3,
    borderColor: "#FFD600",
    alignItems: "center",
    justifyContent: "center",
  },
  questionBubbleText: {
    color: "#111",
    fontSize: 22,
    fontWeight: "900",
  },

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
  },

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
  },
});
