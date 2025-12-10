// frontend/src/screens/AliveDecksScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Switch,
  ImageSourcePropType,
  Modal,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { useGlobalProgress } from "../context/GlobalProgressContext";
import { deckImages } from "../../assets/decks/deckImages";
import { unlockAliveDeck } from "../services/aliveDeckService";
import { log } from "../utils/logger";

type AliveModeKey = "SPIRAL" | "MOIRE" | "FLUID" | "TUNNEL" | "PHENAKISTO";
type DeckVariant = "grid" | "modal";

type AliveDeckMeta = {
  id: string;
  name: string;
  mode: AliveModeKey;
};

// On utilise React.ReactElement au lieu de JSX.Element
type AliveDeckRenderer = (props: {
  deckId: string;
  variant: DeckVariant;
}) => React.ReactElement | null;

// ----- 25 decks Alive, groupés par mode -----
const ALIVE_DECKS: AliveDeckMeta[] = [
  // MODE 1 — Hypnotic Spiral (7)
  { id: "deck_alive_spiral", name: "Spirale N/B", mode: "SPIRAL" },
  { id: "deck_alive_spiral_color_2", name: "Spirale Color 2", mode: "SPIRAL" },
  { id: "deck_alive_spiral_cosmic_iris", name: "Cosmic Iris", mode: "SPIRAL" },
  { id: "deck_alive_spiral_fractal", name: "Spirale Fractale", mode: "SPIRAL" },
  { id: "deck_alive_spiral_galaxy", name: "Spirale Galaxy", mode: "SPIRAL" },
  { id: "deck_alive_spiral_rings", name: "Spirale Rings", mode: "SPIRAL" },
  { id: "deck_alive_spiral_sun", name: "Neon Sunburst", mode: "SPIRAL" },

  // MODE 2 — Moiré Vibration (3)
  { id: "deck_alive_feather_moire", name: "Feather Moiré", mode: "MOIRE" },
  { id: "deck_alive_skull_moire", name: "Skull Moiré", mode: "MOIRE" },
  { id: "deck_alive_tribal_moire", name: "Tribal Moiré", mode: "MOIRE" },

  // MODE 3 — Fluid Wave (5)
  { id: "deck_alive_fluid_chrome", name: "Fluid Chrome", mode: "FLUID" },
  { id: "deck_alive_fluid_cosmic", name: "Fluid Cosmic", mode: "FLUID" },
  { id: "deck_alive_fluid_lava", name: "Fluid Lava", mode: "FLUID" },
  { id: "deck_alive_fluid_neon", name: "Fluid Neon", mode: "FLUID" },
  { id: "deck_alive_fluid_sea",  name: "Fluid Sea",  mode: "FLUID" },

  // MODE 4 — Infinite Tunnel (6)
  {
    id: "deck_alive_tunnel_astronaute_black_hole",
    name: "Tunnel Astronaute",
    mode: "TUNNEL",
  },
  { id: "deck_alive_tunnel_church", name: "Tunnel Church", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_dragon", name: "Tunnel Dragon", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_neon", name: "Tunnel Neon", mode: "TUNNEL" },
  {
    id: "deck_alive_tunnel_skate_black_hole",
    name: "Tunnel Skate",
    mode: "TUNNEL",
  },
  {
    id: "deck_alive_tunnel_tron_skate",
    name: "Tunnel Tron Skate",
    mode: "TUNNEL",
  },

  // MODE 5 — PhenakistoSkate (5)
  { id: "deck_alive_phena_dragon", name: "Phena Dragon", mode: "PHENAKISTO" },
  { id: "deck_alive_phena_eye", name: "Phena Eye", mode: "PHENAKISTO" },
  { id: "deck_alive_phena_flip", name: "Phena Flip", mode: "PHENAKISTO" },
  { id: "deck_alive_phena_ghost", name: "Phena Ghost", mode: "PHENAKISTO" },
  { id: "deck_alive_phena_heart", name: "Phena Heart", mode: "PHENAKISTO" },
];

// ---------- MODE 1 : HYPNOTIC SPIRAL DANGEREUSE !!! ----------
function HypnoticSpiralDeck({
  deckId,
  variant,
}: {
  deckId: string;
  variant: DeckVariant;
}) {
  const spiralSource: ImageSourcePropType | undefined = deckImages[deckId];
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);

  const isModal = variant === "modal";

  // --- Respiration douce (idle) — on la garde pour le grid ---
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: isModal ? 1200 : 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: isModal ? 1200 : 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, isModal]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isModal ? [1, 1.16] : [1, 1.06],
  });

  // Petit balancement seulement pour la vue grid
  const idleRotate = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: isModal ? ["0deg", "0deg", "0deg"] : ["-4deg", "4deg", "-4deg"],
  });

  // Grande rotation hypnotique (modale) – 6 tours complets
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isModal ? ["0deg", "2160deg"] : ["0deg", "1080deg"],
  });

  const onPressSpin = () => {
    if (!isModal || isSpinning) return;

    setIsSpinning(true);
    spinAnim.setValue(0);

    // Accélération douce → vitesse stable → ralentissement
    Animated.sequence([
      // Phase 1 : démarrage naturel
      Animated.timing(spinAnim, {
        toValue: 0.15,
        duration: 700,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      // Phase 2 : plein régime hypnotique
      Animated.timing(spinAnim, {
        toValue: 0.85,
        duration: 2300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      // Phase 3 : décélération progressive façon "Twilight Zone"
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSpinning(false);
    });
  };

  if (!spiralSource) return null;

  const Container = isModal ? TouchableOpacity : View;

  // 👉 En modale : on suit toujours spinAnim (0deg au repos, 6 tours sur la séquence)
  // 👉 En grid : on reste sur le petit balancement idle
  const rotation = isModal ? spin : idleRotate;

  return (
    <Container
      style={styles.aliveDeckContainer}
      activeOpacity={0.9}
      onPress={isModal ? onPressSpin : undefined}
    >
      <Animated.Image
        source={spiralSource}
        style={[
          isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage,
          {
            transform: [{ scale }, { rotate: rotation }],
          },
        ]}
        resizeMode="contain"
      />
    </Container>
  );
}

// // ---------- MODE 1 : HYPNOTIC SPIRAL ----------
// function HypnoticSpiralDeck({
//   deckId,
//   variant,
// }: {
//   deckId: string;
//   variant: DeckVariant;
// }) {
//   const spiralSource: ImageSourcePropType | undefined = deckImages[deckId];
//   const pulseAnim = useRef(new Animated.Value(0)).current;
//   const spinAnim = useRef(new Animated.Value(0)).current;
//   const [isSpinning, setIsSpinning] = useState(false);

//   const isModal = variant === "modal";

//   // --- Respiration douce (idle) — on la garde pour le grid ---
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: isModal ? 1200 : 1400,
//           easing: Easing.inOut(Easing.quad),
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 0,
//           duration: isModal ? 1200 : 1400,
//           easing: Easing.inOut(Easing.quad),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, [pulseAnim, isModal]);

//   const scale = pulseAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: isModal ? [1, 1.16] : [1, 1.06],
//   });

//   // Petit balancement seulement pour la vue grid
//   const idleRotate = pulseAnim.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: isModal ? ["0deg", "0deg", "0deg"] : ["-4deg", "4deg", "-4deg"],
//   });

//   // Grande rotation hypnotique (modale) – 9 tours complets
//   const spin = spinAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: isModal ? ["0deg", "3240deg"] : ["0deg", "1080deg"],
//   });

//   const onPressSpin = () => {
//     if (!isModal || isSpinning) return;

//     setIsSpinning(true);
//     spinAnim.setValue(0);

//     // Accélération → plein régime rapide → décélération douce
//     Animated.sequence([
//       // Phase 1 : démarrage naturel (un peu plus court)
//       Animated.timing(spinAnim, {
//         toValue: 0.1,
//         duration: 500,
//         easing: Easing.in(Easing.quad),
//         useNativeDriver: true,
//       }),
//       // Phase 2 : plein régime bien plus rapide et plus long
//       Animated.timing(spinAnim, {
//         toValue: 0.9,
//         duration: 2600,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       }),
//       // Phase 3 : décélération progressive
//       Animated.timing(spinAnim, {
//         toValue: 1,
//         duration: 900,
//         easing: Easing.out(Easing.quad),
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setIsSpinning(false);
//     });
//   };


//   if (!spiralSource) return null;

//   const Container = isModal ? TouchableOpacity : View;

//   // 👉 En modale : on suit toujours spinAnim (0deg au repos, 6 tours sur la séquence)
//   // 👉 En grid : on reste sur le petit balancement idle
//   const rotation = isModal ? spin : idleRotate;

//   return (
//     <Container
//       style={styles.aliveDeckContainer}
//       activeOpacity={0.9}
//       onPress={isModal ? onPressSpin : undefined}
//     >
//       <Animated.Image
//         source={spiralSource}
//         style={[
//           isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage,
//           {
//             transform: [{ scale }, { rotate: rotation }],
//           },
//         ]}
//         resizeMode="contain"
//       />
//     </Container>
//   );
// }




// ---------- MODE 2 : MOIRÉ VIBRATION ----------
function MoireVibrationDeck({
  deckId,
  variant,
}: {
  deckId: string;
  variant: DeckVariant;
}) {
  const source: ImageSourcePropType | undefined = deckImages[deckId];
  const distortAnim = useRef(new Animated.Value(0)).current;
  const isModal = variant === "modal";

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(distortAnim, {
          toValue: 1,
          duration: isModal ? 450 : 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(distortAnim, {
          toValue: 0,
          duration: isModal ? 450 : 600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [distortAnim, isModal]);

  const translateX = distortAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isModal ? [-7, 7] : [-4, 4],
  });

  const scaleX = distortAnim.interpolate({
    inputRange: [0, 1],
    outputRange: isModal ? [1, 1.07] : [1, 1.03],
  });

  if (!source) return null;

  return (
    <View style={styles.aliveDeckContainer}>
      <Animated.Image
        source={source}
        style={[
          isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage,
          {
            transform: [{ translateX }, { scaleX }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

// ---------- MODE 3 : FLUID WAVE (v2.1 "liquide safe") ----------
function FluidWaveDeck({
  deckId,
  variant,
}: {
  deckId: string;
  variant: DeckVariant;
}) {
  const source: ImageSourcePropType | undefined = deckImages[deckId];
  const isModal = variant === "modal";

  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    waveAnim.setValue(0);

    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: isModal ? 4200 : 4600, // cycle un peu long, vibe "fluide"
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    ).start();
  }, [waveAnim, isModal]);

  // --- drift vertical (comme une vague qui monte / descend) ---
  const translateY = waveAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: isModal ? [-10, -4, 10, 4, -10] : [-6, -3, 6, 3, -6],
  });

  // --- drift horizontal léger (courant qui emporte la board) ---
  const translateX = waveAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: isModal ? [-6, 3, 6, -3, -6] : [-4, 2, 4, -2, -4],
  });

  // --- légère respiration globale (la matière "respire") ---
  const scale = waveAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: isModal ? [1, 1.04, 1.07, 1.04, 1] : [1, 1.02, 1.035, 1.02, 1],
  });

  // --- rotation douce pour casser l'effet "élastique" trop simple ---
  const rotate = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: isModal ? ["-3deg", "3deg", "-3deg"] : ["-2deg", "2deg", "-2deg"],
  });

  if (!source) return null;

  return (
    <View style={styles.aliveDeckContainer}>
      <Animated.Image
        source={source}
        style={[
          isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
              { rotate },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}


// // ---------- MODE 3 : FLUID WAVE (TEST SANS ANIM) ----------
// function FluidWaveDeck({
//   deckId,
//   variant,
// }: {
//   deckId: string;
//   variant: DeckVariant;
// }) {
//   const source: ImageSourcePropType | undefined = deckImages[deckId];
//   const isModal = variant === "modal";

//   if (!source) {
//     log("FLUID_DECK_SOURCE_UNDEFINED", deckId);
//     return null;
//   }

//   log("FLUID_DECK_SOURCE_OK", deckId);

//   return (
//     <View style={styles.aliveDeckContainer}>
//       <Animated.Image
//         // même style que les autres modes, sans transform
//         source={source}
//         style={isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage}
//         resizeMode="contain"
//       />
//     </View>
//   );
// }


// ---------- MODE 4 : INFINITE TUNNEL (v8 "gueule centrée -5cm") ----------
function InfiniteTunnelDeck({
  deckId,
  variant,
}: {
  deckId: string;
  variant: DeckVariant;
}) {
  const source: ImageSourcePropType | undefined = deckImages[deckId];
  const isModal = variant === "modal";

  const tunnelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    tunnelAnim.setValue(0);

    Animated.loop(
      Animated.timing(tunnelAnim, {
        toValue: 1,
        duration: isModal ? 3800 : 4400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [tunnelAnim, isModal]);

  // ===== ZOOM =====
  const scale = tunnelAnim.interpolate({
    inputRange: [0, 0.2, 0.45, 0.55, 0.8, 1],
    outputRange: isModal
      ? [0.30, 0.45, 2.8, 3.6, 1.4, 0.30]
      : [0.8, 0.9, 1.05, 1.1, 0.95, 0.8],
  });

  const translateY = tunnelAnim.interpolate({
  inputRange: [0, 0.2, 0.45, 0.55, 0.8, 1],
  outputRange: isModal
    ? [40, 20, 90, 90, 10, 40]   // 👈 max zoom centré (0)
    : [12, 6, -4, -4, 0, 12],
  });


  const translateX = tunnelAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: isModal ? [-6, 6, -6] : [-3, 3, -3],
  });

  const rotate = tunnelAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: isModal
      ? ["-2.5deg", "2.5deg", "-2.5deg"]
      : ["-1deg", "1deg", "-1deg"],
  });

  if (!source) return null;

  return (
    <View style={styles.aliveDeckContainer}>
      <Animated.Image
        source={source}
        style={[
          isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage,
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
              { rotate },
            ],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

// ---------- MODE 5 : PHENAKISTO SKATE ----------
function PhenakistoSkateDeck({
  deckId,
  variant,
}: {
  deckId: string;
  variant: DeckVariant;
}) {
  const source: ImageSourcePropType | undefined = deckImages[deckId];
  const loopAnim = useRef(new Animated.Value(0)).current;
  const isModal = variant === "modal";

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loopAnim, {
          toValue: 1,
          duration: isModal ? 700 : 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(loopAnim, {
          toValue: 0,
          duration: isModal ? 700 : 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [loopAnim, isModal]);

  const frameScale = loopAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: isModal
      ? [1, 1.08, 1, 1.08, 1]
      : [1, 1.02, 1, 1.02, 1],
  });

  const frameTilt = loopAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: isModal
      ? ["-3deg", "5deg", "-5deg", "5deg", "-3deg"]
      : ["-1deg", "2deg", "-2deg", "2deg", "-1deg"],
  });

  if (!source) return null;

  return (
    <View style={styles.aliveDeckContainer}>
      <Animated.Image
        source={source}
        style={[
          isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage,
          {
            transform: [{ scale: frameScale }, { rotate: frameTilt }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

// =============================================
//          ÉCRAN PRINCIPAL ALIVE DECKS
// =============================================
export default function AliveDecksScreen() {
  log("deckImages_keys", Object.keys(deckImages));
  const { progress, refreshProgress } = useGlobalProgress();

  const unlockedAliveFromBackend: string[] =
    ((progress as any)?.unlockedAliveDecks ??
      (progress as any)?.UnlockedAliveDecks ??
      []) || [];

  const aliveTokens: number =
    (progress as any)?.aliveDeckTokens ??
    (progress as any)?.AliveDeckTokens ??
    0;  

  // Mode test : débloque TOUTES les variantes Alive (25/25)
  const [testUnlockAll, setTestUnlockAll] = useState<boolean>(true);

  // Aides contextuelles par mode (bouton ?)
  const [helpMode, setHelpMode] = useState<AliveModeKey | null>(null);

  // Modale "deck en grand"
  const [selectedDeck, setSelectedDeck] = useState<AliveDeckMeta | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const helpTexts: Record<AliveModeKey, string> = {
    SPIRAL:
      "Appuie sur le deck en grand pour déclencher une grosse rotation, sinon il respire doucement.",
    MOIRE:
      "Les decks Moiré vibrent tout seuls : laisse l’animation tourner pour sentir l’effet optique.",
    FLUID:
      "Les decks Fluid ondulent en continu : les vagues montent et descendent automatiquement.",
    TUNNEL:
      "Les decks Tunnel zooment et dézooment en boucle pour simuler un tunnel infini.",
    PHENAKISTO:
      "Les decks Phenakisto loopent en mode flipbook, comme une mini animation de skateur.",
  };

  const resolvedUnlockedIds = testUnlockAll
    ? ALIVE_DECKS.map((d) => d.id)
    : unlockedAliveFromBackend;

  const modeDefs: {
    key: AliveModeKey;
    title: string;
    subtitle: string;
    renderer: AliveDeckRenderer;
  }[] = [
    {
      key: "SPIRAL",
      title: "Mode 1 — Hypnotic Spiral",
      subtitle: "Rotation + pulsation hypnotique",
      renderer: (p) => <HypnoticSpiralDeck {...p} />,
    },
    {
      key: "MOIRE",
      title: "Mode 2 — Moiré Vibration",
      subtitle: "Micro-vibration optique (lignes/damier)",
      renderer: (p) => <MoireVibrationDeck {...p} />,
    },
    {
      key: "FLUID",
      title: "Mode 3 — Fluid Wave",
      subtitle: "Matière liquide qui respire",
      renderer: (p) => <FluidWaveDeck {...p} />,
    },
    {
      key: "TUNNEL",
      title: "Mode 4 — Infinite Tunnel",
      subtitle: "Zoom breathing façon tunnel infini",
      renderer: (p) => <InfiniteTunnelDeck {...p} />,
    },
    {
      key: "PHENAKISTO",
      title: "Mode 5 — PhenakistoSkate",
      subtitle: "Loop façon flipbook / animation cyclique",
      renderer: (p) => <PhenakistoSkateDeck {...p} />,
    },
  ];

  const groupedByMode: Record<AliveModeKey, AliveDeckMeta[]> = {
    SPIRAL: [],
    MOIRE: [],
    FLUID: [],
    TUNNEL: [],
    PHENAKISTO: [],
  };

  ALIVE_DECKS.forEach((deck) => {
    groupedByMode[deck.mode].push(deck);
  });

    const handleUnlockAliveDeck = async (deckId: string) => {
    if (unlocking || testUnlockAll) return;
    if (aliveTokens <= 0) return;

    try {
      setUnlocking(true);
      await unlockAliveDeck(deckId);
      await refreshProgress();
    } catch (e) {
      log("unlockAliveDeck_error", e);
    } finally {
      setUnlocking(false);
    }
  };


  const renderCard = (
    deck: AliveDeckMeta,
    renderAnimated: AliveDeckRenderer
  ) => {
    const unlocked = resolvedUnlockedIds.includes(deck.id);
    const imgSource = deckImages[deck.id];

    // 🔒 CASE VERROUILLÉE
    if (!unlocked || !imgSource) {
      const canUnlock = !testUnlockAll && aliveTokens > 0;

    return (
        <TouchableOpacity
          key={deck.id}
          style={[
            styles.card,
            styles.cardLocked,
            canUnlock && styles.cardCanUnlock,
          ]}
          activeOpacity={canUnlock ? 0.9 : 1}
          onPress={canUnlock ? () => handleUnlockAliveDeck(deck.id) : undefined}
        >
          <View style={styles.lockedDeckPlaceholder}>
            <Text style={styles.lockedQuestion}>?</Text>
          </View>
          <Text style={styles.cardName}>????</Text>
          <Text style={styles.cardSub}>
            {canUnlock ? "Tap pour débloquer (1 token)" : "LOCKED"}
          </Text>
        </TouchableOpacity>
      );
    }


    return (
      <TouchableOpacity
        key={deck.id}
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => setSelectedDeck(deck)}
      >
        {renderAnimated({ deckId: deck.id, variant: "grid" })}
        <Text style={styles.cardName}>{deck.name}</Text>
        <Text style={styles.cardSub}>Alive Deck</Text>
      </TouchableOpacity>
    );
  };

  const currentModeDef =
    selectedDeck && modeDefs.find((m) => m.key === selectedDeck.mode);

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <Text style={styles.title}>Decks Alive</Text>
        <Text style={styles.subtitle}>25 decks illusions optiques</Text>

        <View style={styles.testToggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.testLabel}>Mode test : tout débloquer</Text>
            <Text style={styles.testHint}>
              (V1 labo : 25/25 decks visibles. Désactive pour ne voir que ce que
              renvoie le backend.)
            </Text>
          </View>
          <View style={styles.tokensRow}>
            <Text style={styles.tokensLabel}>
              Tokens Alive disponibles :{" "}
              <Text style={styles.tokensValue}>{aliveTokens}</Text>
            </Text>
            <Text style={styles.tokensHint}>
              1 token = 1 Deck Alive débloqué
            </Text>
          </View>

          <Switch
            value={testUnlockAll}
            onValueChange={setTestUnlockAll}
            thumbColor={testUnlockAll ? "#FFD600" : "#888"}
            trackColor={{ true: "#0AA5FF", false: "#444" }}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {modeDefs.map((mode) => (
            <View key={mode.key} style={styles.modeBlock}>
              <View style={styles.modeHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                </View>

                <TouchableOpacity
                  style={styles.helpButton}
                  onPress={() => setHelpMode(mode.key)}
                >
                  <Text style={styles.helpButtonText}>?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modeRow}>
                {groupedByMode[mode.key].map((deck) =>
                  renderCard(deck, mode.renderer)
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Modale d'aide par mode */}
        <Modal
          visible={helpMode !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setHelpMode(null)}
        >
          <TouchableOpacity
            style={styles.helpModalBackdrop}
            activeOpacity={1}
            onPress={() => setHelpMode(null)}
          >
            <View style={styles.helpModalCard}>
              <Text style={styles.helpModalTitle}>Comment ça marche ?</Text>
              {helpMode && (
                <Text style={styles.helpModalText}>{helpTexts[helpMode]}</Text>
              )}

              <TouchableOpacity
                style={styles.helpModalButton}
                onPress={() => setHelpMode(null)}
              >
                <Text style={styles.helpModalButtonText}>OK, j’ai capté</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modale deck en grand + animation boostée */}
        <Modal
          visible={selectedDeck !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDeck(null)}
        >
          <TouchableOpacity
            style={styles.deckModalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedDeck(null)}
          >
            <View style={styles.deckModalCard}>
              {selectedDeck && (
                <>
                  <Text style={styles.deckModalTitle}>{selectedDeck.name}</Text>
                  <View style={styles.deckModalImageWrapper}>
                    {currentModeDef &&
                      currentModeDef.renderer({
                        deckId: selectedDeck.id,
                        variant: "modal",
                      })}
                  </View>

                  <TouchableOpacity
                    style={styles.deckModalButton}
                    onPress={() => setSelectedDeck(null)}
                  >
                    <Text style={styles.deckModalButtonText}>Fermer</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050316",
    paddingHorizontal: 12,
    paddingTop: 12,
    marginHorizontal: 10,
    marginVertical: 12,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#FFD600",
    shadowColor: "#FFB020",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  scroll: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  title: {
    fontFamily: "Bangers",
    fontSize: 32,
    color: "#FEE54A",
    textAlign: "center",
    letterSpacing: 1.5,
    textShadowColor: "#FF355E",
    textShadowRadius: 4,
  },
  subtitle: {
    marginTop: 4,
    textAlign: "center",
    color: "#C2C6FF",
    fontSize: 14,
  },
  testToggleRow: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#111325",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

    tokensRow: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#111325",
  },
  tokensLabel: {
    color: "#FEE54A",
    fontSize: 13,
    fontWeight: "700",
  },
  tokensValue: {
    color: "#0AA5FF",
    fontSize: 14,
    fontWeight: "900",
  },
  tokensHint: {
    color: "#B0B3D6",
    fontSize: 11,
    marginTop: 2,
  },
  cardCanUnlock: {
    borderColor: "#FEE54A",
    shadowColor: "#FEE54A",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  testLabel: {
    color: "#FEE54A",
    fontWeight: "700",
    fontSize: 14,
  },
  testHint: {
    color: "#B0B3D6",
    fontSize: 11,
    marginTop: 2,
  },
  modeBlock: {
    marginTop: 24,
  },
  modeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeTitle: {
    fontFamily: "Bangers",
    fontSize: 22,
    color: "#0AA5FF",
    letterSpacing: 1,
  },
  modeSubtitle: {
    color: "#C2C6FF",
    fontSize: 12,
    marginTop: 4,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    flexWrap: "wrap",
  },
  card: {
    flexBasis: "30%",
    marginBottom: 10,
    backgroundColor: "#15172B",
    borderRadius: 18,
    paddingTop: 8,
    paddingHorizontal: 2,
    paddingBottom: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#262B4D",
  },
  cardLocked: {
    opacity: 0.45,
    borderStyle: "dashed",
  },
  lockedDeckPlaceholder: {
    width: "90%",
    aspectRatio: 2 / 3,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#444A7A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080918",
  },
  lockedQuestion: {
    fontSize: 46,
    fontWeight: "900",
    color: "#FEE54A",
  },
  cardName: {
    marginTop: 8,
    color: "#F5F5FF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  cardSub: {
    marginTop: 2,
    color: "#8D91C7",
    fontSize: 11,
    textAlign: "center",
  },
  aliveDeckContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  aliveDeckImage: {
    width: "92%",
    height: 190,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
    borderRadius: 18,
  },
  aliveDeckImageBig: {
    width: "100%",
    height: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 16,
    borderRadius: 22,
  },

  // Bouton ? (aide)
  helpButton: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FEE54A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111325",
  },
  helpButtonText: {
    color: "#FEE54A",
    fontWeight: "900",
    fontSize: 16,
  },
  helpModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  helpModalCard: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#050316",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#FEE54A",
  },
  helpModalTitle: {
    fontFamily: "Bangers",
    fontSize: 22,
    color: "#FEE54A",
    textAlign: "center",
    marginBottom: 8,
  },
  helpModalText: {
    color: "#E5E7EB",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  helpModalButton: {
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FEE54A",
  },
  helpModalButtonText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },

  // Modale deck en grand
  deckModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  deckModalCard: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#050316",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#0AA5FF",
  },
  deckModalTitle: {
    fontFamily: "Bangers",
    fontSize: 26,
    color: "#FEE54A",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 1,
  },
  deckModalSubtitle: {
    color: "#C2C6FF",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  deckModalImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  deckModalButton: {
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FEE54A",
  },
  deckModalButtonText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 14,
  },
});
