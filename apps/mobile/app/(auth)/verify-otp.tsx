import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../../src/components/common/Icon';
import { useAppTheme } from '../../src/hooks/use-theme';
import { useAuth } from '../../src/hooks/use-auth';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { Button } from '../../src/components/ui/Button';
import { Title, Subtitle, Body, Caption } from '../../src/components/ui/Typography';
import { Spacing, BorderRadius } from '../../src/constants/theme';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || '';
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { verifyOtp, resendOtp, isLoading, resetErrors } = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Cooldown countdown
  useEffect(() => {
    let timer: any = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  // Handle single digit input
  const handleDigitChange = (value: string, index: number) => {
    setErrorMessage('');
    setSuccessMessage('');

    // If user pasted a full OTP code (e.g. 6 digits)
    if (value.length > 1) {
      const sanitized = value.replace(/[^0-9]/g, '').slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < sanitized.length; i++) {
        newOtp[i] = sanitized[i];
      }
      setOtp(newOtp);
      if (sanitized.length === 6) {
        Keyboard.dismiss();
      } else {
        inputRefs.current[sanitized.length]?.focus();
      }
      return;
    }

    const sanitizedDigit = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = sanitizedDigit;
    setOtp(newOtp);

    // Auto advance
    if (sanitizedDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit.length === 1);

  // Submit OTP Verification
  const handleVerify = async () => {
    if (!isOtpComplete) {
      setErrorMessage(t('auth.errors.invalidOtp'));
      return;
    }

    const fullCode = otp.join('');
    setErrorMessage('');
    resetErrors();

    try {
      await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: fullCode,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err?.message || t('auth.errors.invalidOtp'));
    }
  };

  // Resend OTP Code
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await resendOtp({ email: email.trim().toLowerCase() });
      setSuccessMessage(t('auth.otpResentSuccess'));
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMessage(err?.message || t('common.error'));
    } finally {
      setIsResending(false);
    }
  };

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
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isDark ? '#2E2822' : '#FFF2E8' },
          ]}
        >
          <Ionicons name="mail-unread-outline" size={32} color={colors.accentDark} />
        </View>
        <Title level={1}>{t('auth.verifyOtpTitle')}</Title>
        <Subtitle style={styles.subtitle}>
          {t('auth.verifyOtpSubtitle')}
        </Subtitle>
        <Body weight="bold" color="accent" style={styles.emailText}>
          {email}
        </Body>
      </View>

      {/* Error / Success Banners */}
      {errorMessage ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: isDark ? '#2D1618' : '#FDE8E8', borderColor: colors.danger },
          ]}
        >
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Body color="danger" weight="medium" style={styles.bannerText}>
            {errorMessage}
          </Body>
        </View>
      ) : null}

      {successMessage ? (
        <View
          style={[
            styles.banner,
            { backgroundColor: isDark ? '#14291D' : '#E8F5E9', borderColor: colors.closeFriends },
          ]}
        >
          <Ionicons name="checkmark-circle" size={18} color={colors.closeFriends} />
          <Body color="secondary" weight="medium" style={styles.bannerText}>
            {successMessage}
          </Body>
        </View>
      ) : null}

      {/* 6 Digit Input Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => {
          const isFocused = inputRefs.current[index]?.isFocused();
          const hasValue = digit.length > 0;

          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(val) => handleDigitChange(val, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              autoFocus={index === 0}
              selectTextOnFocus
              style={[
                styles.otpBox,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: hasValue
                    ? colors.accentDark
                    : colors.cardBorder,
                  color: colors.textPrimary,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Submit Button */}
      <Button
        title={t('auth.verifyButton')}
        onPress={handleVerify}
        loading={isLoading}
        disabled={!isOtpComplete || isLoading}
        size="lg"
        variant="primary"
        style={styles.submitBtn}
      />

      {/* Resend OTP Row */}
      <View style={styles.resendRow}>
        <Caption color="secondary">{t('auth.resendCodePrompt', 'Chưa nhận được mã?')} </Caption>
        {cooldown > 0 ? (
          <Caption color="muted" weight="semibold">
            {t('auth.resendCodeIn', { seconds: cooldown })}
          </Caption>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isResending}
            onPress={handleResend}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Body color="accent" weight="bold">
              {isResending ? t('common.loading') : t('auth.resendCode')}
            </Body>
          </TouchableOpacity>
        )}
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
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emailText: {
    marginTop: 4,
    fontSize: 15,
    textAlign: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  bannerText: {
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.xl,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
});
