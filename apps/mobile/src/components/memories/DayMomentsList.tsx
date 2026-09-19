import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Button } from '../ui/Button';
import { Ionicons } from '../common/Icon';
import { MomentItem, MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface DayMomentsListProps {
  selectedDate: Date;
  moments: MomentItem[];
  onSelectMoment: (moment: MomentItem) => void;
}

export function DayMomentsList({
  selectedDate,
  moments,
  onSelectMoment,
}: DayMomentsListProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const isToday =
    new Date().toDateString() === selectedDate.toDateString();

  const formattedDate = `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title level={3} style={styles.title}>
          {t('memories.dayMomentsTitle', {
            date: formattedDate,
            defaultValue: `Khoảnh khắc ngày ${formattedDate}`,
          })}
        </Title>
        {moments.length > 0 && (
          <Caption color="muted">
            {moments.length} {moments.length === 1 ? 'mục' : 'mục'}
          </Caption>
        )}
      </View>

      {moments.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.surfaceSoft,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Caption style={styles.emptyIcon}>🍃</Caption>
          <Body color="secondary" align="center" style={styles.emptyText}>
            {t(
              'memories.noMomentsOnDay',
              'Không có khoảnh khắc nào được lưu trong ngày này.',
            )}
          </Body>
          {isToday && (
            <Button
              title={t('memories.createTodayPrompt', 'Ghi lại khoảnh khắc hôm nay nhé!')}
              variant="primary"
              size="sm"
              leftIcon={<Ionicons name="add" size={16} color="#FFFFFF" />}
              onPress={() => router.push('/(tabs)/create')}
              style={styles.createBtn}
            />
          )}
        </View>
      ) : (
        <View style={styles.list}>
          {moments.map((item) => {
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => onSelectMoment(item)}
                style={[
                  styles.momentCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                {/* Visual Thumbnail */}
                {item.type === MomentType.PHOTO && item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.thumbnail}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.iconThumbnail,
                      {
                        backgroundColor: isDark ? '#332E29' : '#F7EFE6',
                      },
                    ]}
                  >
                    <Caption style={{ fontSize: 24, lineHeight: 30 }}>
                      {item.emotion?.icon || (item.type === MomentType.NOTE ? '📝' : '✨')}
                    </Caption>
                  </View>
                )}

                {/* Content info */}
                <View style={styles.infoCol}>
                  <View style={styles.metaRow}>
                    <Caption color="muted" style={{ fontSize: 12 }}>
                      {formatTime(item.createdAt)}
                    </Caption>
                    {item.emotion && (
                      <View
                        style={[
                          styles.emotionBadge,
                          {
                            backgroundColor: isDark ? '#2D2722' : '#FFF4E8',
                            borderColor: item.emotion.color || colors.accent,
                          },
                        ]}
                      >
                        <Caption style={{ fontSize: 11, lineHeight: 14 }}>{item.emotion.icon}</Caption>
                        <Caption
                          weight="bold"
                          style={{
                            fontSize: 11,
                            color: item.emotion.color || colors.accentDark,
                          }}
                        >
                          {item.emotion.label}
                        </Caption>
                      </View>
                    )}
                  </View>

                  <Body
                    numberOfLines={2}
                    color="primary"
                    style={styles.contentText}
                  >
                    {item.content || (item.type === MomentType.PHOTO ? 'Bức ảnh khoảnh khắc' : '')}
                  </Body>

                  <View style={styles.footerRow}>
                    <View style={styles.statsGroup}>
                      <View style={styles.statItem}>
                        <Caption style={{ fontSize: 12, lineHeight: 14 }}>❤️</Caption>
                        <Caption color="muted" style={{ fontSize: 12 }}>
                          {item.reactionsCount ?? item._count?.reactions ?? 0}
                        </Caption>
                      </View>
                      <View style={styles.statItem}>
                        <Caption style={{ fontSize: 12, lineHeight: 14 }}>💬</Caption>
                        <Caption color="muted" style={{ fontSize: 12 }}>
                          {item.messagesCount ?? item._count?.messages ?? 0}
                        </Caption>
                      </View>
                    </View>
                    <Caption color="muted" style={{ fontSize: 11.5 }}>
                      {t('memories.viewDetail', 'Chi tiết')} →
                    </Caption>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 13.5,
    marginBottom: Spacing.sm,
  },
  createBtn: {
    marginTop: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
  },
  momentCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.sm + 2,
    gap: Spacing.sm + 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  iconThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 3,
  },
  contentText: {
    fontSize: 13.5,
    lineHeight: 18,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsGroup: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
