import { apiClient } from '../api-client';
import {
  AuthResponse,
  RegisterResponse,
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  OAuthPayload,
  UserProfile,
  AuthTokens,
} from '@aurora/types';

export const authService = {
  /**
   * Log in with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', payload, {
      requiresAuth: false,
    });
  },

  /**
   * Register a new account
   */
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', payload, {
      requiresAuth: false,
    });
  },

  /**
   * Verify 6-digit email OTP
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/verify-otp', payload, {
      requiresAuth: false,
    });
  },

  /**
   * Resend verification OTP to email
   */
  async resendOtp(payload: ResendOtpPayload): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>('/auth/resend-otp', payload, {
      requiresAuth: false,
    });
  },

  /**
   * Authenticate with Google OAuth token
   */
  async googleLogin(payload: OAuthPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/google', payload, {
      requiresAuth: false,
    });
  },

  /**
   * Authenticate with Apple OAuth token
   */
  async appleLogin(payload: OAuthPayload): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/apple', payload, {
      requiresAuth: false,
    });
  },

  /**
   * Refresh JWT Token pair
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return apiClient.post<AuthTokens>(
      '/auth/refresh',
      { refreshToken },
      { requiresAuth: false },
    );
  },

  /**
   * Logout current session on server
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post<void>('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/me', { requiresAuth: true });
  },
};
