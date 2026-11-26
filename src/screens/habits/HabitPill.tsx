import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Habit } from '../../types/habit';
import { Check, Snowflake } from 'lucide-react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { useHabitVisual } from './useHabitVisual';
import { getColorScheme } from './colorRules';
import { checkmarkLabel } from './a11yLabels';

interface HabitPillProps {
  habit: Habit;
  todayKey: string;
  onPress: (habitId: string) => void;
  required?: boolean;
}

// A habit inside a group card (group view). Only the check is tappable, and it
// is round in every group type: docs/style-choices/habits-section/tap-targets.md
export default function HabitPill({
  habit,
  todayKey,
  onPress,
  required = false,
}: HabitPillProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { status } = useHabitVisual(habit, todayKey);
  const scheme = getColorScheme(
    'pill',
    status.complete,
    status.markedToday,
    status.frozenToday,
    colors,
  );

  return (
    <View
      testID={`habit-pill-${habit.id}`}
      style={[
        styles.pill,
        { borderColor: required ? colors.v2Blue : colors.v2Border },
      ]}
    >
      <Pressable
        testID={`habit-pill-check-${habit.id}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: status.markedToday }}
        accessibilityLabel={checkmarkLabel(habit.name, status.streak, {
          frozen: scheme.frozen,
          freezesLeft: status.freezesLeft,
        })}
        hitSlop={PILL_CHECK_HIT_SLOP}
        onPress={() => onPress(habit.id)}
        style={styles.check}
      >
        {scheme.iconFrozen ? (
          <Snowflake
            testID={`habit-pill-frozen-${habit.id}`}
            color={scheme.iconColor}
            size={18}
            strokeWidth={2}
          />
        ) : (
          <View
            testID={`habit-pill-icon-${habit.id}`}
            style={[
              styles.icon,
              {
                borderColor: scheme.iconColor,
                backgroundColor: scheme.iconFilled
                  ? scheme.iconColor
                  : undefined,
              },
            ]}
          >
            {scheme.iconFilled ? (
              <Check color={colors.v2Background} size={12} strokeWidth={3.5} />
            ) : null}
          </View>
        )}
      </Pressable>
      <Text
        importantForAccessibility="no"
        style={[styles.name, { color: scheme.titleColor }]}
      >
        {habit.name}
      </Text>
      <Text
        importantForAccessibility="no"
        style={[styles.streak, { color: scheme.numberColor }]}
      >
        {status.streak}
      </Text>
    </View>
  );
}

// The 18px check grows to 48×48 to tap, inside the 48dp-tall pill
export const PILL_CHECK_HIT_SLOP = { top: 15, bottom: 15, left: 12, right: 18 };

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      borderWidth: 1,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.v2CardBackgroundInset,
    },
    check: {
      marginRight: 6,
    },
    icon: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    name: {
      fontWeight: '600',
      marginRight: 8,
    },
    streak: {
      fontStyle: 'italic',
    },
  });
