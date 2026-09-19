import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/use-theme';
import { Spacing } from '../../constants/theme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /**
   * Whether the container should be scrollable
   * @default false
   */
  scrollable?: boolean;
  /**
   * Whether to wrap inside KeyboardAvoidingView
   * @default true if scrollable is true, otherwise false
   */
  withKeyboardAvoid?: boolean;
  /**
   * Safe area edges to apply padding to
   * @default ['top', 'bottom', 'left', 'right']
   */
  edges?: Edge[];
  /**
   * Outer container style
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style applied to the content/scrollview container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Optional Fixed Header placed outside the scroll area
   */
  header?: React.ReactNode;
  /**
   * Optional Fixed Footer placed outside the scroll area
   */
  footer?: React.ReactNode;
  /**
   * Keyboard dismiss mode on scroll
   */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  /**
   * Whether to show vertical scroll indicator
   * @default false
   */
  showsVerticalScrollIndicator?: boolean;
  /**
   * RefreshControl element for pull to refresh
   */
  refreshControl?: React.ReactElement<any>;
}

export function ScreenContainer({
  children,
  scrollable = false,
  withKeyboardAvoid,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  contentContainerStyle,
  header,
  footer,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  refreshControl,
}: ScreenContainerProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const applyTop = edges.includes('top');
  const applyBottom = edges.includes('bottom');
  const applyLeft = edges.includes('left');
  const applyRight = edges.includes('right');

  const safePadding: ViewStyle = {
    paddingTop: applyTop ? Math.max(insets.top, Spacing.sm) : 0,
    paddingBottom: applyBottom ? Math.max(insets.bottom, Spacing.sm) : 0,
    paddingLeft: applyLeft ? Math.max(insets.left, Spacing.md) : 0,
    paddingRight: applyRight ? Math.max(insets.right, Spacing.md) : 0,
  };

  const shouldAvoidKeyboard =
    withKeyboardAvoid !== undefined ? withKeyboardAvoid : scrollable;

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.flexOne}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.flexOne, contentContainerStyle]}>
        {children}
      </View>
    );
  };

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        safePadding,
        style,
      ]}
    >
      {header}
      {renderContent()}
      {footer}
    </View>
  );

  if (shouldAvoidKeyboard) {
    return (
      <KeyboardAvoidingView
        style={[styles.flexOne, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
});
