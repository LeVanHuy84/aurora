import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { useEmotions } from '../../hooks/use-emotions';
import { EmotionItem } from '@aurora/types';
import { Label, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';
import { getEmotionLabel } from '../../utils/emotion';

export interface EmotionSelectorProps {
  selectedId?: string | null;
  selectedCode?: string | null;
  onSelectEmotion: (emotion: EmotionItem | null) => void;
}

export function EmotionSelector({
  selectedId,
  selectedCode,
  onSelectEmotion,
}: EmotionSelectorProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const { data: emotions = [], isLoading } = useEmotions();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {emotions.map((emotion) => {
        const isSelected =
          (selectedId && emotion.id === selectedId) ||
          (selectedCode && emotion.code.toUpperCase() === selectedCode.toUpperCase());

        const baseColor = emotion.color || colors.accent;
        const selectedBg = isDark ? `${baseColor}38` : `${baseColor}1F`;

        return (
          <TouchableOpacity
            key={emotion.id || emotion.code}
            activeOpacity={0.7}
            onPress={() => {
              if (isSelected) {
                onSelectEmotion(null);
              } else {
                onSelectEmotion(emotion);
              }
            }}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? selectedBg : colors.surfaceSoft,
                borderColor: isSelected ? baseColor : colors.cardBorder,
              },
            ]}
          >
            <Label style={styles.icon}>{emotion.icon || '✨'}</Label>
            <Caption
              weight={isSelected ? 'bold' : 'medium'}
              style={{
                color: isSelected ? baseColor : colors.textSecondary,
                fontSize: 12.5,
              }}
            >
              {getEmotionLabel(emotion, t)}
            </Caption>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingVertical: 2,
    paddingRight: Spacing.md,
    gap: Spacing.xs + 3,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.2,
    gap: 6,
    height: 36,
  },
  icon: {
    fontSize: 15,
    lineHeight: 18,
  },
});
