import { StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme';

// Single source of the Habits coloring rules: docs/style-choices/coloring-rules.md
export type ColorKind = 'pill' | 'banner';

export interface ColorScheme {
  titleColor: string;
  numberColor: string;
  iconColor: string;
  iconFilled: boolean;
  container: ViewStyle | null;
}

const bannerStyles = StyleSheet.create({
  complete: {
    borderWidth: 2,
    borderColor: colors.v2Orange,
    backgroundColor: colors.v2OrangeCardBackground,
  },
});

export function getColorScheme(
  kind: ColorKind,
  complete: boolean,
): ColorScheme {
  const accent = complete ? colors.v2Orange : colors.v2GreyText;
  const isBanner = kind === 'banner';

  return {
    titleColor: isBanner ? colors.v2White : accent,
    numberColor: accent,
    iconColor: complete ? colors.v2Orange : colors.v2GreyOutline,
    iconFilled: complete,
    container: isBanner && complete ? bannerStyles.complete : null,
  };
}
