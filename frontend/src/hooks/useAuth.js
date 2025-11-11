import { useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../services/authService';
import { log } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAuth() {
  const [userId, setUserId] = useState(() => AsyncStorage.getItem('userId'));
  const [token, setToken] = useState(() => AsyncStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [u, t] = await Promise.all([
          AsyncStorage.getItem('userId'),
          AsyncStorage.getItem('accessToken'),
        ]);
        if (mounted) {
          setUserId(u);
          setToken(t);
        }
        log('useAuth init', { userId: u, token: !!t });
      } catch (e) {
        log('useAuth init error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (creds) => {
    setLoading(true);
    const res = await apiLogin(creds);
    const t = await AsyncStorage.getItem('accessToken');
    const u = await AsyncStorage.getItem('userId');
    setToken(t);
    setUserId(u);
    setLoading(false);
    return res;
  };


  const logout = async () => {
    setLoading(true);
    await apiLogout();
    setToken(null);
    setUserId(null);
    setLoading(false);
  };

  return { userId, token, login, logout, loading };
}
