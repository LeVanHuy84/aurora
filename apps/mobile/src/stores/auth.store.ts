import { create } from 'zustand';
import { UserProfile, AuthTokens } from '@aurora/types';
import { tokenStorage } from '../services/token-storage';
import { authService } from '../services/modules/auth.service';

interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  setSession: (user: UserProfile, tokens: AuthTokens) => Promise<void>;
  setUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setSession: async (user: UserProfile, tokens: AuthTokens) => {
    await tokenStorage.setTokens(tokens);
    set({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setUser: (user: UserProfile) => {
    set({ user });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // Ignore network error during logout
    } finally {
      await tokenStorage.clearTokens();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  initAuth: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();

      if (!accessToken && !refreshToken) {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
        return;
      }

      // Fetch user profile to verify current session
      const user = await authService.getMe();
      set({
        user,
        tokens: {
          accessToken: accessToken || '',
          refreshToken: refreshToken || '',
        },
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.warn('Session verification failed, logging out', error);
      await tokenStorage.clearTokens();
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },
}));
