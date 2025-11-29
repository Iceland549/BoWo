// frontend/src/screens/TrickLearnScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
  proTip?: string;
  commonMistake?: string;
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

  // ---------------------------------------------------------
  // useEffect : FETCH DATA
  // ---------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        console.log("[UI] TrickLearnScreen.fetch", trickId);   // ← AJOUT IMPORTANT
        log("TrickLearnScreen.fetch", trickId);
        const { data } = await api.get(`/content/tricks/${trickId}/learn`);
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
        await refreshProgress();  // 🔥 synchronise la XP globale


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
    require("../../assets/logos/bowo2_logo.png");

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
        <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
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
        {/* IMAGES */}
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
              renderItem={({ item }) => {
                const url = resolveMediaUrl(item);
                if (!url) return null;
                return <Image source={{ uri: url }} style={styles.stepImage} />;
              }}
            />
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* STEPS */}
        {/* ------------------------------------------------- */}
        {trick.steps?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step-by-step 🔥</Text>

            {trick.steps.map((s, i) => {
              const colors = ["#0AA5FF", "#FFD600", "#FF355E"];
              const bg = colors[i % 3];

              return (
                <View style={styles.stepRow} key={i}>
                  <View style={[styles.stepIndex, { backgroundColor: bg }]} >
                    <Text style={styles.stepIndexText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{s}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* PRO TIP */}
        {/* ------------------------------------------------- */}
        {trick.proTip && (
          <View style={[styles.section, styles.proTip]}>
            <Text style={styles.sectionTitle}>💡 Pro Tip</Text>
            <Text style={styles.proTipText}>{trick.proTip}</Text>
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* COMMON MISTAKE */}
        {/* ------------------------------------------------- */}
        {trick.commonMistake && (
          <View style={[styles.section, styles.mistake]}>
            <Text style={styles.sectionTitle}>⚠️ Erreurs fréquentes</Text>
            <Text style={styles.mistakeText}>{trick.commonMistake}</Text>
          </View>
        )}

        {/* ------------------------------------------------- */}
        {/* DUOLINGO-LIKE : Répondre à une question */}
        {/* ------------------------------------------------- */}
        <TouchableOpacity
          style={{
            marginHorizontal: 16,
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
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  sectionTitle: {
    color: "#0AA5FF",
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

  // PRO TIP
  proTip: {
    backgroundColor: "#022C22",
    borderColor: "#22C55E",
  },
  proTipText: {
    color: "#BBF7D0",
  },

  // MISTAKES
  mistake: {
    backgroundColor: "#450A0A",
    borderColor: "#F97373",
  },
  mistakeText: {
    color: "#FECACA",
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

  // BACK BUTTON
  backBtn: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B82F6",
    backgroundColor: "#020617",
  },
  backBtnText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
  },
});

