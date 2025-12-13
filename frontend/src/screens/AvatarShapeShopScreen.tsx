// // frontend/src/screens/AvatarShapeShopScreen.tsx
// import React, { useCallback, useMemo, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { useFocusEffect } from "@react-navigation/native";

// // ✅ avatarImages.ts est dans /src/assets (pas /assets), donc on importe depuis src
// import { shapeShopAvatarImages } from "../../assets/avatars/avatarImages";

// import {
//   AvatarShopDto,
//   AvatarShopFamilyDto,
//   AvatarShopItemDto,
//   getAvatarShapeShop,
//   unlockAvatarShapeShop,
// } from "@/services/avatarShapeShopService";

// type TabKey = string;

// export default function AvatarShapeShopScreen() {
//   const [loading, setLoading] = useState(true);
//   const [busyId, setBusyId] = useState<string | null>(null);
//   const [data, setData] = useState<AvatarShopDto | null>(null);
//   const [activeTab, setActiveTab] = useState<TabKey>("");
//   const [error, setError] = useState<string | null>(null);

//   const families: AvatarShopFamilyDto[] = useMemo(
//     () => data?.families ?? [],
//     [data]
//   );

//   const activeFamily = useMemo(() => {
//     if (!families.length) return undefined;
//     return families.find((f) => f.key === activeTab) ?? families[0];
//   }, [families, activeTab]);

//   const items: AvatarShopItemDto[] = useMemo(
//     () => activeFamily?.items ?? [],
//     [activeFamily]
//   );

//   const priceLabel = (cents: number) => {
//     const eur = cents / 100;
//     return `${eur.toFixed(2).replace(".", ",")}€`;
//   };

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const dto = await getAvatarShapeShop();
//       setData(dto);

//       const firstKey = dto?.families?.[0]?.key ?? "";
//       setActiveTab((prev) => (prev && dto?.families?.some((f) => f.key === prev) ? prev : firstKey));
//     } catch (e: any) {
//       const status = e?.response?.status;
//       const serverMsg =
//         e?.response?.data?.message ??
//         e?.response?.data?.error ??
//         e?.response?.data?.title ??
//         null;

//       const msg =
//         serverMsg ??
//         (status ? `HTTP ${status}` : null) ??
//         e?.message ??
//         "Failed to load shop.";

//       setError(String(msg));
//       setData(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // ✅ Un seul déclenchement (sinon double-fetch)
//   useFocusEffect(
//     useCallback(() => {
//       load();
//     }, [load])
//   );

//   const onBuy = useCallback(
//     (item: AvatarShopItemDto) => {
//       if (item.owned || busyId) return;

//       Alert.alert(
//         "Unlock avatar shape",
//         `Buy "${item.displayName}" for ${priceLabel(item.priceCents)} ?`,
//         [
//           { text: "Cancel", style: "cancel" },
//           {
//             text: "Buy",
//             onPress: async () => {
//               setBusyId(item.id);
//               try {
//                 await unlockAvatarShapeShop(item.id);
//                 await load();
//               } catch (e: any) {
//                 const status = e?.response?.status;
//                 const serverMsg =
//                   e?.response?.data?.message ??
//                   e?.response?.data?.error ??
//                   e?.response?.data?.title ??
//                   null;

//                 Alert.alert(
//                   "Error",
//                   serverMsg ??
//                     (status ? `HTTP ${status}` : null) ??
//                     e?.message ??
//                     "Purchase failed."
//                 );
//               } finally {
//                 setBusyId(null);
//               }
//             },
//           },
//         ]
//       );
//     },
//     [busyId, load]
//   );

//   if (loading && !data && !error) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator />
//         <Text style={styles.muted}>Loading shop…</Text>
//       </View>
//     );
//   }

//   if (error && !data) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorTitle}>Shop error</Text>
//         <Text style={styles.errorText}>{error}</Text>
//         <Pressable onPress={load} style={styles.retryBtn}>
//           <Text style={styles.retryText}>Retry</Text>
//         </Pressable>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.page}>
//       <Text style={styles.title}>Avatar Shapes Shop</Text>

//       <View style={styles.tabs}>
//         {families.map((f) => {
//           const selected = f.key === (activeFamily?.key ?? f.key);
//           return (
//             <Pressable
//               key={f.key}
//               onPress={() => setActiveTab(f.key)}
//               style={[styles.tab, selected && styles.tabSelected]}
//             >
//               <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
//                 {f.label || f.key}
//               </Text>
//             </Pressable>
//           );
//         })}
//       </View>

//       {loading && !!data && (
//         <View style={styles.inlineLoading}>
//           <ActivityIndicator />
//           <Text style={styles.muted}>Refreshing…</Text>
//         </View>
//       )}

//       <FlatList
//         data={items}
//         keyExtractor={(it) => it.id}
//         contentContainerStyle={styles.list}
//         renderItem={({ item }) => {
//           const img = (shapeShopAvatarImages as any)[item.id];
//           const owned = item.owned;
//           const busy = busyId === item.id;

//           return (
//             <View style={styles.card}>
//               <View style={styles.cardLeft}>
//                 {img ? (
//                   <Image source={img} style={styles.avatar} resizeMode="contain" />
//                 ) : (
//                   <View style={[styles.avatar, styles.avatarFallback]}>
//                     <Text style={styles.fallbackText}>?</Text>
//                   </View>
//                 )}
//               </View>

//               <View style={styles.cardMid}>
//                 <Text style={styles.name}>{item.displayName}</Text>
//                 <Text style={styles.meta}>
//                   {item.family} • {priceLabel(item.priceCents)}
//                 </Text>
//               </View>

//               <View style={styles.cardRight}>
//                 <Pressable
//                   onPress={() => onBuy(item)}
//                   disabled={owned || busy}
//                   style={[
//                     styles.buyBtn,
//                     owned && styles.buyBtnOwned,
//                     busy && styles.buyBtnBusy,
//                   ]}
//                 >
//                   {busy ? (
//                     <ActivityIndicator />
//                   ) : (
//                     <Text style={styles.buyText}>{owned ? "Owned" : "Buy"}</Text>
//                   )}
//                 </Pressable>
//               </View>
//             </View>
//           );
//         }}
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <Text style={styles.muted}>No items.</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   page: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#3B1C6E", // violet BoWo (comme Profile)
//   },

//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   muted: {
//     opacity: 0.8,
//     marginTop: 10,
//     color: "#E0E0E0",
//     fontWeight: "600",
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "900",
//     marginBottom: 14,
//     color: "#FFD400", // jaune fluo BoWo
//     letterSpacing: 0.6,
//     textTransform: "uppercase",
//   },

//   errorTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     marginBottom: 6,
//     color: "#FFD400",
//   },

//   errorText: {
//     color: "#EAEAEA",
//     textAlign: "center",
//     paddingHorizontal: 18,
//   },

//   retryBtn: {
//     marginTop: 14,
//     borderWidth: 2,
//     borderRadius: 18,
//     paddingVertical: 10,
//     paddingHorizontal: 18,
//     borderColor: "#FFD400",
//   },

//   retryText: {
//     fontWeight: "900",
//     color: "#FFD400",
//   },

//   /* ---------- TABS ---------- */

//   tabs: {
//     flexDirection: "row",
//     marginBottom: 16,
//     flexWrap: "wrap",
//   },

//   tab: {
//     marginRight: 10,
//     marginBottom: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//     backgroundColor: "#2A114F",
//   },

//   tabSelected: {
//     borderColor: "#FFD400",
//     backgroundColor: "#000000",
//   },

//   tabText: {
//     fontWeight: "900",
//     color: "#FFFFFF",
//     textTransform: "uppercase",
//   },

//   tabTextSelected: {
//     color: "#FFD400",
//   },

//   inlineLoading: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   /* ---------- LIST ---------- */

//   list: {
//     paddingBottom: 40,
//   },

//   card: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#0B0714", // dark card
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: "#FFD400",
//     padding: 16,
//     marginBottom: 14,
//   },

//   cardLeft: {
//     marginRight: 14,
//   },

//   avatar: {
//     width: 64,
//     height: 64,
//   },

//   avatarFallback: {
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#1E1E1E",
//     borderRadius: 12,
//   },

//   fallbackText: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: "#FFD400",
//   },

//   cardMid: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: "#FFFFFF",
//   },

//   meta: {
//     marginTop: 4,
//     color: "#CCCCCC",
//     fontWeight: "600",
//   },

//   cardRight: {},

//   buyBtn: {
//     minWidth: 96,
//     height: 40,
//     borderRadius: 999,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 2,
//     borderColor: "#FFD400",
//     backgroundColor: "transparent", // outline BoWo
//     paddingHorizontal: 14,
//   },

//   buyBtnOwned: {
//     borderColor: "#666",
//     opacity: 0.6,
//   },

//   buyBtnBusy: {
//     opacity: 0.85,
//   },

//   buyText: {
//     fontWeight: "900",
//     color: "#FFD400",
//     textTransform: "uppercase",
//   },

//   empty: {
//     paddingTop: 24,
//     alignItems: "center",
//   },
// });

// frontend/src/screens/AvatarShapeShopScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

// ✅ avatarImages.ts est dans /src/assets (pas /assets), donc on importe depuis src
import { shapeShopAvatarImages } from "../../assets/avatars/avatarImages";

import {
  AvatarShopDto,
  AvatarShopFamilyDto,
  AvatarShopItemDto,
  getAvatarShapeShop,
  unlockAvatarShapeShop,
} from "@/services/avatarShapeShopService";

type TabKey = string;

export default function AvatarShapeShopScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [data, setData] = useState<AvatarShopDto | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("");
  const [error, setError] = useState<string | null>(null);

  // ✅ Preview modal
  const [preview, setPreview] = useState<AvatarShopItemDto | null>(null);
  const [buyConfirm, setBuyConfirm] = useState<AvatarShopItemDto | null>(null);
  
  

  const families: AvatarShopFamilyDto[] = useMemo(
    () => data?.families ?? [],
    [data]
  );

  const activeFamily = useMemo(() => {
    if (!families.length) return undefined;
    return families.find((f) => f.key === activeTab) ?? families[0];
  }, [families, activeTab]);

  const items: AvatarShopItemDto[] = useMemo(
    () => activeFamily?.items ?? [],
    [activeFamily]
  );

  const priceLabel = (cents: number) => {
    const eur = cents / 100;
    return `${eur.toFixed(2).replace(".", ",")}€`;
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dto = await getAvatarShapeShop();
      setData(dto);

      const firstKey = dto?.families?.[0]?.key ?? "";
      setActiveTab((prev) =>
        prev && dto?.families?.some((f) => f.key === prev) ? prev : firstKey
      );
    } catch (e: any) {
      const status = e?.response?.status;
      const serverMsg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.response?.data?.title ??
        null;

      const msg =
        serverMsg ??
        (status ? `HTTP ${status}` : null) ??
        e?.message ??
        "Failed to load shop.";

      setError(String(msg));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Un seul déclenchement (sinon double-fetch)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onBuy = useCallback(
    (item: AvatarShopItemDto) => {
      if (item.owned || busyId) return;

        setBuyConfirm(item);

    },
    [busyId]
  );

  const onOpenPreview = useCallback((item: AvatarShopItemDto) => {
    setPreview(item);
  }, []);

  const onClosePreview = useCallback(() => {
    setPreview(null);
  }, []);

  const onBackToPark = useCallback(() => {
    // Comme dans ProfileScreen : retour Park = Home
    navigation.navigate("Home");
  }, [navigation]);

  const previewImg =
    preview?.id ? (shapeShopAvatarImages as any)[preview.id] : null;

  if (loading && !data && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading shop…</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Shop error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={load} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>

        {/* 🔙 BACK TO PARK */}
        <TouchableOpacity style={styles.backBtn} onPress={onBackToPark}>
          <Text style={styles.backBtnText}>Back to Park</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Avatar Shapes Shop</Text>

      <View style={styles.tabs}>
        {families.map((f) => {
          const selected = f.key === (activeFamily?.key ?? f.key);
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveTab(f.key)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                {f.label || f.key}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading && !!data && (
        <View style={styles.inlineLoading}>
          <ActivityIndicator />
          <Text style={styles.muted}>Refreshing…</Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const img = (shapeShopAvatarImages as any)[item.id];
          const owned = item.owned;
          const busy = busyId === item.id;

          return (
            <View style={styles.card}>
              {/* ✅ Zone cliquable pour ouvrir la modale (sans interférer avec Buy) */}
              <Pressable
                style={styles.cardHit}
                onPress={() => onOpenPreview(item)}
              >
                <View style={styles.cardLeft}>
                  {img ? (
                    <Image
                      source={img}
                      style={styles.avatar}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={styles.fallbackText}>?</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardMid}>
                  <Text style={styles.name}>{item.displayName}</Text>
                  <Text style={styles.meta}>
                    {item.family} • {priceLabel(item.priceCents)}
                  </Text>
                  <Text style={styles.tapHint}>Tap to preview</Text>
                </View>
              </Pressable>

              <View style={styles.cardRight}>
                <Pressable
                  onPress={() => onBuy(item)}
                  disabled={owned || busy}
                  style={[
                    styles.buyBtn,
                    owned && styles.buyBtnOwned,
                    busy && styles.buyBtnBusy,
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.buyText}>{owned ? "Owned" : "Buy"}</Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.muted}>No items.</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.backBtn} onPress={onBackToPark}>
            <Text style={styles.backBtnText}>Back to Park</Text>
          </TouchableOpacity>
        }
      />

      {/* ===================== PREVIEW MODAL ===================== */}
      <Modal
        visible={!!preview}
        transparent
        animationType="fade"
        onRequestClose={onClosePreview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Pressable style={styles.modalClose} onPress={onClosePreview}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>{preview?.displayName ?? ""}</Text>
            <Text style={styles.modalSubtitle}>
              {(preview?.family ?? "") +
                (preview ? ` • ${priceLabel(preview.priceCents)}` : "")}
            </Text>

            <View style={styles.modalImageWrap}>
              {previewImg ? (
                <Image
                  source={previewImg}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.modalFallback}>
                  <Text style={styles.modalFallbackText}>No image</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={onClosePreview}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ===================== BUY CONFIRM MODAL ===================== */}
        <Modal
        visible={!!buyConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setBuyConfirm(null)}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
            <Pressable style={styles.modalClose} onPress={() => setBuyConfirm(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>

            <Text style={styles.modalTitle}>UNLOCK AVATAR</Text>

            <Text style={styles.modalSubtitle}>
                {buyConfirm?.displayName ?? ""} •{" "}
                {buyConfirm ? priceLabel(buyConfirm.priceCents) : ""}
            </Text>

            <View style={{ marginTop: 18 }}>
                <Pressable
                style={[styles.modalBtn, { backgroundColor: "#FFD400" }]}
                onPress={async () => {
                    if (!buyConfirm) return;

                    const current = buyConfirm; // capture
                    setBuyConfirm(null);

                    setBusyId(current.id);
                    try {
                    await unlockAvatarShapeShop(current.id);
                    await load();
                    } finally {
                    setBusyId(null);
                    }
                }}
                >
                <Text style={[styles.modalBtnText, { color: "#111" }]}>
                    CONFIRM
                </Text>
                </Pressable>

                <Pressable
                style={[
                    styles.modalBtn,
                    {
                    marginTop: 10,
                    backgroundColor: "transparent",
                    borderColor: "#666",
                    },
                ]}
                onPress={() => setBuyConfirm(null)}
                >
                <Text style={[styles.modalBtnText, { color: "#FFF" }]}>
                    CANCEL
                </Text>
                </Pressable>
            </View>
            </View>
        </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 16,
    backgroundColor: "#3B1C6E", // violet BoWo
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  muted: {
    opacity: 0.85,
    marginTop: 10,
    color: "#E0E0E0",
    fontWeight: "600",
    fontFamily: "Bangers",
    letterSpacing: 0.6,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 14,
    color: "#FFD400",
    letterSpacing: 1,
    textTransform: "uppercase",
    fontFamily: "Bangers",
    textShadowColor: "#000",
    textShadowRadius: 8,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
    color: "#FFD400",
    fontFamily: "Bangers",
    letterSpacing: 1,
  },

  errorText: {
    color: "#EAEAEA",
    textAlign: "center",
    paddingHorizontal: 18,
    fontWeight: "700",
  },

  retryBtn: {
    marginTop: 14,
    borderWidth: 2,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderColor: "#FFD400",
    backgroundColor: "#020617",
  },

  retryText: {
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: "Bangers",
    fontSize: 22,
    letterSpacing: 1,
    textShadowColor: "#FFD400",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  /* ---------- TABS ---------- */

  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: "wrap",
  },

  tab: {
    marginRight: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    backgroundColor: "#2A114F",
  },

  tabSelected: {
    borderColor: "#FFD400",
    backgroundColor: "#000000",
  },

  tabText: {
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
    fontFamily: "Bangers",
    letterSpacing: 0.8,
    fontSize: 18,
  },

  tabTextSelected: {
    color: "#FFD400",
  },

  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  /* ---------- LIST ---------- */

  list: {
    paddingBottom: 24,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B0714",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFD400",
    padding: 14,
    marginBottom: 14,
  },

  // zone pressable (left + mid)
  cardHit: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  cardLeft: { marginRight: 14 },

  avatar: { width: 64, height: 64 },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
  },

  fallbackText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFD400",
    fontFamily: "Bangers",
  },

  cardMid: { flex: 1 },

  name: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: "Bangers",
    letterSpacing: 0.8,
  },

  meta: {
    marginTop: 2,
    color: "#CCCCCC",
    fontWeight: "700",
  },

  tapHint: {
    marginTop: 6,
    color: "#0AA5FF",
    fontWeight: "900",
    fontFamily: "Bangers",
    letterSpacing: 0.8,
  },

  cardRight: {},

  buyBtn: {
    minWidth: 110,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFD400",
    backgroundColor: "#FFD400",
    paddingHorizontal: 14,
  },

  buyBtnOwned: {
    borderColor: "#666",
    backgroundColor: "#2C2C2C",
    opacity: 0.7,
  },

  buyBtnBusy: {
    opacity: 0.85,
  },

  buyText: {
    fontWeight: "900",
    color: "#111",
    textTransform: "uppercase",
    fontFamily: "Bangers",
    fontSize: 20,
    letterSpacing: 1,
  },

  empty: { paddingTop: 24, alignItems: "center" },

  /* ---------- BACK TO PARK ---------- */

  backBtn: {
    marginTop: 18,
    marginBottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD400",
    backgroundColor: "#020617",
  },

  backBtnText: {
    fontFamily: "Bangers",
    fontSize: 26,
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "#FFD400",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },

  /* ---------- MODAL PREVIEW ---------- */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#1A1B20",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFD400",
    padding: 18,
  },

  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 2,
    borderColor: "#FFD400",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  modalCloseText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
  },

  modalTitle: {
    fontFamily: "Bangers",
    fontSize: 30,
    color: "#FFD400",
    textAlign: "center",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 6,
  },

  modalSubtitle: {
    color: "#EDECF8",
    textAlign: "center",
    marginTop: 6,
    fontWeight: "700",
    marginBottom: 12,
  },

  modalImageWrap: {
    width: "100%",
    height: 320,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#0AA5FF",
    backgroundColor: "#0B0714",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  modalImage: {
    width: "92%",
    height: "92%",
  },

  modalFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  modalFallbackText: {
    color: "#9FA0A8",
    fontWeight: "800",
  },

  modalBtn: {
    marginTop: 14,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD400",
    backgroundColor: "#0AA5FF",
  },

  modalBtnText: {
    fontFamily: "Bangers",
    fontSize: 24,
    color: "#111",
    letterSpacing: 1,
  },
});

