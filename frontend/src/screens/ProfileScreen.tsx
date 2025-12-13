// frontend/src/screens/ProfileScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import {
  bubbleAvatarImages,
  shapeAvatarImages,
  shapeShopAvatarImages,
} from "../../assets/avatars/avatarImages";
import { useIsFocused } from "@react-navigation/native";
import { useModalContext } from "@/context/ModalContext";
import { getProfile } from "../services/authService";
import { log } from "../utils/logger";
import BoWoXPBar from "../components/BoWoXPBar";

// 🎖 Catalogue client léger des badges (id → titre + emoji)
const BADGE_CLIENT_CATALOG: Record<string, { title: string; emoji: string }> = {
  badge_kickstart: { title: "Kickstart Rookie", emoji: "🛹" },
  badge_quick_thinker: { title: "Quick Thinker", emoji: "⚡" },
  badge_trick_machine: { title: "Trick Machine", emoji: "🤖" },
  badge_full_send: { title: "Full Send", emoji: "💥" },
  badge_commit_or_quit: { title: "Commit or Quit", emoji: "🎯" },
  badge_perfect_trick: { title: "Perfect Trick", emoji: "🌟" },
  badge_double_master: { title: "Double Master", emoji: "✌️" },
  badge_triple_threat: { title: "Triple Threat", emoji: "💣" },
  badge_perfectionist: { title: "The Perfectionist", emoji: "💎" },
  badge_streak_rider: { title: "Streak Rider", emoji: "🔥" },
  badge_streak_destroyer: { title: "Streak Destroyer", emoji: "🚀" },
  badge_streak_legend: { title: "Streak Legend", emoji: "🏆" },
  badge_quiz_master: { title: "Quiz Master", emoji: "📚" },
  badge_xp_hunter: { title: "XP Hunter", emoji: "💰" },
  badge_park_explorer: { title: "Park Explorer", emoji: "🗺️" },
  badge_park_dominator: { title: "Park Dominator", emoji: "👑" },
  badge_avatar_collector: { title: "Avatar Collector", emoji: "🧩" },
  badge_ultimate_collector: { title: "Ultimate Collector", emoji: "🌈" },
  badge_early_bird: { title: "Early Bird Session", emoji: "🌅" },
  badge_midnight_session: { title: "Midnight Session", emoji: "🌙" },
};

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showModal } = useModalContext();
  const isFocused = useIsFocused();

  const logoFlip = require("../../assets/logos/flip-coin2_logo.png");
  const logoMagic = require("../../assets/logos/magic-ball_logo.png");
  const logoFortune = require("../../assets/logos/fortune2_logo.png");
  const logoCasino = require("../../assets/logos/casino_logo.png");

  // Animation pour le gros sticker (float + tilt)
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  // 🔄 NOUVELLE ANIM DE SPIN POUR LE TAP SUR L'AVATAR
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);
  const [showLevelOnAvatar, setShowLevelOnAvatar] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const translateY = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const idleRotate = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-3deg", "3deg", "-3deg"],
  });

  // 🔁 INTERPOLATION POUR LE SPIN "COOL" (3 tours complets)
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "1080deg"], // 3 x 360°
  });

  /* -------------------------------------------------------- */
  /*   🔵 FONCTION DE CHARGEMENT DU PROFIL                    */
  /* -------------------------------------------------------- */
  const loadProfile = useCallback(async () => {
    try {
      const data = await getProfile(); // UserProgressDto direct
      setProfile(data);
      log("Profile refreshed OK", data);
    } catch (err) {
      log("ProfileScreen error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (isFocused) {
      loadProfile();
    }
  }, [isFocused, loadProfile]);

  if (loading || !profile) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  /* -------------------------------------------------------- */
  /*  📊 MAPPING PROPS BACKEND → UI                           */
  /* -------------------------------------------------------- */
  const xp: number = profile?.xp ?? 0;
  const level: number = profile?.level ?? 1;
  const levelTitleFromDto: string = profile?.levelTitle ?? "";
  const levelEmoji: string = profile?.levelEmoji ?? "";

  const currentLevelMinXP: number = profile?.currentLevelMinXP ?? 0;
  const nextLevelMinXP: number =
    profile?.nextLevelMinXP ?? currentLevelMinXP + 100;

  const xpInLevel = Math.max(0, xp - currentLevelMinXP);
  const xpInterval = Math.max(1, nextLevelMinXP - currentLevelMinXP);
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpInterval) * 100));

  const totalUnlocked: number =
    profile?.totalUnlocked ?? profile?.unlockedTricks?.length ?? 0;

  // 🆕 BADGES + DECKS
  const unlockedDecks: string[] = profile?.unlockedDecks ?? [];
  const unlockedBadges: string[] = profile?.unlockedBadges ?? [];

  const totalTricksAvailable: number = profile?.totalTricksAvailable ?? 0;
  const completionPercent: number = profile?.completionPercent ?? 0;

  const dailyStreak: number = profile?.dailyStreak ?? 0;

  const bubbleAvatarId: string | undefined =
    profile?.bubbleAvatarId ?? undefined;

  // ⚠️ shapeAvatarId peut être soit un shape "XP", soit un shape "SHOP"
  const shapeAvatarId: string | undefined =
    profile?.shapeAvatarId ?? undefined;

  const bubbleAvatarSource =
    bubbleAvatarId ? bubbleAvatarImages[bubbleAvatarId] : null;

  const shapeAvatarSource =
    shapeAvatarId
      ? (shapeAvatarImages as any)[shapeAvatarId] ??
        (shapeShopAvatarImages as any)[shapeAvatarId] ??
        null
      : null;

  const getFallbackLevelTitle = () => {
    if (level >= 5) return "Skate Legend";
    if (level === 4) return "Urban Shredder";
    if (level === 3) return "Street Soldier";
    if (level === 2) return "Pop Master";
    if (level === 1) return "Street Rat";
    return "Rookie";
  };

  const baseTitle =
    levelTitleFromDto && levelTitleFromDto.length > 0
      ? levelTitleFromDto
      : getFallbackLevelTitle();

  const levelTitle = `${levelEmoji ? levelEmoji + " " : ""}${baseTitle}`.trim();

  const getMotivation = () => {
    if (xpPercent >= 90) return "🔥 Tu touches le prochain niveau !";
    if (xpPercent >= 50) return "⚡ Beau flow, continue comme ça !";
    if (totalUnlocked >= 10) return "🛹 Tu commences à avoir un vrai style !";
    if (totalUnlocked >= 5) return "💥 Tu montes en puissance, keep pushing !";
    return "🌟 Chaque trick débloqué fait de toi un meilleur rider !";
  };

  const motivation = getMotivation();

  /* -------------------------------------------------------- */
  /*  🔓 LOGIQUE MINI-JEUX                                    */
  /* -------------------------------------------------------- */
  const canUnlockMiniGames = totalUnlocked >= 2;
  const unlockedMiniGames: string[] = profile.unlockedMiniGames || [];

  const MINI_GAMES = [
    {
      name: "Flip Coin",
      key: "coin-flip",
      screen: "KillerTimeCoinFlip",
      logo: logoFlip,
    },
    {
      name: "Magic 8-Ball",
      key: "magic-8ball",
      screen: "Magic8Ball",
      logo: logoMagic,
    },
    {
      name: "Fortune Cookie",
      key: "fortune-cookie",
      screen: "FortuneCookie",
      logo: logoFortune,
    },
    {
      name: "Casino Trick Slot",
      key: "casino-slot",
      screen: "CasinoTrickSlot",
      logo: logoCasino,
    },
  ];

  const onPressMiniGame = (game) => {
    const isUnlocked = unlockedMiniGames.includes(game.key);

    if (isUnlocked) {
      navigation.navigate(game.screen);
      return;
    }

    if (!canUnlockMiniGames) {
      showModal({
        title: "Mini-jeu verrouillé",
        message: "Débloque 2 tricks pour jouer à ce mini-jeu !",
        type: "warning",
        confirmText: "OK",
      });
      return;
    }

    navigation.navigate("MiniGameUnlockChoice", { selected: game.key });
  };

  // 🌀 TAP SUR LE GROS AVATAR : SPIN + AFFICHAGE NIVEAU
  const onPressBigAvatar = () => {
    if (isSpinning) return; // évite le spam

    setIsSpinning(true);
    setShowLevelOnAvatar(true);
    spinAnim.setValue(0);

    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setShowLevelOnAvatar(false);
    });
  };

  /* -------------------------------------------------------- */
  /*  🎨 RENDER                                               */
  /* -------------------------------------------------------- */
  return (
    <View style={styles.container}>
      <ScreenWrapper>
        <Text style={styles.title}>My Board, My World</Text>

        {/* PROFILE CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>Niveau</Text>
          {level > 0 && <Text style={styles.value}>{level}</Text>}
          <Text style={styles.levelTitle}>{levelTitle}</Text>

          {/* Mini avatars côte à côte */}
          {(bubbleAvatarSource || shapeAvatarSource) && (
            <View style={styles.avatarsRow}>
              {bubbleAvatarSource && (
                <Image
                  source={bubbleAvatarSource}
                  style={styles.avatarBubbleMini}
                  resizeMode="contain"
                />
              )}
              {shapeAvatarSource && (
                <Image
                  source={shapeAvatarSource}
                  style={styles.avatarShapeMini}
                  resizeMode="contain"
                />
              )}
            </View>
          )}

          {/* XP globale → bar basée sur le niveau courant */}
          <BoWoXPBar currentXp={xpInLevel} nextLevelXp={xpInterval} />
          <Text style={styles.xpDetail}>
            {xpInLevel}/{xpInterval} XP dans ce niveau ({xpPercent}%)
          </Text>

          {/* Daily Streak */}
          <Text style={styles.label}>BoWo Daily Streak</Text>
          <Text style={styles.streakValue}>{dailyStreak} 🔥</Text>

          {/* Tricks / complétion */}
          <Text style={styles.label}>Tricks débloqués</Text>
          <Text style={styles.value}>
            {totalUnlocked}/{totalTricksAvailable}
          </Text>

          <Text style={styles.label}>Progression globale</Text>
          <Text style={styles.value}>{completionPercent}%</Text>

          <Text style={styles.motivation}>{motivation}</Text>
        </View>

        {/* 🎖 BADGES DÉBLOQUÉS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Badges débloqués</Text>

          {unlockedBadges.length === 0 ? (
            <Text style={styles.sectionEmpty}>
              Aucun badge pour l&apos;instant... continue à shredder le park !
            </Text>
          ) : (
            <View style={styles.badgeList}>
              {unlockedBadges.map((id) => {
                const meta = BADGE_CLIENT_CATALOG[id] ?? {
                  title: id,
                  emoji: "🏅",
                };
                return (
                  <View key={id} style={styles.badgePill}>
                    <Text style={styles.badgeEmoji}>{meta.emoji}</Text>
                    <Text style={styles.badgeText}>{meta.title}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 🧩 AVATAR SHAPE SHOP */}
        <View style={[styles.sectionCard, styles.sectionAvatarShopCard]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Avatar Shape Shop</Text>
            <View style={[styles.sectionChip, styles.sectionChipGold]}>
              <Text style={[styles.sectionChipText, styles.sectionChipTextGold]}>
                0,19€
              </Text>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>
            Archetype • Mascot • Emotion
          </Text>

          <TouchableOpacity
            style={[styles.sectionButton, styles.sectionButtonGold]}
            onPress={() => navigation.navigate("Collection")}
          >
            <Text style={[styles.sectionButtonText, styles.sectionButtonTextGold]}>
              COLLECTIONS
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🎴 COLLECTION DE DECKS */}
        <View style={[styles.sectionCard, styles.sectionDecksCard]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Collection de decks</Text>
            <View style={styles.sectionChip}>
              <Text style={styles.sectionChipText}>
                {Array.from(new Set(unlockedDecks)).length}/20
              </Text>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>
            Masterise des tricks pour débloquer des decks exclusifs.
          </Text>

          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() =>
              navigation.navigate("DeckCollection", {
                unlockedDecks: Array.from(new Set(unlockedDecks)),
              })
            }
          >
            <Text style={styles.sectionButtonText}>VOIR LA COLLECTION</Text>
          </TouchableOpacity>
        </View>

        {/* 🔥 TIME-KILLER ZONE */}
        <Text style={styles.killZoneTitle}>TIME-KILLER ZONE</Text>

        <View style={styles.grid}>
          {MINI_GAMES.map((g) => {
            const isUnlocked = unlockedMiniGames.includes(g.key);

            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.gameBtn, !isUnlocked && styles.gameLocked]}
                onPress={() => onPressMiniGame(g)}
              >
                <Image
                  source={g.logo}
                  style={styles.gameLogo}
                  resizeMode="contain"
                />
                <Text style={styles.gameName}>{g.name}</Text>

                <Text style={styles.gameInfo}>
                  {isUnlocked
                    ? "Débloqué ✔"
                    : !canUnlockMiniGames
                    ? "Débloqué après 2 tricks !"
                    : "Choisis ce mini-jeu à débloquer"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🔙 BACK TO PARK */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backBtnText}> Back to Park</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("LegalMenu")}
          style={styles.legalBtn}
        >
          <Text style={styles.legalText}>Informations légales</Text>
        </TouchableOpacity>

        {/* GROS STICKER ANIMÉ CLIQUABLE + SPIN & NIVEAU */}
        {shapeAvatarSource && (
          <TouchableOpacity
            style={styles.bigShapeContainer}
            onPress={onPressBigAvatar}
            activeOpacity={0.9}
          >
            <Animated.Image
              source={shapeAvatarSource}
              style={[
                styles.avatarShapeBig,
                {
                  transform: [
                    { scale },
                    { translateY },
                    { rotate: isSpinning ? spin : idleRotate },
                  ],
                },
              ]}
              resizeMode="contain"
            />

            {showLevelOnAvatar && (
              <View style={styles.avatarLevelBadge}>
                <Text style={styles.avatarLevelBadgeText}>LEVEL {level}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScreenWrapper>
    </View>
  );
}

/* -------------------------------------------------------- */
/*              🎨 SANTA CRUZ STYLES                         */
/* -------------------------------------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3a1a6b", padding: 20 },

  title: {
    fontFamily: "Bangers",
    fontSize: 40,
    color: "#0AA5FF",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 30,
    textShadowColor: "#FF355E",
    textShadowRadius: 4,
  },

  card: {
    backgroundColor: "#1A1B20",
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFD600",
    marginBottom: 24,
  },
  label: {
    color: "#FFD600",
    fontSize: 14,
    marginTop: 12,
    opacity: 0.8,
  },
  value: {
    color: "#0AA5FF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
    textShadowColor: "#FF355E",
    textShadowRadius: 4,
  },
  levelTitle: {
    color: "#FFD600",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 8,
  },
  xpDetail: {
    marginTop: 4,
    color: "#EDECF8",
    fontSize: 12,
  },
  streakValue: {
    marginTop: 4,
    color: "#FFD600",
    fontSize: 20,
    fontWeight: "900",
  },
  motivation: {
    marginTop: 14,
    color: "#EDECF8",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  avatarDebug: {
    marginTop: 8,
    color: "#B0B0B0",
    fontSize: 12,
  },

  // --- Sections Badges / Decks / Shop ---
  sectionCard: {
    marginTop: 18,
    marginBottom: 8,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "#020617",
    borderWidth: 2,
    borderColor: "#F97316",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionDecksCard: {
    borderColor: "#0AA5FF",
  },
  sectionAvatarShopCard: {
    borderColor: "#FFD600",
  },
  sectionTitle: {
    fontFamily: "Bangers",
    fontSize: 22,
    color: "#FFD600",
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: "#E5E7EB",
    fontSize: 13,
    marginBottom: 10,
  },
  sectionEmpty: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#0AA5FF",
  },
  sectionChipGold: {
    borderColor: "#FFD600",
  },
  sectionChipText: {
    color: "#0AA5FF",
    fontWeight: "800",
    fontSize: 12,
  },
  sectionChipTextGold: {
    color: "#FFD600",
  },

  // --- Badges list ---
  badgeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#F97316",
  },
  badgeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    color: "#F9FAFB",
    fontSize: 12,
    fontWeight: "700",
  },

  // --- Boutons sections ---
  sectionButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0AA5FF",
    backgroundColor: "#020617",
  },
  sectionButtonGold: {
    borderColor: "#FFD600",
  },
  sectionButtonText: {
    fontFamily: "Bangers",
    fontSize: 22,
    color: "#0AA5FF",
    letterSpacing: 1,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionButtonTextGold: {
    color: "#FFD600",
  },

  // Row pour les mini avatars
  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },
  avatarBubbleMini: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
  },
  avatarShapeMini: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },

  // ⬇️⬇️ CSS MODIFIÉ POUR LE GROS AVATAR CLIQUABLE + OMBRE
  bigShapeContainer: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12, // zone cliquable un peu plus grande
  },
  avatarShapeBig: {
    width: "92%",
    height: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },

  // ⬇️⬇️ NOUVEAU BADGE NIVEAU AFFICHÉ PENDANT LE SPIN
  avatarLevelBadge: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "#FFD600",
  },
  avatarLevelBadgeText: {
    fontFamily: "Bangers",
    color: "#FFD600",
    fontSize: 18,
    letterSpacing: 1,
  },

  /* TIME-KILLER */
  killZoneTitle: {
    color: "#0AA5FF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gameBtn: {
    width: "48%",
    backgroundColor: "#0AA5FF",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFD600",
    marginBottom: 16,
  },
  gameLocked: {
    backgroundColor: "#555",
    opacity: 0.6,
  },
  gameName: {
    color: "#111",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
  gameInfo: {
    color: "#111",
    textAlign: "center",
    marginTop: 4,
    fontSize: 13,
  },
  gameLogo: {
    width: 70,
    height: 70,
    alignSelf: "center",
    marginBottom: 8,
  },

  // BACK BUTTON
  backBtn: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD600",
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

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111215",
  },
  loadingText: {
    marginTop: 10,
    color: "#FFD600",
    fontSize: 14,
  },

  /* LEGAL BUTTON */
  legalBtn: {
    marginTop: 6,
    marginBottom: 20,
    paddingVertical: 10,
    alignSelf: "center",
  },

  legalText: {
    color: "#0AA5FF",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
    fontWeight: "800",
  },
});
