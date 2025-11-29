// src/context/ProgressContext.tsx
import React, { createContext, useState, useContext } from "react";
import TrickProgressService, {
  NextQuestionResponse,
  SubmitAnswerResponse,
} from "../api/trickProgressService";
import { useGlobalProgress } from "./GlobalProgressContext";

interface TrickProgress {
  level: number;
  totalXp: number;
}

interface ProgressState {
  [trickId: string]: TrickProgress;
}

interface ProgressContextValue {
  progress: ProgressState;
  fetchQuestion: (trickId: string) => Promise<NextQuestionResponse>;
  answerQuestion: (
    trickId: string,
    level: number,
    userAnswer: string
  ) => Promise<SubmitAnswerResponse>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

// 🔥 CONFIG EXACTE POUR TON UI
const LOCAL_MAX_LEVEL = 8;
const LOCAL_MAX_XP = 80;
const LOCAL_XP_PER_LEVEL = LOCAL_MAX_XP / LOCAL_MAX_LEVEL; // = 10

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState>({});
  const global = useGlobalProgress();

  const fetchQuestion = async (trickId: string) => {
    console.log("[CTX] fetchQuestion → trickId =", trickId);

    try {
      const res = await TrickProgressService.getNextQuestion(trickId);
      console.log("[CTX] fetchQuestion SUCCESS →", res);

      setProgress((prev) => ({
        ...prev,
        [trickId]: {
          level: res.currentLevel,
          totalXp: res.currentLevel * LOCAL_XP_PER_LEVEL, // 🔥 FIX 10 XP/level
        },
      }));

      return res;
    } catch (err: any) {
      console.log("[CTX] fetchQuestion ERROR →", err);
      throw err;
    }
  };

  const answerQuestion = async (trickId, level, userAnswer) => {
    console.log("[CTX] answerQuestion →", trickId, level, userAnswer);

    try {
      const res = await TrickProgressService.submitAnswer(trickId, level, userAnswer);
      console.log("[CTX] answerQuestion SUCCESS →", res);

      await global.refreshProgress();

      setProgress((prev) => ({
        ...prev,
        [trickId]: {
          level: res.newLevel,
          totalXp: res.newLevel * LOCAL_XP_PER_LEVEL, // 🔥 FIX cohérence UI
        },
      }));

      return res;
    } catch (err) {
      console.log("[CTX] answerQuestion ERROR →", err);
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
  if (!ctx) throw new Error("useProgress must be inside ProgressProvider");
  return ctx;
};
