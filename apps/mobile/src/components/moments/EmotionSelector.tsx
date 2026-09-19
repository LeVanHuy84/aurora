import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { PRESET_EMOTIONS, PresetEmotion } from '../../constants/emotions';
import { Label, Caption } from '../ui/Typography';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface EmotionSelectorProps {
  selectedCode?: string | null;
  onSelectEmotion: (emotion: PresetEmotion | null) => void;
}

export function EmotionSelector({
  selectedCode,
  onSelectEmotion,
}: EmotionSelectorProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {PRESET_EMOTIONS.map((emotion) => {
        const isSelected = selectedCode === emotion.code;

        return (
          <TouchableOpacity
            key={emotion.code}
            activeOpacity={0.75}
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
                backgroundColor: isSelected
                  ? isDark
                    ? emotion.bgDark
                    : emotion.bgLight
                  : colors.surfaceSoft,
                borderColor: isSelected ? emotion.color : colors.cardBorder,
              },
            ]}
          >
            <Label style={styles.icon}>{emotion.icon}</Label>
            <Caption
              weight={isSelected ? 'bold' : 'medium'}
              style={{
                color: isSelected ? emotion.color : colors.textSecondary,
              }}
            >
              {t(emotion.labelKey)}
            </Caption>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    gap: Spacing.xs + 2,
    minHeight: 40,
  },
  icon: {
    fontSize: 16,
  },
});
