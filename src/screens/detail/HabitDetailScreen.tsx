import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Pencil,
  Repeat,
  Snowflake,
  Trash2,
} from 'lucide-react-native';
import { Habit } from '../../types/habit';
import { HabitGroup } from '../../types/habitGroup';
import { Palette, completionColour } from '../../theme';
import { useSettings } from '../../settings/SettingsProvider';
import { usePalette, useThemedStyles } from '../../theming';
import { groupIdsByHabit } from '../../utils/groupIndex';
import { useHabitsData } from '../habits/HabitsData';
import OptionsMenu, { MenuItem } from '../habits/OptionsMenu';
import TouchTarget from '../habits/TouchTarget';
import { freezesHeldText, groupFactText, habitFactText } from './subtitleText';
import { pageStats } from './pageStats';
import RatingStars from './RatingStars';
import StreakStats from './StreakStats';
import CompletionRateSection from './CompletionRateSection';
import HeatmapSection from './HeatmapSection';
import HistorySection from './HistorySection';
import MemberList from './MemberList';

// The habit and group page: docs/feature-development/release-1-readiness/habit-group-detail-page.md,
// look: docs/style-choices/detail/detail-page.md
export type DetailKind = 'habit' | 'group';

interface HabitDetailScreenProps {
  kind: DetailKind;
  id: string;
  onBack: () => void;
  onOpenGroup: (groupId: string) => void;
  onOpenHabit: (habitId: string) => void; // a group's member row
  onGone: () => void; // the item was deleted: back to the Habits list
}

export default function HabitDetailScreen({
  kind,
  id,
  onBack,
  onOpenGroup,
  onOpenHabit,
  onGone,
}: HabitDetailScreenProps): React.JSX.Element | null {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const {
    habits,
    groups,
    loaded,
    editHabit,
    editGroup,
    removeHabit,
    removeGroup,
    todayKey,
  } = useHabitsData();
  const { weekStart } = useSettings().settings;
  const item: Habit | HabitGroup | undefined =
    kind === 'habit' ? habits[id] : groups[id];
  const stats = useMemo(
    () =>
      item ? pageStats(item, kind === 'habit', todayKey, weekStart) : null,
    [item, kind, todayKey, weekStart],
  );

  // Deleted here, from its edit form or by a restore: every page about it
  // is stale, so return to the list
  const gone = loaded && !item;
  useEffect(() => {
    if (gone) onGone();
  }, [gone, onGone]);
  if (!item || !stats) return null;

  const isHabit = kind === 'habit';
  const facts = isHabit ? habitFactText(habits[id]) : groupFactText(groups[id]);
  const freezes = freezesHeldText(item.streakFreeze?.available ?? 0);
  const memberOf = isHabit
    ? (groupIdsByHabit(groups)[id] ?? []).map(groupId => groups[groupId])
    : [];
  const accent = completionColour(colors, item.colour).accent;
  const members = isHabit
    ? []
    : groups[id].habitIds
        .map(habitId => habits[habitId])
        .filter((habit): habit is Habit => habit !== undefined);
  const edit = () => (isHabit ? editHabit(id) : editGroup(id));
  const menuItems: MenuItem[] = [
    { key: 'edit', label: 'Edit', Icon: Pencil, onPress: edit },
    {
      key: 'delete',
      label: isHabit ? 'Delete habit' : 'Delete group',
      Icon: Trash2,
      danger: true,
      onPress: () => (isHabit ? removeHabit(id) : removeGroup(id)),
    },
  ];

  return (
    <View
      testID="detail-screen"
      style={[styles.screen, { paddingTop: insets.top }]}
    >
      <View style={styles.topBar}>
        <TouchTarget
          testID="detail-back"
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
        >
          <ChevronLeft color={colors.v2White} size={26} />
        </TouchTarget>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleCard}>
          <Text
            testID="detail-title"
            style={styles.title}
            accessibilityRole="header"
          >
            {item.name}
          </Text>
          <TouchTarget
            testID="detail-edit"
            accessibilityRole="button"
            accessibilityLabel={`Edit ${item.name}`}
            onPress={edit}
          >
            <Pencil color={colors.v2White} size={20} />
          </TouchTarget>
          <OptionsMenu
            kind={kind}
            testID="detail-menu"
            items={menuItems}
            iconColor={colors.v2White}
            iconSize={22}
          />
        </View>

        {/* Facts as plain text; the group chips are the only chips, and open
            the group's page (subtitle option B1) */}
        <View style={styles.subtitle}>
          <View style={styles.facts}>
            <View style={styles.fact}>
              <Repeat color={colors.v2GreyText} size={14} />
              <Text testID="detail-facts" style={styles.factText}>
                {facts}
              </Text>
            </View>
            <View style={styles.fact}>
              <Snowflake color={colors.v2Ice} size={14} />
              <Text
                testID="detail-freezes"
                style={[styles.factText, { color: colors.v2Ice }]}
              >
                {freezes}
              </Text>
            </View>
          </View>
          {memberOf.length > 0 ? (
            <View style={styles.chips}>
              {memberOf.map(group => (
                <Pressable
                  key={group.id}
                  testID={`detail-group-chip-${group.id}`}
                  accessibilityRole="link"
                  accessibilityLabel={`Open ${group.name} group`}
                  onPress={() => onOpenGroup(group.id)}
                  hitSlop={{ top: 6, bottom: 6 }}
                  style={({ pressed }) => [
                    styles.chip,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Layers color={colors.v2White} size={14} />
                  <Text style={styles.chipLabel}>{group.name}</Text>
                  <ChevronRight color={colors.v2White} size={16} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <RatingStars stars={stats.stars} color={accent} />
        <StreakStats streaks={stats.streaks} color={accent} />
        <CompletionRateSection
          rate={stats.rate}
          trend={stats.trend}
          step={stats.trendStep}
          cadence={item.cadence}
          color={accent}
        />
        <HeatmapSection
          slots={stats.heat}
          steps={stats.heatSteps}
          color={accent}
        />
        <HistorySection
          cadence={item.cadence}
          markers={stats.markers}
          frozenDates={stats.frozenDates}
          hoursHabit={
            isHabit && habits[id].type === 'Hours' ? habits[id] : undefined
          }
          todayKey={todayKey}
          weekStart={weekStart}
          color={accent}
        />
        {!isHabit && members.length > 0 ? (
          <MemberList
            members={members}
            todayKey={todayKey}
            weekStart={weekStart}
            color={accent}
            onOpenHabit={onOpenHabit}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.v2Background,
    },
    topBar: {
      paddingHorizontal: 4,
      paddingTop: 4,
      alignItems: 'flex-start',
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 32,
      gap: 16,
    },
    titleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.v2Border,
      borderRadius: 16,
      backgroundColor: colors.v2CardBackground,
      paddingLeft: 16,
      paddingVertical: 4,
    },
    title: {
      flex: 1,
      color: colors.v2White,
      fontWeight: '700',
      fontSize: 24,
      paddingVertical: 8,
    },
    subtitle: {
      gap: 10,
      marginTop: -6,
      paddingHorizontal: 4,
    },
    facts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 16,
      rowGap: 4,
    },
    fact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    factText: {
      color: colors.v2GreyText,
      fontSize: 14,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    // Outlined more strongly than any other chip-like shape, with a chevron,
    // so it reads as something to tap
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      minHeight: 36,
      borderWidth: 1.5,
      borderColor: colors.v2GreyOutline,
      borderRadius: 18,
      backgroundColor: colors.v2CardBackground,
      paddingLeft: 12,
      paddingRight: 8,
    },
    chipPressed: {
      opacity: 0.55,
    },
    chipLabel: {
      color: colors.v2White,
      fontWeight: '600',
      fontSize: 14,
    },
  });
