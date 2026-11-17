import { BackupStore } from './BackupStore';
import { Added, maybeAutoBackup, restoreFromBackup } from './backupService';
import {
  BackupAccount,
  loadBackupState,
  updateBackupState,
} from './backupState';
import { DriveBackupStore } from './driveBackupStore';
import {
  clearAccessToken,
  getAccessToken,
  revokeGoogleAccess,
  signInWithGoogle,
  signOutOfGoogle,
} from './googleAccount';

// Sign in, sign out and delete: google-drive-backup.md (decisions 7, 9, 10)

export function createDriveStore(): BackupStore {
  return new DriveBackupStore(getAccessToken, clearAccessToken);
}

export interface SignInResult {
  account: BackupAccount;
  added: Added | null; // null when there was no backup or it couldn't be read
}

// Signs in, then merges any existing backup into the phone. A failed restore
// changes nothing and its error shows in Profile. Null when cancelled.
export async function signIn(
  store: BackupStore = createDriveStore(),
): Promise<SignInResult | null> {
  const account = await signInWithGoogle();
  if (!account) return null;
  await updateBackupState({ account, lastError: undefined });
  let added: Added | null = null;
  try {
    added = await restoreFromBackup(store);
  } catch {}
  return { account, added };
}

function forgetAccount(): Promise<unknown> {
  return updateBackupState({
    account: undefined,
    lastBackupAt: undefined,
    lastError: undefined,
  });
}

// Keeps the phone's data and the Drive backup; backups stop
export async function signOut(): Promise<void> {
  await signOutOfGoogle();
  await forgetAccount();
}

// Deletes both backup files, revokes Vinaya's access and signs out. The
// phone's data stays. Stops before signing out if the delete fails.
export async function deleteBackupAndSignOut(
  store: BackupStore = createDriveStore(),
): Promise<void> {
  const { account } = await loadBackupState();
  await store.delete();
  if (account?.email) await revokeGoogleAccess(account.email);
  await signOutOfGoogle();
  await forgetAccount();
}

// Weekly backup on app open, when signed in
export async function autoBackup(
  store: BackupStore = createDriveStore(),
): Promise<boolean> {
  const { account } = await loadBackupState();
  return maybeAutoBackup(store, account !== undefined);
}
