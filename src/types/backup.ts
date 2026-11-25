import { Habit } from './habit';
import { HabitGroup } from './habitGroup';

// Backup format: docs/feature-development/release-1-readiness/google-drive-backup.md

// Recorded on delete so a merge can't bring the item back from an older backup
export interface Tombstone {
  id: string;
  kind: 'habit' | 'group';
  deletedAt: number;
}

export interface BackupData {
  habits: Record<string, Habit>;
  habitGroups: Record<string, HabitGroup>;
  tombstones: Tombstone[];
  settings?: Record<string, unknown>; // settings_v2, only once changed on some phone
}

export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupFile extends BackupData {
  schemaVersion: number;
  exportedAt: number;
  appVersion: string;
  deviceId: string;
}
