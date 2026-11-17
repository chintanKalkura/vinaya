import { Tombstone } from '../types/backup';
import { TOMBSTONE_DAYS } from '../types/habitConfig';

const DAY_MS = 24 * 60 * 60 * 1000;

export function pruneTombstones(
  tombstones: Record<string, Tombstone>,
  now: number,
): Record<string, Tombstone> {
  const cutoff = now - TOMBSTONE_DAYS * DAY_MS;
  return Object.fromEntries(
    Object.entries(tombstones).filter(([, t]) => t.deletedAt >= cutoff),
  );
}

// Adds a tombstone and drops the expired ones
export function withTombstone(
  tombstones: Record<string, Tombstone>,
  tombstone: Tombstone,
): Record<string, Tombstone> {
  return pruneTombstones(
    { ...tombstones, [tombstone.id]: tombstone },
    tombstone.deletedAt,
  );
}
