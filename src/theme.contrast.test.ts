import { colors } from './theme';
import { contrastRatio } from './utils/contrast';

// WCAG 2.2 AA on the Habits screen: 4.5:1 for text, 3:1 for icons and other
// non-text UI. docs/feature-development/release-1-readiness/accessibility-fixes.md
const CARDS = {
  card: colors.v2CardBackground,
  inset: colors.v2CardBackgroundInset,
  background: colors.v2Background,
  orangeCard: colors.v2OrangeCardBackground,
  icyCard: colors.v2IceCardBackground,
};

describe('theme contrast', () => {
  describe.each(Object.entries(CARDS))('on the %s background', (_, bg) => {
    it.each([
      ['grey text', colors.v2GreyText],
      ['white text', colors.v2White],
    ])('should give %s at least 4.5:1', (__, fg) => {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it.each([
    ['orange text and icons', colors.v2Orange, colors.v2OrangeCardBackground],
    ['icy text and icons', colors.v2Ice, colors.v2IceCardBackground],
    ['orange on the plain card', colors.v2Orange, colors.v2CardBackground],
  ])('should give %s at least 4.5:1', (_, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['card', colors.v2CardBackground],
    ['inset', colors.v2CardBackgroundInset],
  ])('should give the grey outline at least 3:1 on the %s', (_, bg) => {
    expect(contrastRatio(colors.v2GreyOutline, bg)).toBeGreaterThanOrEqual(3);
  });

  it('should give grey text the 4.6:1 margin on the card', () => {
    expect(
      contrastRatio(colors.v2GreyText, colors.v2CardBackground),
    ).toBeGreaterThanOrEqual(4.6);
  });
});
