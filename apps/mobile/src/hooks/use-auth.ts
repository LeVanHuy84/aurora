import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/modules/auth.service';
import {
  LoginPayload,
  RegisterPayload,
  OAuthPayload,
  AuthResponse,
  RegisterResponse,
  VerifyOtpPayload,
  ResendOtpPayload,
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
      if (!data.requiresEmailVerification && data.tokens && data.user) {
        await setSession(data.user, data.tokens);
        queryClient.setQueryData(['user', 'me'], data.user);
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: async (data: RegisterResponse) => {
      if (!data.requiresEmailVerification && data.tokens && data.user) {
        await setSession(data.user, data.tokens);
        queryClient.setQueryData(['user', 'me'], data.user);
      }
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
    onSuccess: async (data: AuthResponse) => {
      await setSession(data.user, data.tokens);
      queryClient.setQueryData(['user', 'me'], data.user);
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: (payload: ResendOtpPayload) => authService.resendOtp(payload),
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
    verifyOtpMutation.isPending ||
    resendOtpMutation.isPending ||
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
    verifyOtp: verifyOtpMutation.mutateAsync,
    resendOtp: resendOtpMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutateAsync,
    appleLogin: appleLoginMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verifyOtpError: verifyOtpMutation.error,
    resendOtpError: resendOtpMutation.error,
    googleError: googleLoginMutation.error,
    appleError: appleLoginMutation.error,
    resetErrors: () => {
      loginMutation.reset();
      registerMutation.reset();
      verifyOtpMutation.reset();
      resendOtpMutation.reset();
      googleLoginMutation.reset();
      appleLoginMutation.reset();
    },
  };
}
