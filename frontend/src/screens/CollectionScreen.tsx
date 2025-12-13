// frontend/src/screens/CollectionScreen.tsx
import React, { useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../components/ScreenWrapper";

export default function CollectionScreen() {
  const navigation = useNavigation<any>();

  const onBackToPark = useCallback(() => {
    navigation.navigate("Home");
  }, [navigation]);

  const goAvatar = useCallback(() => {
    // Collection Avatar (à créer plus tard) -> pour l'instant on ouvre la shop Avatar
    navigation.navigate("AvatarShapeShop");
  }, [navigation]);

  const goAvatarShop = useCallback(() => {
    navigation.navigate("AvatarShapeShop");
  }, [navigation]);

  const goClassic = useCallback(() => {
    // Collection Deck Classique (déjà existante)
    navigation.navigate("DeckCollection");
  }, [navigation]);

  const goClassicShop = useCallback(() => {
    // Shop classic à créer plus tard → fallback propre
    Alert.alert("Classic Deck Shop", "Coming soon.");
  }, []);

  const goAlive = useCallback(() => {
    // Collection / Lab Alive (déjà existante)
    navigation.navigate("AliveDecks");
  }, [navigation]);

  const goAliveShop = useCallback(() => {
    // Pour l’instant AliveDecks fait office de “lab/shop”
    navigation.navigate("AliveDecks");
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <ScreenWrapper>
        <Text style={styles.title}>COLLECTIONS</Text>
        <Text style={styles.subtitle}>Your stash. Your style. 🔥</Text>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* =============== AVATAR =============== */}
          <View style={[styles.card, styles.cardAvatar]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🧑‍🎤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>AVATAR</Text>
                <Text style={styles.cardDesc}>
                  Shapes • Styles • Identity
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.statRow}>
                <Text style={styles.statKey}>Owned</Text>
                <Text style={styles.statVal}>—</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statKey}>Active</Text>
                <Text style={styles.statVal}>—</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={goAvatar}>
                <Text style={styles.btnPrimaryText}>OPEN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnGhost} onPress={goAvatarShop}>
                <Text style={styles.btnGhostText}>SHOP</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* =============== CLASSIC DECKS =============== */}
          <View style={[styles.card, styles.cardClassic]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🛹</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>CLASSIC DECKS</Text>
                <Text style={styles.cardDesc}>Old school collection</Text>
              </View>
              <View style={[styles.badge, styles.badgeBlue]}>
                <Text style={styles.badgeText}>COLLECT</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.statRow}>
                <Text style={styles.statKey}>Owned</Text>
                <Text style={styles.statVal}>—</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statKey}>Favorite</Text>
                <Text style={styles.statVal}>—</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={goClassic}>
                <Text style={styles.btnPrimaryText}>OPEN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnGhost} onPress={goClassicShop}>
                <Text style={styles.btnGhostText}>SHOP</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* =============== ALIVE DECKS =============== */}
          <View style={[styles.card, styles.cardAlive]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>🌀</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>ALIVE DECKS</Text>
                <Text style={styles.cardDesc}>Moire • Tunnel • Lenti</Text>
              </View>
              <View style={[styles.badge, styles.badgePink]}>
                <Text style={styles.badgeText}>LAB</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.statRow}>
                <Text style={styles.statKey}>Owned</Text>
                <Text style={styles.statVal}>—</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statKey}>Mode</Text>
                <Text style={styles.statVal}>—</Text>
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.btnPrimary} onPress={goAlive}>
                <Text style={styles.btnPrimaryText}>OPEN</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnGhost} onPress={goAliveShop}>
                <Text style={styles.btnGhostText}>SHOP</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* =============== BACK TO PARK =============== */}
          <TouchableOpacity style={styles.backBtn} onPress={onBackToPark}>
            <Text style={styles.backBtnText}>Back to Park</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenWrapper>
    </View>
  );
}

/* ----------------------------------------------------------
 * 🎨 BOWO SANTA CRUZ STYLE (aligned with Profile / others)
 * ---------------------------------------------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#3a1a6b" },

  title: {
    fontFamily: "Bangers",
    fontSize: 34,
    color: "#FFD600",
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "#000",
    textShadowRadius: 10,
    marginTop: 6,
    marginBottom: 4,
  },

  subtitle: {
    fontFamily: "Bangers",
    fontSize: 18,
    color: "#0AA5FF",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 16,
  },

  scroll: {
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#111827",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFD600",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  cardAvatar: { borderColor: "#FFD600" },
  cardClassic: { borderColor: "#0AA5FF" },
  cardAlive: { borderColor: "#FF355E" },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardEmoji: {
    fontSize: 34,
  },

  cardTitle: {
    fontFamily: "Bangers",
    fontSize: 26,
    color: "#F9FAFB",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  cardDesc: {
    color: "#C7D2FE",
    fontWeight: "800",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#FFD600",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeBlue: { backgroundColor: "#0AA5FF" },
  badgePink: { backgroundColor: "#FF355E" },

  badgeText: {
    fontFamily: "Bangers",
    fontSize: 16,
    color: "#111",
    letterSpacing: 1,
  },

  cardBody: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    gap: 8,
  },

  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statKey: { color: "#9CA3AF", fontWeight: "900" },
  statVal: { color: "#F9FAFB", fontWeight: "900" },

  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  btnPrimary: {
    flex: 1,
    backgroundColor: "#FFD600",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },

  btnPrimaryText: {
    fontFamily: "Bangers",
    fontSize: 22,
    color: "#111",
    letterSpacing: 1,
  },

  btnGhost: {
    width: 120,
    backgroundColor: "#1A1B20",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD600",
  },

  btnGhostText: {
    fontFamily: "Bangers",
    fontSize: 20,
    color: "#FFD600",
    letterSpacing: 1,
  },

  // BACK BUTTON (same spirit as your other screens)
  backBtn: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD600",
    backgroundColor: "#020617",
  },

  backBtnText: {
    fontFamily: "Bangers",
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "#FFD600",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
