import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MomentType, QuotedMomentSummary } from '@aurora/types';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Caption, Label, Title } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { BorderRadius } from '../../constants/theme';

export interface ChatSharedMomentCardProps {
  moment?: QuotedMomentSummary | null;
  isMe: boolean;
}

export function ChatSharedMomentCard({ moment, isMe }: ChatSharedMomentCardProps) {
  const { colors, isDark } = useAppTheme();

  if (!moment) return null;

  const type = moment.type || (moment.imageUrl ? MomentType.PHOTO : MomentType.NOTE);

  // 1. PHOTO MOMENT (Compact Locket 1:1 Square)
  if (type === MomentType.PHOTO && moment.imageUrl) {
    return (
      <View
        style={[
          styles.container,
          styles.photoContainer,
          {
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        <Image
          source={{ uri: moment.imageUrl }}
          style={styles.photo}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        {/* Top Tag Badge */}
        <View style={styles.topPhotoTag}>
          <Caption color="white" weight="bold" style={styles.topPhotoTagText}>
            ✦ Khoảnh khắc
          </Caption>
        </View>

        {/* Floating Caption on Photo (Locket style) */}
        {moment.content ? (
          <View style={styles.floatingCaption}>
            <Caption
              color="white"
              weight="semibold"
              numberOfLines={2}
              style={styles.captionText}
            >
              {moment.content}
            </Caption>
          </View>
        ) : null}
      </View>
    );
  }

  // 2. NOTE MOMENT (Compact Warm Diary Note)
  if (type === MomentType.NOTE) {
    return (
      <View
        style={[
          styles.container,
          styles.noteContainer,
          {
            backgroundColor: isDark ? '#262320' : '#FFFDF7',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.cardBorder,
          },
        ]}
      >
        <View style={styles.noteHeader}>
          <Ionicons name="document-text" size={15} color={colors.accentDark} />
          <Caption weight="bold" color="primary" style={{ fontSize: 12 }}>
            Ghi chú
          </Caption>
        </View>
        <Body color="primary" style={styles.noteText} numberOfLines={3}>
          "{moment.content}"
        </Body>
      </View>
    );
  }

  // 3. MOOD MOMENT (Compact Mood Card)
  if (type === MomentType.MOOD) {
    const emotion = moment.emotion;
    return (
      <View
        style={[
          styles.container,
          styles.moodContainer,
          {
            backgroundColor: isDark ? '#262320' : '#FFF9F2',
            borderColor: emotion?.color || colors.accent,
          },
        ]}
      >
        <Label style={styles.moodEmoji}>{emotion?.icon || '✨'}</Label>
        <Title level={3} style={styles.moodTitle}>
          {emotion?.label || 'Cảm xúc'}
        </Title>
        {moment.content ? (
          <Caption color="secondary" numberOfLines={2} style={styles.moodContentText}>
            {moment.content}
          </Caption>
        ) : null}
      </View>
    );
  }

  // Fallback
  return (
    <View
      style={[
        styles.container,
        styles.noteContainer,
        {
          backgroundColor: isDark ? '#262320' : '#F5F2EB',
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Caption color="muted">✦ Khoảnh khắc</Caption>
      {moment.content ? (
        <Body color="primary" numberOfLines={2} style={{ marginTop: 4 }}>
          {moment.content}
        </Body>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  photoContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: '#EAE6DF',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  topPhotoTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  topPhotoTagText: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
  floatingCaption: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  noteContainer: {
    padding: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13.5,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  moodContainer: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  moodEmoji: {
    fontSize: 34,
    lineHeight: 40,
  },
  moodTitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
  },
  moodContentText: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 11.5,
  },
});
