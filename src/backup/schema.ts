import { BACKUP_SCHEMA_VERSION, BackupData, BackupFile } from '../types/backup';

export class BackupVersionError extends Error {}
export class BackupFormatError extends Error {}

export interface BackupMeta {
  exportedAt: number;
  appVersion: string;
  deviceId: string;
}

// Upgrades a parsed file from version N to N + 1. Add an entry with every
// breaking change to the format.
const MIGRATIONS: Record<number, (file: BackupFile) => BackupFile> = {};

export function toBackupFile(data: BackupData, meta: BackupMeta): BackupFile {
  return { schemaVersion: BACKUP_SCHEMA_VERSION, ...meta, ...data };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseBackupFile(json: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new BackupFormatError('The backup file is not valid JSON');
  }
  if (
    !isRecord(parsed) ||
    typeof parsed.schemaVersion !== 'number' ||
    !isRecord(parsed.habits) ||
    !isRecord(parsed.habitGroups) ||
    !Array.isArray(parsed.tombstones)
  ) {
    throw new BackupFormatError('The backup file is missing required fields');
  }
  if (parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new BackupVersionError(
      'This backup is from a newer version of Vinaya. Update the app to restore it.',
    );
  }

  let file = parsed as unknown as BackupFile;
  while (file.schemaVersion < BACKUP_SCHEMA_VERSION) {
    const migrate = MIGRATIONS[file.schemaVersion];
    if (!migrate) {
      throw new BackupFormatError(
        `No migration from backup version ${file.schemaVersion}`,
      );
    }
    file = migrate(file);
  }
  return file;
}
