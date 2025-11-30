// import { useState } from "react";
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { QuestionDefinition } from "../api/trickProgressService";
// import { useGlobalProgress } from "../context/GlobalProgressContext";
// interface Props {
//   visible: boolean;
//   question: QuestionDefinition;
//   onAnswer: (option: string) => Promise<boolean>;
//   onClose: () => void;
// }

// export default function BoWoQuestionModal({ visible, question, onAnswer, onClose }: Props) {
//   const { refreshProgress } = useGlobalProgress();
//   const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   if (!question) return null;

//   return (
//     <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
//       <View style={styles.overlay}>
//         <View style={styles.box}>
//           <Text style={styles.title}>Question niveau {question.level}</Text>
//           <Text style={styles.message}>{question.question}</Text>

//           {result === "correct" && (
//             <Text style={{ color: "lime", fontSize: 20, marginBottom: 8, textAlign: "center" }}>
//               ✔ Bonne réponse !
//             </Text>
//           )}

//           {result === "incorrect" && (
//             <Text style={{ color: "red", fontSize: 20, marginBottom: 8, textAlign: "center" }}>
//               ✘ Mauvaise réponse
//             </Text>
//           )}


//           {question.options.map((opt) => (
//             <TouchableOpacity
//               key={opt}
//               style={styles.option}
//               onPress={async () => {
//                 if (isSubmitting) return;
//                 setIsSubmitting(true);

//                 const wasCorrect = await onAnswer(opt);

//                 setResult(wasCorrect ? "correct" : "incorrect");
//                 await refreshProgress();

//                 setIsSubmitting(false);
//               }}
//             >
//               <Text style={styles.optionText}>{opt}</Text>
//             </TouchableOpacity>
//           ))}

//           {result !== null && (
//             <TouchableOpacity
//               style={[styles.option, { marginTop: 10, backgroundColor: "#333" }]}
//               onPress={onClose}
//             >
//               <Text style={styles.optionText}>Fermer</Text>
//             </TouchableOpacity>
//           )}

//           <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
//             <Text style={styles.closeText}>Plus tard</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// }

// // styles inspirés de ton BoWoModal existant
// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(3, 0, 12, 0.9)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   box: {
//     backgroundColor: "#161623",
//     padding: 20,
//     borderRadius: 24,
//     width: "85%",
//     borderWidth: 2,
//     borderColor: "#FF355E",
//   },
//   title: {
//     color: "#FFD600",
//     fontWeight: "900",
//     fontSize: 20,
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   message: {
//     color: "#EDEDF5",
//     fontSize: 15,
//     textAlign: "center",
//     marginBottom: 16,
//   },
//   option: {
//     backgroundColor: "#111",
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//     borderRadius: 12,
//     marginVertical: 4,
//     borderWidth: 1,
//     borderColor: "#FF355E",
//   },
//   optionText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   closeBtn: {
//     marginTop: 10,
//     alignSelf: "center",
//   },
//   closeText: {
//     color: "#888",
//     fontSize: 13,
//   },
// });

import { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { QuestionDefinition } from "../api/trickProgressService";
import { useGlobalProgress } from "../context/GlobalProgressContext";

interface Props {
  visible: boolean;
  question: QuestionDefinition;
  onAnswer: (option: string) => Promise<boolean>;
  onClose: () => void;
}

function shuffle(arr: any[]) {
  return arr
    .map(a => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.value);
}

export default function BoWoQuestionModal({ visible, question, onAnswer, onClose }: Props) {
  const { refreshProgress } = useGlobalProgress();
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<any[]>([]);

  useEffect(() => {
    if (question) {
      const answers = question.options.map((text: string) => ({
        text
      }));
      setShuffledAnswers(shuffle(answers));
      setResult(null);
    }
  }, [question]);

  if (!question) return null;

  async function onPressAnswer(answer: { text: string }) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    // 🔥 Comparaison correcte selon TON backend
    const isCorrect = answer.text === question.answer;

    // On envoie quand même dans le backend (il retournera correct=true/false)
    const wasCorrect = await onAnswer(answer.text);

    setResult(isCorrect && wasCorrect ? "correct" : "incorrect");

    await refreshProgress();
    setIsSubmitting(false);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Question niveau {question.level}</Text>
          <Text style={styles.message}>{question.question}</Text>

          {result === "correct" && (
            <Text style={{ color: "lime", fontSize: 20, marginBottom: 8, textAlign: "center" }}>
              ✔ Bonne réponse !
            </Text>
          )}

          {result === "incorrect" && (
            <Text style={{ color: "red", fontSize: 20, marginBottom: 8, textAlign: "center" }}>
              ✘ Mauvaise réponse
            </Text>
          )}

          {shuffledAnswers.map((ans) => (
            <TouchableOpacity
              key={ans.text}
              style={styles.option}
              onPress={() => onPressAnswer(ans)}
            >
              <Text style={styles.optionText}>{ans.text}</Text>
            </TouchableOpacity>
          ))}

          {result !== null && (
            <TouchableOpacity
              style={[styles.option, { marginTop: 10, backgroundColor: "#333" }]}
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

