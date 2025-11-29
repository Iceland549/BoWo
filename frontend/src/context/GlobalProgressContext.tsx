// src/context/GlobalProgressContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getProfile } from "../services/authService";
import { log } from "../utils/logger";

// ⚙️ Même valeur que dans GetUserProgressUseCase (XP_PER_LEVEL = 500)
const XP_PER_LEVEL = 500;

type QuizAttemptsMap = Record<string, number>;

// Aligné sur UserProgressDto côté backend
// ContentMicroservice.Application.DTOs.UserProgressDto
export interface GlobalProgress {
  userId: string;
  unlockedTricks: string[];
  lastUnlockDateUtc: string | null;
  tricksUnlockedToday: number;
  quizAttempts: QuizAttemptsMap;
  totalUnlocked: number;
  xp: number;
  level: number;
  totalTricksAvailable: number;
  completionPercent: number;
  unlockedMiniGames: string[];
}

interface GlobalProgressContextValue {
  progress: GlobalProgress | null;
  loading: boolean;
  error: string | null;
  refreshProgress: () => Promise<void>;
  // helpers dérivés de XP
  nextLevelXp: number;
  xpPercent: number;
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

  // côté C#, tu as TotalUnlocked => UnlockedTricks.Count
  // on sécurise quand même au cas où
  const totalUnlocked =
    raw.totalUnlocked ??
    raw.TotalUnlocked ??
    (Array.isArray(unlockedTricks) ? unlockedTricks.length : 0);

  const xp = raw.xp ?? raw.XP ?? 0;
  const level = raw.level ?? raw.Level ?? 0;
  const totalTricksAvailable =
    raw.totalTricksAvailable ?? raw.TotalTricksAvailable ?? 0;
  const completionPercent =
    raw.completionPercent ?? raw.CompletionPercent ?? 0;
  const unlockedMiniGames =
    raw.unlockedMiniGames ?? raw.UnlockedMiniGames ?? [];

  return {
    userId,
    unlockedTricks,
    lastUnlockDateUtc,
    tricksUnlockedToday,
    quizAttempts,
    totalUnlocked,
    xp,
    level,
    totalTricksAvailable,
    completionPercent,
    unlockedMiniGames,
  };
}

// --------- Provider ---------
export function GlobalProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<GlobalProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔗 via gateway : /api/progress → ContentMicroservice /progress
      const dto = await getProfile();
      const normalized = normalizeProfile(dto);

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
  }, []);

  const refreshProgress = async () => {
    await load();
  };

  // Helpers dérivés (XP)
  const level = progress?.level ?? 0;
  const xp = progress?.xp ?? 0;
  const nextLevelXp = (level + 1) * XP_PER_LEVEL;
  const xpPercent =
    nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0;

  const value: GlobalProgressContextValue = {
    progress,
    loading,
    error,
    refreshProgress,
    nextLevelXp,
    xpPercent,
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
