import React, { createContext, useContext, useState, ReactNode } from 'react';
import BoWoModal from '../components/BoWoModal';

export type ModalType = 
  | "success"
  | "error"
  | "warning"
  | "info"; // bonus si un jour nécessaire

export interface ModalOptions {
  title?: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ModalContextValue {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showModal = (opts: ModalOptions) => {
    setOptions({
      type: 'info',
      confirmText: 'OK',
      ...opts,
    });
  };

  const hideModal = () => {
    setOptions(null);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}

      {/* 🔥 Modale globale BoWo */}
      <BoWoModal
        visible={!!options}
        options={options}
        onClose={hideModal}
      />
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used inside a ModalProvider');
  }
  return ctx;
}
