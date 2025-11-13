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

api.interceptors.request.use(async (cfg) => {
  const token = global?.authToken || (await AsyncStorage.getItem('accessToken')) || null;
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

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const status = err?.response?.status;

    // si 401 et pas déjà retenté: tente un refresh
    if (status === 401 && !original._retry) {
      original._retry = true;

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
        const data = await refreshSession(); // appelle /auth/refresh
        const newToken = data?.accessToken || data?.AccessToken || data?.access_token;
        if (!newToken) throw new Error('No token after refresh');
        onRefreshed(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (_e) {
        // refresh KO: on nettoie la session
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'expiresAt']);
        global.authToken = null;
        navigate('Login');
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    log('API error', status, err?.message);
    throw err;
  }
);

export default api;
