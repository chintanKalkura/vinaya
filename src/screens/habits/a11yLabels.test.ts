import { checkmarkLabel, groupLabel, hoursLabel } from './a11yLabels';

const NOT_FROZEN = { frozen: false, freezesLeft: 1 };

describe('checkmarkLabel', () => {
  it('should name the habit and its streak', () => {
    expect(checkmarkLabel('Run', 12, NOT_FROZEN)).toBe('Run, 12 day streak');
  });

  it('should add the freeze when one was used today', () => {
    expect(checkmarkLabel('Run', 3, { frozen: true, freezesLeft: 1 })).toBe(
      'Run, 3 day streak, streak freeze used today, 1 freeze left',
    );
  });
});

describe('hoursLabel', () => {
  it("should name the habit, today's hours, the target and the streak", () => {
    expect(hoursLabel('Study', 2, 4, 5, NOT_FROZEN)).toBe(
      'Study, 2 of 4 hours today, 5 day streak',
    );
  });
});

describe('groupLabel', () => {
  it('should name the group, its type, whether it is complete and the streak', () => {
    expect(groupLabel('Fitness', 'Required', true, 7, NOT_FROZEN)).toBe(
      'Fitness, Required group, complete, 7 day streak',
    );
  });

  it('should say when the group is not complete', () => {
    expect(groupLabel('Fitness', 'Any', false, 0, NOT_FROZEN)).toBe(
      'Fitness, Any group, not complete, 0 day streak',
    );
  });
});
