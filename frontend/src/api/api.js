import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { log } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async cfg => {
  const token = global?.authToken || await AsyncStorage.getItem('accessToken') || null;
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
    log('API req', cfg.method?.toUpperCase(), cfg.url, 'token present');
  } else {
    log('API req', cfg.method?.toUpperCase(), cfg.url, 'no token');
  }
  return cfg;
}, err => Promise.reject(err));

api.interceptors.response.use(res => {
  return res;
}, err => {
  log('API error', err?.response?.status, err?.message);
  return Promise.reject(err);
});

export default api;
