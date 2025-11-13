import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

const saveSession = async ({ accessToken, refreshToken, userId, expiresAt }) => {
  if (accessToken) {
    await AsyncStorage.setItem('accessToken', accessToken);
    global.authToken = accessToken;
  }
  if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
  if (userId)       await AsyncStorage.setItem('userId', userId);
  if (expiresAt)    await AsyncStorage.setItem('expiresAt', String(expiresAt));
};

export async function login({ email, password }) {
  log('authService.login', { email });
  const { data } = await api.post('/auth/login', { email, password });
  await saveSession({
    accessToken: data.accessToken || data.AccessToken || data.access_token,
    refreshToken: data.refreshToken || data.RefreshToken,
    userId: data.userId || data.UserId,
    expiresAt: data.expiresAt || data.ExpiresAt
  });
  return data;
}

export async function refresh() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (!refreshToken) return null;
  const { data } = await api.post('/auth/refresh', { refreshToken });
  await saveSession({
    accessToken: data.accessToken || data.AccessToken || data.access_token,
    refreshToken: data.refreshToken || data.RefreshToken,
    userId: data.userId || data.UserId,
    expiresAt: data.expiresAt || data.ExpiresAt
  });
  return data;
}

export async function logout() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  try {
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
  } catch (e) {
    log('remote logout error (ignored)', e);
  }
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId', 'expiresAt']);
  global.authToken = null;
  return true;
}
