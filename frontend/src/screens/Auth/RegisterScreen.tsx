import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../../api/api';
import { log } from '../../utils/logger';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Error", "Email and password required.");
      return;
    }

    try {
      setLoading(true);
      log('RegisterScreen.register', { email });

      const res = await api.post('/account/register', { email, password });

      if (res.data?.success) {
        Alert.alert('Success', 'Account created!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', res.data?.message || 'Registration failed');
      }

    } catch (err: any) {
      log('RegisterScreen error', err);
      const msg = err?.response?.data?.message || "Registration failed";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Register</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
      />

      <Button title={loading ? "Please wait..." : "Register"} onPress={onRegister} />
      <View style={{ height: 12 }} />
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
