import React, { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { Habit, HabitCadence } from '../../types/habit';
import { LogEntry } from '../../types/log';
import { WeekStart } from '../../types/settings';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { addDays, parseDate } from '../../utils/dates';
import {
  CALENDAR_RANGES,
  CalendarRange,
  calendarRangeStart,
  defaultCalendarRange,
} from '../../utils/history';
import Section, { makeNoteStyles } from './Section';
import MonthGrid, { DayInfo, DayState } from './MonthGrid';

// History: month grids over a chosen range, a legend, and for Hours habits the
// hours per day under it (habit-group-detail-page.md, decisions 13–14)
export const RANGE_LABELS: Record<CalendarRange, string> = {
  week: 'Last week',
  month: 'Last month',
  '3m': '3 months',
  '6m': '6 months',
  year: 'Last year',
};

const STATE_WORDS: Record<DayState, string> = {
  done: 'done',
  partial: 'part done',
  frozen: 'frozen',
  none: 'not done',
};

export function dayLabel(dateKey: string, state: DayState): string {
  const date = parseDate(dateKey).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return `${date}, ${STATE_WORDS[state]}`;
}

// Done, part of an Hours target, frozen, or not done
export function dayStateOf(
  dateKey: string,
  done: Set<string>,
  frozen: Set<string>,
  hours?: Map<string, number>,
): DayState {
  if (done.has(dateKey)) return 'done';
  if ((hours?.get(dateKey) ?? 0) > 0) return 'partial';
  if (frozen.has(dateKey)) return 'frozen';
  return 'none';
}

export function monthsBetween(from: string, to: string): [number, number][] {
  const start = parseDate(from);
  const end = parseDate(to);
  const months: [number, number][] = [];
  for (
    let d = new Date(start.getFullYear(), start.getMonth(), 1);
    d <= end;
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  ) {
    months.push([d.getFullYear(), d.getMonth()]);
  }
  return months;
}

interface HistorySectionProps {
  cadence: HabitCadence;
  markers: LogEntry[];
  frozenDates: string[];
  hoursHabit?: Habit; // Hours habits: part days and the hours chart
  todayKey: string;
  weekStart: WeekStart;
  color: string;
}

export default function HistorySection({
  cadence,
  markers,
  frozenDates,
  hoursHabit,
  todayKey,
  weekStart,
  color,
}: HistorySectionProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const [range, setRange] = useState<CalendarRange>(
    defaultCalendarRange(cadence),
  );
  const scroll = useRef<ScrollView>(null);
  const from = calendarRangeStart(range, todayKey);

  const done = useMemo(() => new Set(markers.map(m => m.date)), [markers]);
  const frozen = useMemo(() => new Set(frozenDates), [frozenDates]);
  const hours = useMemo(
    () =>
      hoursHabit
        ? new Map(
            hoursHabit.history
              .filter(e => e.kind === 'hours')
              .map(e => [e.date, e.value]),
          )
        : undefined,
    [hoursHabit],
  );
  const dayInfo = (dateKey: string): DayInfo => {
    const state = dayStateOf(dateKey, done, frozen, hours);
    return {
      state,
      inRange: dateKey >= from && dateKey <= todayKey,
      label: dayLabel(dateKey, state),
    };
  };

  return (
    <Section title="HISTORY" testID="detail-history">
      <View style={styles.chips}>
        {CALENDAR_RANGES.map(id => {
          const selected = id === range;
          return (
            <Pressable
              key={id}
              testID={`history-range-${id}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              hitSlop={{ top: 10, bottom: 10 }}
              onPress={() => setRange(id)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipLabel, selected && styles.chipLabelSelected]}
              >
                {RANGE_LABELS[id]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {/* Newest month at the bottom, opened scrolled to it */}
      <ScrollView
        ref={scroll}
        nestedScrollEnabled
        style={styles.months}
        contentContainerStyle={styles.monthsContent}
        onContentSizeChange={() =>
          scroll.current?.scrollToEnd({ animated: false })
        }
      >
        {monthsBetween(from, todayKey).map(([year, month]) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            weekStart={weekStart}
            color={color}
            dayInfo={dayInfo}
          />
        ))}
      </ScrollView>
      <View style={styles.legend}>
        <LegendItem label="Done">
          <View style={[styles.dot, { backgroundColor: color }]} />
        </LegendItem>
        {hoursHabit ? (
          <LegendItem label="Part of target">
            <View style={[styles.dot, styles.ring, { borderColor: color }]}>
              <View style={[styles.half, { backgroundColor: color }]} />
            </View>
          </LegendItem>
        ) : null}
        <LegendItem label="Frozen">
          <View
            style={[styles.dot, styles.ring, { borderColor: colors.v2Ice }]}
          />
        </LegendItem>
        <LegendItem label="Not done">
          <View style={[styles.dot, styles.ring]} />
        </LegendItem>
      </View>
      {hoursHabit ? (
        <HoursBars
          habit={hoursHabit}
          hours={hours ?? new Map()}
          from={from}
          todayKey={todayKey}
          color={color}
        />
      ) : null}
    </Section>
  );
}

function LegendItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.legendItem}>
      {children}
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

// One bar a day for up to a month; longer ranges one bar a week, the average
// hours a day that week. The daily target is a dashed line.
export function hoursBars(
  hours: Map<string, number>,
  from: string,
  todayKey: string,
): { values: number[]; weekly: boolean } {
  const days: number[] = [];
  for (let d = from; d <= todayKey; d = addDays(d, 1))
    days.push(hours.get(d) ?? 0);
  if (days.length <= 31) return { values: days, weekly: false };
  const values: number[] = [];
  for (let end = days.length; end > 0; end -= 7) {
    const week = days.slice(Math.max(0, end - 7), end);
    values.unshift(week.reduce((a, b) => a + b, 0) / week.length);
  }
  return { values, weekly: true };
}

const BAR_HEIGHT = 120;

function HoursBars({
  habit,
  hours,
  from,
  todayKey,
  color,
}: {
  habit: Habit;
  hours: Map<string, number>;
  from: string;
  todayKey: string;
  color: string;
}): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const notes = useThemedStyles(makeNoteStyles);
  const [width, setWidth] = useState(0);
  const target = habit.targetHours ?? 0;
  const { values, weekly } = hoursBars(hours, from, todayKey);
  const top = Math.max(1, Math.ceil(Math.max(target, ...values)));
  const left = 24;
  const bottom = 6;
  const y = (v: number) => 6 + (1 - v / top) * (BAR_HEIGHT - 6 - bottom);
  const slot = (width - left) / Math.max(1, values.length);

  return (
    <View testID="detail-hours" style={styles.hours}>
      <Text style={styles.subTitle} accessibilityRole="header">
        HOURS PER DAY
      </Text>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Hours per ${
          weekly ? 'day, averaged each week' : 'day'
        }, target ${target} hours`}
        onLayout={e => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 ? (
          <Svg width={width} height={BAR_HEIGHT}>
            {[0, top].map(v => (
              <SvgText
                key={v}
                x={left - 6}
                y={y(v) + 4}
                fontSize={10}
                fill={colors.v2GreyText}
                textAnchor="end"
              >
                {String(v)}
              </SvgText>
            ))}
            <Line
              x1={left}
              x2={width}
              y1={y(0)}
              y2={y(0)}
              stroke={colors.v2Border}
            />
            {values.map((v, i) => (
              <Rect
                key={i}
                x={left + i * slot + slot * 0.15}
                y={y(v)}
                width={slot * 0.7}
                height={y(0) - y(v)}
                rx={2}
                fill={color}
                opacity={v >= target ? 1 : 0.45}
              />
            ))}
            <Line
              x1={left}
              x2={width}
              y1={y(target)}
              y2={y(target)}
              stroke={colors.v2White}
              strokeDasharray="4 3"
              strokeWidth={1}
            />
          </Svg>
        ) : null}
      </View>
      <Text style={notes.note}>
        {weekly
          ? `One bar a week: the average hours a day. Dashed line: ${target}h target.`
          : `Dashed line: ${target}h target.`}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 14,
      backgroundColor: colors.v2CardBackgroundInset,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    chipSelected: {
      borderColor: colors.v2Orange,
      backgroundColor: colors.v2Orange,
    },
    chipLabel: {
      color: colors.v2White,
      fontSize: 12,
      fontWeight: '600',
    },
    chipLabelSelected: {
      color: colors.v2Background,
    },
    months: {
      maxHeight: 340,
    },
    monthsContent: {
      gap: 12,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 14,
      rowGap: 6,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    legendLabel: {
      color: colors.v2GreyText,
      fontSize: 11,
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
    },
    ring: {
      borderWidth: 1.5,
      borderColor: colors.v2Border,
    },
    half: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '50%',
    },
    hours: {
      gap: 8,
      marginTop: 4,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.v2Border,
    },
    subTitle: {
      color: colors.v2GreyText,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
  });
