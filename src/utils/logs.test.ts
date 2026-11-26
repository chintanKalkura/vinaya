import { withLogEntry } from './logs';
import { LogEntry } from '../types/log';

const mark = (date: string): LogEntry => ({ date, kind: 'marker', value: 1 });

function item(dates: string[]) {
  const history = dates.map(mark);
  return { id: 'a', history, recentLog: [...history].reverse() };
}

describe('withLogEntry', () => {
  it('should put a past day in date order, in both logs', () => {
    const updated = withLogEntry(
      item(['2026-11-20', '2026-11-25']),
      '2026-11-22',
      mark('2026-11-22'),
    );

    expect([
      updated.history.map(e => e.date),
      updated.recentLog.map(e => e.date),
    ]).toEqual([
      ['2026-11-20', '2026-11-22', '2026-11-25'],
      ['2026-11-25', '2026-11-22', '2026-11-20'],
    ]);
  });

  it('should clear a day with no entry', () => {
    expect(
      withLogEntry(item(['2026-11-20', '2026-11-25']), '2026-11-20', undefined)
        .history,
    ).toEqual([mark('2026-11-25')]);
  });

  it('should replace an existing entry for the day', () => {
    const hours: LogEntry = { date: '2026-11-20', kind: 'hours', value: 3 };

    expect(
      withLogEntry(item(['2026-11-20']), '2026-11-20', hours).history,
    ).toEqual([hours]);
  });

  it('should keep recentLog to its newest 90 entries', () => {
    const dates = Array.from(
      { length: 100 },
      (_, i) =>
        `2026-0${1 + Math.floor(i / 28)}-${String(1 + (i % 28)).padStart(
          2,
          '0',
        )}`,
    );
    const updated = withLogEntry(item(dates), '2025-12-31', mark('2025-12-31'));

    expect([
      updated.history.length,
      updated.recentLog.length,
      updated.recentLog[0].date,
    ]).toEqual([101, 90, dates[99]]);
  });
});
