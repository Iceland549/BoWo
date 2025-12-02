import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import api from "../api/api";
import { useModalContext } from "@/context/ModalContext";
type DeleteAccountNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "DeleteAccount"
>;

export default function DeleteAccountScreen() {
  const navigation = useNavigation<DeleteAccountNavProp>();
  const { showModal } = useModalContext();
  
    const handleDelete = () => {
        showModal({
            type: "warning",
            title: "Supprimer mon compte ?",
            message: "Cette action est irréversible. Souhaitez-vous vraiment continuer ?",
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
            onConfirm: async () => {
            // 👉 deuxième confirmation
            showModal({
                type: "error",
                title: "Confirmation finale",
                message: "Toute votre progression, XP et vos données seront définitivement perdues.",
                confirmText: "Supprimer définitivement",
                cancelText: "Annuler",
                onConfirm: async () => {
                await api.delete("/auth/account");

                navigation.reset({
                    index: 0,
                    routes: [{ name: "Main" }],
                });
                return true
                }
            });
            return true;
            }
        });
    };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supprimer mon compte</Text>
      <Text style={styles.text}>
        Cette action supprimera définitivement votre email, XP, progression
        et toutes les données associées.
      </Text>

      <TouchableOpacity style={styles.btn} onPress={handleDelete}>
        <Text style={styles.btnText}>Supprimer définitivement</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: {
    fontSize: 28,
    color: "#FF355E",
    fontWeight: "900",
    marginBottom: 20,
  },
  text: { fontSize: 16, color: "#EDECF8", marginBottom: 30 },
  btn: {
    backgroundColor: "#FF355E",
    padding: 16,
    borderRadius: 12,
  },
  btnText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 18,
  },
});
