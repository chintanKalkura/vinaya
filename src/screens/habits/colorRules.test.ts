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

  describe('complete status apart from marked today', () => {
    it('should keep the banner orange with an empty icon when complete but not marked today', () => {
      const scheme = getColorScheme('banner', true, false);

      expect([
        scheme.numberColor,
        scheme.container?.borderColor,
        scheme.iconFilled,
        scheme.iconColor,
      ]).toEqual([
        colors.v2Orange,
        colors.v2Orange,
        false,
        colors.v2GreyOutline,
      ]);
    });

    it('should fill the icon but stay grey when marked today but not yet complete', () => {
      const scheme = getColorScheme('pill', false, true);

      expect([scheme.titleColor, scheme.iconFilled, scheme.iconColor]).toEqual([
        colors.v2GreyText,
        true,
        colors.v2Orange,
      ]);
    });

    it('should treat complete as marked today when markedToday is not given', () => {
      expect(getColorScheme('pill', true).iconFilled).toBe(true);
    });
  });
});

describe('getColorScheme frozen today', () => {
  it('should show the pill title, number and icon icy when frozen', () => {
    const scheme = getColorScheme('pill', false, false, true);

    expect([scheme.titleColor, scheme.numberColor, scheme.iconColor]).toEqual([
      colors.v2Ice,
      colors.v2Ice,
      colors.v2Ice,
    ]);
  });

  it('should keep the banner title white and give it the icy container', () => {
    const scheme = getColorScheme('banner', false, false, true);

    expect([
      scheme.titleColor,
      scheme.numberColor,
      scheme.container?.borderColor,
      scheme.container?.backgroundColor,
    ]).toEqual([
      colors.v2White,
      colors.v2Ice,
      colors.v2Ice,
      colors.v2IceCardBackground,
    ]);
  });

  it('should swap the icon for the Snowflake and turn the bar icy', () => {
    const scheme = getColorScheme('banner', false, false, true);

    expect([scheme.iconFrozen, scheme.barColor, scheme.frozen]).toEqual([
      true,
      colors.v2Ice,
      true,
    ]);
  });

  it('should let complete beat frozen', () => {
    const scheme = getColorScheme('banner', true, true, true);

    expect([
      scheme.numberColor,
      scheme.iconFrozen,
      scheme.barColor,
      scheme.frozen,
      scheme.container?.borderColor,
    ]).toEqual([
      colors.v2Orange,
      false,
      colors.v2Orange,
      false,
      colors.v2Orange,
    ]);
  });

  it('should stay grey and orange-barred when not frozen', () => {
    const scheme = getColorScheme('pill', false, false, false);

    expect([scheme.numberColor, scheme.iconFrozen, scheme.barColor]).toEqual([
      colors.v2GreyText,
      false,
      colors.v2Orange,
    ]);
  });
});
