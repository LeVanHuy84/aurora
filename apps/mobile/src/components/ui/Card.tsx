import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { useAppTheme } from '../../hooks/use-theme';
import { BorderRadius, Spacing } from '../../constants/theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style, ...restProps }: CardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        style,
      ]}
      {...restProps}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
});
