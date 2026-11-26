import { PAST_DAYS_BY_CADENCE, editableRange, isInRange } from './pastDays';

const TODAY = '2026-11-26';
const at = (y: number, m: number, d: number) =>
  new Date(y, m - 1, d, 9).getTime();
const LONG_AGO = at(2020, 1, 1);

describe('editableRange', () => {
  it.each([
    ['Day', '2026-11-19'],
    ['Week', '2026-11-11'],
    ['Month', '2026-09-27'],
    ['Year', '2026-05-30'],
  ] as const)(
    'should go back n days for %s, ending yesterday',
    (cadence, from) => {
      expect(editableRange(cadence, LONG_AGO, TODAY)).toEqual({
        from,
        to: '2026-11-25',
      });
    },
  );

  it('should use n = 7, 15, 60 and 180', () => {
    expect(PAST_DAYS_BY_CADENCE).toEqual({
      Day: 7,
      Week: 15,
      Month: 60,
      Year: 180,
    });
  });

  it('should start no earlier than the creation day', () => {
    expect(editableRange('Year', at(2026, 11, 23), TODAY)).toEqual({
      from: '2026-11-23',
      to: '2026-11-25',
    });
  });

  it('should have nothing to edit on the creation day', () => {
    expect(editableRange('Day', at(2026, 11, 26), TODAY)).toBeUndefined();
  });

  it('should cross a year end', () => {
    expect(editableRange('Day', LONG_AGO, '2027-01-03')).toEqual({
      from: '2026-12-27',
      to: '2027-01-02',
    });
  });
});

describe('isInRange', () => {
  const range = { from: '2026-11-19', to: '2026-11-25' };

  it.each([
    ['2026-11-18', false],
    ['2026-11-19', true],
    ['2026-11-25', true],
    ['2026-11-26', false],
  ])('should treat %s as in range: %s', (date, inside) => {
    expect(isInRange(date, range)).toBe(inside);
  });
});
