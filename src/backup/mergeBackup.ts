import { BackupData, Tombstone } from '../types/backup';
import { DEFAULT_HABIT_LIMITS } from '../types/habitConfig';
import { LogEntry } from '../types/log';
import { pruneTombstones } from '../utils/tombstones';

// Merge rules: docs/feature-development/release-1-readiness/google-drive-backup.md
// (decision 5). Pure, so the same rules can run on a backend later.

interface Logged {
  id: string;
  sortOrder: number;
  recentLog: LogEntry[];
  history: LogEntry[];
}

export interface MergeResult {
  data: BackupData;
  added: { habits: number; groups: number };
}

// Combined by date; on the same date the local entry wins. Oldest first.
function mergeHistory(local: LogEntry[], remote: LogEntry[]): LogEntry[] {
  const byDate = new Map<string, LogEntry>();
  for (const entry of remote) byDate.set(entry.date, entry);
  for (const entry of local) byDate.set(entry.date, entry);
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function withLogs<T extends Logged>(item: T, history: LogEntry[]): T {
  return {
    ...item,
    history,
    recentLog: [...history]
      .reverse()
      .slice(0, DEFAULT_HABIT_LIMITS.recentLogSize),
  };
}

function mergeItems<T extends Logged>(
  local: Record<string, T>,
  remote: Record<string, T>,
  deleted: Set<string>,
): { items: Record<string, T>; added: number } {
  const items: Record<string, T> = {};
  for (const item of Object.values(local)) {
    if (deleted.has(item.id)) continue;
    const other = remote[item.id];
    items[item.id] = other
      ? withLogs(item, mergeHistory(item.history, other.history))
      : item;
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
