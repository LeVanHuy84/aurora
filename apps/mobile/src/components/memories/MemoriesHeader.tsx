import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { Spacing, BorderRadius } from '../../constants/theme';

export type MemoriesTabMode = 'CALENDAR' | 'TIMELINE';

export interface MemoriesHeaderProps {
  activeMode: MemoriesTabMode;
  onSelectMode: (mode: MemoriesTabMode) => void;
  totalMoments?: number;
}

export function MemoriesHeader({
  activeMode,
  onSelectMode,
  totalMoments,
}: MemoriesHeaderProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View>
          <Title level={1} style={styles.title}>
            {t('memories.title', 'Kỷ niệm')}
          </Title>
          <Caption color="muted" style={styles.subtitle}>
            {totalMoments !== undefined
              ? t('memories.totalRecorded', {
                  count: totalMoments,
                  defaultValue: `Đã lưu ${totalMoments} khoảnh khắc`,
                })
              : t('memories.subtitle', 'Hành trình cảm xúc & khoảnh khắc đã lưu')}
          </Caption>
        </View>
      </View>

      {/* Segmented Mode Switcher */}
      <View
        style={[
          styles.segmentContainer,
          {
            backgroundColor: isDark ? '#262320' : '#EFECE6',
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMode('CALENDAR')}
          style={[
            styles.segmentButton,
            activeMode === 'CALENDAR' && [
              styles.segmentButtonActive,
              { backgroundColor: colors.card },
            ],
          ]}
        >
          <Ionicons
            name="calendar"
            size={15}
            color={activeMode === 'CALENDAR' ? colors.accentDark : colors.textMuted}
          />
          <Body
            weight={activeMode === 'CALENDAR' ? 'bold' : 'medium'}
            style={{
              fontSize: 13,
              color: activeMode === 'CALENDAR' ? colors.textPrimary : colors.textSecondary,
            }}
          >
            {t('memories.calendarTab', 'Lịch cảm xúc')}
          </Body>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectMode('TIMELINE')}
          style={[
            styles.segmentButton,
            activeMode === 'TIMELINE' && [
              styles.segmentButtonActive,
              { backgroundColor: colors.card },
            ],
          ]}
        >
          <Ionicons
            name="time"
            size={15}
            color={activeMode === 'TIMELINE' ? colors.accentDark : colors.textMuted}
          />
          <Body
            weight={activeMode === 'TIMELINE' ? 'bold' : 'medium'}
            style={{
              fontSize: 13,
              color: activeMode === 'TIMELINE' ? colors.textPrimary : colors.textSecondary,
            }}
          >
            {t('memories.timelineTab', 'Dòng thời gian')}
          </Body>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm + 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 12.5,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  segmentButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 2.5,
    elevation: 2,
  },
});
