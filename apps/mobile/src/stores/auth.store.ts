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
  updateTokens: (tokens: AuthTokens) => void;
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

  updateTokens: (tokens: AuthTokens) => {
    set({
      tokens,
      isAuthenticated: true,
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

      // Fetch user profile to verify current session (will auto-refresh token if accessToken expired)
      const user = await authService.getMe();
      const latestAccessToken = (await tokenStorage.getAccessToken()) || accessToken || '';
      const latestRefreshToken = (await tokenStorage.getRefreshToken()) || refreshToken || '';

      set({
        user,
        tokens: {
          accessToken: latestAccessToken,
          refreshToken: latestRefreshToken,
        },
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error: any) {
      console.warn('Session verification failed during initAuth', error);
      // Only clear tokens if unauthorized (401/403), do NOT log out on temporary network failure
      const isUnauthorized = error?.statusCode === 401 || error?.statusCode === 403;
      if (isUnauthorized) {
        await tokenStorage.clearTokens();
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        // Keep authenticated state for offline/network retry
        set({
          isLoading: false,
          isInitialized: true,
        });
      }
    }
  },
}));
