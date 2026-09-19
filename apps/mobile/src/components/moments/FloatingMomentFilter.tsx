import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { FilterOption } from './FriendFilterModal';

export interface FloatingMomentFilterProps {
  selectedFilter: FilterOption;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FloatingMomentFilter({
  selectedFilter,
  onPress,
  style,
}: FloatingMomentFilterProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const getFilterLabel = () => {
    if (selectedFilter.type === 'CLOSE_FRIENDS') {
      return t('moments.closeFriends', 'Bạn thân');
    }
    if (selectedFilter.type === 'FRIEND') {
      return selectedFilter.displayName;
    }
    return t('moments.everyone', 'Tất cả mọi người');
  };

  const getFilterAvatar = () => {
    if (selectedFilter.type === 'FRIEND') {
      return selectedFilter.avatarUrl;
    }
    return null;
  };

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <TouchableOpacity
        style={[
          styles.pill,
          {
            backgroundColor: isDark ? '#272421' : '#F0ECE4',
            borderColor: colors.cardBorder,
          },
        ]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        {getFilterAvatar() ? (
          <Image
            source={{ uri: getFilterAvatar()! }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <Ionicons
            name={
              selectedFilter.type === 'CLOSE_FRIENDS' ? 'star' : 'globe-outline'
            }
            size={20}
            color={
              selectedFilter.type === 'CLOSE_FRIENDS'
                ? colors.closeFriends
                : colors.accentDark
            }
          />
        )}
        <Body weight="bold" color="primary" style={styles.text}>
          {getFilterLabel()}
        </Body>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  text: {
    fontSize: 18,
    letterSpacing: -0.2,
  },
});
