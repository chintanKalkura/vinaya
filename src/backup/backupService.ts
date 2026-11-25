import {
  loadHabitGroups,
  loadHabits,
  loadTombstones,
  saveHabitGroups,
  saveHabits,
  saveTombstones,
  withStorageQueue,
} from '../storage/habitStorage';
import { getAppVersionName } from '../storage/appInfo';
import {
  loadStoredSettings,
  toSettings,
  writeSettings,
} from '../storage/settingsStorage';
import {
  applyStreakFreezesInQueue,
  syncGroupCompletionInQueue,
} from '../services/habitGroupService';
import { BackupData } from '../types/backup';
import { toDateKey } from '../utils/dates';
import { BackupStore, BackupStoreError } from './BackupStore';
import { getDeviceId, loadBackupState, updateBackupState } from './backupState';
import { MergeResult, mergeBackup } from './mergeBackup';
import { BackupVersionError, toBackupFile } from './schema';

// Backup and restore: docs/feature-development/release-1-readiness/google-drive-backup.md

const DAY_MS = 24 * 60 * 60 * 1000;
export const AUTO_BACKUP_DAYS = 7;

export type Added = MergeResult['added'];

// The text Profile shows for a failed backup or restore
export function backupErrorText(error: unknown): string {
  if (error instanceof BackupVersionError) return error.message;
  if (error instanceof BackupStoreError) {
    switch (error.reason) {
      case 'offline':
        return "Couldn't reach Google Drive. Will try again next time.";
      case 'full':
        return 'Your Google Drive is full.';
      case 'unauthorized':
        return 'Vinaya no longer has access to your Google Drive. Sign in again.';
    }
  }
  return 'Backup failed. Will try again next time.';
}

// Runs inside the storage queue: merges the backup into the phone's data,
// re-checks every group for today and re-applies freezes
async function mergeIntoLocal(
  remote: BackupData | null,
  now: number,
): Promise<MergeResult> {
  const [habits, habitGroups, tombstones, settings] = await Promise.all([
    loadHabits(),
    loadHabitGroups(),
    loadTombstones(),
    loadStoredSettings(),
  ]);
  const local: BackupData = {
    habits,
    habitGroups,
    tombstones: Object.values(tombstones),
    ...(settings ? { settings: { ...settings } } : {}),
  };
  if (!remote) return { data: local, added: { habits: 0, groups: 0 } };

  const { data, added } = mergeBackup(local, remote, now);
  await saveHabits(data.habits);
  await saveHabitGroups(data.habitGroups);
  await saveTombstones(Object.fromEntries(data.tombstones.map(t => [t.id, t])));
  // Settings changed on this phone win; otherwise the backup's are kept
  if (!settings && data.settings)
    await writeSettings(toSettings(data.settings));

  const todayKey = toDateKey(new Date(now));
  for (const groupId of Object.keys(data.habitGroups)) {
    await syncGroupCompletionInQueue(groupId, todayKey);
  }
  await applyStreakFreezesInQueue(todayKey);

  const [finalHabits, finalGroups] = await Promise.all([
    loadHabits(),
    loadHabitGroups(),
  ]);
  return {
    data: { ...data, habits: finalHabits, habitGroups: finalGroups },
    added,
  };
}

// Downloads, merges (the phone wins) and uploads, so an old phone can't
// overwrite a newer one. The network calls run outside the storage queue so
// they never hold up a tap; local data changes only after a good download.
export async function backupNow(
  store: BackupStore,
  now: number = Date.now(),
): Promise<Added> {
  try {
    const remote = await store.read();
    const merged = await withStorageQueue(() => mergeIntoLocal(remote, now));
    const file = toBackupFile(merged.data, {
      exportedAt: now,
      appVersion: (await getAppVersionName()) ?? 'unknown',
      deviceId: await getDeviceId(),
    });
    await store.write(file);
    await updateBackupState({ lastBackupAt: now, lastError: undefined });
    return merged.added;
  } catch (error) {
    await updateBackupState({ lastError: backupErrorText(error) });
    throw error;
  }
}

// Weekly, when the app comes to the foreground. Fails quietly: the error
// shows in Profile and the next app open tries again.
export async function maybeAutoBackup(
  store: BackupStore,
  signedIn: boolean,
  now: number = Date.now(),
): Promise<boolean> {
  if (!signedIn) return false;
  const { lastBackupAt } = await loadBackupState();
  if (
    lastBackupAt !== undefined &&
    now - lastBackupAt < AUTO_BACKUP_DAYS * DAY_MS
  ) {
    return false;
  }
  try {
    await backupNow(store, now);
  } catch {}
  return true;
}

// After sign-in: merges an existing backup into the phone. Returns null when
// there is no backup. A failure changes nothing on the phone.
export async function restoreFromBackup(
  store: BackupStore,
  now: number = Date.now(),
): Promise<Added | null> {
  try {
    const remote = await store.read();
    if (!remote) return null;
    const merged = await withStorageQueue(() => mergeIntoLocal(remote, now));
    return merged.added;
  } catch (error) {
    await updateBackupState({ lastError: backupErrorText(error) });
    throw error;
  }
}
