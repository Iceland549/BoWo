// src/navigation/AppShell.tsx
import React from "react";
import AppNavigator from "./AppNavigator";
import BoWoQuestionModal from "../components/BoWoQuestionModal";
import LevelUpScreen from "../components/LevelUpScreen";
import { useModalContext } from "../context/ModalContext";

export default function AppShell() {
  const {
    questionModal,
    closeQuestionModal,
    levelUp,
    closeLevelUp,
  } = useModalContext();

  return (
    <>
      {/* Navigation principale */}
      <AppNavigator />

      {/* Modale de question */}
      {questionModal && (
        <BoWoQuestionModal
          visible={!!questionModal}
          question={questionModal.question}
          onClose={closeQuestionModal}
          onAnswer={questionModal.onAnswer}
        />
      )}

      {/* Écran Level Up */}
      {levelUp && (
        <LevelUpScreen
          visible={!!levelUp}
          trickId={levelUp.trickId}
          newLevel={levelUp.newLevel}
          xpGained={levelUp.xpGained}
          onClose={closeLevelUp}
        />
      )}
    </>
  );
}
