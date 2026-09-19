import React from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { MomentItem, MomentType, Visibility } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface HistoryTimelineProps {
  moments: MomentItem[];
  isLoading?: boolean;
  onSelectMoment: (moment: MomentItem) => void;
}

interface MonthSection {
  title: string;
  items: MomentItem[];
  topEmotion?: { icon: string; label: string; color?: string } | null;
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

  // Group moments by Month & Year, and calculate top emotion
  const groupedSections: MonthSection[] = [];
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

  // Calculate dominant emotion for each month
  groupedSections.forEach((section) => {
    const emotionCountMap: { [label: string]: { count: number; emotion: any } } = {};
    section.items.forEach((item) => {
      if (item.emotion?.label) {
        if (!emotionCountMap[item.emotion.label]) {
          emotionCountMap[item.emotion.label] = { count: 0, emotion: item.emotion };
        }
        emotionCountMap[item.emotion.label].count += 1;
      }
    });

    let maxCount = 0;
    let dominant: any = null;
    Object.values(emotionCountMap).forEach((entry) => {
      if (entry.count > maxCount) {
        maxCount = entry.count;
        dominant = entry.emotion;
      }
    });
    section.topEmotion = dominant;
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

  const handleCardPress = (item: MomentItem) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // ignore
    }
    onSelectMoment(item);
  };

  const renderVisibilityIcon = (visibility?: Visibility) => {
    if (visibility === Visibility.CLOSE_FRIENDS) {
      return (
        <View
          style={[
            styles.visibilityTag,
            { backgroundColor: isDark ? '#1D2E26' : '#EAF6F0' },
          ]}
        >
          <Ionicons name="star" size={10} color={colors.closeFriends} />
          <Caption weight="bold" style={{ fontSize: 10, color: colors.closeFriends }}>
            {t('moments.closeFriends', 'Bạn thân')}
          </Caption>
        </View>
      );
    }
    if (visibility === Visibility.ONLY_ME) {
      return (
        <View
          style={[
            styles.visibilityTag,
            { backgroundColor: isDark ? '#2B2621' : '#F4EFE6' },
          ]}
        >
          <Ionicons name="lock-closed" size={10} color={colors.textSecondary} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {groupedSections.map((section, sIdx) => (
        <View key={sIdx} style={styles.sectionGroup}>
          {/* Month Chapter Header */}
          <View style={styles.monthHeaderRow}>
            <View
              style={[
                styles.monthCapsule,
                {
                  backgroundColor: isDark ? '#2B2621' : '#F5EFE6',
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="journal-outline" size={14} color={colors.accentDark} />
              <Body
                weight="bold"
                style={{
                  fontSize: 13.5,
                  color: isDark ? '#FDFCF9' : colors.textPrimary,
                }}
              >
                {section.title}
              </Body>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: isDark ? '#3D342C' : '#E8DECة'.replace('ة', 'F') || '#EAE0D2' },
                ]}
              >
                <Caption
                  weight="bold"
                  style={{
                    fontSize: 11,
                    color: isDark ? '#E5D6C5' : colors.accentDark,
                  }}
                >
                  {section.items.length}
                </Caption>
              </View>
            </View>

            {section.topEmotion && (
              <View
                style={[
                  styles.topEmotionBadge,
                  {
                    backgroundColor: isDark ? '#2B221B' : '#FFF6ED',
                    borderColor: section.topEmotion.color || colors.accent,
                  },
                ]}
              >
                <Caption style={{ fontSize: 11 }}>{section.topEmotion.icon}</Caption>
                <Caption
                  weight="semibold"
                  style={{
                    fontSize: 11,
                    color: isDark ? '#F2E8DC' : colors.accentDark,
                  }}
                >
                  {section.topEmotion.label}
                </Caption>
              </View>
            )}

            <View style={[styles.headerDivider, { backgroundColor: colors.divider }]} />
          </View>

          {/* Vertical Timeline Stream */}
          <View style={styles.timelineStream}>
            {/* Continuous Vertical Timeline Track Line */}
            <View
              style={[
                styles.verticalLine,
                { backgroundColor: isDark ? '#3A332C' : '#EBE4D8' },
              ]}
            />

            {section.items.map((item) => {
              const baseEmotionColor = item.emotion?.color || colors.accent;
              const reactionsCount = item.reactionsCount ?? item._count?.reactions ?? 0;
              const messagesCount = item.messagesCount ?? item._count?.messages ?? 0;

              return (
                <View key={item.id} style={styles.timelineItemRow}>
                  {/* Timeline Node Icon/Dot */}
                  <View
                    style={[
                      styles.timelineNode,
                      {
                        backgroundColor: isDark ? '#221E1A' : '#FDFBF7',
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

                  {/* Timeline Journal Card */}
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => handleCardPress(item)}
                    style={[
                      styles.journalCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    {/* Card Header Meta */}
                    <View style={styles.cardHeaderMeta}>
                      <View style={styles.dayBadge}>
                        <Ionicons name="time-outline" size={13} color={colors.accentDark} />
                        <Body weight="bold" color="primary" style={{ fontSize: 13 }}>
                          {formatDay(item.createdAt)}
                        </Body>
                        <Caption color="muted" style={{ fontSize: 11.5 }}>
                          · {formatTime(item.createdAt)}
                        </Caption>
                      </View>

                      <View style={styles.metaRightGroup}>
                        {renderVisibilityIcon(item.visibility)}

                        {item.emotion && (
                          <View
                            style={[
                              styles.emotionPill,
                              {
                                backgroundColor: isDark ? '#2E241E' : '#FFF6EC',
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
                                fontSize: 11,
                                color: isDark ? '#F5EFEB' : colors.accentDark,
                              }}
                            >
                              {item.emotion.label}
                            </Caption>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* 1. PHOTO MOMENT (Polaroid / Framed Photo Style) */}
                    {item.type === MomentType.PHOTO && item.imageUrl ? (
                      <View style={styles.photoContainer}>
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.photoImage}
                          contentFit="cover"
                          transition={200}
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

                    {/* 2. NOTE MOMENT (Warm Journal Parchment Paper Style) */}
                    {item.type === MomentType.NOTE ? (
                      <View
                        style={[
                          styles.noteContainer,
                          {
                            backgroundColor: isDark ? '#2A2520' : '#FAF6EE',
                            borderColor: colors.cardBorder,
                          },
                        ]}
                      >
                        <View style={styles.noteTop}>
                          <View style={styles.noteBadge}>
                            <Ionicons
                              name="document-text"
                              size={14}
                              color={colors.accentDark}
                            />
                            <Caption weight="bold" color="primary" style={{ fontSize: 11 }}>
                              Nhật ký tâm sự
                            </Caption>
                          </View>
                          <Caption color="muted" style={{ fontSize: 18, lineHeight: 18 }}>
                            “
                          </Caption>
                        </View>
                        <Body color="primary" style={styles.noteText}>
                          {item.content}
                        </Body>
                      </View>
                    ) : null}

                    {/* 3. MOOD MOMENT (Soft Emotion Card with Glow) */}
                    {item.type === MomentType.MOOD ? (
                      <View
                        style={[
                          styles.moodContainer,
                          {
                            backgroundColor: isDark ? '#2D251F' : '#FFF7EE',
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
                        <View
                          style={[
                            styles.statChip,
                            {
                              backgroundColor:
                                reactionsCount > 0
                                  ? isDark
                                    ? '#36281F'
                                    : '#FFF1E2'
                                  : 'transparent',
                            },
                          ]}
                        >
                          <Caption style={{ fontSize: 12, lineHeight: 14 }}>❤️</Caption>
                          <Caption
                            weight={reactionsCount > 0 ? 'bold' : 'normal'}
                            color={reactionsCount > 0 ? 'primary' : 'muted'}
                            style={{ fontSize: 11.5 }}
                          >
                            {reactionsCount}
                          </Caption>
                        </View>

                        <View
                          style={[
                            styles.statChip,
                            {
                              backgroundColor:
                                messagesCount > 0
                                  ? isDark
                                    ? '#22302A'
                                    : '#EBF6F1'
                                  : 'transparent',
                            },
                          ]}
                        >
                          <Caption style={{ fontSize: 12, lineHeight: 14 }}>💬</Caption>
                          <Caption
                            weight={messagesCount > 0 ? 'bold' : 'normal'}
                            color={messagesCount > 0 ? 'primary' : 'muted'}
                            style={{ fontSize: 11.5 }}
                          >
                            {messagesCount}
                          </Caption>
                        </View>
                      </View>

                      <View style={styles.viewDetailLink}>
                        <Caption
                          weight="semibold"
                          style={{ color: colors.accentDark, fontSize: 11.5 }}
                        >
                          {t('memories.viewDetail', 'Xem chi tiết')}
                        </Caption>
                        <Ionicons
                          name="chevron-forward"
                          size={12}
                          color={colors.accentDark}
                        />
                      </View>
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
    marginBottom: Spacing.lg,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm + 4,
    gap: 8,
  },
  monthCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  topEmotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
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
    top: 8,
    bottom: 12,
    width: 2,
    borderRadius: 1,
  },
  timelineItemRow: {
    position: 'relative',
    marginBottom: Spacing.md,
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
    borderRadius: 20,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    gap: 5,
  },
  metaRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visibilityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
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
    fontSize: 11,
    lineHeight: 14,
  },
  photoContainer: {
    width: '100%',
  },
  photoImage: {
    width: '100%',
    aspectRatio: 1.15,
  },
  photoCaptionWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
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
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
  },
  noteTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  moodContainer: {
    marginHorizontal: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    padding: Spacing.md + 2,
    borderRadius: 16,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodLargeEmoji: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: 2,
  },
  moodTitle: {
    fontSize: 16.5,
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
    paddingVertical: 8,
    borderTopWidth: 0.8,
  },
  footerStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  viewDetailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
