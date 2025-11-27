import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { QuestionDefinition } from "../api/trickProgressService";

interface Props {
  visible: boolean;
  question: QuestionDefinition;
  onAnswer: (option: string) => Promise<void>;
  onClose: () => void;
}

export default function BoWoQuestionModal({ visible, question, onAnswer, onClose }: Props) {
  if (!question) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Question niveau {question.level}</Text>
          <Text style={styles.message}>{question.question}</Text>

          {question.options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.option}
              onPress={() => onAnswer(opt)}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// styles inspirés de ton BoWoModal existant
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
  closeBtn: {
    marginTop: 10,
    alignSelf: "center",
  },
  closeText: {
    color: "#888",
    fontSize: 13,
  },
});
