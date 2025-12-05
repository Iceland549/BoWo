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
} from "../../assets/avatars/avatarImages";
import { useIsFocused } from "@react-navigation/native";
import { useModalContext } from "@/context/ModalContext";
import { getProfile } from "../services/authService";
import { log } from "../utils/logger";
import BoWoXPBar from "../components/BoWoXPBar";

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

  const rotate = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-3deg", "3deg", "-3deg"],
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

  const totalTricksAvailable: number = profile?.totalTricksAvailable ?? 0;
  const completionPercent: number = profile?.completionPercent ?? 0;

  const dailyStreak: number = profile?.dailyStreak ?? 0;

  const bubbleAvatarId: string | undefined =
    profile?.bubbleAvatarId ?? undefined;
  const shapeAvatarId: string | undefined =
    profile?.shapeAvatarId ?? undefined;

  const bubbleAvatarSource =
    bubbleAvatarId ? bubbleAvatarImages[bubbleAvatarId] : null;
  const shapeAvatarSource =
    shapeAvatarId ? shapeAvatarImages[shapeAvatarId] : null;

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
    if (totalUnlocked >= 10)
      return "🛹 Tu commences à avoir un vrai style !";
    if (totalUnlocked >= 5)
      return "💥 Tu montes en puissance, keep pushing !";
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

  /* -------------------------------------------------------- */
  /*  🎨 RENDER                                                */
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

          {bubbleAvatarId && (
            <Text style={styles.avatarDebug}>
              Bubble avatar : {bubbleAvatarId}
            </Text>
          )}
          {shapeAvatarId && (
            <Text style={styles.avatarDebug}>
              Shape avatar : {shapeAvatarId}
            </Text>
          )}
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

        {/* GROS STICKER ANIMÉ (sans cercle bizarre) */}
        {shapeAvatarSource && (
          <View style={styles.bigShapeContainer}>
            <Animated.Image
              source={shapeAvatarSource}
              style={[
                styles.avatarShapeBig,
                {
                  transform: [{ scale }, { translateY }, { rotate }],
                },
              ]}
              resizeMode="contain"
            />
          </View>
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
    marginBottom: 40,
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

  bigShapeContainer: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarShapeBig: {
    width: "92%",
    height: 280,
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
