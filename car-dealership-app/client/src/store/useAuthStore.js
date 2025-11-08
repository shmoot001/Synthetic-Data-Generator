import { create } from 'zustand';
import { currentUser, login as apiLogin, logout as apiLogout } from '../lib/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  status: 'idle',
  error: null,
  async load() {
    set({ status: 'loading' });
    try {
      const user = await currentUser();
      set({ user, status: 'success', error: null });
    } catch (error) {
      set({ status: 'error', error: error.message, user: null });
    }
  },
  async login(credentials) {
    set({ status: 'loading' });
    try {
      const user = await apiLogin(credentials);
      set({ user, status: 'success', error: null });
      return user;
    } catch (error) {
      set({ status: 'error', error: error.response?.data?.message || 'Inloggningen misslyckades' });
      throw error;
    }
  },
  async logout() {
    await apiLogout();
    set({ user: null, status: 'idle', error: null });
  }
}));
