import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Body } from '../ui/Typography';
import { MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface MomentTypeSegmentProps {
  selectedType: MomentType;
  onSelectType: (type: MomentType) => void;
}

export function MomentTypeSegment({
  selectedType,
  onSelectType,
}: MomentTypeSegmentProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  const types: { type: MomentType; icon: any; labelKey: string; fallback: string }[] = [
    { type: MomentType.PHOTO, icon: 'camera', labelKey: 'moments.photo', fallback: 'Ảnh' },
    { type: MomentType.NOTE, icon: 'document-text', labelKey: 'moments.note', fallback: 'Ghi chú' },
    { type: MomentType.MOOD, icon: 'happy', labelKey: 'moments.mood', fallback: 'Cảm xúc' },
  ];

  return (
    <View
      style={[
        styles.segmentContainer,
        { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
      ]}
    >
      {types.map((item) => {
        const isActive = selectedType === item.type;
        return (
          <TouchableOpacity
            key={item.type}
            activeOpacity={0.8}
            onPress={() => onSelectType(item.type)}
            style={[
              styles.segmentBtn,
              isActive && [
                styles.segmentBtnActive,
                {
                  backgroundColor: colors.card,
                  borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
                },
              ],
            ]}
          >
            <Ionicons
              name={item.icon}
              size={16}
              color={isActive ? colors.accentDark : colors.textSecondary}
            />
            <Body
              weight={isActive ? 'bold' : 'medium'}
              style={{
                color: isActive ? colors.accentDark : colors.textSecondary,
                fontSize: 14,
              }}
            >
              {t(item.labelKey, item.fallback)}
            </Body>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    padding: 3,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    height: 44,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  segmentBtnActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
