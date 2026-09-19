import React from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { MomentItem, MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface HistoryTimelineProps {
  moments: MomentItem[];
  isLoading?: boolean;
  onSelectMoment: (moment: MomentItem) => void;
}

export function HistoryTimeline({
  moments,
  isLoading = false,
  onSelectMoment,
}: HistoryTimelineProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  if (moments.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: colors.surfaceSoft,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <Caption style={styles.emptyIcon}>📖</Caption>
        <Title level={3} align="center" style={styles.emptyTitle}>
          {t('memories.noHistoryTitle', 'Chưa có ký ức nào')}
        </Title>
        <Body color="secondary" align="center" style={styles.emptyDesc}>
          {t(
            'memories.noHistoryDesc',
            'Bắt đầu chụp ảnh, viết ghi chú hoặc cập nhật cảm xúc để lưu giữ những kỷ niệm quý giá.',
          )}
        </Body>
      </View>
    );
  }

  // Group moments by Month & Year
  const groupedSections: { title: string; items: MomentItem[] }[] = [];
  const groupMap: { [key: string]: MomentItem[] } = {};

  moments.forEach((item) => {
    const d = new Date(item.createdAt);
    const key = `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
    if (!groupMap[key]) {
      groupMap[key] = [];
      groupedSections.push({ title: key, items: groupMap[key] });
    }
    groupMap[key].push(item);
  });

  const formatDay = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `Ngày ${d.getDate()}`;
    } catch {
      return '';
    }
  };

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
      {groupedSections.map((section, sIdx) => (
        <View key={sIdx} style={styles.sectionGroup}>
          {/* Month Section Header Capsule */}
          <View style={styles.monthHeaderRow}>
            <View
              style={[
                styles.monthCapsule,
                {
                  backgroundColor: isDark ? '#2D2824' : '#F7EFE6',
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={13} color={colors.accentDark} />
              <Body
                weight="bold"
                style={{
                  fontSize: 13,
                  color: isDark ? '#F5F3EF' : colors.textPrimary,
                }}
              >
                {section.title}
              </Body>
              <Caption color="muted" style={{ fontSize: 11.5 }}>
                ({section.items.length})
              </Caption>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: colors.divider }]} />
          </View>

          {/* Vertical Timeline Stream */}
          <View style={styles.timelineStream}>
            {/* Continuous Vertical Timeline Track Line */}
            <View
              style={[
                styles.verticalLine,
                { backgroundColor: isDark ? '#38322C' : '#EAE4D9' },
              ]}
            />

            {section.items.map((item, itemIdx) => {
              const baseEmotionColor = item.emotion?.color || colors.accent;

              return (
                <View key={item.id} style={styles.timelineItemRow}>
                  {/* Timeline Node Icon/Dot */}
                  <View
                    style={[
                      styles.timelineNode,
                      {
                        backgroundColor: isDark ? '#201D1A' : '#FDFBF7',
                        borderColor: baseEmotionColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.timelineInnerDot,
                        { backgroundColor: baseEmotionColor },
                      ]}
                    />
                  </View>

                  {/* Timeline Item Card */}
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => onSelectMoment(item)}
                    style={[
                      styles.journalCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    {/* Card Top Meta */}
                    <View style={styles.cardHeaderMeta}>
                      <View style={styles.dayBadge}>
                        <Body weight="bold" color="primary" style={{ fontSize: 13 }}>
                          {formatDay(item.createdAt)}
                        </Body>
                        <Caption color="muted" style={{ fontSize: 11.5 }}>
                          · {formatTime(item.createdAt)}
                        </Caption>
                      </View>

                      {item.emotion && (
                        <View
                          style={[
                            styles.emotionPill,
                            {
                              backgroundColor: isDark ? '#2D2520' : '#FFF5EB',
                              borderColor: baseEmotionColor,
                            },
                          ]}
                        >
                          <Caption style={styles.pillEmoji}>
                            {item.emotion.icon}
                          </Caption>
                          <Caption
                            weight="bold"
                            style={{
                              fontSize: 11.5,
                              color: isDark ? '#F5F3EF' : colors.accentDark,
                            }}
                          >
                            {item.emotion.label}
                          </Caption>
                        </View>
                      )}
                    </View>

                    {/* 1. PHOTO MOMENT */}
                    {item.type === MomentType.PHOTO && item.imageUrl ? (
                      <View style={styles.photoContainer}>
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.photoImage}
                          contentFit="cover"
                        />
                        {item.content ? (
                          <View
                            style={[
                              styles.photoCaptionWrap,
                              { backgroundColor: isDark ? '#26221E' : '#FDFBF8' },
                            ]}
                          >
                            <Body
                              numberOfLines={2}
                              color="primary"
                              style={styles.captionText}
                            >
                              {item.content}
                            </Body>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {/* 2. NOTE MOMENT */}
                    {item.type === MomentType.NOTE ? (
                      <View
                        style={[
                          styles.noteContainer,
                          {
                            backgroundColor: isDark ? '#282420' : '#FAF6EE',
                            borderColor: colors.cardBorder,
                          },
                        ]}
                      >
                        <View style={styles.noteTop}>
                          <Ionicons
                            name="document-text-outline"
                            size={16}
                            color={colors.accentDark}
                          />
                          <Caption weight="bold" color="primary" style={{ fontSize: 11.5 }}>
                            Ghi chú nhật ký
                          </Caption>
                        </View>
                        <Body color="primary" style={styles.noteText}>
                          "{item.content}"
                        </Body>
                      </View>
                    ) : null}

                    {/* 3. MOOD MOMENT */}
                    {item.type === MomentType.MOOD ? (
                      <View
                        style={[
                          styles.moodContainer,
                          {
                            backgroundColor: isDark ? '#2E2721' : '#FFF7EE',
                            borderColor: baseEmotionColor,
                          },
                        ]}
                      >
                        <Caption style={styles.moodLargeEmoji}>
                          {item.emotion?.icon || '✨'}
                        </Caption>
                        <Title
                          level={3}
                          style={[styles.moodTitle, { color: colors.textPrimary }]}
                        >
                          {item.emotion?.label || 'Cảm xúc'}
                        </Title>
                        {item.content ? (
                          <Body
                            numberOfLines={2}
                            color="secondary"
                            style={styles.moodReflection}
                          >
                            {item.content}
                          </Body>
                        ) : null}
                      </View>
                    ) : null}

                    {/* Card Footer Bar */}
                    <View
                      style={[
                        styles.cardFooter,
                        { borderTopColor: colors.divider },
                      ]}
                    >
                      <View style={styles.footerStats}>
                        <Caption color="muted" style={{ fontSize: 12 }}>
                          ❤️ {item._count?.reactions || item.reactionsCount || 0}
                        </Caption>
                        <Caption color="muted" style={{ fontSize: 12 }}>
                          💬 {item._count?.comments || item.commentsCount || 0}
                        </Caption>
                      </View>
                      <Caption
                        weight="semibold"
                        style={{ color: colors.accentDark, fontSize: 11.5 }}
                      >
                        Xem chi tiết →
                      </Caption>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: Spacing.xs,
  },
  emptyTitle: {
    fontSize: 17,
    marginBottom: Spacing.xs,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 260,
  },
  sectionGroup: {
    marginBottom: Spacing.md + 4,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm + 2,
    gap: 8,
  },
  monthCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  headerDivider: {
    flex: 1,
    height: 1,
  },
  timelineStream: {
    position: 'relative',
    paddingLeft: 16,
  },
  verticalLine: {
    position: 'absolute',
    left: 7,
    top: 6,
    bottom: 12,
    width: 2,
    borderRadius: 1,
  },
  timelineItemRow: {
    position: 'relative',
    marginBottom: Spacing.sm + 6,
  },
  timelineNode: {
    position: 'absolute',
    left: -16,
    top: 14,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  journalCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
  },
  dayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  pillEmoji: {
    fontSize: 12,
    lineHeight: 15,
  },
  photoContainer: {
    width: '100%',
  },
  photoImage: {
    width: '100%',
    aspectRatio: 1.15,
  },
  photoCaptionWrap: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: '#EBE6DE22',
  },
  captionText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  noteContainer: {
    marginHorizontal: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    padding: Spacing.sm + 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  moodContainer: {
    marginHorizontal: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLargeEmoji: {
    fontSize: 38,
    lineHeight: 46,
    marginBottom: 2,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  moodReflection: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 7,
    borderTopWidth: 0.8,
  },
  footerStats: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
