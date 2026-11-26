import { BackupData, Tombstone } from '../types/backup';
import { pruneTombstones } from '../utils/tombstones';

// Merge rules: docs/feature-development/release-1-readiness/google-drive-backup.md
// (decision 5). Pure, so the same rules can run on a backend later.

interface Mergeable {
  id: string;
  sortOrder: number;
}

export interface MergeResult {
  data: BackupData;
  added: { habits: number; groups: number };
}

function mergeItems<T extends Mergeable>(
  local: Record<string, T>,
  remote: Record<string, T>,
  deleted: Set<string>,
): { items: Record<string, T>; added: number } {
  // An item on both sides is kept as the phone has it, log included: a day
  // unmarked on the phone has no entry, so combining by date would bring the
  // backup's mark back
  const items: Record<string, T> = {};
  for (const item of Object.values(local)) {
    if (!deleted.has(item.id)) items[item.id] = item;
  }

  // Backup-only items go after the phone's, in the backup's order
  let nextSortOrder =
    Math.max(-1, ...Object.values(items).map(i => i.sortOrder)) + 1;
  const newItems = Object.values(remote)
    .filter(item => !(item.id in local) && !deleted.has(item.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  for (const item of newItems) {
    items[item.id] = { ...item, sortOrder: nextSortOrder++ };
  }
  return { items, added: newItems.length };
}

function mergeTombstones(
  local: Tombstone[],
  remote: Tombstone[],
  now: number,
): Tombstone[] {
  const byId: Record<string, Tombstone> = {};
  for (const t of [...remote, ...local]) {
    const seen = byId[t.id];
    if (!seen || t.deletedAt > seen.deletedAt) byId[t.id] = t;
  }
  return Object.values(pruneTombstones(byId, now));
}

export function mergeBackup(
  local: BackupData,
  remote: BackupData,
  now: number,
): MergeResult {
  const tombstones = mergeTombstones(local.tombstones, remote.tombstones, now);
  const deleted = new Set(tombstones.map(t => t.id));

  const habits = mergeItems(local.habits, remote.habits, deleted);
  const groups = mergeItems(local.habitGroups, remote.habitGroups, deleted);

  // Members must exist: a habit deleted on either side leaves every group
  const exists = (id: string) => id in habits.items;
  const habitGroups = Object.fromEntries(
    Object.entries(groups.items).map(([id, group]) => [
      id,
      {
        ...group,
        habitIds: group.habitIds.filter(exists),
        ...(group.requiredHabitIds
          ? { requiredHabitIds: group.requiredHabitIds.filter(exists) }
          : {}),
      },
    ]),
  );

  const settings = local.settings ?? remote.settings;
  return {
    data: {
      habits: habits.items,
      habitGroups,
      tombstones,
      ...(settings ? { settings } : {}),
    },
    added: { habits: habits.added, groups: groups.added },
  };
}
