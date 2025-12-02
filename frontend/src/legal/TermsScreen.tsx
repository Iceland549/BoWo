import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";

export default function TermsScreen() {
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Conditions Générales d’Utilisation (CGU)</Text>

        <Text style={styles.text}>
          Cette application “BoWo – My Board, My World” permet l’apprentissage du skateboard,
          la progression, les mini-jeux, les vidéos et quiz.
          En utilisant BoWo, vous acceptez ces conditions.
        </Text>

        <Text style={styles.heading}>1. Objet</Text>
        <Text style={styles.text}>
          BoWo est une application éducative visant à aider les utilisateurs à apprendre et
          améliorer leurs tricks de skateboard à travers des vidéos, images, progression XP,
          mini-jeux et contenus pédagogiques.
        </Text>

        <Text style={styles.heading}>2. Compte utilisateur</Text>
        <Text style={styles.text}>
          La création d’un compte nécessite une adresse email et un mot de passe.
          Vous êtes responsable de la confidentialité de vos identifiants.
        </Text>

        <Text style={styles.heading}>3. Contenu</Text>
        <Text style={styles.text}>
          Les vidéos, images, textes, descriptions, tips, mini-jeux et illustrations
          appartiennent à leurs auteurs ou à BoWo.
        </Text>

        <Text style={styles.heading}>4. Activité physique</Text>
        <Text style={styles.text}>
          La pratique du skateboard comporte des risques. BoWo ne peut être tenu responsable
          des blessures causées par une mauvaise exécution des tricks.
        </Text>

        <Text style={styles.heading}>5. Publicités</Text>
        <Text style={styles.text}>
          BoWo utilise Google AdMob. Certaines données non personnelles peuvent être collectées
          pour afficher des publicités pertinentes.
        </Text>

        <Text style={styles.heading}>6. Achats intégrés</Text>
        <Text style={styles.text}>
          Certains contenus peuvent être proposés sous forme d’achats intégrés via Google Play.
        </Text>

        <Text style={styles.heading}>7. Modifications</Text>
        <Text style={styles.text}>
          BoWo peut mettre à jour ces CGU à tout moment. Vous serez notifié en cas de changement.
        </Text>

        <Text style={styles.heading}>8. Contact</Text>
        <Text style={styles.text}>support@bowo.app</Text>

        {/* ENGLISH VERSION */}
        <Text style={styles.title}>Terms of Use (EN)</Text>

        <Text style={styles.text}>
          “BoWo – My Board, My World” is an educational skateboarding application.
          By using this app, you agree to these Terms.
        </Text>

        <Text style={styles.heading}>1. Purpose</Text>
        <Text style={styles.text}>
          BoWo helps users learn skateboard tricks using videos, tutorials, XP progression,
          and mini-games.
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
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
