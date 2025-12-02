import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";

export default function PrivacyScreen() {
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Politique de Confidentialité</Text>

        <Text style={styles.text}>
          BoWo collecte uniquement les données nécessaires : email, progression,
          XP, mini-jeux débloqués, tricks appris et statistiques internes.
        </Text>

        <Text style={styles.heading}>1. Données collectées</Text>
        <Text style={styles.text}>
          - Email{"\n"}
          - Mot de passe (haché){"\n"}
          - XP global{"\n"}
          - Tricks débloqués{"\n"}
          - Mini-jeux débloqués{"\n"}
          - Statistiques anonymes{"\n"}
        </Text>

        <Text style={styles.heading}>2. Finalités</Text>
        <Text style={styles.text}>
        Les données servent à : authentifier l’utilisateur, suivre la progression,
        débloquer du contenu, et améliorer l’expérience.
        </Text>


        <Text style={styles.heading}>3. Publicité</Text>
        <Text style={styles.text}>
          BoWo utilise Google AdMob. Des identifiants publicitaires anonymes peuvent être utilisés.
        </Text>

        <Text style={styles.heading}>4. Suppression</Text>
        <Text style={styles.text}>
          l’utilisateur peut supprimer son compte depuis la page “Supprimer mon compte”.
        </Text>

        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.text}>support@bowo.app</Text>
      </ScrollView>
    </ScreenWrapper>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "#0AA5FF",
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "#FF355E",
    textShadowRadius: 6,
  },
  heading: {
    marginTop: 20,
    fontSize: 20,
    color: "#FFD600",
    fontWeight: "900",
  },
  text: {
    marginTop: 10,
    fontSize: 15,
    color: "#EDECF8",
    lineHeight: 22,
  },
});
