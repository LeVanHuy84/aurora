import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '../common/Icon';
import { useAppTheme } from '../../hooks/use-theme';
import { Title } from '../ui/Typography';
import { Spacing } from '../../constants/theme';

export interface CreateMomentHeaderProps {
  onClose: () => void;
}

export function CreateMomentHeader({ onClose }: CreateMomentHeaderProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.topNav, { borderBottomColor: colors.divider }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.navBtn,
          { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
        ]}
      >
        <Ionicons name="close" size={20} color={colors.textPrimary} />
      </TouchableOpacity>

      <Title level={3} style={styles.navTitle}>
        {t('moments.createMomentTitle', 'Tạo khoảnh khắc')}
      </Title>

      <View style={styles.navPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPlaceholder: {
    width: 36,
  },
  navTitle: {
    fontSize: 17.5,
    letterSpacing: -0.2,
    fontWeight: '700',
  },
});
