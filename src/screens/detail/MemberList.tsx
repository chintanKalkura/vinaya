import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Habit } from '../../types/habit';
import { WeekStart } from '../../types/settings';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { getCadenceStatus } from '../../utils/cadence';
import { habitMarkers } from '../../utils/hours';
import { completionRate, completionUnits } from '../../utils/history';
import { toDateKey } from '../../utils/dates';
import Section from './Section';
import { percentText } from './pageStats';

// A group's members: name, current streak | overall completion rate, ›.
// The streak follows the pill colouring: the group's colour when complete
// today, grey otherwise (habit-group-detail-page.md, decision 15)
interface MemberListProps {
  members: Habit[];
  todayKey: string;
  weekStart: WeekStart;
  color: string;
  onOpenHabit: (habitId: string) => void;
}

export default function MemberList({
  members,
  todayKey,
  weekStart,
  color,
  onOpenHabit,
}: MemberListProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  return (
    <Section title="HABITS IN THIS GROUP" testID="detail-members">
      {members.map(habit => {
        const markers = habitMarkers(habit);
        const status = getCadenceStatus(
          markers,
          habit.cadence,
          habit.target,
          todayKey,
          habit.streakFreeze,
        );
        const rate = completionRate(
          completionUnits(
            markers,
            habit.cadence,
            habit.target,
            toDateKey(new Date(habit.createdAt)),
            todayKey,
            weekStart,
          ),
        ).rate;
        return (
          <Pressable
            key={habit.id}
            testID={`detail-member-${habit.id}`}
            accessibilityRole="button"
            accessibilityLabel={`${habit.name}, streak ${
              status.streak
            }, ${percentText(rate)} complete, open`}
            onPress={() => onOpenHabit(habit.id)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Text style={styles.name} numberOfLines={1}>
              {habit.name}
            </Text>
            <Text
              testID={`detail-member-streak-${habit.id}`}
              style={[
                styles.streak,
                { color: status.complete ? color : colors.v2GreyText },
              ]}
            >
              {status.streak}
            </Text>
            <Text style={styles.bar}>|</Text>
            <Text testID={`detail-member-rate-${habit.id}`} style={styles.rate}>
              {percentText(rate)}
            </Text>
            <ChevronRight color={colors.v2GreyText} size={18} />
          </Pressable>
        );
      })}
    </Section>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: colors.v2CardBackgroundInset,
      paddingHorizontal: 12,
    },
    pressed: {
      opacity: 0.6,
    },
    name: {
      flex: 1,
      color: colors.v2White,
      fontSize: 14,
      fontWeight: '600',
    },
    streak: {
      fontStyle: 'italic',
      fontWeight: '600',
      fontSize: 14,
    },
    bar: {
      color: colors.v2GreyOutline,
    },
    rate: {
      color: colors.v2White,
      fontSize: 13,
      fontVariant: ['tabular-nums'],
    },
  });
