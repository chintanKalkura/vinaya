import { BackupFile } from '../types/backup';

// Where backups live. Google Drive today; Vinaya's own backend can be another
// implementation later: google-drive-backup.md (decision 14)
export interface BackupStore {
  // The latest backup, or null when there is none
  read(): Promise<BackupFile | null>;
  // Keeps the previous backup until the new one is written
  write(file: BackupFile): Promise<void>;
  // Removes the latest and the previous backup
  delete(): Promise<void>;
}

export type BackupStoreFailure = 'offline' | 'full' | 'unauthorized' | 'other';

export class BackupStoreError extends Error {
  constructor(readonly reason: BackupStoreFailure, message: string) {
    super(message);
  }
}
