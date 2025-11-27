// src/context/ProgressContext.tsx
import React, { createContext, useState, useContext } from "react";
import TrickProgressService, {
  NextQuestionResponse,
  SubmitAnswerResponse,
} from "../api/trickProgressService";

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

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [progress, setProgress] = useState<ProgressState>({});

  const fetchQuestion = async (trickId: string) => {
    console.log("[CTX] fetchQuestion → trickId =", trickId);

    try {
      const res = await TrickProgressService.getNextQuestion(trickId);
      console.log("[CTX] fetchQuestion SUCCESS →", res);

      setProgress((prev) => ({
        ...prev,
        [trickId]: {
          level: res.currentLevel,
          totalXp: prev[trickId]?.totalXp ?? 0,
        },
      }));

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

  const answerQuestion = async (trickId: string, level: number, userAnswer: string) => {
    console.log(
      "[CTX] answerQuestion →",
      "trickId =", trickId,
      "level =", level,
      "answer =", userAnswer
    );

    try {
      const res = await TrickProgressService.submitAnswer(trickId, level, userAnswer);
      console.log("[CTX] answerQuestion SUCCESS →", res);

      setProgress((prev) => {
        const before = prev[trickId] ?? { level: 0, totalXp: 0 };
        return {
          ...prev,
          [trickId]: {
            level: res.newLevel,
            totalXp: before.totalXp + res.xpGained,
          },
        };
      });

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
  if (!ctx) throw new Error("useProgress must be inside ProgressProvider");
  return ctx;
};
