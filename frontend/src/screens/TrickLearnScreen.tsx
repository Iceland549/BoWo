// frontend/src/screens/TrickLearnScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useGlobalProgress } from "../context/GlobalProgressContext";
import ScreenWrapper from "../components/ScreenWrapper";
import api from "../api/api";
import { log } from "../utils/logger";
import { MEDIA_BASE_URL } from "../config/env";
import useModal from "../hooks/useModal";

// === AJOUTS DUOLINGO-LIKE ===
import { useProgress } from "../context/ProgressContext";
import { useQuestion } from "../hooks/useQuestion";
import { useModalContext } from "../context/ModalContext";
import BoWoXPBar from "../components/BoWoXPBar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------
type TrickLearn = {
  id: string;
  name: string;
  description?: string;
  steps: string[];
  images: string[];
  amateurVideoUrl?: string | null;
  proVideoUrl?: string | null;
  proTip?: string[];
  commonMistake?: string[];
  funFact?: string;
};

type TrickVideoCardProps = {
  label: string;
  url: string;
  variant: "pro" | "amateur";
};

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------
/**
 * Nettoie / normalise une URL renvoyée par l'API
 */
const resolveMediaUrl = (raw?: string | null): string | null => {
  if (!raw) return null;

  // déjà une URL absolue
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // chemin commençant par /
  if (raw.startsWith("/")) return `${MEDIA_BASE_URL}${raw}`;

  // défaut → concat
  return `${MEDIA_BASE_URL}/${raw}`;
};

// ---------------------------------------------------------
// Components internes
// ---------------------------------------------------------
/**
 * Carte vidéo stylée BoWo (Santa Cruz-like)
 * Source : expo-av officiels
 * https://docs.expo.dev/versions/latest/sdk/av/
 */
const TrickVideoCard: React.FC<TrickVideoCardProps> = ({ label, url, variant }) => {
  const isPro = variant === "pro";

  return (
    <View style={[styles.videoCard, isPro ? styles.videoBlue : styles.videoYellow]}>
      <View style={styles.videoHeaderRow}>
        <Text style={styles.videoLabel}>{label}</Text>
        <Text style={styles.videoPill}>{isPro ? "PRO" : "IRL"}</Text>
      </View>

      <Video
        source={{ uri: url }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls
        isLooping
      />
    </View>
  );
};

// ---------------------------------------------------------
// ECRAN PRINCIPAL
// ---------------------------------------------------------
export default function TrickLearnScreen({ route, navigation }: any) {
  const { trickId } = route.params;
  const [trick, setTrick] = useState<TrickLearn | null>(null);
  const [loading, setLoading] = useState(true);
  const { showModal } = useModal();

  // === PROGRESSION / QUESTIONS (Duolingo-like) ===
  const { progress } = useProgress();
  const { refreshProgress } = useGlobalProgress();
  const { openQuestionModal, showLevelUp } = useModalContext();
  const { loadQuestion, submit } = useQuestion(trickId);

  // Niveau / XP actuel du trick
  const current = progress[trickId] ?? { level: 0, totalXp: 0 };

  // === FULLSCREEN VIEWER ===
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const fullscreenOpacity = useRef(new Animated.Value(0)).current;

  // ---------------------------------------------------------
  // useEffect : FETCH DATA
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        console.log("[UI] TrickLearnScreen.fetch", trickId);
        log("TrickLearnScreen.fetch", trickId);
        const { data } = await api.get(`/content/tricks/${trickId}/learn`);
        console.log("🔍 TRICK FROM API →", JSON.stringify(data, null, 2));
        setTrick(data);
      } catch (err) {
        log("TrickLearnScreen.error", err);
        showModal({
          type: "error",
          title: "Erreur",
          message: "Impossible de charger ce trick.",
          confirmText: "OK",
        });
      } finally {
        setLoading(false);
      }
    })();

    // ❗ Justification :
    // showModal est un hook custom → dépendance instable → boucle infinie si ajouté.
    // Source : react.dev exhaustive-deps
    // https://react.dev/learn/synchronizing-with-effects#troubleshooting-useeffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trickId]);

  // ---------------------------------------------------------
  // Duolingo-like : Ouvrir une question
  // ---------------------------------------------------------
  const askQuestion = async () => {
    const res = await loadQuestion();
    if (!res?.question) return;

    openQuestionModal({
      trickId,
      question: res.question,
      onAnswer: async (selected: string) => {
        const result = await submit(res.question.level, selected);
        await refreshProgress(); // 🔥 synchronise la XP globale

        if (result.correct && result.newLevel > current.level) {
          showLevelUp({
            trickId,
            newLevel: result.newLevel,
            xpGained: result.xpGained,
          });
        }
        return result.correct;
      },
    });
  };

  // ---------------------------------------------------------
  // Fullscreen helpers
  // ---------------------------------------------------------
  const openFullscreen = (startIndex: number) => {
    if (!trick?.images?.length) return;
    setFullscreenIndex(startIndex);
    setFullscreenVisible(true);
    fullscreenOpacity.setValue(0);
    Animated.timing(fullscreenOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeFullscreen = () => {
    Animated.timing(fullscreenOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setFullscreenVisible(false);
    });
  };

  // ---------------------------------------------------------
  // ÉTAT : LOADING
  // ---------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // ---------------------------------------------------------
  // ÉTAT : AUCUN TRICK
  // ---------------------------------------------------------
  if (!trick) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Aucun contenu trouvé.</Text>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("Main", { screen: "Home" })}
        >
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------------------------------------------------
  // Données finalisées
  // ---------------------------------------------------------
  const mainImage =
    (trick.images?.[0] ? resolveMediaUrl(trick.images[0]) : null) ??
    require("../../assets/logos/bowo3_logo.png");

  const proVideo = resolveMediaUrl(trick.proVideoUrl || undefined);
  const amateurVideo = resolveMediaUrl(trick.amateurVideoUrl || undefined);
  const hasAnyVideo = !!proVideo || !!amateurVideo;

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenWrapper>
        {/* ------------------------------------------------- */}
        {/* FULLSCREEN VIEWER OVERLAY */}
        {/* ------------------------------------------------- */}
        {fullscreenVisible && (
          <Animated.View
            style={[
              styles.fullscreenContainer,
              { opacity: fullscreenOpacity },
            ]}
          >
            <FlatList
              data={trick.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={fullscreenIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => {
                const url = resolveMediaUrl(item);
                if (!url) return null;

                return (
                  <View style={styles.fullscreenWrapper}>
                    <ScrollView
                      style={{ flex: 1 }}
                      maximumZoomScale={3}
                      minimumZoomScale={1}
                      contentContainerStyle={styles.fullscreenZoomContainer}
                      centerContent
                    >
                      <Image
                        source={{ uri: url }}
                        style={styles.fullscreenImage}
                        resizeMode="contain"
                      />
                    </ScrollView>
                  </View>
                );
              }}
            />

            {/* Close button */}
            <TouchableOpacity
              style={styles.fullscreenClose}
              onPress={closeFullscreen}
            >
              <Text style={styles.fullscreenCloseText}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ------------------------------------------------- */}
        {/* HERO */}
        {/* ------------------------------------------------- */}
        <View style={styles.heroWrapper}>
          {typeof mainImage === "number" ? (
            <Image source={mainImage} style={styles.heroImage} />
          ) : (
            <Image source={{ uri: mainImage }} style={styles.heroImage} />
          )}

          <View style={styles.heroOverlay} />

          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTag}>TRICK UNLOCKED</Text>
            <Text style={styles.heroTitle}>{trick.name}</Text>
          </View>
        </View>

        {/* ------------------------------------------------- */}
        {/* XP BAR (PROGRESSION TRICK) */}
        {/* ------------------------------------------------- */}
        <View style={{ marginBottom: 12 }}>
          <BoWoXPBar currentXp={current.totalXp} nextLevelXp={80} />
        </View>

        {/* ------------------------------------------------- */}
        {/* DESCRIPTION */}
        {/* ------------------------------------------------- */}
        {trick.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pourquoi ce trick déchire 💥</Text>
            <Text style={styles.description}>{trick.description}</Text>
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* VIDEOS */}
        {/* ------------------------------------------------- */}
        {hasAnyVideo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Clips 🎬</Text>

            {proVideo && (
              <TrickVideoCard label="Pro Clip" url={proVideo} variant="pro" />
            )}

            {amateurVideo && (
              <TrickVideoCard
                label="Real Life Clip"
                url={amateurVideo}
                variant="amateur"
              />
            )}
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* IMAGES (CLIC → FULLSCREEN) */}
        {/* ------------------------------------------------- */}
        {trick.images?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visual Steps 🌀</Text>

            <FlatList
              data={trick.images}
              horizontal
              keyExtractor={(u, i) => `${u}-${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesList}
              renderItem={({ item, index }) => {
                const url = resolveMediaUrl(item);
                if (!url) return null;
                return (
                  <TouchableOpacity
                    onPress={() => openFullscreen(index)}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: url }} style={styles.stepImage} />
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* STEPS */}
        {/* ------------------------------------------------- */}
        {trick.steps?.length > 0 && (
          <View style={styles.stepsBox}>
            <Text style={styles.sectionTitle}>Step-by-step 🔥</Text>

            {trick.steps.map((s, i) => {
              const colors = ["#0AA5FF", "#FFD600", "#FF355E"];
              const bg = colors[i % 3];

              return (
                <View style={styles.stepRow} key={i}>
                  <View style={[styles.stepIndex, { backgroundColor: bg }]}>
                    <Text style={styles.stepIndexText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 🔥 PRO TIP */}
        {trick.proTip?.length > 0 && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>🔥 PRO TIP</Text>

            {Array.isArray(trick.proTip) &&
              trick.proTip.map((line, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
          </View>
        )}

        {/* ⚠️ COMMON MISTAKE */}
        {trick.commonMistake?.length > 0 && (
          <View style={styles.mistakeBox}>
            <Text style={styles.mistakeTitle}>⚠️ ERREUR COURANTE</Text>

            {Array.isArray(trick.commonMistake) &&
              trick.commonMistake.map((line, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={[styles.bullet, { color: "#FF355E" }]}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
          </View>
        )}

        {/* 🎉 FUN FACT */}
        {trick.funFact && (
          <View style={styles.funFactBox}>
            <Text style={styles.funFactTitle}>🎉 FUN FACT</Text>

            <View style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: "#FFA500" }]}>•</Text>
              <Text style={styles.bulletText}>{trick.funFact}</Text>
            </View>
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* DUOLINGO-LIKE : Répondre à une question */}
        {/* ------------------------------------------------- */}
        <TouchableOpacity
          style={{
            marginTop: 10,
            marginBottom: 4,
            backgroundColor: "#0AA5FF",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
          }}
          onPress={askQuestion}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
            Répondre à une question
          </Text>
        </TouchableOpacity>

        {/* ------------------------------------------------- */}
        {/* RETURN */}
        {/* ------------------------------------------------- */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("Main", { screen: "Home" })}
        >
          <Text style={styles.backBtnText}>← Back to Park</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    </ScrollView>
  );
}

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },
  content: {
    paddingBottom: 32,
  },

  // HERO
  heroWrapper: {
    position: "relative",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: 260,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050816CC",
  },
  heroTextWrap: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  heroTag: {
    color: "#FFD600",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  heroTitle: {
    color: "#F9FAFB",
    fontSize: 28,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 4,
  },

  // SECTION
  section: {
    marginVertical: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  sectionTitle: {
    color: "#FFD600",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  description: {
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
  },

  // STEPSBOX
  stepsBox: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#111827",
    borderWidth: 2,
    borderColor: "#FFD600",
    shadowColor: "#FFD600",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  // VIDEOS
  videoCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 16,
  },
  videoBlue: {
    backgroundColor: "#0B1120",
    borderWidth: 1,
    borderColor: "#0AA5FF",
  },
  videoYellow: {
    backgroundColor: "#451A03",
    borderWidth: 1,
    borderColor: "#FFD600",
  },
  videoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  videoLabel: {
    color: "#F9FAFB",
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
  },
  videoPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#F9FAFB",
    color: "#F9FAFB",
    fontSize: 10,
    fontWeight: "700",
  },
  video: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
  },

  // IMAGES
  imagesList: {
    paddingVertical: 4,
  },
  stepImage: {
    width: 220,
    height: 140,
    borderRadius: 16,
    marginRight: 10,
  },

  // STEPS
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  stepIndexText: {
    color: "#050816",
    fontWeight: "900",
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 14,
    lineHeight: 20,
  },

  /* --- PRO TIP BOX --- */
  tipBox: {
    backgroundColor: "#1A1B20",
    borderWidth: 2,
    borderColor: "#0AA5FF",
    borderRadius: 14,
    padding: 14,
    marginTop: 22,
  },
  tipTitle: {
    color: "#0AA5FF",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    color: "#0AA5FF",
    fontSize: 22,
    marginRight: 8,
    marginTop: -3,
  },
  bulletText: {
    flex: 1,
    color: "#EDECF8",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },

  /* --- COMMON MISTAKE BOX --- */
  mistakeBox: {
    backgroundColor: "#1A1B20",
    borderWidth: 2,
    borderColor: "#FF355E",
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
  },
  mistakeTitle: {
    color: "#FF355E",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    backgroundColor: "#050816",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: "#E5E7EB",
    fontSize: 14,
  },

    // BOUTON RÉPONDRE À UNE QUESTION
  answerBtn: {
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: "#0AA5FF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD600", // outline jaune Santa Cruz
  },

  answerBtnText: {
    fontFamily: "Bangers",
    color: "#FFFFFF",
    fontSize: 24,
    letterSpacing: 1,
    textShadowColor: "#FFD600",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,       // très léger → NET
  }, 

  // BACK BUTTON
  backBtn: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD600",     // jaune neon
    backgroundColor: "#020617",
  },

  backBtnText: {
    fontFamily: "Bangers",
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "#FFD600",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  funFactBox: {
    marginVertical: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#2C1A05",        // brun foncé chaud pour ambiance dorée
    borderWidth: 2,
    borderColor: "#FFA500",            // orange doré
    shadowColor: "#FFB020",            // halo doré
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },

  funFactTitle: {
    color: "#FFA500",
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 8,
    textShadowColor: "#FFCE70",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  // FULLSCREEN VIEWER
  fullscreenContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(5,8,22,0.96)", // fond sombre type blur
    zIndex: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenZoomContainer: {
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  fullscreenClose: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  fullscreenCloseText: {
    fontSize: 24,
    color: "#FFF",
    fontWeight: "900",
  },
});
