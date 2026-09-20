import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { getEmotionLabel } from '../../utils/emotion';
import { CalendarMomentItem } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface MonthlyMoodChartProps {
  moments: CalendarMomentItem[];
  monthName: string;
}

interface EmotionStat {
  code: string;
  label: string;
  icon: string;
  color: string;
  count: number;
  percentage: number;
}

export function MonthlyMoodChart({ moments, monthName }: MonthlyMoodChartProps) {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();

  // Aggregate moments by emotion
  const emotionMap: { [code: string]: EmotionStat } = {};
  let totalWithEmotion = 0;

  moments.forEach((item) => {
    if (item.emotion) {
      totalWithEmotion++;
      const code = item.emotion.code;
      if (!emotionMap[code]) {
        emotionMap[code] = {
          code,
          label: item.emotion.label,
          icon: item.emotion.icon,
          color: item.emotion.color || colors.accent,
          count: 0,
          percentage: 0,
        };
      }
      emotionMap[code].count++;
    }
  });

  const stats: EmotionStat[] = Object.values(emotionMap)
    .map((stat) => ({
      ...stat,
      percentage: totalWithEmotion > 0 ? Math.round((stat.count / totalWithEmotion) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="pie-chart-outline" size={16} color={colors.accentDark} />
          <Title level={3} style={styles.title}>
            {t('profile.monthlyMoodSummary', 'Bản đồ cảm xúc tháng')}
          </Title>
        </View>
        <Caption color="muted" style={styles.monthLabel}>
          {monthName}
        </Caption>
      </View>

      {stats.length === 0 ? (
        <View
          style={[
            styles.emptyNotice,
            { backgroundColor: colors.surfaceSoft, borderColor: colors.cardBorder },
          ]}
        >
          <Caption style={{ fontSize: 22, lineHeight: 28 }}>🌈</Caption>
          <Body color="secondary" align="center" style={styles.emptyText}>
            {t('profile.noMoodData', 'Chưa có đủ dữ liệu cảm xúc trong tháng này.')}
          </Body>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Multi-segment Colored Distribution Bar */}
          <View
            style={[
              styles.distributionBarContainer,
              { backgroundColor: isDark ? '#2B2724' : '#F0EBE3' },
            ]}
          >
            {stats.map((stat, idx) => (
              <View
                key={stat.code}
                style={[
                  styles.distributionBarSegment,
                  {
                    backgroundColor: stat.color,
                    flex: stat.percentage,
                    borderTopLeftRadius: idx === 0 ? 8 : 0,
                    borderBottomLeftRadius: idx === 0 ? 8 : 0,
                    borderTopRightRadius: idx === stats.length - 1 ? 8 : 0,
                    borderBottomRightRadius: idx === stats.length - 1 ? 8 : 0,
                  },
                ]}
              />
            ))}
          </View>

          {/* Mood Pills Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View
                key={stat.code}
                style={[
                  styles.statPill,
                  {
                    backgroundColor: isDark ? '#27231F' : '#FAF6EE',
                    borderColor: stat.color,
                  },
                ]}
              >
                <View style={styles.pillLeft}>
                  <Caption style={styles.pillIcon}>{stat.icon}</Caption>
                  <Body weight="bold" color="primary" style={styles.pillLabel}>
                    {getEmotionLabel(stat, t)}
                  </Body>
                </View>
                <View style={styles.pillRight}>
                  <Body weight="bold" style={{ color: stat.color, fontSize: 13 }}>
                    {stat.percentage}%
                  </Body>
                  <Caption color="muted" style={{ fontSize: 11 }}>
                    ({stat.count})
                  </Caption>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  monthLabel: {
    fontSize: 12,
  },
  emptyNotice: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptyText: {
    fontSize: 13,
  },
  content: {
    gap: Spacing.sm,
  },
  distributionBarContainer: {
    height: 12,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  distributionBarSegment: {
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statPill: {
    width: '48.8%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pillIcon: {
    fontSize: 13.5,
    lineHeight: 17,
  },
  pillLabel: {
    fontSize: 12.5,
  },
  pillRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
});
