// src/hooks/useQuestion.js
import { useState } from "react";
import { useProgress } from "../context/ProgressContext";

export const useQuestion = (trickId) => {
  const { fetchQuestion, answerQuestion } = useProgress();

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadQuestion = async () => {
    console.log("[HOOK] loadQuestion → trickId =", trickId);
    setLoading(true);
    const res = await fetchQuestion(trickId);
    setLoading(false);
    setQuestion(res.question);
    return res;
  };

  const submit = async (level, userAnswer) => {
    console.log(
      "[HOOK] submit →",
      "trickId =", trickId,
      "level =", level,
      "answer =", userAnswer
    );
    const res = await answerQuestion(trickId, level, userAnswer);
    return res;
  };


  return { question, loadQuestion, submit, loading, setQuestion };
};
