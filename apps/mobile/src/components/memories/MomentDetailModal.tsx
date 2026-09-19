import React from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { MomentItem, MomentType, Visibility } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface MomentDetailModalProps {
  visible: boolean;
  moment: MomentItem | null;
  onClose: () => void;
}

export function MomentDetailModal({
  visible,
  moment,
  onClose,
}: MomentDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  if (!moment) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} lúc ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '';
    }
  };

  const getVisibilityLabel = (visibility?: Visibility) => {
    switch (visibility) {
      case Visibility.CLOSE_FRIENDS:
        return t('moments.closeFriends', 'Bạn thân');
      case Visibility.FRIENDS:
        return t('moments.friends', 'Bạn bè');
      default:
        return t('moments.onlyMe', 'Chỉ mình tôi');
    }
  };

  const baseEmotionColor = moment.emotion?.color || colors.accent;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header Bar */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: colors.divider,
              paddingTop: Math.max(insets.top, 24) + Spacing.sm,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceSoft }]}
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Title level={3} style={styles.headerTitle}>
            {t('memories.momentDetail', 'Chi tiết khoảnh khắc')}
          </Title>

          <View style={styles.placeholderBtn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Metadata Bar */}
          <View style={styles.metaHeader}>
            <View style={styles.dateGroup}>
              <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
              <Caption color="secondary" style={styles.dateText}>
                {formatDate(moment.createdAt)}
              </Caption>
            </View>

            <View
              style={[
                styles.visibilityBadge,
                {
                  backgroundColor:
                    moment.visibility === Visibility.CLOSE_FRIENDS
                      ? isDark
                        ? '#172B25'
                        : '#E8F5F1'
                      : colors.surfaceSoft,
                },
              ]}
            >
              <Ionicons
                name={
                  moment.visibility === Visibility.CLOSE_FRIENDS
                    ? 'star'
                    : moment.visibility === Visibility.FRIENDS
                    ? 'people'
                    : 'lock-closed'
                }
                size={12}
                color={
                  moment.visibility === Visibility.CLOSE_FRIENDS
                    ? colors.closeFriends
                    : colors.textSecondary
                }
              />
              <Caption
                weight="bold"
                style={{
                  fontSize: 11,
                  color:
                    moment.visibility === Visibility.CLOSE_FRIENDS
                      ? colors.closeFriends
                      : colors.textSecondary,
                }}
              >
                {getVisibilityLabel(moment.visibility)}
              </Caption>
            </View>
          </View>

          {/* Main Visual Content */}
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {moment.type === MomentType.PHOTO && moment.imageUrl ? (
              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: moment.imageUrl }}
                  style={styles.fullPhoto}
                  contentFit="cover"
                />
              </View>
            ) : moment.type === MomentType.MOOD ? (
              <View
                style={[
                  styles.moodContainer,
                  {
                    backgroundColor: isDark ? '#2E2721' : '#FFF6EB',
                    borderColor: baseEmotionColor,
                  },
                ]}
              >
                <Caption style={styles.moodLargeEmoji}>
                  {moment.emotion?.icon || '✨'}
                </Caption>
                <Title level={1} style={[styles.moodLargeTitle, { color: colors.textPrimary }]}>
                  {moment.emotion?.label || 'Cảm xúc'}
                </Title>
              </View>
            ) : (
              <View
                style={[
                  styles.noteContainer,
                  {
                    backgroundColor: isDark ? '#2B2621' : '#FBF7EF',
                  },
                ]}
              >
                <Ionicons
                  name="document-text"
                  size={24}
                  color={colors.accentDark}
                  style={{ marginBottom: Spacing.sm }}
                />
                <Body style={styles.noteLargeText}>
                  "{moment.content}"
                </Body>
              </View>
            )}

            {/* Emotion & Content Details */}
            <View style={styles.cardBody}>
              {moment.emotion && (
                <View
                  style={[
                    styles.emotionDetailPill,
                    {
                      backgroundColor: isDark ? '#332B24' : '#FFF3E5',
                      borderColor: baseEmotionColor,
                    },
                  ]}
                >
                  <Caption style={{ fontSize: 16, lineHeight: 20 }}>{moment.emotion.icon}</Caption>
                  <Body
                    weight="bold"
                    style={{
                      fontSize: 14,
                      color: baseEmotionColor,
                    }}
                  >
                    {moment.emotion.label}
                  </Body>
                </View>
              )}

              {moment.content && moment.type !== MomentType.NOTE && (
                <Body color="primary" style={styles.captionText}>
                  {moment.content}
                </Body>
              )}

              {/* Interactions counter */}
              <View style={[styles.interactionsBar, { borderTopColor: colors.divider }]}>
                <View style={styles.counterItem}>
                  <Caption style={{ fontSize: 16, lineHeight: 20 }}>❤️</Caption>
                  <Caption weight="bold" color="primary">
                    {moment._count?.reactions || moment.reactionsCount || 0} lượt thích
                  </Caption>
                </View>
                <View style={styles.counterItem}>
                  <Caption style={{ fontSize: 16, lineHeight: 20 }}>💬</Caption>
                  <Caption weight="bold" color="primary">
                    {moment._count?.comments || moment.commentsCount || 0} phản hồi
                  </Caption>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  placeholderBtn: {
    width: 36,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  cardContainer: {
    borderRadius: 24,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  moodContainer: {
    paddingVertical: Spacing.xl * 1.5,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  moodLargeEmoji: {
    fontSize: 64,
    lineHeight: 74,
    marginBottom: Spacing.xs,
  },
  moodLargeTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  noteContainer: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    minHeight: 180,
    justifyContent: 'center',
  },
  noteLargeText: {
    fontSize: 17,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  cardBody: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emotionDetailPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.2,
  },
  captionText: {
    fontSize: 15.5,
    lineHeight: 23,
  },
  interactionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
