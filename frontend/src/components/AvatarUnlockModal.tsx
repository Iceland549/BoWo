// frontend/src/components/AvatarUnlockModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { AvatarUnlockPayload } from "../context/ModalContext";
import { useGlobalProgress } from "../context/GlobalProgressContext";
import { selectBubbleAvatar } from "../services/avatarService";
import {
  bubbleAvatarImages,
  shapeAvatarImages,
} from "../../assets/avatars/avatarImages";

interface Props {
  visible: boolean;
  payload: AvatarUnlockPayload;
  onClose: () => void;
}

export default function AvatarUnlockModal({
  visible,
  payload,
  onClose,
}: Props) {
  const { refreshProgress } = useGlobalProgress();
  const [submitting, setSubmitting] = useState(false);

  if (!payload) return null;

  const { type, avatarId, availableIds } = payload;
  const isBubble = type === "bubble";

  const title = isBubble
    ? "Choisis ta bulle de rider !"
    : "Nouveau sticker skateur débloqué !";

  const subtitle = isBubble
    ? "Sélectionne ton avatar de profil à partir du niveau 2."
    : "À chaque niveau, un nouveau shape stylé se débloque 🔥";

//   const availableCount = availableIds?.length ?? 0;

  // -----------------------------------
  // Sélection d'une bulle
  // -----------------------------------
  async function onSelectBubble(id: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await selectBubbleAvatar(id);
      await refreshProgress(); // mise à jour du UserProgress global
      onClose();
    } catch (e) {
      console.log("selectBubbleAvatar error", e);
      setSubmitting(false);
    }
  }

  const renderBubbleChoice = () => {
    if (!availableIds || availableIds.length === 0) {
      return (
        <Text style={styles.info}>
          Pas d’avatars bulles disponibles pour l’instant.
        </Text>
      );
    }

    return (
      <>
        <Text style={styles.info}>
          Choisis ton portrait parmi {availableIds.length} styles :
        </Text>

        <FlatList
          data={availableIds}
          keyExtractor={(id) => id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => {
            const imgSource = bubbleAvatarImages[item];
            return (
              <TouchableOpacity
                style={styles.avatarItem}
                onPress={() => onSelectBubble(item)}
                disabled={submitting}
              >
                {imgSource ? (
                  <Image source={imgSource} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>{item}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </>
    );
  };

  const renderShapeInfo = () => {
    const imgSource = avatarId ? shapeAvatarImages[avatarId] : null;

    return (
      <>
        {avatarId && (
          <Text style={styles.highlight}>
            Nouveau sticker :{" "}
            <Text style={styles.highlightId}>{avatarId}</Text>
          </Text>
        )}

        <View style={styles.avatarPreview}>
          {imgSource ? (
            <Image source={imgSource} style={styles.avatarImageBig} />
          ) : (
            <Text style={styles.avatarPreviewText}>SHAPE AVATAR</Text>
          )}
        </View>

        <TouchableOpacity style={styles.btn} onPress={onClose}>
          <Text style={styles.btnText}>OK, stylé 😎</Text>
        </TouchableOpacity>
      </>
    );
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
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {isBubble ? renderBubbleChoice() : renderShapeInfo()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#111",
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#0AA5FF",
    width: "90%",
    maxWidth: 420,
  },
  title: {
    color: "#FFD600",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#EDEDF5",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  info: {
    color: "#ccc",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  grid: {
    justifyContent: "center",
  },
  avatarItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFD600",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
  },
  avatarPreview: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImageBig: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  avatarPreviewText: {
    color: "#fff",
    fontSize: 16,
  },
  highlight: {
    marginTop: 8,
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  highlightId: {
    color: "#0AA5FF",
    fontWeight: "900",
  },
  btn: {
    marginTop: 16,
    backgroundColor: "#00FFA3",
    paddingVertical: 10,
    borderRadius: 999,
  },
  btnText: {
    color: "#000",
    fontWeight: "800",
    textAlign: "center",
  },
});
