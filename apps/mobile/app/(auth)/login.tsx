import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { useAuth } from '../../src/hooks/use-auth';
import { useOAuth } from '../../src/hooks/use-oauth';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { SocialButton } from '../../src/components/ui/SocialButton';
import { Title, Subtitle, Body, Caption } from '../../src/components/ui/Typography';
import { Spacing } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { login, isLoading, resetErrors } = useAuth();
  const { signInWithGoogle, signInWithApple, isOAuthLoading, oauthError } = useOAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    resetErrors();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError(t('auth.errors.invalidEmail'));
      isValid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError(t('auth.errors.passwordTooShort'));
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
      router.replace('/');
    } catch (err: any) {
      setGeneralError(err?.message || t('auth.errors.loginFailed'));
    }
  };

  const errorMessage = generalError || oauthError;

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={styles.scrollContent}
      header={
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => router.back()}
            style={[
              styles.backButton,
              { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Title level={1}>{t('auth.loginTitle')}</Title>
        <Subtitle style={styles.subtitle}>{t('auth.loginSubtitle')}</Subtitle>
      </View>

      {/* General Error Banner */}
      {errorMessage ? (
        <View
          style={[
            styles.errorBanner,
            { backgroundColor: '#FDE8E8', borderColor: colors.danger },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Body color="danger" weight="medium" style={styles.errorBannerText}>
            {errorMessage}
          </Body>
        </View>
      ) : null}

      {/* Form Fields */}
      <View style={styles.form}>
        <Input
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textSecondary} />}
        />

        <Input
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
          error={passwordError}
          isPassword
          autoCapitalize="none"
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />}
        />

        <Button
          title={t('auth.login')}
          onPress={handleLogin}
          loading={isLoading}
          size="lg"
          variant="primary"
          style={styles.submitBtn}
        />
      </View>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
        <Caption style={styles.dividerText}>{t('auth.orContinueWith')}</Caption>
        <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
      </View>

      {/* Social OAuth Buttons */}
      <View style={styles.socialContainer}>
        <SocialButton
          provider="google"
          onPress={signInWithGoogle}
          loading={isOAuthLoading}
        />
        <SocialButton
          provider="apple"
          onPress={signInWithApple}
          loading={isOAuthLoading}
        />
      </View>

      {/* Footer Link */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/register')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Body color="secondary" weight="semibold">
            {t('auth.dontHaveAccount')}
          </Body>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorBannerText: {
    flex: 1,
  },
  form: {
    width: '100%',
    marginTop: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontWeight: '500',
  },
  socialContainer: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
