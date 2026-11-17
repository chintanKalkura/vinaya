import {
  BackupFormatError,
  BackupVersionError,
  parseBackupFile,
  toBackupFile,
} from './schema';

const META = { exportedAt: 1000, appVersion: '1.0', deviceId: 'device-1' };
const DATA = { habits: {}, habitGroups: {}, tombstones: [] };

describe('toBackupFile', () => {
  it('should stamp the current schema version and metadata', () => {
    expect(toBackupFile(DATA, META)).toEqual({
      schemaVersion: 1,
      ...META,
      ...DATA,
    });
  });
});

describe('parseBackupFile', () => {
  it('should round-trip a version 1 file', () => {
    const file = toBackupFile(DATA, META);

    expect(parseBackupFile(JSON.stringify(file))).toEqual(file);
  });

  it('should refuse a newer version with a message', () => {
    const file = { ...toBackupFile(DATA, META), schemaVersion: 2 };

    expect(() => parseBackupFile(JSON.stringify(file))).toThrow(
      new BackupVersionError(
        'This backup is from a newer version of Vinaya. Update the app to restore it.',
      ),
    );
  });

  it('should refuse a file that is not JSON', () => {
    expect(() => parseBackupFile('{')).toThrow(BackupFormatError);
  });

  it('should refuse a file missing its habits', () => {
    const file: Partial<ReturnType<typeof toBackupFile>> = toBackupFile(
      DATA,
      META,
    );
    delete file.habits;

    expect(() => parseBackupFile(JSON.stringify(file))).toThrow(
      BackupFormatError,
    );
  });
});
