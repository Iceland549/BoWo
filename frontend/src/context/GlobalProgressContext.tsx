// src/context/GlobalProgressContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import { getProfile } from "../services/authService";
import { log } from "../utils/logger";
import { useModalContext } from "./ModalContext";

type QuizAttemptsMap = Record<string, number>;

// Aligné sur ContentMicroservice.Application.DTOs.UserProgressDto
export interface GlobalProgress {
  userId: string;
  unlockedTricks: string[];
  lastUnlockDateUtc: string | null;
  tricksUnlockedToday: number;
  quizAttempts: QuizAttemptsMap;
  totalUnlocked: number;

  // --- SYSTÈME XP / NIVEAU ---
  xp: number;
  level: number;
  levelTitle: string;
  levelEmoji: string;
  currentLevelMinXP: number;
  nextLevelMinXP: number;
  xpToNextLevel: number;
  maxDefinedLevel: number;
  isMaxLevel: boolean;

  // --- COMPLÉTION / CATALOGUE ---
  totalTricksAvailable: number;
  completionPercent: number;

  // --- MINI-JEUX ---
  unlockedMiniGames: string[];

  // --- DAILY STREAK ---
  dailyStreak: number;

  // --- AVATARS ---
  bubbleAvatarId: string | null;
  shapeAvatarId: string | null;
  availableBubbleAvatarIds: string[];
  availableShapeAvatarIds: string[];
}

interface GlobalProgressContextValue {
  progress: GlobalProgress | null;
  loading: boolean;
  error: string | null;
  refreshProgress: () => Promise<void>;

  // helpers dérivés pour la barre d’XP
  xpPercent: number;       // 0–100% dans le niveau courant
  currentLevelMinXP: number;
  nextLevelMinXP: number;
}

const GlobalProgressContext =
  createContext<GlobalProgressContextValue | undefined>(undefined);

// --------- Normalisation DTO → GlobalProgress (robuste au casing) ---------
function normalizeProfile(raw: any | null | undefined): GlobalProgress | null {
  if (!raw) return null;

  const userId = raw.userId ?? raw.UserId ?? "";
  const unlockedTricks = raw.unlockedTricks ?? raw.UnlockedTricks ?? [];
  const lastUnlockDateUtc =
    raw.lastUnlockDateUtc ?? raw.LastUnlockDateUtc ?? null;
  const tricksUnlockedToday =
    raw.tricksUnlockedToday ?? raw.TricksUnlockedToday ?? 0;
  const quizAttempts =
    raw.quizAttempts ?? raw.QuizAttempts ?? ({} as QuizAttemptsMap);

  const totalUnlocked =
    raw.totalUnlocked ??
    raw.TotalUnlocked ??
    (Array.isArray(unlockedTricks) ? unlockedTricks.length : 0);

  // -------- XP / LEVEL (nouveaux champs) ----------
  const xp = raw.xp ?? raw.XP ?? 0;
  const level = raw.level ?? raw.Level ?? 1;

  const levelTitle = raw.levelTitle ?? raw.LevelTitle ?? "";
  const levelEmoji = raw.levelEmoji ?? raw.LevelEmoji ?? "";

  const currentLevelMinXP =
    raw.currentLevelMinXP ?? raw.CurrentLevelMinXP ?? 0;
  const nextLevelMinXP =
    raw.nextLevelMinXP ?? raw.NextLevelMinXP ?? currentLevelMinXP;
  const xpToNextLevel =
    raw.xpToNextLevel ?? raw.XPToNextLevel ?? Math.max(nextLevelMinXP - xp, 0);
  const maxDefinedLevel =
    raw.maxDefinedLevel ?? raw.MaxDefinedLevel ?? level;
  const isMaxLevel =
    raw.isMaxLevel ?? raw.IsMaxLevel ?? level >= maxDefinedLevel;

  // -------- COMPLETION ----------
  const totalTricksAvailable =
    raw.totalTricksAvailable ?? raw.TotalTricksAvailable ?? 0;
  const completionPercent =
    raw.completionPercent ?? raw.CompletionPercent ?? 0;

  // -------- MINI-GAMES ----------
  const unlockedMiniGames =
    raw.unlockedMiniGames ?? raw.UnlockedMiniGames ?? [];

  // -------- DAILY STREAK ----------
  const dailyStreak = raw.dailyStreak ?? raw.DailyStreak ?? 0;

  // -------- AVATARS ----------
  const bubbleAvatarId =
    raw.bubbleAvatarId ?? raw.BubbleAvatarId ?? null;
  const shapeAvatarId =
    raw.shapeAvatarId ?? raw.ShapeAvatarId ?? null;

  const availableBubbleAvatarIds =
    raw.availableBubbleAvatarIds ?? raw.AvailableBubbleAvatarIds ?? [];
  const availableShapeAvatarIds =
    raw.availableShapeAvatarIds ?? raw.AvailableShapeAvatarIds ?? [];

  return {
    userId,
    unlockedTricks,
    lastUnlockDateUtc,
    tricksUnlockedToday,
    quizAttempts,
    totalUnlocked,

    xp,
    level,
    levelTitle,
    levelEmoji,
    currentLevelMinXP,
    nextLevelMinXP,
    xpToNextLevel,
    maxDefinedLevel,
    isMaxLevel,

    totalTricksAvailable,
    completionPercent,

    unlockedMiniGames,

    dailyStreak,

    bubbleAvatarId,
    shapeAvatarId,
    availableBubbleAvatarIds,
    availableShapeAvatarIds,
  };
}

// --------- Provider ---------
export function GlobalProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<GlobalProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const previousRef = useRef<GlobalProgress | null>(null);
  const { openAvatarUnlock } = useModalContext();

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔗 via gateway : /api/progress → ContentMicroservice /progress
      const dto = await getProfile();
      const normalized = normalizeProfile(dto);

      if (!normalized) {
        setProgress(null);
        previousRef.current = null;
        return;
      }

      const previous = previousRef.current;

      // ---------- LOGIQUE AVATAR BULLE ----------
      if (!previous) {
        // Premier chargement : si pas encore de bulle choisie mais des bulles dispos → modale
        if (
          !normalized.bubbleAvatarId &&
          normalized.availableBubbleAvatarIds &&
          normalized.availableBubbleAvatarIds.length > 0
        ) {
          openAvatarUnlock({
            type: "bubble",
            avatarId: null,
            availableIds: normalized.availableBubbleAvatarIds,
          });
        }
      } else {
        const hadBubbleBefore = !!previous.bubbleAvatarId;
        const hasBubbleNow = !!normalized.bubbleAvatarId;

        const hadBubbleChoicesBefore =
          previous.availableBubbleAvatarIds &&
          previous.availableBubbleAvatarIds.length > 0;

        const hasBubbleChoicesNow =
          normalized.availableBubbleAvatarIds &&
          normalized.availableBubbleAvatarIds.length > 0;

        // On ouvre la modale quand on passe de "aucun choix"
        // à "au moins une bulle disponible" et qu’aucune bulle n’est encore choisie
        if (
          !hasBubbleNow &&
          !hadBubbleChoicesBefore &&
          hasBubbleChoicesNow &&
          !hadBubbleBefore
        ) {
          openAvatarUnlock({
            type: "bubble",
            avatarId: null,
            availableIds: normalized.availableBubbleAvatarIds,
          });
        }

        // ---------- LOGIQUE AVATAR SHAPE ----------
        const prevShapes = previous.availableShapeAvatarIds || [];
        const newShapes = normalized.availableShapeAvatarIds || [];

        if (newShapes.length > prevShapes.length) {
          const newlyUnlocked =
            newShapes.find((id) => !prevShapes.includes(id)) ??
            newShapes[newShapes.length - 1];

          if (newlyUnlocked) {
            openAvatarUnlock({
              type: "shape",
              avatarId: newlyUnlocked,
            });
          }
        }
      }

      previousRef.current = normalized;
      setProgress(normalized);
      log("GlobalProgress loaded", normalized);
    } catch (err: any) {
      log("GlobalProgress.load error", err);
      setError(err?.message ?? "Unable to load progress");
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    load();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProgress = async () => {
    await load();
  };

  // Helpers dérivés (XP dans le niveau courant)
  let xpPercent = 0;
  let currentLevelMinXP = 0;
  let nextLevelMinXP = 0;

  if (progress) {
    const xp = progress.xp;
    currentLevelMinXP = progress.currentLevelMinXP ?? 0;
    nextLevelMinXP = progress.nextLevelMinXP ?? currentLevelMinXP;

    const span = Math.max(nextLevelMinXP - currentLevelMinXP, 1);
    const xpInLevel = xp - currentLevelMinXP;
    xpPercent = Math.min(Math.max((xpInLevel / span) * 100, 0), 100);
  }

  const value: GlobalProgressContextValue = {
    progress,
    loading,
    error,
    refreshProgress,
    xpPercent,
    currentLevelMinXP,
    nextLevelMinXP,
  };

  return (
    <GlobalProgressContext.Provider value={value}>
      {children}
    </GlobalProgressContext.Provider>
  );
}

// --------- Hook ---------
export function useGlobalProgress(): GlobalProgressContextValue {
  const ctx = useContext(GlobalProgressContext);
  if (!ctx) {
    throw new Error("useGlobalProgress must be used within GlobalProgressProvider");
  }
  return ctx;
}
