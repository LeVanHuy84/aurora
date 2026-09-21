import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
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

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { register, isLoading, resetErrors } = useAuth();
  const { signInWithGoogle, signInWithApple, isOAuthLoading, oauthError } = useOAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [displayNameError, setDisplayNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setDisplayNameError('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    resetErrors();

    if (!displayName.trim()) {
      setDisplayNameError(t('auth.errors.displayNameRequired', 'Vui lòng nhập tên hiển thị'));
      isValid = false;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !usernameRegex.test(cleanUsername)) {
      setUsernameError(t('auth.errors.invalidUsername', 'Tên đăng nhập từ 3-20 ký tự, chỉ gồm chữ, số và dấu gạch dưới'));
      isValid = false;
    }

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

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await register({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: cleanEmail,
        password,
      });

      if (res?.requiresEmailVerification) {
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { email: cleanEmail },
        });
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setGeneralError(err?.message || t('auth.errors.registerFailed'));
    }
  };

  const errorMessage = generalError || oauthError;

  return (
    <ScreenContainer
      scrollable
      edges={['top']}
      style={styles.container}
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
        <Title level={1}>{t('auth.registerTitle')}</Title>
        <Subtitle style={styles.subtitle}>{t('auth.registerSubtitle')}</Subtitle>
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
          label={t('auth.displayName')}
          placeholder={t('auth.displayNamePlaceholder')}
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text);
            if (displayNameError) setDisplayNameError('');
          }}
          error={displayNameError}
          autoCapitalize="words"
          leftIcon={<Ionicons name="person-outline" size={18} color={colors.textSecondary} />}
        />

        <Input
          label={t('auth.username')}
          placeholder={t('auth.usernamePlaceholder')}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (usernameError) setUsernameError('');
          }}
          error={usernameError}
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<Ionicons name="at-outline" size={18} color={colors.textSecondary} />}
        />

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
          title={t('auth.register')}
          onPress={handleRegister}
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
        {Platform.OS === 'ios' && (
          <SocialButton
            provider="apple"
            onPress={signInWithApple}
            loading={isOAuthLoading}
          />
        )}
      </View>

      {/* Terms & Conditions Notice */}
      <Caption align="center" style={styles.termsText}>
        {t('auth.termsNotice')}
      </Caption>

      {/* Footer Link */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/login')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Body color="secondary" weight="semibold">
            {t('auth.alreadyHaveAccount')}
          </Body>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: Spacing.xl,
  },
  topBar: {
    paddingHorizontal: 16,
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
    marginBottom: Spacing.md,
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
    marginVertical: Spacing.md + 4,
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
  termsText: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
});
