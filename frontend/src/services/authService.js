// frontend/src/services/authService.js
import axios from 'axios';
import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';
import { log } from '../utils/logger';

const saveSession = async ({ accessToken, refreshToken, userId, expiresAt }) => {
  if (accessToken) {
    await AsyncStorage.setItem('accessToken', accessToken);
    global.authToken = accessToken;
  }
  if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
  if (userId) await AsyncStorage.setItem('userId', userId);
  if (expiresAt) await AsyncStorage.setItem('expiresAt', String(expiresAt));
};

// petit helper pour gérer le wrapper ApiResponse<T>
const unwrap = (apiData) => {
  if (
    apiData &&
    typeof apiData === 'object' &&
    'data' in apiData &&
    'success' in apiData
  ) {
    return apiData.data; // ApiResponse<T> → T
  }
  return apiData;
};

export async function login({ email, password }) {
  log('authService.login', { email });
  const { data } = await api.post('/auth/login', { email, password });

  const payload = unwrap(data);

  await saveSession({
    accessToken:
      payload?.accessToken || payload?.AccessToken || payload?.access_token,
    refreshToken: payload?.refreshToken || payload?.RefreshToken,
    userId: payload?.userId || payload?.UserId,
    expiresAt: payload?.expiresAt || payload?.ExpiresAt,
  });

  return data;
}

// ------------------------------------------------------
//  REFRESH TOKEN : axios "nu" pour éviter d'empiler les interceptors
// ------------------------------------------------------
export async function refresh() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) {
    log('authService.refresh → no refreshToken in storage');
    return null;
  }

  // ⚠️ on N’UTILISE PAS l’instance `api` ici
  const { data } = await axios.post(
    `${API_BASE_URL}/api/auth/refresh`,
    { refreshToken }
  );

  const payload = unwrap(data);

  await saveSession({
    accessToken:
      payload?.accessToken || payload?.AccessToken || payload?.access_token,
    refreshToken: payload?.refreshToken || payload?.RefreshToken,
    userId: payload?.userId || payload?.UserId,
    expiresAt: payload?.expiresAt || payload?.ExpiresAt,
  });

  return data;
}

// ------------------------------------------------------
//  PROFIL "SKATE" = PROGRESSION JOUEUR (ContentMicroservice /progress)
// ------------------------------------------------------
export async function getProfile() {
  try {
    // → via gateway: /api/progress → ContentMicroservice /progress
    const { data } = await api.get('/progress');
    return unwrap(data); // ApiResponse<UserProgressDto> → UserProgressDto
  } catch (err) {
    log('authService.getProfile error', err);
    throw err;
  }
}

export async function logout() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } catch (e) {
    log('remote logout error (ignored)', e);
  }
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'expiresAt']);
  global.authToken = null;
  return true;
}
