// src/context/ModalContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import BoWoModal from "../components/BoWoModal";
import { QuestionDefinition } from "../api/trickProgressService";

// -----------------------------------------------
// 1. Types de la modale classique (déjà existante)
// -----------------------------------------------
export type ModalType = "success" | "error" | "warning" | "info";

export interface ModalOptions {
  title?: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<boolean>;
  onCancel?: () => void;
}

// -----------------------------------------------
// 2. Types pour BoWoQuestionModal
// -----------------------------------------------
export interface QuestionModalPayload {
  trickId: string;
  question: QuestionDefinition;
  onAnswer: (answer: string) => Promise<boolean>;
}

// -----------------------------------------------
// 3. Types pour LevelUpScreen
// -----------------------------------------------
export interface LevelUpPayload {
  trickId: string;
  newLevel: number;
  xpGained: number;
}

// -----------------------------------------------
// 4. Types pour AvatarUnlockModal (nouveau)
// -----------------------------------------------
export type AvatarUnlockType = "bubble" | "shape";

export interface AvatarUnlockPayload {
  type: AvatarUnlockType;
  /**
   * ID technique de l’avatar tout juste débloqué
   * (ex: "bubble_lvl2_03" ou "shape_lvl3_rebel_shredder")
   */
  avatarId?: string | null;
  /**
   * Liste complète des avatars disponibles pour ce type
   * (ex: AvailableBubbleAvatarIds ou AvailableShapeAvatarIds)
   */
  availableIds?: string[];
}

// -----------------------------------------------
// 5. Le contexte complet
// -----------------------------------------------
interface ModalContextValue {
  // Modale classique
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;

  // Modale Question
  questionModal: QuestionModalPayload | null;
  openQuestionModal: (payload: QuestionModalPayload) => void;
  closeQuestionModal: () => void;

  // Level up Screen
  levelUp: LevelUpPayload | null;
  showLevelUp: (payload: LevelUpPayload) => void;
  closeLevelUp: () => void;

  // Avatar unlock (bubble / shape)
  avatarUnlock: AvatarUnlockPayload | null;
  openAvatarUnlock: (payload: AvatarUnlockPayload) => void;
  closeAvatarUnlock: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

// -----------------------------------------------
// 6. Provider global (unique)
// -----------------------------------------------
export function ModalProvider({ children }: { children: ReactNode }) {
  // 🔹 MODALE CLASSIQUE
  const [options, setOptions] = useState<ModalOptions | null>(null);

  // 🔹 MODALE QUESTION
  const [questionModal, setQuestionModal] =
    useState<QuestionModalPayload | null>(null);

  // 🔹 LEVEL UP
  const [levelUp, setLevelUp] = useState<LevelUpPayload | null>(null);

  // 🔹 AVATAR UNLOCK
  const [avatarUnlock, setAvatarUnlock] =
    useState<AvatarUnlockPayload | null>(null);

  // --------------------------
  // A. API modale classique
  // --------------------------
  const showModal = (opts: ModalOptions) => {
    setOptions({
      type: "info",
      confirmText: "OK",
      ...opts,
    });
  };

  const hideModal = () => setOptions(null);

  // --------------------------
  // B. API modale QUESTION
  // --------------------------
  const openQuestionModal = (payload: QuestionModalPayload) => {
    setQuestionModal(payload);
  };

  const closeQuestionModal = () => setQuestionModal(null);

  // --------------------------
  // C. API Level Up
  // --------------------------
  const showLevelUp = (payload: LevelUpPayload) => {
    setLevelUp(payload);
  };

  const closeLevelUp = () => setLevelUp(null);

  // --------------------------
  // D. API Avatar Unlock
  // --------------------------
  const openAvatarUnlock = (payload: AvatarUnlockPayload) => {
    setAvatarUnlock(payload);
  };

  const closeAvatarUnlock = () => setAvatarUnlock(null);

  // --------------------------
  // E. Rendu
  // --------------------------
  return (
    <ModalContext.Provider
      value={{
        // modale classique
        showModal,
        hideModal,

        // questions
        questionModal,
        openQuestionModal,
        closeQuestionModal,

        // level up
        levelUp,
        showLevelUp,
        closeLevelUp,

        // avatars
        avatarUnlock,
        openAvatarUnlock,
        closeAvatarUnlock,
      }}
    >
      {children}

      {/* Modale classique globale */}
      <BoWoModal visible={!!options} options={options} onClose={hideModal} />
    </ModalContext.Provider>
  );
}

// -----------------------------------------------
// 7. Hook d’accès
// -----------------------------------------------
export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModalContext must be used inside ModalProvider");
  }
  return ctx;
}
