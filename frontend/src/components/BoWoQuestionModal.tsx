// src/components/BoWoQuestionModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { QuestionDefinition } from "../api/trickProgressService";

interface Props {
  visible: boolean;
  question: QuestionDefinition | null;
  onAnswer: (option: string) => Promise<boolean>;
  onClose: () => void;
}

interface AnswerOption {
  text: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.value);
}

export default function BoWoQuestionModal({
  visible,
  question,
  onAnswer,
  onClose,
}: Props) {
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<AnswerOption[]>([]);

  useEffect(() => {
    if (!question) {
      setShuffledAnswers([]);
      setResult(null);
      setIsSubmitting(false);
      return;
    }

    const answers = question.options.map((text) => ({ text }));
    setShuffledAnswers(shuffle(answers));
    setResult(null);
    setIsSubmitting(false);
  }, [question]);

  if (!question) return null;

  const handlePressAnswer = async (answer: AnswerOption) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const wasCorrect = await onAnswer(answer.text);
      setResult(wasCorrect ? "correct" : "incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Question niveau {question.level}</Text>
          <Text style={styles.message}>{question.question}</Text>

          {result === "correct" && (
            <Text style={styles.correctText}>✔ Bonne réponse !</Text>
          )}

          {result === "incorrect" && (
            <Text style={styles.incorrectText}>✘ Mauvaise réponse</Text>
          )}

          {shuffledAnswers.map((ans) => (
            <TouchableOpacity
              key={ans.text}
              style={styles.option}
              onPress={() => handlePressAnswer(ans)}
              disabled={isSubmitting}
            >
              <Text style={styles.optionText}>{ans.text}</Text>
            </TouchableOpacity>
          ))}

          {result !== null && (
            <TouchableOpacity
              style={[styles.option, styles.closeOption]}
              onPress={onClose}
            >
              <Text style={styles.optionText}>Fermer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(3, 0, 12, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#161623",
    padding: 20,
    borderRadius: 24,
    width: "85%",
    borderWidth: 2,
    borderColor: "#FF355E",
  },
  title: {
    color: "#FFD600",
    fontWeight: "900",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    color: "#EDEDF5",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  correctText: {
    color: "lime",
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  incorrectText: {
    color: "red",
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  option: {
    backgroundColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#FF355E",
  },
  optionText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  closeOption: {
    marginTop: 10,
    backgroundColor: "#333",
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "center",
  },
  closeText: {
    color: "#888",
    fontSize: 13,
  },
});
