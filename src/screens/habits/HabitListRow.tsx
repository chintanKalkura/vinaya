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
import { checkmarkLabel, hoursLabel } from './a11yLabels';

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
  const freeze = { frozen: scheme.frozen, freezesLeft: status.freezesLeft };
  // Pills never show the freeze label. Decorative: the tap target's label says it.
  const cadenceLabel = isBanner ? (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
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
    </View>
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
    <Text
      importantForAccessibility="no"
      style={styles.groupName}
      numberOfLines={1}
    >
      {groupName}
    </Text>
  ) : null;
  const nameRow = (
    <View style={styles.nameRow}>
      <Text
        importantForAccessibility="no"
        style={[styles.name, { color: scheme.titleColor }]}
      >
        {habit.name}
      </Text>
      <Text
        testID={`habit-row-streak-${habit.id}`}
        importantForAccessibility="no"
        style={streakStyle}
      >
        {status.streak}
      </Text>
      {menu}
    </View>
  );

  // Only the check (or the Hours bar) is tappable; the rest of the banner
  // will open the detail page (habit-group-detail-page.md):
  // docs/style-choices/habits-section/tap-targets.md
  if (hours) {
    return (
      <View testID={`habit-row-${habit.id}`} style={rowStyle}>
        <View style={styles.textColumn}>
          {nameRow}
          {groupLabel}
          <Pressable
            testID={`habit-row-hours-${habit.id}`}
            accessibilityRole="button"
            accessibilityLabel={hoursLabel(
              habit.name,
              hours.hoursToday,
              habit.targetHours ?? 0,
              status.streak,
              freeze,
            )}
            hitSlop={isBanner ? BANNER_HOURS_HIT_SLOP : CELL_HOURS_HIT_SLOP}
            onPress={() => onPress(habit.id)}
            style={styles.hoursProgress}
          >
            <HoursProgress
              total={hours.hoursToday}
              target={habit.targetHours ?? 0}
              testID={`habit-row-progress-${habit.id}`}
              color={scheme.barColor}
            />
          </Pressable>
        </View>
        {cadenceLabel}
      </View>
    );
  }

  return (
    <View testID={`habit-row-${habit.id}`} style={rowStyle}>
      <Pressable
        testID={`habit-row-check-${habit.id}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: status.markedToday }}
        accessibilityLabel={checkmarkLabel(habit.name, status.streak, freeze)}
        hitSlop={CHECK_HIT_SLOP}
        onPress={() => onPress(habit.id)}
        style={styles.check}
      >
        {scheme.iconFrozen ? (
          <Snowflake
            testID={`habit-row-frozen-${habit.id}`}
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
                backgroundColor: scheme.iconFilled
                  ? scheme.iconColor
                  : undefined,
              },
            ]}
          >
            {scheme.iconFilled ? (
              <Check color={colors.v2Background} size={13} strokeWidth={3.5} />
            ) : null}
          </View>
        )}
      </Pressable>
      <View style={styles.textColumn}>
        {nameRow}
        {groupLabel}
      </View>
      {cadenceLabel}
    </View>
  );
}

// The 20px check grows to 48×48 to tap, inside the banner's padding (more room
// below, where the cadence label sits)
export const CHECK_HIT_SLOP = { top: 12, bottom: 16, left: 14, right: 14 };
// The Hours bar row (about 16px) grows to 48 tall; less above on banners so it
// stays clear of the ⋮
export const BANNER_HOURS_HIT_SLOP = { top: 10, bottom: 22 };
export const CELL_HOURS_HIT_SLOP = { top: 16, bottom: 16 };

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
  check: {
    marginRight: 10,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
