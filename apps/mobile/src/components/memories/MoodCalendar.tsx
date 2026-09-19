import React from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../hooks/use-theme';
import { Title, Body, Caption } from '../ui/Typography';
import { Ionicons } from '../common/Icon';
import { CalendarMomentItem, MomentType } from '@aurora/types';
import { Spacing, BorderRadius } from '../../constants/theme';

export interface MoodCalendarProps {
  currentMonth: number; // 1 - 12
  currentYear: number;
  selectedDate: Date;
  moments: CalendarMomentItem[];
  isLoading?: boolean;
  onSelectDate: (date: Date) => void;
  onChangeMonth: (month: number, year: number) => void;
}

export function MoodCalendar({
  currentMonth,
  currentYear,
  selectedDate,
  moments,
  isLoading = false,
  onSelectDate,
  onChangeMonth,
}: MoodCalendarProps) {
  const { colors, isDark } = useAppTheme();
  const { t, i18n } = useTranslation();

  const isVi = i18n.language.startsWith('vi');
  const weekDays = isVi
    ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date();
  const isCurrentMonthToday =
    today.getMonth() + 1 === currentMonth && today.getFullYear() === currentYear;

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onChangeMonth(12, currentYear - 1);
    } else {
      onChangeMonth(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onChangeMonth(1, currentYear + 1);
    } else {
      onChangeMonth(currentMonth + 1, currentYear);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    onChangeMonth(now.getMonth() + 1, now.getFullYear());
    onSelectDate(now);
  };

  // Calendar matrix calculation (Monday = 0, Sunday = 6)
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  let startingDayIndex = firstDayOfMonth.getDay() - 1;
  if (startingDayIndex === -1) startingDayIndex = 6; // Sunday becomes index 6

  // Map moments by day of month (1..31)
  const momentsByDay: { [day: number]: CalendarMomentItem[] } = {};
  moments.forEach((item) => {
    const itemDate = new Date(item.createdAt);
    if (
      itemDate.getMonth() + 1 === currentMonth &&
      itemDate.getFullYear() === currentYear
    ) {
      const day = itemDate.getDate();
      if (!momentsByDay[day]) momentsByDay[day] = [];
      momentsByDay[day].push(item);
    }
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      {/* Month Navigator Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePrevMonth}
          style={[styles.navBtn, { borderColor: colors.cardBorder }]}
        >
          <Ionicons name="chevron-back" size={17} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.monthTitleWrapper}>
          <Title level={3} style={styles.monthTitle}>
            {isVi
              ? `Tháng ${currentMonth}, ${currentYear}`
              : `${firstDayOfMonth.toLocaleString('en-US', { month: 'long' })} ${currentYear}`}
          </Title>
          {!isCurrentMonthToday && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleGoToday}
              style={[styles.todayBadge, { backgroundColor: colors.surfaceSoft }]}
            >
              <Caption color="primary" weight="bold" style={{ fontSize: 11 }}>
                {t('memories.todayBtn', 'Hôm nay')}
              </Caption>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNextMonth}
          style={[styles.navBtn, { borderColor: colors.cardBorder }]}
        >
          <Ionicons name="chevron-forward" size={17} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekDaysRow}>
        {weekDays.map((day, idx) => (
          <View key={idx} style={styles.weekDayCol}>
            <Caption
              weight="semibold"
              color="muted"
              style={[
                styles.weekDayText,
                (idx === 5 || idx === 6) && { color: colors.accentDark },
              ]}
            >
              {day}
            </Caption>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {/* Empty padding cells */}
          {Array.from({ length: startingDayIndex }).map((_, idx) => (
            <View key={`empty-${idx}`} style={styles.dayCellEmpty} />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const cellDate = new Date(currentYear, currentMonth - 1, dayNum);

            const isSelected =
              selectedDate.getDate() === dayNum &&
              selectedDate.getMonth() + 1 === currentMonth &&
              selectedDate.getFullYear() === currentYear;

            const isCurrentDay =
              today.getDate() === dayNum &&
              today.getMonth() + 1 === currentMonth &&
              today.getFullYear() === currentYear;

            const dayMoments = momentsByDay[dayNum] || [];
            const hasMoments = dayMoments.length > 0;

            // Pick emoji or icon representation
            const primaryMomentWithEmotion = dayMoments.find((m) => m.emotion?.icon);
            const displayIcon = primaryMomentWithEmotion?.emotion?.icon
              ? primaryMomentWithEmotion.emotion.icon
              : hasMoments
              ? dayMoments[0].type === MomentType.PHOTO
                ? '📷'
                : '📝'
              : null;

            const emotionColor = primaryMomentWithEmotion?.emotion?.color;

            return (
              <TouchableOpacity
                key={`day-${dayNum}`}
                activeOpacity={0.7}
                onPress={() => onSelectDate(cellDate)}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#352D26'
                        : '#FFF2E4'
                      : 'transparent',
                    borderColor: isSelected
                      ? colors.accent
                      : isCurrentDay
                      ? colors.accentDark
                      : 'transparent',
                    borderWidth: isSelected || isCurrentDay ? 1.5 : 0,
                  },
                ]}
              >
                <Body
                  weight={isSelected || isCurrentDay ? 'bold' : 'normal'}
                  style={[
                    styles.dayNumber,
                    {
                      color: isSelected
                        ? colors.accentDark
                        : isCurrentDay
                        ? colors.accentDark
                        : colors.textPrimary,
                    },
                  ]}
                >
                  {dayNum}
                </Body>

                {/* Mood Emoji or Indicator (Unclipped & properly sized) */}
                <View style={styles.iconContainer}>
                  {displayIcon ? (
                    <Caption style={styles.moodEmoji}>{displayIcon}</Caption>
                  ) : (
                    <View style={styles.emptyIconPlaceholder} />
                  )}
                </View>

                {/* Multiple moments indicator dot */}
                {dayMoments.length > 1 && (
                  <View
                    style={[
                      styles.multiDot,
                      { backgroundColor: emotionColor || colors.accent },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 4,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  todayBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  weekDayText: {
    fontSize: 11.5,
  },
  loadingContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 52,
  },
  dayCell: {
    width: '14.28%',
    height: 52,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
    position: 'relative',
  },
  dayNumber: {
    fontSize: 12.5,
    lineHeight: 15,
  },
  iconContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyIconPlaceholder: {
    height: 4,
  },
  multiDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
