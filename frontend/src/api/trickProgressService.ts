import api from "./api";

export interface QuestionDefinition {
  level: number;
  type: string;
  question: string;
  options: string[];
  answer: string;
}

export interface NextQuestionResponse {
  currentLevel: number;
  question: QuestionDefinition | null;
  isCompleted: boolean;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  newLevel: number;
  xpGained: number;
  globalProgress: {
    xp: number;
    level: number;
    completionPercent: number;
    unlockedTricks: string[];
    unlockedMiniGames: string[];
    totalUnlocked: number;
    totalTricksAvailable: number;
    tricksUnlockedToday: number;
    lastUnlockDateUtc: string;
    userId: string;
  };
}

class TrickProgressService {
  async getNextQuestion(trickId: string): Promise<NextQuestionResponse> {
    const { data } = await api.get(`/progress/${trickId}/next`);
    return data;
  }

  async submitAnswer(
    trickId: string,
    level: number,
    userAnswer: string
  ): Promise<SubmitAnswerResponse> {
    const { data } = await api.post(`/progress/${trickId}/answer`, {
      level,
      userAnswer,
    });
    return data;
  }
}

export default new TrickProgressService();
