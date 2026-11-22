import { contrastRatio } from './contrast';

describe('contrastRatio', () => {
  it('should be 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('should be 1 for a colour on itself', () => {
    expect(contrastRatio('#23233f', '#23233f')).toBe(1);
  });

  it('should not depend on the order of the colours', () => {
    expect(contrastRatio('#4a4a6a', '#23233f')).toBeCloseTo(
      contrastRatio('#23233f', '#4a4a6a'),
      10,
    );
  });

  it('should match the old outline failure from the review (1.79:1)', () => {
    expect(contrastRatio('#4a4a6a', '#23233f')).toBeCloseTo(1.79, 2);
  });
});
