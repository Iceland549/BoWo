import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import useAuth from '../../hooks/useAuth';
import { log } from '../../utils/logger';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    log('LoginScreen.onSubmit', { email });
    try {
      await login({ email, password });
    } catch (err) {
      log('login failed', err);
      alert('Login failed');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>BoWo — Sign in</Text>
      <TextInput placeholder="email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput placeholder="password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Sign in" onPress={onSubmit} />
      <Text onPress={() => navigation.navigate('Register')}>Create account</Text>
    </View>
  );
}
