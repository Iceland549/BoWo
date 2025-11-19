import React, { useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import useAuth from '../../hooks/useAuth';
import { log } from '../../utils/logger';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (loading) return;
    setLoading(true);

    log('LoginScreen.onSubmit', { email });

    try {
      await login({ email, password });
    } catch (err) {
      log('login failed', err);
      alert('Échec de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenWrapper>
        <Text style={styles.title}>BoWo</Text>
        <Text style={styles.subtitle}>Connecte-toi</Text>

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

        <TouchableOpacity style={styles.btn} onPress={onSubmit}>
          {!loading ? (
            <Text style={styles.btnText}>Se connecter</Text>
          ) : (
            <ActivityIndicator color="#111" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Créer un compte</Text>
        </TouchableOpacity>
      </ScreenWrapper>  
    </View>
  );
}

/* -------------------- STYLES SANTA CRUZ -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    padding: 30,
    justifyContent: 'center',
  },

  title: {
    fontSize: 42,
    color: '#0AA5FF',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
    marginBottom: 4,
  },

  subtitle: {
    color: '#FFD600',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    opacity: 0.85,
    letterSpacing: 1,
  },

  input: {
    width: '100%',
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
    backgroundColor: '#FF355E',
    paddingVertical: 14,
    borderRadius: 40,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FFD600',
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
