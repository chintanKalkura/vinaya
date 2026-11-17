import { pruneTombstones, withTombstone } from './tombstones';
import { Tombstone } from '../types/backup';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 17);

function tombstone(id: string, daysAgo: number): Tombstone {
  return { id, kind: 'habit', deletedAt: NOW - daysAgo * DAY_MS };
}

describe('pruneTombstones', () => {
  it('should keep tombstones up to 180 days old', () => {
    const kept = tombstone('a', 180);

    expect(pruneTombstones({ a: kept }, NOW)).toEqual({ a: kept });
  });

  it('should drop tombstones older than 180 days', () => {
    expect(pruneTombstones({ a: tombstone('a', 181) }, NOW)).toEqual({});
  });
});

describe('withTombstone', () => {
  it('should add the tombstone and drop expired ones', () => {
    const added = tombstone('b', 0);

    expect(withTombstone({ a: tombstone('a', 200) }, added)).toEqual({
      b: added,
    });
  });
});
