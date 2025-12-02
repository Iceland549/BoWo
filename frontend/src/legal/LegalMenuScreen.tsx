import React from "react";
import { Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenWrapper from "../components/ScreenWrapper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type LegalMenuNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LegalMenu"
>;

export default function LegalMenuScreen() {
  const navigation = useNavigation<LegalMenuNavigationProp>();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Informations Légales</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Terms")}
        >
          <Text style={styles.cardTitle}>CGU / Terms of Use</Text>
          <Text style={styles.cardDesc}>Règles d’utilisation de l’application BoWo.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Privacy")}
        >
          <Text style={styles.cardTitle}>Politique de Confidentialité</Text>
          <Text style={styles.cardDesc}>Vos données, vos droits, notre responsabilité.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderColor: "#FF355E" }]}
          onPress={() => navigation.navigate("DeleteAccount")}
        >
          <Text style={[styles.cardTitle, { color: "#FF355E" }]}>Supprimer mon compte</Text>
          <Text style={styles.cardDesc}>Suppression complète et définitive.</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    color: "#0AA5FF",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "#FF355E",
    textShadowRadius: 6,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#1A1B20",
    borderWidth: 2,
    borderColor: "#FFD600",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    color: "#FFD600",
    fontSize: 20,
    fontWeight: "900",
  },
  cardDesc: {
    color: "#EDECF8",
    marginTop: 6,
    fontSize: 15,
  },
});
