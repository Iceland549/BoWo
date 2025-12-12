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
import AsyncStorage from "@react-native-async-storage/async-storage";

type AliveModeKey = "SPIRAL" | "MOIRE" | "TUNNEL" | "LENT" | "MORPH";
type DeckVariant = "grid" | "modal";

type AliveDeckMeta = {
  id: string;
  name: string;
  mode: AliveModeKey;
};

type AliveDeckRenderer = (props: {
  deckId: string;
  variant: DeckVariant;
}) => React.ReactElement | null;

// ✅ ALIVE — aligné avec deckImages.ts (Spiral/Moire/Tunnel/Lent uniquement)
const ALIVE_DECKS: AliveDeckMeta[] = [
  // SPIRAL (7)
  { id: "deck_alive_spiral", name: "Spirale N/B", mode: "SPIRAL" },
  { id: "deck_alive_spiral_color_2", name: "Spirale Color 2", mode: "SPIRAL" },
  { id: "deck_alive_spiral_cosmic_iris", name: "Cosmic Iris", mode: "SPIRAL" },
  { id: "deck_alive_spiral_fractal", name: "Spirale Fractale", mode: "SPIRAL" },
  { id: "deck_alive_spiral_galaxy", name: "Spirale Galaxy", mode: "SPIRAL" },
  { id: "deck_alive_spiral_rings", name: "Spirale Rings", mode: "SPIRAL" },
  { id: "deck_alive_spiral_sun", name: "Neon Sunburst", mode: "SPIRAL" },

  // TUNNEL (7)
  { id: "deck_alive_tunnel_astronaute_black_hole", name: "Tunnel Astronaute", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_church", name: "Tunnel Church", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_dragon", name: "Tunnel Dragon", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_neon", name: "Tunnel Neon", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_skate_black_hole", name: "Tunnel Skate", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_tron_skate", name: "Tunnel Tron Skate", mode: "TUNNEL" },
  { id: "deck_alive_tunnel_shark", name: "Tunnel Shark", mode: "TUNNEL" },

  // LENTICULAR (1 entrée catalogue ; utilise calm+chaotic en interne)
  { id: "deck_alive_lent_calm", name: "Lenticular Calm", mode: "LENT" },
];

// ================================
//  Sécurité Hypnotic Spiral (BoWo)
// ================================
const HYPNO_WARNING_KEY = "bowo_hypno_warning_v1";
const HYPNO_SESSIONS_KEY = "bowo_hypno_sessions_v1";
const HYPNO_DAILY_KEY = "bowo_hypno_daily_v1";

const HYPNO_MAX_SESSIONS = 3;
const HYPNO_WINDOW_MS = 5 * 60 * 1000;
const HYPNO_DAILY_MAX = 3;
const HYPNO_BAR_MAX = 3;

// =========================================================
// MODE 1 : HYPNOTIC SPIRAL (code original conservé)
// - GRID : respiration douce (comme ton original)
// - MODAL : respiration + spin au clic + sécurité (comme ton original)
// =========================================================
function HypnoticSpiralDeck({
  deckId,
  variant,
}: {
  deckId: string;
  variant: DeckVariant;
}) {
  const spiralSource = deckImages[deckId];

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const batteryPulse = useRef(new Animated.Value(0)).current;

  const [isSpinning, setIsSpinning] = useState(false);

  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [cooldownMin, setCooldownMin] = useState<number | null>(null);

  const [recentCount, setRecentCount] = useState(0);

  const isModal = variant === "modal";

  const getTodayKey = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    AsyncStorage.getItem(HYPNO_WARNING_KEY).then((v) => {
      if (v === "true") setHasAcceptedWarning(true);
    });
  }, []);

  // ✅ IMPORTANT : le hook est toujours appelé (pas de return avant)
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

  const idleRotate = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: isModal ? ["0deg", "0deg", "0deg"] : ["-4deg", "4deg", "-4deg"],
  });

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "2160deg"],
  });

  const canUseHypno = async (): Promise<boolean> => {
    const now = Date.now();
    const todayKey = getTodayKey();

    try {
      const rawDaily = await AsyncStorage.getItem(HYPNO_DAILY_KEY);
      const daily = rawDaily ? JSON.parse(rawDaily) : null;

      const dailyCount =
        daily?.date === todayKey && typeof daily?.count === "number"
          ? daily.count
          : 0;

      if (dailyCount >= HYPNO_DAILY_MAX) {
        setCooldownMin(null);
        setShowLimitModal(true);
        return false;
      }

      const raw = await AsyncStorage.getItem(HYPNO_SESSIONS_KEY);
      const sessions: number[] = raw ? JSON.parse(raw) : [];
      const recent = sessions.filter((t) => now - t < HYPNO_WINDOW_MS);

      setRecentCount(recent.length);

      if (recent.length >= HYPNO_MAX_SESSIONS) {
        const remaining = HYPNO_WINDOW_MS - (now - Math.min(...recent));
        setCooldownMin(Math.ceil(remaining / 60000));
        setShowLimitModal(true);
        return false;
      }

      recent.push(now);
      await AsyncStorage.setItem(HYPNO_SESSIONS_KEY, JSON.stringify(recent));

      await AsyncStorage.setItem(
        HYPNO_DAILY_KEY,
        JSON.stringify({ date: todayKey, count: dailyCount + 1 })
      );

      setRecentCount(recent.length);

      batteryPulse.setValue(0);
      Animated.sequence([
        Animated.timing(batteryPulse, { toValue: 1, duration: 140, useNativeDriver: true }),
        Animated.timing(batteryPulse, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();

      return true;
    } catch (e) {
      log("hypno_limit_error", e);
      return true;
    }
  };

  const startSpin = () => {
    setIsSpinning(true);
    spinAnim.setValue(0);

    Animated.sequence([
      Animated.timing(spinAnim, {
        toValue: 0.15,
        duration: 700,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 0.85,
        duration: 2300,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => setIsSpinning(false));
  };

  const onPressSpin = async () => {
    if (!isModal || isSpinning) return;

    if (!hasAcceptedWarning) {
      setShowWarningModal(true);
      return;
    }

    if (await canUseHypno()) startSpin();
  };

  const acceptWarning = async () => {
    await AsyncStorage.setItem(HYPNO_WARNING_KEY, "true");
    setHasAcceptedWarning(true);
    setShowWarningModal(false);
    if (await canUseHypno()) startSpin();
  };

  if (!spiralSource) return null;

  const Container = isModal ? TouchableOpacity : View;
  const rotation = isModal ? spin : idleRotate;

  return (
    <>
      <Container
        style={styles.aliveDeckContainer}
        activeOpacity={0.9}
        onPress={isModal ? onPressSpin : undefined}
      >
        <Animated.Image
          source={spiralSource}
          style={[
            isModal ? styles.aliveDeckImageBig : styles.aliveDeckImage,
            { transform: [{ scale }, { rotate: rotation }] },
          ]}
          resizeMode="contain"
        />

        {isModal && (
          <View style={styles.hypnoHud}>
            <Text style={styles.hypnoHudText}>
              Hypnotic energy: {recentCount}/{HYPNO_BAR_MAX}
            </Text>

            <Animated.View
              style={[
                styles.hypnoBattery,
                {
                  transform: [
                    {
                      scale: batteryPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.08],
                      }),
                    },
                  ],
                },
              ]}
            >
              {Array.from({ length: HYPNO_BAR_MAX }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.hypnoCell,
                    i < recentCount ? styles.hypnoCellOn : styles.hypnoCellOff,
                  ]}
                />
              ))}
            </Animated.View>
          </View>
        )}
      </Container>

      <Modal visible={showWarningModal} transparent animationType="fade">
        <View style={styles.helpModalBackdrop}>
          <View style={styles.helpModalCard}>
            <Text style={styles.helpModalTitle}>Attention</Text>
            <Text style={styles.helpModalText}>
              Les effets hypnotiques peuvent provoquer une sensation de vertige.
              Utilise ce deck avec modération et jamais juste avant de faire du skate.
            </Text>
            <TouchableOpacity style={styles.helpModalButton} onPress={acceptWarning}>
              <Text style={styles.helpModalButtonText}>J’ai compris</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showLimitModal} transparent animationType="fade">
        <View style={styles.helpModalBackdrop}>
          <View style={styles.helpModalCard}>
            <Text style={styles.helpModalTitle}>Pause recommandée</Text>
            <Text style={styles.helpModalText}>
              {cooldownMin != null
                ? `Trop d’utilisations rapprochées. Réessaie dans ${cooldownMin} minute(s).`
                : `Limite journalière atteinte. Reviens demain.`}
            </Text>
            <TouchableOpacity
              style={styles.helpModalButton}
              onPress={() => setShowLimitModal(false)}
            >
              <Text style={styles.helpModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}



// =========================================================
// MODE 3 : TUNNEL — MODAL : au clic, 1 cycle (~4.2s)
// =========================================================
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

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    return () => {
      tunnelAnim.stopAnimation();
    };
  }, [tunnelAnim]);

  if (!source) return null;

  const startEffect = () => {
    if (!isModal) return;
    if (isActive) return;

    setIsActive(true);
    tunnelAnim.setValue(0);

    Animated.timing(tunnelAnim, {
      toValue: 1,
      duration: 4200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setIsActive(false);
      tunnelAnim.setValue(0);
    });
  };

  // GRID : statique (mouvement commun sera sur la card)
  if (!isModal) {
    return (
      <View style={styles.aliveDeckContainer}>
        <Animated.Image source={source} style={styles.aliveDeckImage} resizeMode="contain" />
      </View>
    );
  }

  // MODAL : statique tant qu’on n’a pas cliqué
  if (!isActive) {
    return (
      <TouchableOpacity style={styles.aliveDeckContainer} activeOpacity={0.9} onPress={startEffect}>
        <Animated.Image source={source} style={styles.aliveDeckImageBig} resizeMode="contain" />
      </TouchableOpacity>
    );
  }

  // animation tunnel (ton mapping modal)
  const scale = tunnelAnim.interpolate({
    inputRange: [0, 0.2, 0.45, 0.55, 0.8, 1],
    outputRange: [0.30, 0.45, 2.8, 3.6, 1.4, 0.30],
  });

  const translateY = tunnelAnim.interpolate({
    inputRange: [0, 0.2, 0.45, 0.55, 0.8, 1],
    outputRange: [40, 20, 90, 90, 10, 40],
  });

  const translateX = tunnelAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-6, 6, -6],
  });

  const rotate = tunnelAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-2.5deg", "2.5deg", "-2.5deg"],
  });

  return (
    <TouchableOpacity style={styles.aliveDeckContainer} activeOpacity={0.9} onPress={startEffect}>
      <Animated.Image
        source={source}
        style={[styles.aliveDeckImageBig, { transform: [{ translateX }, { translateY }, { scale }, { rotate }] }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

// =========================================================
// MODE 4 : LENTICULAR — MODAL : au clic, 1 séquence (~6s)
// =========================================================
function LenticularDeck({
  deckId,
  variant,
}: {
  deckId: string;
  variant: DeckVariant;
}) {
  const isModal = variant === "modal";

  const calmSource = deckImages["deck_alive_lent_calm"] as ImageSourcePropType;
  const chaoticSource = deckImages["deck_alive_lent_chaotic"] as ImageSourcePropType;

  const flipAnimRef = useRef<Animated.Value | null>(null);
  if (!flipAnimRef.current) flipAnimRef.current = new Animated.Value(0);
  const flipAnim = flipAnimRef.current;

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    return () => {
      flipAnim.stopAnimation();
    };
  }, [flipAnim]);

  const startEffect = () => {
    if (!isModal) return;
    if (isActive) return;

    setIsActive(true);
    flipAnim.setValue(0);

    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setIsActive(false);
      flipAnim.setValue(0);
    });
  };

  // GRID : calm statique
  if (!isModal) {
    return (
      <View style={styles.aliveDeckContainer}>
        <Animated.Image source={calmSource} style={styles.aliveDeckImage} resizeMode="contain" />
      </View>
    );
  }

  // MODAL : statique tant qu’on n’a pas cliqué
  if (!isActive) {
    return (
      <TouchableOpacity style={styles.aliveDeckContainer} activeOpacity={0.9} onPress={startEffect}>
        <Animated.Image source={calmSource} style={styles.aliveDeckImageBig} resizeMode="contain" />
      </TouchableOpacity>
    );
  }

  const tiltY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-10deg", "10deg", "-10deg"],
  });

  const zoom = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.95, 1, 0.95],
  });

  const calmOpacity = flipAnim.interpolate({
    inputRange: [0, 0.18, 0.32, 0.68, 0.82, 1],
    outputRange: [1, 1, 0, 0, 1, 1],
  });

  const chaoticOpacity = flipAnim.interpolate({
    inputRange: [0, 0.18, 0.32, 0.68, 0.82, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
  });

  return (
    <TouchableOpacity style={styles.aliveDeckContainer} activeOpacity={0.9} onPress={startEffect}>
      <Animated.View
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: [{ perspective: 1200 }, { rotateY: tiltY }, { scale: zoom }],
        }}
      >
        <Animated.Image
          source={calmSource}
          style={[styles.aliveDeckImageBig, { position: "absolute", opacity: calmOpacity }]}
          resizeMode="contain"
        />
        <Animated.Image
          source={chaoticSource}
          style={[styles.aliveDeckImageBig, { position: "absolute", opacity: chaoticOpacity }]}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// =============================================
//          ÉCRAN PRINCIPAL ALIVE DECKS
// =============================================
export default function AliveDecksScreen() {
  log("deckImages_keys", Object.keys(deckImages));
  const { progress, refreshProgress } = useGlobalProgress();

  const unlockedAliveFromBackend: string[] =
    ((progress as any)?.unlockedAliveDecks ?? (progress as any)?.UnlockedAliveDecks ?? []) || [];

  const aliveTokens: number =
    (progress as any)?.aliveDeckTokens ?? (progress as any)?.AliveDeckTokens ?? 0;

  const [testUnlockAll, setTestUnlockAll] = useState<boolean>(true);
  const [helpMode, setHelpMode] = useState<AliveModeKey | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<AliveDeckMeta | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // ✅ Mouvement commun vitrine (grid) au niveau de la card
  const showcaseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    showcaseAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(showcaseAnim, {
        toValue: 1,
        duration: 3200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [showcaseAnim]);

  const showcaseTranslateY = showcaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -6, 0],
  });

  const showcaseRotate = showcaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-2deg", "2deg", "-2deg"],
  });

  const showcaseScale = showcaseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 1],
  });

  const helpTexts: Record<AliveModeKey, string> = {
    SPIRAL: "En modale : appuie sur le deck pour déclencher une grosse rotation (safe).",
    MOIRE: "En modale : appuie sur le deck pour déclencher l'effet moiré quelques secondes.",
    TUNNEL: "En modale : appuie sur le deck pour lancer un zoom tunnel quelques secondes.",
    LENT: "En modale : appuie sur le deck pour déclencher l'effet lenticular quelques secondes.",
    MORPH: "Bientôt…",
  };

  const resolvedUnlockedIds = testUnlockAll ? ALIVE_DECKS.map((d) => d.id) : unlockedAliveFromBackend;

  const modeDefs: {
    key: AliveModeKey;
    title: string;
    subtitle: string;
    renderer: AliveDeckRenderer;
  }[] = [
    { key: "SPIRAL", title: "Mode 1 — Hypnotic Spiral", subtitle: "Respiration + spin au clic (safe)", renderer: (p) => <HypnoticSpiralDeck {...p} /> },
    { key: "TUNNEL", title: "Mode 3 — Infinite Tunnel", subtitle: "Déclenché au clic (quelques secondes)", renderer: (p) => <InfiniteTunnelDeck {...p} /> },
    { key: "LENT", title: "Mode 4 — Lenticular", subtitle: "Déclenché au clic (quelques secondes)", renderer: (p) => <LenticularDeck {...p} /> },
  ];

  const groupedByMode: Record<AliveModeKey, AliveDeckMeta[]> = {
    SPIRAL: [],
    MOIRE: [],
    TUNNEL: [],
    LENT: [],
    MORPH: [],
  };

  ALIVE_DECKS.forEach((deck) => groupedByMode[deck.mode].push(deck));

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

  const renderCard = (deck: AliveDeckMeta, renderAnimated: AliveDeckRenderer) => {
    const unlocked = resolvedUnlockedIds.includes(deck.id);
    const imgSource = deckImages[deck.id];

    if (!unlocked || !imgSource) {
      const canUnlock = !testUnlockAll && aliveTokens > 0;

      return (
        <TouchableOpacity
          key={deck.id}
          style={[styles.card, styles.cardLocked, canUnlock && styles.cardCanUnlock]}
          activeOpacity={canUnlock ? 0.9 : 1}
          onPress={canUnlock ? () => handleUnlockAliveDeck(deck.id) : undefined}
        >
          <View style={styles.lockedDeckPlaceholder}>
            <Text style={styles.lockedQuestion}>?</Text>
          </View>
          <Text style={styles.cardName}>????</Text>
          <Text style={styles.cardSub}>{canUnlock ? "Tap pour débloquer (1 token)" : "LOCKED"}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity key={deck.id} style={styles.card} activeOpacity={0.9} onPress={() => setSelectedDeck(deck)}>
        {/* ✅ mouvement commun vitrine (wrapper) */}
        <Animated.View
          style={{
            width: "100%",
            transform: [{ translateY: showcaseTranslateY }, { scale: showcaseScale }, { rotate: showcaseRotate }],
          }}
        >
          {renderAnimated({ deckId: deck.id, variant: "grid" })}
        </Animated.View>

        <Text style={styles.cardName}>{deck.name}</Text>
        <Text style={styles.cardSub}>Alive Deck</Text>
      </TouchableOpacity>
    );
  };

  const currentModeDef = selectedDeck && modeDefs.find((m) => m.key === selectedDeck.mode);

  return (
    <ScreenWrapper>
      <View style={styles.root}>
        <Text style={styles.title}>Decks Alive</Text>
        <Text style={styles.subtitle}>{ALIVE_DECKS.length} decks illusions optiques</Text>

        <View style={styles.testToggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.testLabel}>Mode test : tout débloquer</Text>
            <Text style={styles.testHint}>(Désactive pour ne voir que ce que renvoie le backend.)</Text>
          </View>

          <View style={styles.tokensRow}>
            <Text style={styles.tokensLabel}>
              Tokens Alive disponibles : <Text style={styles.tokensValue}>{aliveTokens}</Text>
            </Text>
            <Text style={styles.tokensHint}>1 token = 1 Deck Alive débloqué</Text>
          </View>

          <Switch
            value={testUnlockAll}
            onValueChange={setTestUnlockAll}
            thumbColor={testUnlockAll ? "#FFD600" : "#888"}
            trackColor={{ true: "#0AA5FF", false: "#444" }}
          />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {modeDefs.map((mode) => (
            <View key={mode.key} style={styles.modeBlock}>
              <View style={styles.modeHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                </View>

                <TouchableOpacity style={styles.helpButton} onPress={() => setHelpMode(mode.key)}>
                  <Text style={styles.helpButtonText}>?</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modeRow}>
                {groupedByMode[mode.key].map((deck) => renderCard(deck, mode.renderer))}
              </View>
            </View>
          ))}
        </ScrollView>

        <Modal visible={helpMode !== null} transparent animationType="fade" onRequestClose={() => setHelpMode(null)}>
          <TouchableOpacity style={styles.helpModalBackdrop} activeOpacity={1} onPress={() => setHelpMode(null)}>
            <View style={styles.helpModalCard}>
              <Text style={styles.helpModalTitle}>Comment ça marche ?</Text>
              {helpMode && <Text style={styles.helpModalText}>{helpTexts[helpMode]}</Text>}

              <TouchableOpacity style={styles.helpModalButton} onPress={() => setHelpMode(null)}>
                <Text style={styles.helpModalButtonText}>OK, j’ai capté</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={selectedDeck !== null} transparent animationType="fade" onRequestClose={() => setSelectedDeck(null)}>
          <TouchableOpacity style={styles.deckModalBackdrop} activeOpacity={1} onPress={() => setSelectedDeck(null)}>
            <View style={styles.deckModalCard}>
              {selectedDeck && (
                <>
                  <TouchableOpacity style={styles.deckModalCloseButton} onPress={() => setSelectedDeck(null)}>
                    <Text style={styles.deckModalCloseButtonText}>✕</Text>
                  </TouchableOpacity>

                  <Text style={styles.deckModalTitle}>{selectedDeck.name}</Text>

                  <View style={styles.deckModalImageWrapper}>
                    {currentModeDef &&
                      currentModeDef.renderer({
                        deckId: selectedDeck.id,
                        variant: "modal",
                      })}
                  </View>
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

  hypnoHud: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  hypnoHudText: {
    color: "#C2C6FF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  hypnoBattery: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#FEE54A",
    backgroundColor: "rgba(17, 19, 37, 0.85)",
  },
  hypnoCell: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  hypnoCellOn: {
    backgroundColor: "#FEE54A",
    borderColor: "#FFD600",
  },
  hypnoCellOff: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderColor: "rgba(255, 255, 255, 0.18)",
  },

  scroll: { flex: 1, marginTop: 8 },
  scrollContent: { paddingBottom: 32 },

  title: {
    fontFamily: "Bangers",
    fontSize: 32,
    color: "#FEE54A",
    textAlign: "center",
    letterSpacing: 1.5,
    textShadowColor: "#FF355E",
    textShadowRadius: 4,
  },
  subtitle: { marginTop: 4, textAlign: "center", color: "#C2C6FF", fontSize: 14 },

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
  tokensLabel: { color: "#FEE54A", fontSize: 13, fontWeight: "700" },
  tokensValue: { color: "#0AA5FF", fontSize: 14, fontWeight: "900" },
  tokensHint: { color: "#B0B3D6", fontSize: 11, marginTop: 2 },

  cardCanUnlock: {
    borderColor: "#FEE54A",
    shadowColor: "#FEE54A",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  testLabel: { color: "#FEE54A", fontWeight: "700", fontSize: 14 },
  testHint: { color: "#B0B3D6", fontSize: 11, marginTop: 2 },

  modeBlock: { marginTop: 24 },
  modeHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modeTitle: { fontFamily: "Bangers", fontSize: 22, color: "#0AA5FF", letterSpacing: 1 },
  modeSubtitle: { color: "#C2C6FF", fontSize: 12, marginTop: 4 },

  modeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap" },

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
  cardLocked: { opacity: 0.45, borderStyle: "dashed" },

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
  lockedQuestion: { fontSize: 46, fontWeight: "900", color: "#FEE54A" },

  cardName: { marginTop: 8, color: "#F5F5FF", fontSize: 13, fontWeight: "700", textAlign: "center" },
  cardSub: { marginTop: 2, color: "#8D91C7", fontSize: 11, textAlign: "center" },

  deckModalCloseButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  deckModalCloseButtonText: { color: "#FEE54A", fontSize: 18, fontWeight: "900" },

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
  helpButtonText: { color: "#FEE54A", fontWeight: "900", fontSize: 16 },

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
  helpModalText: { color: "#E5E7EB", fontSize: 14, textAlign: "center", marginBottom: 16 },
  helpModalButton: { alignSelf: "center", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: "#FEE54A" },
  helpModalButtonText: { color: "#111827", fontWeight: "700", fontSize: 13 },

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
  deckModalTitle: { fontFamily: "Bangers", fontSize: 26, color: "#FEE54A", textAlign: "center", marginBottom: 4, letterSpacing: 1 },
  deckModalImageWrapper: { alignItems: "center", justifyContent: "center", marginBottom: 18, marginTop: 8, minHeight: 360 },
});
