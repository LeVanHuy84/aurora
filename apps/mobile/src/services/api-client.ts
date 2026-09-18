import { Platform } from 'react-native';
import i18n from '../i18n';
import { tokenStorage } from './token-storage';
import { ApiResponse } from '@aurora/types';

const DEFAULT_TIMEOUT_MS = 15000;

// Default development API URL depending on platform
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }
  return 'http://localhost:3000/api/v1';
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
  timeoutMs?: number;
}

export class ApiError extends Error {
  statusCode: number;
  error?: string;
  data?: any;

  constructor(message: string, statusCode: number, error?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
    this.data = data;
  }
}

/**
 * Normalizes raw network exceptions and server errors into user-friendly localized messages.
 */
function normalizeErrorMessage(err: any, statusCode = 0, responseData?: any): string {
  // 1. If backend returned a structured message (e.g. from nestjs-i18n or ValidationPipe)
  if (responseData && typeof responseData === 'object' && responseData.message) {
    const rawMsg = Array.isArray(responseData.message)
      ? responseData.message.join(', ')
      : String(responseData.message);

    // If the message is an error code key, attempt i18n lookup
    if (rawMsg === 'INVALID_CREDENTIALS') {
      return i18n.t('auth.errors.loginFailed');
    }
    if (rawMsg === 'EMAIL_EXISTS' || rawMsg === 'USERNAME_EXISTS') {
      return i18n.t('auth.errors.registerFailed');
    }
    return rawMsg;
  }

  // 2. Timeout error
  if (err?.name === 'AbortError' || err?.message?.toLowerCase().includes('timeout') || err?.message?.toLowerCase().includes('aborted')) {
    return i18n.t('errors.timeoutError');
  }

  // 3. Network connection / Host unreachable / Backend down / Native fetch exceptions
  const errStr = String(err?.message || err || '');
  const isNetworkFailure =
    statusCode === 0 ||
    errStr.includes('Could not connect') ||
    errStr.includes('Network request failed') ||
    errStr.includes('Failed to fetch') ||
    errStr.includes('NetworkError') ||
    errStr.includes('Promise.swift') ||
    errStr.includes('TypeError') ||
    errStr.includes('ECONNREFUSED');

  if (isNetworkFailure) {
    return i18n.t('errors.networkError');
  }

  // 4. HTTP Status Code fallbacks
  switch (statusCode) {
    case 401:
      return i18n.t('errors.unauthorized');
    case 403:
      return i18n.t('errors.forbidden');
    case 404:
      return i18n.t('errors.notFound');
    default:
      if (statusCode >= 500) {
        return i18n.t('errors.serverError');
      }
      return i18n.t('errors.unknownError');
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

async function executeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    body,
    params,
    requiresAuth = true,
    headers: customHeaders,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...customOptions
  } = options;

  let url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': i18n.language || 'vi',
    ...(customHeaders as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const fetchOptions: RequestInit = {
    ...customOptions,
    headers,
    signal: controller.signal,
  };

  if (body !== undefined) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: any) {
    clearTimeout(timeoutId);
    const friendlyMessage = normalizeErrorMessage(err, 0);
    throw new ApiError(friendlyMessage, 0, 'NetworkError', err);
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle 401 Unauthorized with automatic refresh token flow
  if (
    response.status === 401 &&
    requiresAuth &&
    !endpoint.includes('/auth/refresh') &&
    !endpoint.includes('/auth/login')
  ) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshToken = await tokenStorage.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        await tokenStorage.clearTokens();
        throw new ApiError(i18n.t('errors.unauthorized'), 401);
      }

      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': i18n.language || 'vi',
          },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshJson: ApiResponse<{ accessToken: string; refreshToken: string }> =
          await refreshResponse.json();

        if (refreshResponse.ok && refreshJson.data) {
          await tokenStorage.setTokens(refreshJson.data);
          isRefreshing = false;
          onRefreshed(refreshJson.data.accessToken);

          // Retry current request with new token
          headers['Authorization'] = `Bearer ${refreshJson.data.accessToken}`;
          const retryResponse = await fetch(url, { ...fetchOptions, headers });
          const retryJson: ApiResponse<T> = await retryResponse.json();
          if (!retryResponse.ok) {
            const errorMsg = normalizeErrorMessage(null, retryResponse.status, retryJson);
            throw new ApiError(errorMsg, retryResponse.status);
          }
          return retryJson.data;
        } else {
          isRefreshing = false;
          await tokenStorage.clearTokens();
          onRefreshed(null);
          throw new ApiError(i18n.t('errors.unauthorized'), 401);
        }
      } catch (refreshErr) {
        isRefreshing = false;
        await tokenStorage.clearTokens();
        onRefreshed(null);
        throw new ApiError(i18n.t('errors.unauthorized'), 401);
      }
    } else {
      // Another request is currently refreshing the token; wait for it
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber(async (newToken) => {
          if (!newToken) {
            return reject(new ApiError(i18n.t('errors.unauthorized'), 401));
          }
          try {
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...fetchOptions, headers });
            const retryJson: ApiResponse<T> = await retryResponse.json();
            if (!retryResponse.ok) {
              const errorMsg = normalizeErrorMessage(null, retryResponse.status, retryJson);
              return reject(new ApiError(errorMsg, retryResponse.status));
            }
            resolve(retryJson.data);
          } catch (e: any) {
            const errorMsg = normalizeErrorMessage(e, 0);
            reject(new ApiError(errorMsg, 0));
          }
        });
      });
    }
  }

  let responseData: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const errorMessage = normalizeErrorMessage(null, response.status, responseData);

    throw new ApiError(
      errorMessage,
      response.status,
      responseData?.error,
      responseData?.data,
    );
  }

  // Handle standard ApiResponse wrapper: { success: true, statusCode: 200, data: T }
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data as T;
  }

  return responseData as T;
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(endpoint, { ...options, method: 'POST', body });
  },

  patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(endpoint, { ...options, method: 'PUT', body });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
