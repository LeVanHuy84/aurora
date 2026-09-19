import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { MomentItem, MomentType } from '@aurora/types';
import { useAppTheme } from '../../hooks/use-theme';
import { Body, Label, Title } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Ionicons } from '../common/Icon';
import { FloatingEmojiBurst } from './FloatingEmojiBurst';

export interface MomentCanvasProps {
  moment: MomentItem;
  burstEmoji: string;
  burstKey: number;
}

export function MomentCanvas({ moment, burstEmoji, burstKey }: MomentCanvasProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const emotion = moment.emotion;

  return (
    <View style={styles.canvasWrapper}>
      {/* 1. PHOTO MOMENT */}
      {moment.type === MomentType.PHOTO && moment.imageUrl ? (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.photo}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          <FloatingEmojiBurst emoji={burstEmoji} triggerKey={burstKey} />
        </View>
      ) : null}

      {/* 2. NOTE MOMENT */}
      {moment.type === MomentType.NOTE ? (
        <View
          style={[
            styles.noteContainer,
            {
              backgroundColor: isDark ? '#262320' : '#FDF7EE',
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.noteHeader}>
            <Ionicons
              name="document-text"
              size={20}
              color={colors.accentDark}
            />
            <Body weight="bold" color="primary" style={{ fontSize: 16 }}>
              {t('moments.note', 'Ghi chú')}
            </Body>
          </View>
          <Body color="primary" style={styles.noteText}>
            "{moment.content}"
          </Body>
          <FloatingEmojiBurst emoji={burstEmoji} triggerKey={burstKey} />
        </View>
      ) : null}

      {/* 3. MOOD MOMENT */}
      {moment.type === MomentType.MOOD ? (
        <View
          style={[
            styles.moodContainer,
            {
              backgroundColor: isDark ? '#262320' : '#FFF9F2',
              borderColor: emotion?.color || colors.accent,
            },
          ]}
        >
          <Label style={styles.moodEmoji}>{emotion?.icon || '✨'}</Label>
          <Title level={2} style={styles.moodTitle}>
            {emotion?.label || t('moments.mood', 'Cảm xúc')}
          </Title>
          {moment.content ? (
            <Body color="secondary" style={styles.moodContentText}>
              {moment.content}
            </Body>
          ) : null}
          <FloatingEmojiBurst emoji={burstEmoji} triggerKey={burstKey} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvasWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EAE6DF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  noteContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: Spacing.xl,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  noteText: {
    fontSize: 19,
    lineHeight: 29,
    fontStyle: 'italic',
  },
  moodContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 28,
    borderWidth: 2,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 68,
    lineHeight: 78,
  },
  moodTitle: {
    marginTop: Spacing.sm,
    fontSize: 24,
  },
  moodContentText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
});
