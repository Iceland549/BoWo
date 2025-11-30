import React, { useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import api from '../../api/api';
import { log } from '../../utils/logger';
import useModal from '../../hooks/useModal';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showModal } = useModal();
  
  const onRegister = async () => {
    if (loading) return;

    if (!email || !password) {
      showModal({
        type: 'error',
        title: 'Champs manquants',
        message: 'Email et mot de passe sont requis.',
        confirmText: 'OK',
      });
      return;
    }

    try {
      setLoading(true);
      log('RegisterScreen.register', { email });

      const res = await api.post('/account/register', { email, password });

      if (res.data?.success) {
        showModal({
          type: 'success',
          title: 'Compte créé 🎉',
          message: 'Ton compte a été créé avec succès !',
          confirmText: 'Se connecter',
          onConfirm: () => navigation.navigate('Login'),
        });
      } else {
        showModal({
          type: 'error',
          title: 'Erreur',
          message: res.data?.message || 'Impossible de créer le compte.',
          confirmText: 'OK',
        });
      }
    } catch (err) {
      log('RegisterScreen error', err);
      const msg = err?.response?.data?.message || 'Registration failed';
      showModal({
        type: 'error',
        title: 'Erreur réseau',
        message: msg,
        confirmText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenWrapper>
        <Text style={styles.title}>Créer un compte</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.btn} onPress={onRegister}>
          {!loading ? (
            <Text style={styles.btnText}>Créer</Text>
          ) : (
            <ActivityIndicator color="#111" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Retour à la connexion</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    </View>
  );
}

/* -------------------- STYLES SANTA CRUZ -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3a1a6b',
    padding: 30,
    justifyContent: 'center',
  },

  title: {
    fontSize: 32,
    color: '#0AA5FF',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 30,
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  input: {
    backgroundColor: '#1A1B20',
    color: 'white',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#0AA5FF',
  },

  btn: {
    backgroundColor: '#FFD600',
    paddingVertical: 14,
    borderRadius: 40,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FF355E',
  },

  btnText: {
    textAlign: 'center',
    color: '#111215',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  link: {
    color: '#0AA5FF',
    textAlign: 'center',
    marginTop: 18,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
