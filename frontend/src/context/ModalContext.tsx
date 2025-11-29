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
// 2. Types pour BoWoQuestionModal (nouveau)
// -----------------------------------------------
export interface QuestionModalPayload {
  trickId: string;
  question: QuestionDefinition;
  onAnswer: (answer: string) => Promise<boolean>;
}

// -----------------------------------------------
// 3. Types pour LevelUpScreen (nouveau)
// -----------------------------------------------
export interface LevelUpPayload {
  trickId: string;
  newLevel: number;
  xpGained: number;
}

// -----------------------------------------------
// 4. Le contexte complet
// -----------------------------------------------
interface ModalContextValue {
  // Modale classique
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;

  // Modale QUestion
  questionModal: QuestionModalPayload | null;
  openQuestionModal: (payload: QuestionModalPayload) => void;
  closeQuestionModal: () => void;

  // Level up Screen
  levelUp: LevelUpPayload | null;
  showLevelUp: (payload: LevelUpPayload) => void;
  closeLevelUp: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

// -----------------------------------------------
// 5. Provider global (unique)
// -----------------------------------------------
export function ModalProvider({ children }: { children: ReactNode }) {
  // 🔹 MODALE CLASSIQUE
  const [options, setOptions] = useState<ModalOptions | null>(null);

  // 🔹 MODALE QUESTION
  const [questionModal, setQuestionModal] =
    useState<QuestionModalPayload | null>(null);

  // 🔹 LEVEL UP
  const [levelUp, setLevelUp] = useState<LevelUpPayload | null>(null);

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
  // D. Rendu
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
      }}
    >
      {children}

      {/* Modale classique globale */}
      <BoWoModal
        visible={!!options}
        options={options}
        onClose={hideModal}
      />

    </ModalContext.Provider>
  );
}

// -----------------------------------------------
// 6. Hook d’accès
// -----------------------------------------------
export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModalContext must be used inside ModalProvider");
  }
  return ctx;
}
