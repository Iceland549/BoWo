// frontend/src/screens/DeckCollectionScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  TouchableOpacity,
  Pressable,
  Animated,   // ✅ déjà ajouté pour le spin
  Easing,     // ✅ déjà ajouté pour le spin
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useGlobalProgress } from "../context/GlobalProgressContext";
import { deckImages } from "../../assets/decks/deckImages";

type Props = NativeStackScreenProps<RootStackParamList, "DeckCollection">;

type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

type DeckMeta = {
  id: string;
  name: string;
  rarity: Rarity;
  emoji: string;
};

const DECK_CATALOG: DeckMeta[] = [
  { id: "deck_abyssal_demon", name: "Abyssal Demon", rarity: "LEGENDARY", emoji: "😈" },
  { id: "deck_anarchy_slash", name: "Anarchy Slash", rarity: "COMMON", emoji: "🧨" },
  { id: "deck_candy_swirl", name: "Candy Swirl", rarity: "COMMON", emoji: "🍭" },
  { id: "deck_aztec_jaguar", name: "Aztec Jaguar", rarity: "EPIC", emoji: "🗿" },
  { id: "deck_emoji_madness", name: "Emoji Madness", rarity: "COMMON", emoji: "😜" },
  { id: "deck_favela_vibes", name: "Favela Vibes", rarity: "RARE", emoji: "🏘️" },
  { id: "deck_grunge_burner", name: "Grunge Burner", rarity: "COMMON", emoji: "🔥" },
  { id: "deck_kanji_rebellion", name: "Kanji Rebellion", rarity: "EPIC", emoji: "🈵" },
  { id: "deck_kawaii_bubble", name: "Kawaii Bubble", rarity: "COMMON", emoji: "🩷" },
  { id: "deck_koi", name: "Koi Flow", rarity: "EPIC", emoji: "🐟" },
  { id: "deck_lucha_flame", name: "Lucha Flame", rarity: "RARE", emoji: "🔥" },
  { id: "deck_power_man", name: "Power Man", rarity: "EPIC", emoji: "⚡" },
  { id: "deck_rising_sun_oni", name: "Rising Sun Oni", rarity: "EPIC", emoji: "👹" },
  { id: "deck_rust_riot", name: "Rust Riot", rarity: "COMMON", emoji: "🧱" },
  { id: "deck_sakura", name: "Sakura Drift", rarity: "RARE", emoji: "🌸" },
  { id: "deck_street_chaos", name: "Street Chaos", rarity: "COMMON", emoji: "🎨" },
  { id: "deck_sugar_skull", name: "Sugar Skull", rarity: "RARE", emoji: "💀" },
  { id: "deck_toxic_trash", name: "Toxic Trash", rarity: "COMMON", emoji: "☣️" },
  { id: "deck_tron", name: "Tron Lines", rarity: "EPIC", emoji: "💡" },
  { id: "deck_venice_sunset", name: "Venice Sunset", rarity: "RARE", emoji: "🌴" },
];

export default function DeckCollectionScreen({ route }: Props) {
  const { progress } = useGlobalProgress();

  const fromRoute = route.params?.unlockedDecks ?? [];
  const fromContext = progress?.unlockedDecks ?? [];

  const merged = [...fromRoute, ...fromContext].filter(Boolean);
  const unlockedDecks = Array.from(new Set(merged));

  const totalDecks = DECK_CATALOG.length;
  const ownedCount = unlockedDecks.length;

  // 🔍 Deck sélectionné pour l’affichage en grand
  const [selectedDeck, setSelectedDeck] = useState<DeckMeta | null>(null);

  // 🌀 ANIM SPIN POUR LA PLANCHE DANS LA MODALE
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWow, setShowWow] = useState(false);

  // ✨ NOUVELLE ANIM POUR LES ÉTOILES QUI SCINTILLENT
  const starAnim = React.useRef(new Animated.Value(0)).current;

  // boucle d’anim pour les étoiles (fade + petit scale)
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(starAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(starAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [starAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "1080deg"], // 3 tours
  });

  const starOpacity = starAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const starScale = starAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.3],
  });

  const onPressBigDeck = () => {
    if (isSpinning || !selectedDeck) return;

    setIsSpinning(true);
    setShowWow(true);
    spinAnim.setValue(0);

    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      setShowWow(false);
    });
  };

  const renderItem = ({ item }: { item: DeckMeta }) => {
    const owned = unlockedDecks.includes(item.id);
    const imgSource = deckImages[item.id];

    const rarityStyle =
      item.rarity === "COMMON"
        ? styles.rarityCommon
        : item.rarity === "RARE"
        ? styles.rarityRare
        : item.rarity === "EPIC"
        ? styles.rarityEpic
        : styles.rarityLegendary;

    const onPressCard = () => {
      if (owned && imgSource) {
        setSelectedDeck(item);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPressCard}
        style={[styles.card, !owned && styles.cardLocked]}
      >
        {owned && imgSource ? (
          <Image
            source={imgSource}
            style={styles.deckImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.emoji}>{owned ? item.emoji : "❓"}</Text>
        )}

        <Text style={styles.deckName}>{owned ? item.name : "????"}</Text>
        <Text style={[styles.rarity, owned ? rarityStyle : styles.rarityLocked]}>
          {owned ? item.rarity : "LOCKED"}
        </Text>
      </TouchableOpacity>
    );
  };

  // 🔎 modal plein écran
  const selectedImg = selectedDeck ? deckImages[selectedDeck.id] : null;
  const selectedRarityStyle =
    selectedDeck?.rarity === "COMMON"
      ? styles.rarityCommon
      : selectedDeck?.rarity === "RARE"
      ? styles.rarityRare
      : selectedDeck?.rarity === "EPIC"
      ? styles.rarityEpic
      : styles.rarityLegendary;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Collection de Decks</Text>
        <Text style={styles.subtitle}>
          {ownedCount} / {totalDecks} decks débloqués
        </Text>

        <FlatList
          data={DECK_CATALOG}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />

        <Modal
          visible={!!selectedDeck}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDeck(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {selectedDeck && selectedImg && (
                <>
                  {/* 👇 Zone cliquable + spin + "WAOUW" + étoiles */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onPressBigDeck}
                    style={styles.modalDeckWrapper}
                  >
                    <Animated.Image
                      source={selectedImg}
                      style={[
                        styles.modalImage,
                        { transform: [{ rotate: spin }] },
                      ]}
                      resizeMode="contain"
                    />

                    {/* ✨ ÉTOILES AUTOUR DE LA BOARD (pointerEvents: "none" pour ne pas gêner le clic) */}
                    <View style={styles.starsContainer} pointerEvents="none">
                      <Animated.Text
                        style={[
                          styles.star,
                          styles.starTopLeft,
                          { opacity: starOpacity, transform: [{ scale: starScale }] },
                        ]}
                      >
                        ✦
                      </Animated.Text>
                      <Animated.Text
                        style={[
                          styles.star,
                          styles.starTopRight,
                          { opacity: starOpacity, transform: [{ scale: starScale }] },
                        ]}
                      >
                        ✦
                      </Animated.Text>
                      <Animated.Text
                        style={[
                          styles.star,
                          styles.starMidLeft,
                          { opacity: starOpacity, transform: [{ scale: starScale }] },
                        ]}
                      >
                        ✦
                      </Animated.Text>
                      <Animated.Text
                        style={[
                          styles.star,
                          styles.starMidRight,
                          { opacity: starOpacity, transform: [{ scale: starScale }] },
                        ]}
                      >
                        ✦
                      </Animated.Text>
                      <Animated.Text
                        style={[
                          styles.star,
                          styles.starBottom,
                          { opacity: starOpacity, transform: [{ scale: starScale }] },
                        ]}
                      >
                        ✦
                      </Animated.Text>
                    </View>

                    {showWow && (
                      <View style={styles.wowBadge}>
                        <Text style={styles.wowBadgeText}>WAOUW</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.modalName}>{selectedDeck.name}</Text>
                  <Text style={[styles.modalRarity, selectedRarityStyle]}>
                    {selectedDeck.rarity}
                  </Text>
                  <Pressable
                    style={styles.modalCloseButton}
                    onPress={() => setSelectedDeck(null)}
                  >
                    <Text style={styles.modalCloseText}>FERMER</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFD600",
    margin: 12,
  },
  title: {
    fontFamily: "Bangers",
    fontSize: 32,
    color: "#FFD600",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#E5E7EB",
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#0B1120",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1F2937",
  },
  cardLocked: {
    opacity: 0.35,
  },
  deckImage: {
    width: "100%",
    height: 120,
    marginBottom: 8,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  deckName: {
    color: "#F9FAFB",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 4,
  },
  rarity: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  rarityLocked: {
    color: "#6B7280",
  },
  rarityCommon: {
    color: "#9CA3AF",
  },
  rarityRare: {
    color: "#38BDF8",
  },
  rarityEpic: {
    color: "#A855F7",
  },
  rarityLegendary: {
    color: "#FACC15",
  },

  // ----- Modal plein écran -----
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "#020617",
    borderWidth: 2,
    borderColor: "#F97316",
    alignItems: "center",
  },

  // 👇 WRAPPER CLIQUABLE POUR LA BOARD + ZONE ÉTOILES
  modalDeckWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },

  // image de la board agrandie
  modalImage: {
    width: "100%",
    height: 360,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 14,
  },

  // ✨ CONTENEUR DES ÉTOILES
  starsContainer: {
    position: "absolute",
    width: "100%",
    height: 360,
    justifyContent: "center",
    alignItems: "center",
  },
  star: {
    position: "absolute",
    color: "#FACC15",
    fontSize: 22,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  starTopLeft: {
    top: 40,
    left: "10%",
  },
  starTopRight: {
    top: 40,
    right: "10%",
  },
  starMidLeft: {
    top: "45%",
    left: "4%",
  },
  starMidRight: {
    top: "45%",
    right: "4%",
  },
  starBottom: {
    bottom: 20,
    alignSelf: "center",
  },

  // badge "WAOUW"
  wowBadge: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    backgroundColor: "rgba(2,6,23,0.95)",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#FFD600",
  },
  wowBadgeText: {
    fontFamily: "Bangers",
    fontSize: 26,
    color: "#FFD600",
    letterSpacing: 2,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },

  modalName: {
    fontFamily: "Bangers",
    fontSize: 28,
    color: "#F9FAFB",
    textAlign: "center",
    marginBottom: 4,
  },
  modalRarity: {
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    marginBottom: 16,
  },
  modalCloseButton: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#F97316",
  },
  modalCloseText: {
    fontFamily: "Bangers",
    fontSize: 20,
    color: "#020617",
  },
});
