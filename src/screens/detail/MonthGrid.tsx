import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Snowflake } from 'lucide-react-native';
import { WeekStart } from '../../types/settings';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { toDateKey } from '../../utils/dates';

// One month of day circles, used by History and Edit past days:
// docs/style-choices/detail/detail-page.md
export type DayState = 'done' | 'partial' | 'frozen' | 'none';

export interface DayInfo {
  state: DayState;
  inRange: boolean; // days outside the range are dimmed and can't be tapped
  label: string; // TalkBack's "Tue 24 Nov, done"
}

interface MonthGridProps {
  year: number;
  month: number; // 0–11
  weekStart: WeekStart;
  color: string;
  dayInfo: (dateKey: string) => DayInfo;
  onPressDay?: (dateKey: string) => void;
  selectedKey?: string; // outlined (Edit past days, Hours habits)
}

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MonthGrid({
  year,
  month,
  weekStart,
  color,
  dayInfo,
  onPressDay,
  selectedKey,
}: MonthGridProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const first = weekStart === 'sunday' ? 0 : 1;
  const lead = (new Date(year, month, 1).getDay() - first + 7) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const title = new Date(year, month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < lead; i++)
    cells.push(<View key={`lead${i}`} style={styles.cell} />);
  for (let day = 1; day <= days; day++) {
    const key = toDateKey(new Date(year, month, day));
    const info = dayInfo(key);
    let circle: ViewStyle | undefined;
    let number: TextStyle | undefined;
    if (info.state === 'done') {
      circle = { backgroundColor: color };
      number = { color: colors.v2Background, fontWeight: '700' };
    } else if (info.state === 'partial') {
      circle = { borderWidth: 1.5, borderColor: color };
      number = { color: colors.v2White, fontWeight: '700' };
    } else if (info.state === 'frozen') {
      circle = { borderWidth: 1.5, borderColor: colors.v2Ice };
      number = { color: colors.v2Ice };
    }
    const body = (
      <View>
        <View style={[styles.circle, circle]}>
          {info.state === 'partial' ? (
            <View style={[styles.half, { backgroundColor: color }]} />
          ) : null}
          <Text style={[styles.number, number]}>{day}</Text>
        </View>
        {info.state === 'frozen' ? (
          <View style={styles.badge}>
            <Snowflake color={colors.v2Ice} size={11} strokeWidth={2.4} />
          </View>
        ) : null}
      </View>
    );
    const tappable = onPressDay && info.inRange;
    cells.push(
      <Pressable
        key={key}
        testID={`day-${key}`}
        accessible
        accessibilityRole={tappable ? 'button' : undefined}
        accessibilityLabel={info.label}
        accessibilityState={
          tappable ? { selected: selectedKey === key } : undefined
        }
        disabled={!tappable}
        onPress={tappable ? () => onPressDay(key) : undefined}
        style={[styles.cell, !info.inRange && styles.dim]}
      >
        <View style={selectedKey === key ? styles.selected : undefined}>
          {body}
        </View>
      </Pressable>,
    );
  }

  const letters = Array.from(
    { length: 7 },
    (_, i) => WEEKDAY_LETTERS[(i + first) % 7],
  );
  return (
    <View testID={`month-${year}-${month + 1}`} style={styles.month}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {letters.map((letter, i) => (
          <Text key={`wd${i}`} style={[styles.cell, styles.weekday]}>
            {letter}
          </Text>
        ))}
        {cells}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    month: {
      gap: 6,
    },
    title: {
      color: colors.v2White,
      fontSize: 13,
      fontWeight: '700',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: `${100 / 7}%`,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekday: {
      height: 18,
      color: colors.v2GreyText,
      fontSize: 10,
      textAlign: 'center',
    },
    dim: {
      opacity: 0.3,
    },
    circle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    // Part of an Hours target: the left half filled, whatever the hours
    half: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '50%',
    },
    number: {
      color: colors.v2GreyText,
      fontSize: 13,
      fontVariant: ['tabular-nums'],
    },
    badge: {
      position: 'absolute',
      top: -3,
      right: -3,
      borderRadius: 8,
      backgroundColor: colors.v2CardBackground,
    },
    selected: {
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.v2White,
      padding: 2,
    },
  });
