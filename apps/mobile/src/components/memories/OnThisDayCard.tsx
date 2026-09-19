import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { MomentItem, MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface OnThisDayCardProps {
  moment: MomentItem | null;
  onPress: (moment: MomentItem) => void;
}

export function OnThisDayCard({ moment, onPress }: OnThisDayCardProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  if (!moment) return null;

  const momentDate = new Date(moment.createdAt);
  const now = new Date();
  const yearsAgo = now.getFullYear() - momentDate.getFullYear();
  const dateFormatted = `${momentDate.getDate()}/${momentDate.getMonth() + 1}/${momentDate.getFullYear()}`;

  const timeLabel =
    yearsAgo >= 1
      ? `${yearsAgo} năm trước (${dateFormatted})`
      : `Ngày này ${dateFormatted}`;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(moment)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#2B231D' : '#FFF6ED',
          borderColor: colors.accent,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={14} color={colors.accentDark} />
          <Caption weight="bold" color="primary" style={{ color: colors.accentDark, fontSize: 12 }}>
            {t('memories.onThisDayTitle', 'Ký ức ngày này ✨')}
          </Caption>
        </View>
        <Caption color="muted" style={{ fontSize: 12 }}>
          {timeLabel}
        </Caption>
      </View>

      <View style={styles.contentRow}>
        {moment.type === MomentType.PHOTO && moment.imageUrl ? (
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.thumbnail}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.iconThumbnail,
              { backgroundColor: isDark ? '#3D3228' : '#FFEBD8' },
            ]}
          >
            <Caption style={{ fontSize: 26, lineHeight: 32 }}>
              {moment.emotion?.icon || (moment.type === MomentType.NOTE ? '📝' : '✨')}
            </Caption>
          </View>
        )}

        <View style={styles.textContent}>
          {moment.emotion && (
            <View style={styles.emotionPill}>
              <Caption style={{ fontSize: 13, lineHeight: 16 }}>{moment.emotion.icon}</Caption>
              <Caption weight="bold" color="primary" style={{ fontSize: 12 }}>
                {moment.emotion.label}
              </Caption>
            </View>
          )}

          {moment.content ? (
            <Body
              numberOfLines={2}
              color="primary"
              style={styles.contentText}
            >
              {moment.content}
            </Body>
          ) : null}

          <View style={styles.footerRow}>
            {(moment.reactionsCount || moment._count?.reactions || moment.messagesCount || moment._count?.messages) ? (
              <View style={styles.statsGroup}>
                <Caption color="muted" style={{ fontSize: 11.5 }}>
                  ❤️ {moment.reactionsCount ?? moment._count?.reactions ?? 0}
                </Caption>
                <Caption color="muted" style={{ fontSize: 11.5 }}>
                  💬 {moment.messagesCount ?? moment._count?.messages ?? 0}
                </Caption>
              </View>
            ) : <View />}
            <Caption color="muted" style={styles.viewMoreText}>
              {t('memories.viewDetail', 'Xem chi tiết')} →
            </Caption>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm + 4,
    shadowColor: '#E76F51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 14,
  },
  iconThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 4,
  },
  viewMoreText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
