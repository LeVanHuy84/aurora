import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons, FontAwesome } from '../common/Icon';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { BorderRadius, Spacing } from '../../constants/theme';

export type SocialProvider = 'google' | 'apple';

export interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function SocialButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: SocialButtonProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const isGoogle = provider === 'google';

  const getBackgroundColor = () => {
    if (isGoogle) {
      return isDark ? '#2C2926' : '#FFFFFF';
    }
    // Apple button: Black on light mode, White on dark mode
    return isDark ? '#FFFFFF' : '#000000';
  };

  const getBorderColor = () => {
    if (isGoogle) {
      return isDark ? colors.cardBorder : '#E0DCD3';
    }
    return 'transparent';
  };

  const getTextColor = () => {
    if (isGoogle) {
      return colors.textPrimary;
    }
    return isDark ? '#000000' : '#FFFFFF';
  };

  const title = isGoogle
    ? t('auth.continueWithGoogle')
    : t('auth.continueWithApple');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {isGoogle ? (
              <FontAwesome name="google" size={18} color="#EA4335" />
            ) : (
              <Ionicons
                name="logo-apple"
                size={20}
                color={getTextColor()}
              />
            )}
          </View>
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
