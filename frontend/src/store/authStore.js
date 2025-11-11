import { create } from 'zustand';
import { log } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create((set) => ({
  userId: null,
  token: null,
  isLoading: false,

  setCredentials: (userId, token) => {
    log('authStore.setCredentials', { userId, token });
    set({ userId, token });
  },

  clearCredentials: async () => {
    log('authStore.clearCredentials');
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userId']);
    } catch (e) {
      log('storage remove error', e);
    }
    set({ userId: null, token: null });
  },
}));
