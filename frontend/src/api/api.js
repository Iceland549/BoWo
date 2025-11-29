// frontend/src/api/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';
import { log } from '../utils/logger';
import { refresh as refreshSession } from '../services/authService';
import { useAuthStore } from '../store/authStore'; // 👈 AJOUT

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
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status || 0;
    const url = originalRequest?.url || '';

    // 🔹 Si ce n'est PAS un 401, on laisse passer l'erreur
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 🔹 On ne tente pas de refresh sur les routes d’auth elles-mêmes
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // 🔁 si un refresh est déjà en cours, on met la requête en attente
      return new Promise((resolve, reject) => {
        pending.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // 🔄 appelle /auth/refresh (via authService.refresh)
      await refreshSession();

      // 👉 ATTENTION : authService.refresh a déjà appelé saveSession()
      // donc le nouveau token est dans global.authToken ou AsyncStorage
      const newToken =
        global?.authToken || (await AsyncStorage.getItem('accessToken'));

      if (!newToken) {
        throw new Error('No token after refresh');
      }

      // 🔔 réveille les requêtes en attente
      onRefreshed(newToken);

      // 🧠 rejoue la requête originale avec le nouveau token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      log('Refresh session failed → forcing logout', refreshErr);

      // 🔻 On vide proprement le store + le stockage
      try {
        const { clearCredentials } = useAuthStore.getState();
        await clearCredentials();
      } catch (_e) {
        // fallback au cas où
        await AsyncStorage.multiRemove([
          'accessToken',
          'refreshToken',
          'userId',
          'expiresAt',
        ]);
        global.authToken = null;
      }

      // ❌ IMPORTANT : plus de navigate('Login') ici
      // AppNavigator basculera tout seul sur AuthNavigator car le token du store = null

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
      pending = [];
    }
  }
);


export default api;
