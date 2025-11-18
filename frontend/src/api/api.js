// frontend/src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';
import { log } from '../utils/logger';
import { refresh as refreshSession } from '../services/authService';
import { navigate } from '../navigation/RootNavigation';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

// ------------------------------------------------------
//  REQUEST INTERCEPTOR : ajoute le JWT si présent
// ------------------------------------------------------
api.interceptors.request.use(async (cfg) => {
  const token =
    global?.authToken || (await AsyncStorage.getItem('accessToken')) || null;

  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
    log('API req', cfg.method?.toUpperCase(), cfg.url, 'token present');
  } else {
    log('API req', cfg.method?.toUpperCase(), cfg.url, 'no token');
  }
  return cfg;
});

let isRefreshing = false;
let pending = [];

function onRefreshed(newToken) {
  pending.forEach((cb) => cb(newToken));
  pending = [];
}

// ------------------------------------------------------
//  RESPONSE INTERCEPTOR : gère 401 + refresh
// ------------------------------------------------------
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status || 0;
    const url = original?.url || '';

    // 1) Si le 401 vient déjà de /auth/refresh → pas de boucle infinie
    if (status === 401 && url.includes('/auth/refresh')) {
      log('API error 401 on /auth/refresh → force logout');
      try {
        await AsyncStorage.multiRemove([
          'accessToken',
          'refreshToken',
          'userId',
          'expiresAt',
        ]);
      } catch (e) {
        log('storage clear error after refresh 401', e);
      }
      global.authToken = null;
      navigate('Login');
      throw err;
    }

    // 2) Autres 401 : on tente UN refresh
    if (status === 401 && !original._retry) {
      original._retry = true;

      // Si un refresh est déjà en cours → on s'abonne
      if (isRefreshing) {
        return new Promise((resolve) => {
          pending.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const data = await refreshSession(); // utilise maintenant un axios "nu"
        const newToken =
          data?.accessToken ||
          data?.AccessToken ||
          data?.access_token ||
          null;

        if (!newToken) {
          throw new Error('No token after refresh');
        }

        onRefreshed(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (e) {
        // Refresh KO : on nettoie la session et on renvoie vers Login
        log('Refresh session failed → logout', e);
        try {
          await AsyncStorage.multiRemove([
            'accessToken',
            'refreshToken',
            'userId',
            'expiresAt',
          ]);
        } catch (cleanErr) {
          log('storage clear error after refresh fail', cleanErr);
        }
        global.authToken = null;
        navigate('Login');
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    // 3) Autres erreurs
    log('API error', status, err?.message);
    throw err;
  }
);

export default api;
