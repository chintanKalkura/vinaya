import { getColorScheme } from './colorRules';
import { colors } from '../../theme';

describe('getColorScheme', () => {
  describe('pill', () => {
    it('should show title and number orange when complete', () => {
      const scheme = getColorScheme('pill', true);

      expect([scheme.titleColor, scheme.numberColor]).toEqual([
        colors.v2Orange,
        colors.v2Orange,
      ]);
    });

    it('should show title and number grey when not complete', () => {
      const scheme = getColorScheme('pill', false);

      expect([scheme.titleColor, scheme.numberColor]).toEqual([
        colors.v2GreyText,
        colors.v2GreyText,
      ]);
    });

    it('should never change the card', () => {
      expect(getColorScheme('pill', true).container).toBeNull();
    });
  });

  describe('banner', () => {
    it('should keep the title white when complete', () => {
      expect(getColorScheme('banner', true).titleColor).toBe(colors.v2White);
    });

    it('should keep the title white when not complete', () => {
      expect(getColorScheme('banner', false).titleColor).toBe(colors.v2White);
    });

    it('should show the number orange when complete', () => {
      expect(getColorScheme('banner', true).numberColor).toBe(colors.v2Orange);
    });

    it('should show the number grey when not complete', () => {
      expect(getColorScheme('banner', false).numberColor).toBe(
        colors.v2GreyText,
      );
    });

    it('should use the orange border and background when complete', () => {
      expect(getColorScheme('banner', true).container).toEqual({
        borderWidth: 2,
        borderColor: colors.v2Orange,
        backgroundColor: colors.v2OrangeCardBackground,
      });
    });

    it('should keep the grey card when not complete', () => {
      expect(getColorScheme('banner', false).container).toBeNull();
    });
  });

  it('should show the icon orange and filled when complete', () => {
    const scheme = getColorScheme('banner', true);

    expect([scheme.iconColor, scheme.iconFilled]).toEqual([
      colors.v2Orange,
      true,
    ]);
  });

  it('should show the icon as a grey outline when not complete', () => {
    const scheme = getColorScheme('pill', false);

    expect([scheme.iconColor, scheme.iconFilled]).toEqual([
      colors.v2GreyOutline,
      false,
    ]);
  });
});
