import { msUntilNextMidnight } from './dates';

describe('msUntilNextMidnight', () => {
  it('should return the time left until local midnight', () => {
    expect(msUntilNextMidnight(new Date(2024, 5, 15, 23, 30))).toBe(
      30 * 60 * 1000,
    );
  });

  it('should return a full day at midnight itself', () => {
    expect(msUntilNextMidnight(new Date(2024, 5, 15, 0, 0))).toBe(
      24 * 60 * 60 * 1000,
    );
  });

  it('should roll over the end of a month', () => {
    expect(msUntilNextMidnight(new Date(2024, 5, 30, 23, 59, 59, 999))).toBe(1);
  });
});
