import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Caption } from '../ui/Typography';
import { EmotionSelector } from '../moments/EmotionSelector';
import { EmotionItem } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface MoodMomentFormProps {
  selectedEmotion: EmotionItem | null;
  content: string;
  onSelectEmotion: (emotion: EmotionItem | null) => void;
  onChangeContent: (text: string) => void;
}

export function MoodMomentForm({
  selectedEmotion,
  content,
  onSelectEmotion,
  onChangeContent,
}: MoodMomentFormProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const baseColor = selectedEmotion?.color || colors.accent;
  const heroBg = selectedEmotion
    ? isDark
      ? `${baseColor}26`
      : `${baseColor}18`
    : colors.surfaceSoft;

  return (
    <View style={styles.container}>
      {/* Selected Mood Hero Card */}
      <View
        style={[
          styles.moodHeroCard,
          {
            backgroundColor: heroBg,
            borderColor: selectedEmotion ? baseColor : colors.cardBorder,
          },
        ]}
      >
        <Title level={1} style={styles.moodHeroEmoji}>
          {selectedEmotion?.icon || '✨'}
        </Title>
        <Title level={2} style={[styles.moodHeroLabel, { color: colors.textPrimary }]}>
          {selectedEmotion
            ? selectedEmotion.label
            : t('moments.howAreYouFeeling', 'Bạn đang cảm thấy thế nào?')}
        </Title>
      </View>

      {/* Emotion Slider / Selector */}
      <EmotionSelector
        selectedId={selectedEmotion?.id}
        selectedCode={selectedEmotion?.code}
        onSelectEmotion={onSelectEmotion}
      />

      {/* Optional Mood Reflection */}
      <View
        style={[
          styles.captionCard,
          {
            backgroundColor: colors.surfaceSoft,
            borderColor: colors.cardBorder,
            marginTop: Spacing.sm,
          },
        ]}
      >
        <TextInput
          multiline
          numberOfLines={3}
          value={content}
          onChangeText={(text) => {
            if (text.length <= 500) onChangeContent(text);
          }}
          placeholder={t(
            'moments.moodPlaceholder',
            'Chia sẻ thêm về tâm trạng của bạn (không bắt buộc)...',
          )}
          placeholderTextColor={colors.textMuted}
          style={[styles.captionInput, { color: colors.textPrimary }]}
        />
        <Caption color="muted" align="right" style={styles.charCounter}>
          {content.length}/500
        </Caption>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  moodHeroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  moodHeroEmoji: {
    fontSize: 54,
    lineHeight: 62,
    marginBottom: 6,
  },
  moodHeroLabel: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  captionCard: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    padding: Spacing.md,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  captionInput: {
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 50,
  },
  charCounter: {
    fontSize: 11.5,
  },
});
