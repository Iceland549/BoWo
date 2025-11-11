import api from '../api/api';
import { log } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function login({ email, password }) {
  log('authService.login attempt', email);
  const { data } = await api.post('/auth/login', { email, password });
  const token = data.accessToken || data.token || data.access_token;
  const refresh = data.refreshToken || data.refresh_token;
  const userId = data.userId || data.user?.id;
  if (token) {
    try {
      await AsyncStorage.setItem('accessToken', token);
      if (refresh) await AsyncStorage.setItem('refreshToken', refresh);
      if (userId) await AsyncStorage.setItem('userId', userId);
      global.authToken = token;
      log('login success, token stored, userId=', userId);
    } catch (e) {
      log('storage error', e);
    }
  }
  return data;
}

export async function logout() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  log('authService.logout', { refreshToken: !!refreshToken });
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      log('logout remote error', e);
    }
  }
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('userId');
  global.authToken = null;
  return true;
}

export async function getProfile() {
  const { data } = await api.get('/profile/me');
  return data;
}
