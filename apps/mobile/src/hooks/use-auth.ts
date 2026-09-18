import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/modules/auth.service';
import {
  LoginPayload,
  RegisterPayload,
  OAuthPayload,
  AuthResponse,
} from '@aurora/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    isLoading: isStoreLoading,
    isInitialized,
    setSession,
    logout: storeLogout,
    initAuth,
  } = useAuthStore();

  // Local login mutation
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: async (data: AuthResponse) => {
      await setSession(data.user, data.tokens);
      queryClient.setQueryData(['user', 'me'], data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: async (data: AuthResponse) => {
      await setSession(data.user, data.tokens);
      queryClient.setQueryData(['user', 'me'], data.user);
    },
  });

  // Google OAuth mutation
  const googleLoginMutation = useMutation({
    mutationFn: (payload: OAuthPayload) => authService.googleLogin(payload),
    onSuccess: async (data: AuthResponse) => {
      await setSession(data.user, data.tokens);
      queryClient.setQueryData(['user', 'me'], data.user);
    },
  });

  // Apple OAuth mutation
  const appleLoginMutation = useMutation({
    mutationFn: (payload: OAuthPayload) => authService.appleLogin(payload),
    onSuccess: async (data: AuthResponse) => {
      await setSession(data.user, data.tokens);
      queryClient.setQueryData(['user', 'me'], data.user);
    },
  });

  // Logout handler
  const logout = async () => {
    queryClient.clear();
    await storeLogout();
  };

  const isPending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    googleLoginMutation.isPending ||
    appleLoginMutation.isPending ||
    isStoreLoading;

  return {
    user,
    isAuthenticated,
    isLoading: isPending,
    isInitialized,
    initAuth,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutateAsync,
    appleLogin: appleLoginMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    googleError: googleLoginMutation.error,
    appleError: appleLoginMutation.error,
    resetErrors: () => {
      loginMutation.reset();
      registerMutation.reset();
      googleLoginMutation.reset();
      appleLoginMutation.reset();
    },
  };
}
