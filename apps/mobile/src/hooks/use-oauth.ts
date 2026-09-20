import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from './use-auth';
import { useTranslation } from 'react-i18next';

// Hoàn tất session khi redirect về lại app từ browser
WebBrowser.maybeCompleteAuthSession();

export function useOAuth() {
  const { t } = useTranslation();
  const { googleLogin, appleLogin } = useAuth();
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Cấu hình Google Auth Request
  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;

  const hasGoogleClientId = Boolean(webClientId || iosClientId || androidClientId);
  const fallbackClientId = '1234567890-aurora.apps.googleusercontent.com';

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: (Platform.OS === 'android' ? androidClientId : iosClientId) || webClientId || fallbackClientId,
    webClientId: webClientId || fallbackClientId,
    iosClientId: iosClientId || fallbackClientId,
    androidClientId: androidClientId || fallbackClientId,
    scopes: ['openid', 'profile', 'email'],
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
        setOauthError('Vui lòng cấu hình Google Client ID trên EAS/môi trường để đăng nhập Google.');
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
