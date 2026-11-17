import { BackupFile } from '../types/backup';
import { BackupStore } from './BackupStore';

// In-memory BackupStore for tests; keeps the previous file like the Drive store
export class FakeBackupStore implements BackupStore {
  current: BackupFile | null = null;
  previous: BackupFile | null = null;
  readError: Error | null = null;
  writeError: Error | null = null;
  calls: string[] = [];

  async read(): Promise<BackupFile | null> {
    this.calls.push('read');
    if (this.readError) throw this.readError;
    return this.current ?? this.previous;
  }

  async write(file: BackupFile): Promise<void> {
    this.calls.push('write');
    if (this.writeError) throw this.writeError;
    if (this.current) this.previous = this.current;
    this.current = file;
  }

  async delete(): Promise<void> {
    this.calls.push('delete');
    this.current = null;
    this.previous = null;
  }
}
