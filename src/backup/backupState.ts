import AsyncStorage from '@react-native-async-storage/async-storage';

// Shown in Profile: the signed-in account and the last backup or its error
export interface BackupAccount {
  name: string;
  email: string;
}

export interface BackupState {
  lastBackupAt?: number;
  lastError?: string;
  account?: BackupAccount;
}

const BACKUP_STATE_KEY = 'backup_state_v1';
const DEVICE_ID_KEY = 'device_id_v1';

// Not habit data: an unreadable state reads as never backed up
export async function loadBackupState(): Promise<BackupState> {
  try {
    const raw = await AsyncStorage.getItem(BACKUP_STATE_KEY);
    return raw ? (JSON.parse(raw) as BackupState) : {};
  } catch {
    return {};
  }
}

// Merges the patch; an undefined field is removed
export async function updateBackupState(
  patch: Partial<BackupState>,
): Promise<BackupState> {
  const next = { ...(await loadBackupState()), ...patch };
  for (const key of Object.keys(next) as (keyof BackupState)[]) {
    if (next[key] === undefined) delete next[key];
  }
  await AsyncStorage.setItem(BACKUP_STATE_KEY, JSON.stringify(next));
  return next;
}

// A random id made once per install, written into each backup
export async function getDeviceId(): Promise<string> {
  const saved = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (saved) return saved;
  const id = `device-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
