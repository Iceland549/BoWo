// src/navigation/AppShell.tsx
import React from "react";
import AppNavigator from "./AppNavigator";
import BoWoQuestionModal from "../components/BoWoQuestionModal";
import LevelUpScreen from "../components/LevelUpScreen";
import AvatarUnlockModal from "../components/AvatarUnlockModal";
import { useModalContext } from "../context/ModalContext";

export default function AppShell() {
  const {
    questionModal,
    closeQuestionModal,
    levelUp,
    closeLevelUp,
    avatarUnlock,
    closeAvatarUnlock,
  } = useModalContext();

  return (
    <>
      {/* Navigation principale */}
      <AppNavigator />

      {/* Modale de question (quiz par trick) */}
      {questionModal && (
        <BoWoQuestionModal
          visible={!!questionModal}
          question={questionModal.question}
          onClose={closeQuestionModal}
          onAnswer={questionModal.onAnswer}
        />
      )}

      {/* Écran Level Up (level par trick / XP local) */}
      {levelUp && (
        <LevelUpScreen
          visible={!!levelUp}
          trickId={levelUp.trickId}
          newLevel={levelUp.newLevel}
          xpGained={levelUp.xpGained}
          onClose={closeLevelUp}
        />
      )}

      {/* Modale d’avatar débloqué (bulle ou shape) */}
      {avatarUnlock && (
        <AvatarUnlockModal
          visible={!!avatarUnlock}
          payload={avatarUnlock}
          onClose={closeAvatarUnlock}
        />
      )}
    </>
  );
}
