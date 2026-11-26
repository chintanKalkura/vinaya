import { Palette, darkColors, lightColors } from './theme';
import { contrastRatio } from './utils/contrast';
import { mixHex } from './utils/colorMix';

// WCAG 2.2 AA on the Habits screen: 4.5:1 for text, 3:1 for icons and other
// non-text UI. docs/feature-development/release-1-readiness/accessibility-fixes.md
const PALETTES: [string, Palette][] = [
  ['dark', darkColors],
  ['light', lightColors],
];

describe.each(PALETTES)('theme contrast (%s)', (_name, colors) => {
  const CARDS = {
    card: colors.v2CardBackground,
    inset: colors.v2CardBackgroundInset,
    background: colors.v2Background,
    orangeCard: colors.v2OrangeCardBackground,
    icyCard: colors.v2IceCardBackground,
  };

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

  it('should give labels on orange fills at least 4.5:1', () => {
    expect(
      contrastRatio(colors.v2Background, colors.v2Orange),
    ).toBeGreaterThanOrEqual(4.5);
  });

  // Completion colours: docs/style-choices/theme/completion-colours.md
  describe.each(Object.entries(colors.completion))(
    'the %s completion colour',
    (_, { accent, tint }) => {
      it.each([
        ['as text on its tint', accent, tint],
        ['as text on the plain card', accent, colors.v2CardBackground],
        ['under the check on its fill', colors.v2Background, accent],
        ['for white text on its tint', colors.v2White, tint],
        ['for grey text on its tint', colors.v2GreyText, tint],
      ])('should give %s at least 4.5:1', (__, fg, bg) => {
        expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      });
    },
  );

  // Heatmap shades on the habit page: five steps blended from the inset grey
  // to the completion colour (docs/style-choices/detail/detail-page.md). The %
  // under each cell carries the value in text; the shades must still read in
  // order and apart, and the two darkest pass 3:1 like other non-text UI.
  describe.each(Object.entries(colors.completion))(
    'the %s heatmap shades',
    (_, { accent }) => {
      const shade = (step: number) =>
        mixHex(colors.v2CardBackgroundInset, accent, step / 4);
      const onCard = [0, 1, 2, 3, 4].map(step =>
        contrastRatio(shade(step), colors.v2CardBackground),
      );

      it('should stand out more from the card with every step', () => {
        expect(onCard.every((r, i) => i === 0 || r > onCard[i - 1])).toBe(true);
      });

      it('should keep each step at least 1.35:1 from the one before', () => {
        for (let step = 1; step <= 4; step++) {
          expect(
            contrastRatio(shade(step), shade(step - 1)),
          ).toBeGreaterThanOrEqual(1.35);
        }
      });

      it('should give the two darkest steps at least 3:1 on the card', () => {
        expect(Math.min(onCard[3], onCard[4])).toBeGreaterThanOrEqual(3);
      });
    },
  );

  it('should not use the grey or icy colours for completion', () => {
    const accents = Object.values(colors.completion).map(c => c.accent);

    expect(
      accents.filter(c =>
        [colors.v2GreyText, colors.v2GreyOutline, colors.v2Ice].includes(c),
      ),
    ).toEqual([]);
  });

  it('should give red text at least 4.5:1 on the background', () => {
    expect(
      contrastRatio(colors.v2Red, colors.v2Background),
    ).toBeGreaterThanOrEqual(4.5);
  });
});
