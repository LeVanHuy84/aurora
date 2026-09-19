import React, { useState, useMemo } from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { useCalendarMoments, useHistoryMoments } from '../../src/hooks/use-moments';
import { ScreenContainer } from '../../src/components/common/ScreenContainer';
import { MemoriesHeader, MemoriesTabMode } from '../../src/components/memories/MemoriesHeader';
import { MoodCalendar } from '../../src/components/memories/MoodCalendar';
import { OnThisDayCard } from '../../src/components/memories/OnThisDayCard';
import { DayMomentsList } from '../../src/components/memories/DayMomentsList';
import { HistoryTimeline } from '../../src/components/memories/HistoryTimeline';
import { MomentDetailModal } from '../../src/components/memories/MomentDetailModal';
import { MomentItem } from '@aurora/types';
import { Spacing } from '../../src/constants/theme';

export default function MemoriesScreen() {
  const today = useMemo(() => new Date(), []);

  // UI States
  const [activeMode, setActiveMode] = useState<MemoriesTabMode>('CALENDAR');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedMomentDetail, setSelectedMomentDetail] = useState<MomentItem | null>(null);

  // Queries
  const {
    data: calendarMoments = [],
    isLoading: isLoadingCalendar,
    refetch: refetchCalendar,
    isRefetching: isRefetchingCalendar,
  } = useCalendarMoments(currentMonth, currentYear);

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = useHistoryMoments(100);

  const historyMoments = useMemo(
    () => historyData?.items || [],
    [historyData?.items],
  );

  // Filter moments for the selected calendar day
  const selectedDayMoments = useMemo(() => {
    return historyMoments.filter((m) => {
      const d = new Date(m.createdAt);
      return (
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [historyMoments, selectedDate]);

  // Find "On This Day" memory (moment from previous year on same date, or previous month)
  const onThisDayMoment = useMemo(() => {
    return (
      historyMoments.find((m) => {
        const d = new Date(m.createdAt);
        const isSameDayAndMonth =
          d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
        const isPastYear = d.getFullYear() < today.getFullYear();
        return isSameDayAndMonth && isPastYear;
      }) || null
    );
  }, [historyMoments, today]);

  // Pull to refresh handler
  const isRefreshing = isRefetchingCalendar || isRefetchingHistory;
  const handleRefresh = async () => {
    await Promise.all([refetchCalendar(), refetchHistory()]);
  };

  const handleChangeMonth = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <ScreenContainer
      scrollable
      edges={['top']}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* 1. Header with Mode Segment Switcher */}
      <MemoriesHeader
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        totalMoments={historyMoments.length}
      />

      {activeMode === 'CALENDAR' ? (
        <>
          {/* 2. "On This Day" Highlight Card (if any) */}
          {onThisDayMoment && (
            <OnThisDayCard
              moment={onThisDayMoment}
              onPress={(m) => setSelectedMomentDetail(m)}
            />
          )}

          {/* 3. Monthly Mood Calendar Grid */}
          <MoodCalendar
            currentMonth={currentMonth}
            currentYear={currentYear}
            selectedDate={selectedDate}
            moments={calendarMoments}
            isLoading={isLoadingCalendar}
            onSelectDate={setSelectedDate}
            onChangeMonth={handleChangeMonth}
          />

          {/* 4. Filtered Day Moments List */}
          <DayMomentsList
            selectedDate={selectedDate}
            moments={selectedDayMoments}
            onSelectMoment={(m) => setSelectedMomentDetail(m)}
          />
        </>
      ) : (
        /* 5. Full History Timeline View */
        <HistoryTimeline
          moments={historyMoments}
          isLoading={isLoadingHistory}
          onSelectMoment={(m) => setSelectedMomentDetail(m)}
        />
      )}

      {/* 6. Moment Detail Modal */}
      <MomentDetailModal
        visible={!!selectedMomentDetail}
        moment={selectedMomentDetail}
        onClose={() => setSelectedMomentDetail(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm + 4,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl * 2,
  },
});
