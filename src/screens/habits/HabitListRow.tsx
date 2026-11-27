import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Snowflake } from 'lucide-react-native';
import { CompletionColourId, Habit } from '../../types/habit';
import { Palette, completionColour } from '../../theme';
import { usePalette, useThemedStyles } from '../../theming';
import { useHabitVisual } from './useHabitVisual';
import { ratingOf } from '../../utils/rating';
import { StarRow } from '../detail/RatingStars';
import HoursProgress from './HoursProgress';
import StarBurst, { useBurstOnDone } from './StarBurst';
import CadenceLabel, { CADENCE_LABEL_SPACE } from './CadenceLabel';
import FreezeLabel from './FreezeLabel';
import BannerMenu, {
  BANNER_MENU_SPACE,
  bannerMenuTargetStyle,
} from './BannerMenu';
import { ColorKind, getColorScheme } from './colorRules';
import { checkmarkLabel, hoursLabel } from './a11yLabels';

interface HabitListRowProps {
  habit: Habit;
  groupName?: string;
  todayKey: string;
  onPress: (habitId: string) => void;
  colorKind: ColorKind;
  required?: boolean; // pills in a Required group: blue border, like HabitPill
  colour?: CompletionColourId; // pills take their group's colour; banners their own
  onOpen?: (habitId: string) => void; // the rest of the banner opens the habit's page
  onEdit?: (habitId: string) => void; // banners only
  onDelete?: (habitId: string) => void; // banners only
}

export default function HabitListRow({
  habit,
  groupName,
  todayKey,
  onPress,
  colorKind,
  required = false,
  colour,
  onOpen,
  onEdit,
  onDelete,
}: HabitListRowProps): React.JSX.Element {
  const colors = usePalette();
  const styles = useThemedStyles(makeStyles);
  const { status, hours } = useHabitVisual(habit, todayKey);
  const scheme = getColorScheme(
    colorKind,
    status.complete,
    status.markedToday,
    status.frozenToday,
    colors,
    colorKind === 'pill' ? colour : habit.colour,
  );
  // Banners (list view) right-align the streak and show the cadence label;
  // pills (Hours habits inside a group card) keep the streak beside the name
  const isBanner = colorKind === 'banner';
  const rowStyle = [
    styles.row,
    scheme.container,
    isBanner && styles.bannerRow,
    required && { borderColor: colors.v2Blue },
  ];
  const streakStyle = [
    styles.streak,
    isBanner && styles.streakRight,
    { color: scheme.numberColor },
  ];
  const freeze = { frozen: scheme.frozen, freezesLeft: status.freezesLeft };
  // Where the name row's centre is in the banner, for the ⋮ target
  const [textColumnY, setTextColumnY] = useState(0);
  const [nameRowCenter, setNameRowCenter] = useState(0);
  // Marking it done plays a star burst from the check or the bar
  const burst = useBurstOnDone(status.markedToday);
  // Banners show the rating bottom-left (habit-group-detail-page.md, decision 8):
  // earned stars grey until the habit is complete today, then its colour
  const stars = useMemo(
    () => (isBanner ? ratingOf(habit, todayKey).stars : 0),
    [isBanner, habit, todayKey],
  );
  const starColor = status.complete
    ? completionColour(colors, habit.colour).accent
    : colors.v2GreyText;
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
      <View style={[styles.stars, hours ? styles.starsHours : null]}>
        <StarRow
          stars={stars}
          color={starColor}
          size={12}
          testID={`habit-row-stars-${habit.id}`}
        />
      </View>
      <CadenceLabel
        cadence={habit.cadence}
        testID={`habit-row-cadence-${habit.id}`}
      />
    </View>
  ) : null;
  const hasMenu = isBanner && onEdit && onDelete;
  // Drawn in the name row, tapped through a 48dp target over the banner
  const menu = hasMenu ? (
    <BannerMenu
      kind="habit"
      onEdit={() => onEdit(habit.id)}
      onDelete={() => onDelete(habit.id)}
      testID={`habit-row-menu-${habit.id}`}
      targetStyle={bannerMenuTargetStyle(textColumnY + nameRowCenter)}
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
    <View
      style={styles.nameRow}
      onLayout={e =>
        setNameRowCenter(
          e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2,
        )
      }
    >
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
      {hasMenu ? <View style={styles.menuSpace} /> : null}
    </View>
  );
  const onTextColumnLayout = (e: { nativeEvent: { layout: { y: number } } }) =>
    setTextColumnY(e.nativeEvent.layout.y);
  // Anywhere but the check, the bar and the ⋮ opens the habit's page
  // (habit-group-detail-page.md); TalkBack reaches it through the name
  const open = onOpen ? () => onOpen(habit.id) : undefined;
  const openProps = {
    accessible: !!open,
    accessibilityRole: 'button' as const,
    accessibilityLabel: isBanner
      ? `Open ${habit.name}, ${stars} of 5 stars`
      : `Open ${habit.name}`,
    disabled: !open,
    onPress: open,
  };

  // Only the check (or the Hours bar) is tappable; the rest of the banner
  // will open the detail page (habit-group-detail-page.md):
  // docs/style-choices/habits-section/tap-targets.md
  if (hours) {
    return (
      <Pressable
        testID={`habit-row-${habit.id}`}
        accessible={false}
        disabled={!open}
        onPress={open}
        style={rowStyle}
      >
        <View style={styles.textColumn} onLayout={onTextColumnLayout}>
          <Pressable testID={`habit-row-open-${habit.id}`} {...openProps}>
            {nameRow}
            {groupLabel}
          </Pressable>
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
            <StarBurst
              color={scheme.barColor}
              playKey={burst}
              testID={`habit-row-burst-${habit.id}`}
            />
          </Pressable>
        </View>
        {cadenceLabel}
        {menu}
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={`habit-row-${habit.id}`}
      accessible={false}
      disabled={!open}
      onPress={open}
      style={rowStyle}
    >
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
        <StarBurst
          color={scheme.iconColor}
          playKey={burst}
          testID={`habit-row-burst-${habit.id}`}
        />
      </Pressable>
      <Pressable
        testID={`habit-row-open-${habit.id}`}
        {...openProps}
        style={styles.textColumn}
        onLayout={onTextColumnLayout}
      >
        {nameRow}
        {groupLabel}
      </Pressable>
      {cadenceLabel}
      {menu}
    </Pressable>
  );
}

// The 20px check grows to 48×48 to tap, inside the banner's padding (more room
// below, where the cadence label sits)
export const CHECK_HIT_SLOP = { top: 12, bottom: 16, left: 14, right: 14 };
// The Hours bar row (about 16px) grows to 48 tall; less above on banners so it
// stays clear of the ⋮
export const BANNER_HOURS_HIT_SLOP = { top: 10, bottom: 22 };
export const CELL_HOURS_HIT_SLOP = { top: 16, bottom: 16 };

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
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
    // Bottom-left, level with the cadence label: under the name, past the check
    stars: {
      position: 'absolute',
      left: 44,
      bottom: 8,
    },
    starsHours: {
      left: 14,
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
    menuSpace: {
      width: BANNER_MENU_SPACE,
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
