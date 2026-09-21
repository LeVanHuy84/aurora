import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri, ResponseType } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from './use-auth';
import { useTranslation } from 'react-i18next';

// Hoàn tất auth session khi redirect về lại app từ browser
WebBrowser.maybeCompleteAuthSession();

export function useOAuth() {
  const { t } = useTranslation();
  const { googleLogin, appleLogin } = useAuth();
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Warm up browser trên Android để tăng tốc load và tránh trắng trang
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  // Đọc Google Client IDs từ biến môi trường
  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;

  const hasGoogleClientId = Boolean(webClientId || iosClientId || androidClientId);
  const fallbackClientId = '1234567890-aurora.apps.googleusercontent.com';

  const redirectUri = makeRedirectUri({
    scheme: 'aurora',
    path: 'oauthredirect',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId || fallbackClientId,
    webClientId: webClientId || fallbackClientId,
    iosClientId: iosClientId || webClientId || fallbackClientId,
    androidClientId: androidClientId || webClientId || fallbackClientId,
    scopes: ['openid', 'profile', 'email'],
    responseType: ResponseType.IdToken,
    redirectUri,
  });

  // Xử lý khi Google trả về kết quả đăng nhập
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication, params } = response;
      const idToken =
        authentication?.idToken ||
        authentication?.accessToken ||
        params?.id_token ||
        params?.access_token;

      if (idToken) {
        setIsOAuthLoading(true);
        setOauthError(null);
        googleLogin({ idToken })
          .catch((err) => {
            console.warn('[GoogleOAuth] Backend login error:', err);
            setOauthError(err?.message || t('auth.errors.oauthFailed'));
          })
          .finally(() => {
            setIsOAuthLoading(false);
          });
      } else {
        console.warn('[GoogleOAuth] No ID Token received in response params:', params);
        setOauthError(t('auth.errors.oauthFailed'));
      }
    } else if (response?.type === 'error') {
      console.warn('[GoogleOAuth] OAuth prompt error:', response.error);
      setOauthError(response.error?.message || t('auth.errors.oauthFailed'));
      setIsOAuthLoading(false);
    }
  }, [response, googleLogin, t]);

  const signInWithGoogle = async () => {
    try {
      if (!hasGoogleClientId) {
        setOauthError('Vui lòng cấu hình Google Client ID (EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB) trên môi trường.');
        return;
      }
      setIsOAuthLoading(true);
      setOauthError(null);
      await promptAsync();
    } catch (err: any) {
      console.warn('[GoogleOAuth] Prompt error:', err);
      setOauthError(err?.message || t('auth.errors.oauthFailed'));
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') {
      setOauthError(t('auth.errors.appleOnlyIos', 'Apple Sign In chỉ hỗ trợ trên iOS'));
      return;
    }

    try {
      setOauthError(null);
      setIsOAuthLoading(true);

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        setOauthError(t('auth.errors.appleNotAvailable', 'Apple Sign In không khả dụng trên thiết bị này'));
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        await appleLogin({ idToken: credential.identityToken });
      } else {
        throw new Error('No identity token returned by Apple');
      }
    } catch (err: any) {
      if (err?.code !== 'ERR_REQUEST_CANCELED') {
        console.warn('[AppleOAuth] Sign in error:', err);
        setOauthError(err?.message || t('auth.errors.oauthFailed'));
      }
    } finally {
      setIsOAuthLoading(false);
    }
  };

  return {
    signInWithGoogle,
    signInWithApple,
    isOAuthLoading,
    oauthError,
    setOauthError,
    isGoogleReady: !!request,
  };
}
