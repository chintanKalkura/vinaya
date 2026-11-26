import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { ChartNoAxesColumnIncreasing, Snowflake } from 'lucide-react-native';
import { Palette } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { getGroupStatus } from '../../services/habitGroupService';
import { getHoursToday } from '../../utils/hours';
import { getColorScheme } from './colorRules';
import HabitListRow from './HabitListRow';
import HabitPill from './HabitPill';
import HoursProgress from './HoursProgress';
import CadenceLabel, { CADENCE_LABEL_SPACE } from './CadenceLabel';
import FreezeLabel from './FreezeLabel';
import BannerMenu, {
  BANNER_MENU_SPACE,
  bannerMenuTargetStyle,
} from './BannerMenu';
import { groupLabel } from './a11yLabels';

interface GroupCardProps {
  group: HabitGroup;
  habits: Habit[];
  todayKey: string;
  onToggle: (habitId: string) => void;
  onOpen?: (groupId: string) => void; // the card opens the group's page
  onOpenHabit?: (habitId: string) => void; // a pill or Hours cell opens the habit's
  onEdit?: (groupId: string) => void;
  onDelete?: (groupId: string) => void;
}

export default function GroupCard({
  group,
  habits,
  todayKey,
  onToggle,
  onOpen,
  onOpenHabit,
  onEdit,
  onDelete,
}: GroupCardProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const isHoursGroup = group.groupType === 'Hours';
  const status = getGroupStatus(group, todayKey);
  const scheme = getColorScheme(
    'banner',
    status.complete,
    status.markedToday,
    status.frozenToday,
    colors,
    group.colour,
  );
  const hoursTotal = habits.reduce(
    (sum, habit) => sum + getHoursToday(habit, todayKey),
    0,
  );
  const hoursTarget = group.targetHours ?? 0;
  const checkHabits = habits.filter(habit => habit.type !== 'Hours');
  const hoursHabits = habits.filter(habit => habit.type === 'Hours');
  const isRequired = (habitId: string) =>
    group.requiredHabitIds?.includes(habitId) ?? false;
  // The header's centre in the card, for the ⋮ target
  const [headerCenter, setHeaderCenter] = useState(0);
  const hasMenu = onEdit && onDelete;

  // Pills, cells, checks, bars and the ⋮ keep their own taps; the rest of
  // the card opens the group's page (habit-group-detail-page.md). TalkBack
  // reaches it through the header.
  const open = onOpen ? () => onOpen(group.id) : undefined;
  return (
    <Pressable
      testID={`group-card-${group.id}`}
      accessible={false}
      disabled={!open}
      onPress={open}
      style={[styles.card, scheme.container]}
    >
      <View
        style={styles.header}
        onLayout={e =>
          setHeaderCenter(
            e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2,
          )
        }
      >
        {/* Read as one item; the ⋮ stays separate */}
        <Pressable
          testID={`group-header-${group.id}`}
          accessible
          accessibilityRole={open ? 'button' : undefined}
          accessibilityHint={open ? 'Opens the group page' : undefined}
          disabled={!open}
          onPress={open}
          accessibilityLabel={groupLabel(
            group.name,
            group.groupType,
            status.complete,
            status.streak,
            { frozen: scheme.frozen, freezesLeft: status.freezesLeft },
          )}
          style={styles.headerInfo}
        >
          {scheme.iconFrozen ? (
            <Snowflake
              testID={`group-frozen-${group.id}`}
              style={styles.frozenIcon}
              color={scheme.iconColor}
              size={isHoursGroup ? 26 : 22}
              strokeWidth={2.5}
            />
          ) : isHoursGroup ? (
            <View
              testID={`group-hours-icon-${group.id}`}
              style={styles.hoursIcon}
            >
              <ChartNoAxesColumnIncreasing
                color={scheme.iconColor}
                size={26}
                strokeWidth={3}
              />
            </View>
          ) : (
            // A status, not a control: a small solid shape, round for Required
            // and All, square for Any: docs/style-choices/habits-section/tap-targets.md
            <View style={styles.statusSlot}>
              <View
                testID={`group-selector-${group.id}`}
                style={[
                  styles.status,
                  group.groupType === 'Any'
                    ? styles.statusSquare
                    : styles.statusRound,
                  {
                    backgroundColor: status.complete
                      ? scheme.numberColor
                      : colors.v2GreyOutline,
                  },
                ]}
              />
            </View>
          )}
          <Text style={[styles.title, { color: scheme.titleColor }]}>
            {group.name}
          </Text>
          <Text
            testID={`group-number-${group.id}`}
            style={[styles.number, { color: scheme.numberColor }]}
          >
            {status.streak}
          </Text>
        </Pressable>
        {hasMenu ? <View style={styles.menuSpace} /> : null}
      </View>
      {isHoursGroup ? (
        <View style={styles.hoursProgress}>
          <HoursProgress
            total={hoursTotal}
            target={hoursTarget}
            testID={`group-progress-${group.id}`}
            color={scheme.barColor}
          />
        </View>
      ) : null}
      {/* Checkmark pills wrap first, then Hours habits in a 2-column grid:
          docs/feature-development/release-1-readiness/hours-habits-in-any-group.md */}
      {checkHabits.length > 0 ? (
        <View style={styles.pillRow}>
          {checkHabits.map(habit => (
            <HabitPill
              key={habit.id}
              habit={habit}
              todayKey={todayKey}
              onPress={onToggle}
              required={isRequired(habit.id)}
              colour={group.colour}
              onOpen={onOpenHabit}
            />
          ))}
        </View>
      ) : null}
      {hoursHabits.length > 0 ? (
        <View
          style={[
            styles.hoursGrid,
            checkHabits.length > 0 && styles.hoursGridBelowPills,
          ]}
        >
          {hoursHabits.map(habit => (
            <View
              key={habit.id}
              testID={`group-hours-cell-${habit.id}`}
              style={styles.hoursCell}
            >
              <HabitListRow
                habit={habit}
                todayKey={todayKey}
                onPress={onToggle}
                colorKind="pill"
                required={isRequired(habit.id)}
                colour={group.colour}
                onOpen={onOpenHabit}
              />
            </View>
          ))}
        </View>
      ) : null}
      {scheme.frozen ? (
        <FreezeLabel
          freezesLeft={status.freezesLeft}
          testID={`group-freeze-${group.id}`}
        />
      ) : null}
      <CadenceLabel
        cadence={group.cadence}
        testID={`group-cadence-${group.id}`}
      />
      {/* Drawn in the header, tapped through a 48dp target over the card */}
      {onEdit && onDelete ? (
        <BannerMenu
          kind="group"
          onEdit={() => onEdit(group.id)}
          onDelete={() => onDelete(group.id)}
          testID={`group-menu-${group.id}`}
          targetStyle={bannerMenuTargetStyle(headerCenter)}
        />
      ) : null}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 16,
      backgroundColor: colors.v2CardBackground,
      padding: 14,
      paddingBottom: 14 + CADENCE_LABEL_SPACE,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    menuSpace: {
      width: BANNER_MENU_SPACE,
    },
    headerInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    // Keeps the title where the old 22px selector put it
    statusSlot: {
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    status: {
      width: 10,
      height: 10,
    },
    statusRound: {
      borderRadius: 5,
    },
    statusSquare: {
      borderRadius: 2,
    },
    title: {
      flex: 1,
      color: colors.v2White,
      fontWeight: '700',
      fontSize: 24,
    },
    number: {
      fontWeight: '700',
      fontSize: 32,
    },
    frozenIcon: {
      marginRight: 10,
    },
    hoursIcon: {
      marginRight: 10,
    },
    hoursProgress: {
      marginBottom: 12,
    },
    hoursGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 8,
    },
    hoursGridBelowPills: {
      marginTop: 8,
    },
    hoursCell: {
      width: '48.5%',
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
  });
