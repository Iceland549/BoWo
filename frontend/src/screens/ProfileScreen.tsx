import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { getProfile, logout } from '../services/authService';
import { log } from '../utils/logger';

export default function ProfileScreen({ navigation }) {
  const { userId, clearCredentials } = useAuthStore();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        log('Profile loaded', data);
      } catch (err) {
        log('ProfileScreen error', err);
      }
    })();
  }, []);

  const onLogout = async () => {
    await logout();
    clearCredentials();
    navigation.replace('Login');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>My Board, My World</Text>
      {profile ? (
        <>
          <Text>User ID: {userId}</Text>
          <Text>Email: {profile.email}</Text>
          <Text>Unlocked Tricks: {profile.unlockedTricks?.length || 0}</Text>
        </>
      ) : (
        <Text>Loading profile...</Text>
      )}
      <Button title="Logout" onPress={onLogout} />
    </View>
  );
}
