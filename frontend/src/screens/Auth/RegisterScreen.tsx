import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../../api/api';
import { log } from '../../utils/logger';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    try {
      log('RegisterScreen.register', { email });
      const res = await api.post('/auth/register', { email, password });
      if (res.data?.success) {
        Alert.alert('Success', 'Account created!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', res.data?.message || 'Registration failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Registration failed');
      log('RegisterScreen error', err);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Register</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 8, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 16, padding: 8 }}
      />
      <Button title="Register" onPress={onRegister} />
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
