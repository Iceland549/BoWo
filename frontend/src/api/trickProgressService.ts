// src/api/trickProgressService.ts
import api from "./api";
import type { GlobalProgress } from "../context/GlobalProgressContext";

export interface QuestionDefinition {
  level: number;
  type: string;      // "mcq", "true_false", etc., selon ton QuestionBank
  question: string;
  options: string[];
  answer: string;    // bonne réponse (texte exact)
}

export interface NextQuestionResponse {
  currentLevel: number;
  question: QuestionDefinition | null;
  isCompleted: boolean;
}

/**
 * Réponse du POST /progress/{trickId}/answer
 * (SubmitQuestionAnswerUseCase)
 */
export interface SubmitAnswerResponse {
  correct: boolean;
  newLevel: number;
  xpGained: number;

  // XP globale + avatars, etc. (UserProgressDto côté backend)
  globalProgress?: GlobalProgress;
}

class TrickProgressService {
  /**
   * GET /api/progress/{trickId}/next → backend /progress/{trickId}/next
   */
  async getNextQuestion(trickId: string): Promise<NextQuestionResponse> {
    const { data } = await api.get<NextQuestionResponse>(
      `/progress/${trickId}/next`
    );
    return data;
  }

  /**
   * POST /api/progress/{trickId}/answer
   * body: { level, userAnswer }
   */
  async submitAnswer(
    trickId: string,
    level: number,
    userAnswer: string
  ): Promise<SubmitAnswerResponse> {
    const { data } = await api.post<SubmitAnswerResponse>(
      `/progress/${trickId}/answer`,
      {
        level,
        userAnswer,
      }
    );
    return data;
  }
}

export default new TrickProgressService();
