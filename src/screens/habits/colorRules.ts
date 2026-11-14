import { StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme';

// Single source of the Habits coloring rules: docs/style-choices/habits-section/coloring-rules.md
export type ColorKind = 'pill' | 'banner';

export interface ColorScheme {
  titleColor: string;
  numberColor: string;
  iconColor: string;
  iconFilled: boolean;
  iconFrozen: boolean; // the Snowflake replaces the check, selector or chart icon
  barColor: string;
  frozen: boolean; // frozen look: docs/style-choices/habits-section/streak-freeze.md
  container: ViewStyle | null;
}

const bannerStyles = StyleSheet.create({
  complete: {
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2OrangeCardBackground,
  },
  frozen: {
    borderWidth: 2,
    borderColor: colors.v2Ice,
    backgroundColor: colors.v2IceCardBackground,
  },
});

// Title, number and banner follow `complete`; the icon follows `markedToday`.
// Complete beats frozen today, and frozen today beats grey.
export function getColorScheme(
  kind: ColorKind,
  complete: boolean,
  markedToday: boolean = complete,
  frozenToday: boolean = false,
): ColorScheme {
  const frozen = frozenToday && !complete;
  const accent = complete
    ? colors.v2Orange
    : frozen
    ? colors.v2Ice
    : colors.v2GreyText;
  const isBanner = kind === 'banner';
  let container: ViewStyle | null = null;
  if (isBanner && complete) container = bannerStyles.complete;
  else if (isBanner && frozen) container = bannerStyles.frozen;

  return {
    titleColor: isBanner ? colors.v2White : accent,
    numberColor: accent,
    iconColor: markedToday
      ? colors.v2Orange
      : frozen
      ? colors.v2Ice
      : colors.v2GreyOutline,
    iconFilled: markedToday,
    iconFrozen: frozen && !markedToday,
    barColor: frozen ? colors.v2Ice : colors.v2Orange,
    frozen,
    container,
  };
}
