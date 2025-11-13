import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import { login as apiLogin, logout as apiLogout } from '../services/authService';
import { log } from '../utils/logger';

/**
 * Custom hook useAuth()
 * Gère la logique d'authentification côté client :
 * - Initialisation à partir du stockage local (AsyncStorage)
 * - Connexion / déconnexion
 * - Synchronisation avec Zustand (authStore)
 * - Gestion d'un état "loading" pour indiquer les transitions
 */
export default function useAuth() {
  const { setCredentials, clearCredentials } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // 🔹 Initialisation au montage : vérifie si un token existe déjà
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [userId, token] = await Promise.all([
          AsyncStorage.getItem('userId'),
          AsyncStorage.getItem('accessToken'),
        ]);

        if (active) {
          if (token && userId) {
            setCredentials(userId, token);
            log('useAuth init: user authenticated', { userId });
          } else {
            log('useAuth init: no existing session');
          }
        }
      } catch (err) {
        log('useAuth init error', err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false; // évite les setState après démontage
    };
  }, [setCredentials]);

  // 🔹 Connexion utilisateur
  const login = async (creds) => {
    setLoading(true);
    try {
      const res = await apiLogin(creds);

      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');

      if (token && userId) {
        setCredentials(userId, token);
        log('Login success: token stored', { userId });
      } else {
        log('Login warning: token or userId missing after login');
      }

      return res;
    } catch (err) {
      log('Login error', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Déconnexion utilisateur
  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'expiresAt']);
      clearCredentials();
      log('Logout success: credentials cleared');
    } catch (err) {
      log('Logout error', err);
    } finally {
      setLoading(false);
    }
  };

  return { login, logout, loading };
}
