import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useAppTheme } from '../../hooks/use-theme';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subtitle'
  | 'body'
  | 'bodyMedium'
  | 'caption'
  | 'label';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'closeFriends'
  | 'danger'
  | 'white';

export interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: TypographyColor | string;
  align?: 'left' | 'center' | 'right';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  style?: TextStyle | (TextStyle | undefined)[];
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = 'primary',
  align = 'left',
  weight,
  style,
  children,
  ...restProps
}: TypographyProps) {
  const { colors } = useAppTheme();

  const resolveColor = (): string => {
    switch (color) {
      case 'primary':
        return colors.textPrimary;
      case 'secondary':
        return colors.textSecondary;
      case 'muted':
        return colors.textMuted;
      case 'accent':
        return colors.accentDark;
      case 'closeFriends':
        return colors.closeFriends;
      case 'danger':
        return colors.danger;
      case 'white':
        return '#FFFFFF';
      default:
        return color;
    }
  };

  const resolveWeight = (): TextStyle['fontWeight'] => {
    if (weight) {
      switch (weight) {
        case 'normal':
          return '400';
        case 'medium':
          return '500';
        case 'semibold':
          return '600';
        case 'bold':
          return '700';
        case 'extrabold':
          return '800';
      }
    }

    switch (variant) {
      case 'h1':
        return '800';
      case 'h2':
        return '700';
      case 'h3':
        return '600';
      case 'label':
        return '600';
      case 'bodyMedium':
        return '500';
      default:
        return '400';
    }
  };

  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        {
          color: resolveColor(),
          textAlign: align,
          fontWeight: resolveWeight(),
        },
        style,
      ]}
      {...restProps}
    >
      {children}
    </RNText>
  );
}

export function Title({
  level = 1,
  ...props
}: TypographyProps & { level?: 1 | 2 | 3 }) {
  const variant: TypographyVariant = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
  return <Typography variant={variant} {...props} />;
}

export function Subtitle(props: TypographyProps) {
  return <Typography variant="subtitle" color="secondary" {...props} />;
}

export function Body(props: TypographyProps) {
  return <Typography variant="body" {...props} />;
}

export function Caption(props: TypographyProps) {
  return <Typography variant="caption" color="muted" {...props} />;
}

export function Label(props: TypographyProps) {
  return <Typography variant="label" {...props} />;
}

const styles = StyleSheet.create({
  base: {
    fontFamily: undefined, // Uses native system font (San Francisco on iOS, Roboto on Android)
  },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
});
