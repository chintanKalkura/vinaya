import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Snowflake } from 'lucide-react-native';
import { Habit } from '../../types/habit';
import { colors } from '../../theme';
import { useHabitVisual } from './useHabitVisual';
import HoursProgress from './HoursProgress';
import CadenceLabel, { CADENCE_LABEL_SPACE } from './CadenceLabel';
import FreezeLabel from './FreezeLabel';
import BannerMenu from './BannerMenu';
import { ColorKind, getColorScheme } from './colorRules';

interface HabitListRowProps {
  habit: Habit;
  groupName?: string;
  todayKey: string;
  onPress: (habitId: string) => void;
  colorKind: ColorKind;
  onEdit?: (habitId: string) => void; // banners only
  onDelete?: (habitId: string) => void; // banners only
}

export default function HabitListRow({
  habit,
  groupName,
  todayKey,
  onPress,
  colorKind,
  onEdit,
  onDelete,
}: HabitListRowProps): React.JSX.Element {
  const { status, hours } = useHabitVisual(habit, todayKey);
  const scheme = getColorScheme(
    colorKind,
    status.complete,
    status.markedToday,
    status.frozenToday,
  );
  // Banners (list view) right-align the streak and show the cadence label;
  // pills (Hours habits inside a group card) keep the streak beside the name
  const isBanner = colorKind === 'banner';
  const rowStyle = [styles.row, scheme.container, isBanner && styles.bannerRow];
  const streakStyle = [
    styles.streak,
    isBanner && styles.streakRight,
    { color: scheme.numberColor },
  ];
  // Pills never show the freeze label
  const cadenceLabel = isBanner ? (
    <>
      {scheme.frozen ? (
        <FreezeLabel
          freezesLeft={status.freezesLeft}
          testID={`habit-row-freeze-${habit.id}`}
        />
      ) : null}
      <CadenceLabel
        cadence={habit.cadence}
        testID={`habit-row-cadence-${habit.id}`}
      />
    </>
  ) : null;
  const menu =
    isBanner && onEdit && onDelete ? (
      <BannerMenu
        kind="habit"
        onEdit={() => onEdit(habit.id)}
        onDelete={() => onDelete(habit.id)}
        testID={`habit-row-menu-${habit.id}`}
      />
    ) : null;
  const groupLabel = groupName ? (
    <Text style={styles.groupName} numberOfLines={1}>
      {groupName}
    </Text>
  ) : null;

  if (hours) {
    return (
      <Pressable
        testID={`habit-row-${habit.id}`}
        accessibilityRole="button"
        accessibilityState={{ checked: status.markedToday }}
        onPress={() => onPress(habit.id)}
        style={rowStyle}
      >
        <View style={styles.textColumn}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: scheme.titleColor }]}>
              {habit.name}
            </Text>
            <Text testID={`habit-row-streak-${habit.id}`} style={streakStyle}>
              {status.streak}
            </Text>
            {menu}
          </View>
          {groupLabel}
          <View style={styles.hoursProgress}>
            <HoursProgress
              total={hours.hoursToday}
              target={habit.targetHours ?? 0}
              testID={`habit-row-progress-${habit.id}`}
              color={scheme.barColor}
            />
          </View>
        </View>
        {cadenceLabel}
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={`habit-row-${habit.id}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: status.markedToday }}
      onPress={() => onPress(habit.id)}
      style={rowStyle}
    >
      {scheme.iconFrozen ? (
        <Snowflake
          testID={`habit-row-frozen-${habit.id}`}
          style={styles.frozenIcon}
          color={scheme.iconColor}
          size={20}
          strokeWidth={2}
        />
      ) : (
        <View
          testID={`habit-row-icon-${habit.id}`}
          style={[
            styles.icon,
            {
              borderColor: scheme.iconColor,
              backgroundColor: scheme.iconFilled ? scheme.iconColor : undefined,
            },
          ]}
        >
          {scheme.iconFilled ? (
            <Check color={colors.v2Background} size={13} strokeWidth={3.5} />
          ) : null}
        </View>
      )}
      <View style={styles.textColumn}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: scheme.titleColor }]}>
            {habit.name}
          </Text>
          <Text testID={`habit-row-streak-${habit.id}`} style={streakStyle}>
            {status.streak}
          </Text>
          {menu}
        </View>
        {groupLabel}
      </View>
      {cadenceLabel}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.v2Border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.v2CardBackground,
  },
  bannerRow: {
    paddingBottom: 12 + CADENCE_LABEL_SPACE,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  frozenIcon: {
    marginRight: 10,
  },
  textColumn: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flexShrink: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  streak: {
    fontStyle: 'italic',
    fontWeight: '600',
  },
  streakRight: {
    marginLeft: 'auto',
  },
  groupName: {
    color: colors.v2GreyText,
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 2,
  },
  hoursProgress: {
    marginTop: 10,
  },
});
