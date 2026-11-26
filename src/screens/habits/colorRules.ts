import { StyleSheet, ViewStyle } from 'react-native';
import { Palette, completionColour, darkColors } from '../../theme';
import { themedStyles } from '../../theming';
import { CompletionColourId } from '../../types/habit';

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

// One complete style per completion colour, plus the frozen one
const makeBannerStyles = (colors: Palette) =>
  StyleSheet.create({
    ...(Object.fromEntries(
      Object.entries(colors.completion).map(([id, c]) => [
        id,
        { borderWidth: 2, borderColor: c.accent, backgroundColor: c.tint },
      ]),
    ) as Record<CompletionColourId, ViewStyle>),
    frozen: {
      borderWidth: 2,
      borderColor: colors.v2Ice,
      backgroundColor: colors.v2IceCardBackground,
    },
  });

// Title, number and banner follow `complete`; the icon follows `markedToday`.
// Complete beats frozen today, and frozen today beats grey. The item's
// completion colour (orange by default) takes orange's place.
export function getColorScheme(
  kind: ColorKind,
  complete: boolean,
  markedToday: boolean = complete,
  frozenToday: boolean = false,
  colors: Palette = darkColors,
  colour?: CompletionColourId,
): ColorScheme {
  const bannerStyles = themedStyles(makeBannerStyles, colors);
  const done = completionColour(colors, colour);
  const frozen = frozenToday && !complete;
  const accent = complete
    ? done.accent
    : frozen
    ? colors.v2Ice
    : colors.v2GreyText;
  const isBanner = kind === 'banner';
  let container: ViewStyle | null = null;
  if (isBanner && complete)
    container = bannerStyles[colour ?? 'orange'] ?? bannerStyles.orange;
  else if (isBanner && frozen) container = bannerStyles.frozen;

  return {
    titleColor: isBanner ? colors.v2White : accent,
    numberColor: accent,
    iconColor: markedToday
      ? done.accent
      : frozen
      ? colors.v2Ice
      : colors.v2GreyOutline,
    iconFilled: markedToday,
    iconFrozen: frozen && !markedToday,
    barColor: frozen ? colors.v2Ice : done.accent,
    frozen,
    container,
  };
}
