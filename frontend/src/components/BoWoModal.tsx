import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ModalOptions } from '../context/ModalContext';

interface Props {
  visible: boolean;
  options: ModalOptions | null;
  onClose: () => void;
}

const BoWoModal: React.FC<Props> = ({ visible, options, onClose }) => {
  if (!visible || !options) return null;

  const {
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    cancelText,
    onConfirm,
    onCancel,
  } = options;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const titleColor =
    type === 'success' ? '#0AA5FF' : type === 'error' ? '#FF355E' : '#FFD600';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {title ? (
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          ) : null}

          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonsRow}>
            {cancelText ? (
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={handleCancel}
              >
                <Text style={styles.btnSecondaryText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleConfirm}
            >
              <Text style={styles.btnPrimaryText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '82%',
    backgroundColor: '#111215',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#FFD600',
    shadowColor: '#FF355E',
    shadowOpacity: 0.8,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  message: {
    fontSize: 15,
    color: '#EDEDF5',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    minWidth: 120,
  },
  btnPrimary: {
    backgroundColor: '#FF355E',
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  btnSecondary: {
    backgroundColor: '#111215',
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  btnPrimaryText: {
    color: '#111215',
    textAlign: 'center',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  btnSecondaryText: {
    color: '#FFD600',
    textAlign: 'center',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default BoWoModal;
