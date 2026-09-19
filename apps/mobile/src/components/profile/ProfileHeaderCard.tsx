import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { UserProfile } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface ProfileHeaderCardProps {
  user?: UserProfile | null;
  momentsCount: number;
  friendsCount: number;
  closeFriendsCount: number;
  onEditPress: () => void;
}

export function ProfileHeaderCard({
  user,
  momentsCount,
  friendsCount,
  closeFriendsCount,
  onEditPress,
}: ProfileHeaderCardProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const initial = (user?.displayName || user?.username || 'U')[0].toUpperCase();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Top User Identity Row */}
      <View style={styles.identityRow}>
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={[styles.avatar, { borderColor: colors.cardBorder }]}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: colors.accent, borderColor: colors.cardBorder },
            ]}
          >
            <Title level={1} color="white" style={styles.initialText}>
              {initial}
            </Title>
          </View>
        )}

        <View style={styles.nameBlock}>
          <Title level={2} style={styles.displayName}>
            {user?.displayName || user?.username || 'Aurora User'}
          </Title>
          <Caption color="muted" style={styles.handleText}>
            @{user?.username} · {user?.email}
          </Caption>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onEditPress}
          style={[
            styles.editBtn,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Ionicons name="pencil" size={14} color={colors.textPrimary} />
          <Caption weight="bold" color="primary" style={{ fontSize: 12 }}>
            {t('profile.editProfile', 'Sửa')}
          </Caption>
        </TouchableOpacity>
      </View>

      {/* Bio text (if available) */}
      {user?.bio ? (
        <View
          style={[
            styles.bioContainer,
            {
              backgroundColor: isDark ? '#26221E' : '#FAF6EE',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Body color="secondary" style={styles.bioText}>
            "{user.bio}"
          </Body>
        </View>
      ) : null}

      {/* Stats Chips Row */}
      <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
        <View style={styles.statItem}>
          <Title level={2} style={styles.statNumber}>
            {momentsCount}
          </Title>
          <Caption color="muted" style={styles.statLabel}>
            {t('profile.momentsStat', 'Khoảnh khắc')}
          </Caption>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.statItem}>
          <Title level={2} style={styles.statNumber}>
            {friendsCount}
          </Title>
          <Caption color="muted" style={styles.statLabel}>
            {t('profile.friendsStat', 'Bạn bè')}
          </Caption>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.statItem}>
          <View style={styles.closeFriendStatGroup}>
            <Title level={2} style={[styles.statNumber, { color: colors.closeFriends }]}>
              {closeFriendsCount}
            </Title>
            <Caption style={{ fontSize: 11, lineHeight: 14 }}>⭐</Caption>
          </View>
          <Caption color="muted" style={styles.statLabel}>
            {t('profile.closeFriendsStat', 'Bạn thân')}
          </Caption>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
  },
  avatarFallback: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    fontSize: 22,
    lineHeight: 28,
  },
  nameBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  handleText: {
    fontSize: 12,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  bioContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  bioText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm + 2,
    borderTopWidth: 0.8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  closeFriendStatGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 11.5,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
});
