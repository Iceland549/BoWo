// src/context/ProgressContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
} from "react";
import TrickProgressService, {
  NextQuestionResponse,
  SubmitAnswerResponse,
} from "../api/trickProgressService";
import { useGlobalProgress } from "./GlobalProgressContext";

interface TrickProgress {
  // Niveau atteint pour CE trick (0 → 8)
  level: number;
  // XP local pour CE trick (utile pour la petite barre XP locale)
  // On vise 0 → 160 (8 x 20) dans l’UI.
  totalXp: number;
}

interface ProgressState {
  [trickId: string]: TrickProgress;
}

interface ProgressContextValue {
  progress: ProgressState;

  // Récupérer la prochaine question pour un trick
  fetchQuestion: (trickId: string) => Promise<NextQuestionResponse>;

  // Soumettre une réponse pour un trick / level
  answerQuestion: (
    trickId: string,
    level: number,
    userAnswer: string
  ) => Promise<SubmitAnswerResponse>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState>({});
  const global = useGlobalProgress();

  /**
   * 🔹 fetchQuestion(trickId)
   * - Appelle l'API /progress/{trickId}/next
   * - Met à jour le niveau courant localement
   */
  const fetchQuestion = async (trickId: string) => {
    console.log("[CTX] fetchQuestion → trickId =", trickId);

    try {
      const res = await TrickProgressService.getNextQuestion(trickId);
      console.log("[CTX] fetchQuestion SUCCESS →", res);

      setProgress((prev) => {
        const existing = prev[trickId];

        return {
          ...prev,
          [trickId]: {
            // niveau renvoyé par le backend pour ce trick
            level: res.currentLevel,
            // si on avait déjà de l’XP local, on le garde,
            // sinon on initialise à currentLevel * 20 (1 niveau = 20 XP locaux)
            totalXp:
              existing?.totalXp ?? res.currentLevel * 20,
          },
        };
      });

      return res;
    } catch (err: any) {
      console.log(
        "[CTX] fetchQuestion ERROR →",
        err?.response?.status,
        err?.message
      );
      throw err;
    }
  };

  /**
   * 🔹 answerQuestion(trickId, level, userAnswer)
   * - Appelle l'API /progress/{trickId}/answer
   * - Met à jour le niveau + XP LOCAL
   * - L'XP GLOBAL est géré côté backend (AddXPUseCase + GetUserProgressUseCase)
   */
  const answerQuestion = async (
    trickId: string,
    level: number,
    userAnswer: string
  ): Promise<SubmitAnswerResponse> => {
    console.log(
      "[CTX] answerQuestion →",
      "trickId =", trickId,
      "level =", level,
      "answer =", userAnswer
    );

    try {
      const res = await TrickProgressService.submitAnswer(
        trickId,
        level,
        userAnswer
      );
      console.log("[CTX] answerQuestion SUCCESS →", res);

      // Le backend Upgrade 3 renvoie au minimum :
      //  - newLevel (niveau atteint pour ce trick)
      //  - xpGained (XP global gagnée, mais on peut aussi s'en servir comme XP locale)
      const anyRes: any = res as any;
      const newLevel: number = anyRes.newLevel ?? level;
      const xpGainedLocal: number =
        anyRes.xpGained ?? anyRes.xpGainedLocal ?? 0;

      setProgress((prev) => {
        const before = prev[trickId] ?? { level: 0, totalXp: 0 };

        return {
          ...prev,
          [trickId]: {
            level: newLevel,
            totalXp: before.totalXp + xpGainedLocal,
          },
        };
      });

      // 🔥 Très important pour le plan Upgrade 3 :
      // on met à jour la progression GLOBALE (XP, avatars, dailyStreak…)
      // via le contexte global qui appelle /progress.
      try {
        await global.refreshProgress();
      } catch (e) {
        console.log("[CTX] answerQuestion → refreshProgress error", e);
      }

      return res;
    } catch (err: any) {
      console.log(
        "[CTX] answerQuestion ERROR →",
        err?.response?.status,
        err?.message
      );
      throw err;
    }
  };

  return (
    <ProgressContext.Provider value={{ progress, fetchQuestion, answerQuestion }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be inside ProgressProvider");
  }
  return ctx;
};
