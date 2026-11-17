import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import {
  createDriveStore,
  deleteBackupAndSignOut,
  signIn,
  signOut,
} from '../../backup/account';
import { Added, backupNow } from '../../backup/backupService';
import { BackupState, loadBackupState } from '../../backup/backupState';

// Account & backup in Profile: docs/style-choices/profile/account-and-backup.md

export const NOT_SIGNED_IN_TEXT =
  "You're not signed in. Sign in with your Google account to back up your data, so that you don't lose your progress. 🙂";

type Busy = 'none' | 'signIn' | 'backup' | 'signOut' | 'delete';

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function restoreText(added: Added): string {
  const parts = [
    added.habits > 0 ? plural(added.habits, 'habit') : null,
    added.groups > 0 ? plural(added.groups, 'group') : null,
  ].filter(Boolean);
  if (parts.length === 0) return 'Your backup had nothing new for this phone.';
  return `Added ${parts.join(' and ')} from your backup.`;
}

export function lastBackupText(lastBackupAt: number | undefined): string {
  if (lastBackupAt === undefined) return 'Not backed up yet';
  const date = new Date(lastBackupAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Last backed up ${date}`;
}

interface AccountSectionProps {
  onDataChanged: () => void; // a restore or backup merge changed habits
}

export default function AccountSection({
  onDataChanged,
}: AccountSectionProps): React.JSX.Element {
  const [state, setState] = useState<BackupState>({});
  const [busy, setBusy] = useState<Busy>('none');
  const [actionError, setActionError] = useState<string | null>(null);
  const [restored, setRestored] = useState<Added | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const refresh = useCallback(async () => {
    setState(await loadBackupState());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Runs one action at a time; the backup error itself is read from the state
  const run = useCallback(
    async (kind: Busy, action: () => Promise<void>, failure: string) => {
      setBusy(kind);
      setActionError(null);
      try {
        await action();
      } catch {
        setActionError(failure);
      }
      await refresh();
      setBusy('none');
    },
    [refresh],
  );

  const handleSignIn = () =>
    run(
      'signIn',
      async () => {
        const result = await signIn();
        if (result?.added) {
          setRestored(result.added);
          onDataChanged();
        }
      },
      "Couldn't sign in. Try again.",
    );

  const handleBackUp = () =>
    run(
      'backup',
      async () => {
        try {
          const added = await backupNow(createDriveStore());
          if (added.habits + added.groups > 0) onDataChanged();
        } catch {} // shown from the saved state
      },
      '',
    );

  const handleSignOut = () =>
    run('signOut', signOut, "Couldn't sign out. Try again.");

  const handleDelete = () => {
    setConfirmingDelete(false);
    run(
      'delete',
      () => deleteBackupAndSignOut(),
      "Couldn't delete your backup. Try again.",
    );
  };

  const { account } = state;
  const disabled = busy !== 'none';

  return (
    <View testID="account-section" style={styles.card}>
      <Text style={styles.heading}>ACCOUNT & BACKUP</Text>

      {account ? (
        <>
          <Text testID="account-name" style={styles.name}>
            {account.name}
          </Text>
          <Text style={styles.email}>{account.email}</Text>
          {state.lastError ? (
            <Text testID="backup-status" style={styles.error}>
              {state.lastError}
            </Text>
          ) : (
            <Text testID="backup-status" style={styles.status}>
              {lastBackupText(state.lastBackupAt)}
            </Text>
          )}
          <Pressable
            testID="back-up-now"
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={handleBackUp}
            style={[styles.primary, disabled && styles.primaryDisabled]}
          >
            <Text style={styles.primaryLabel}>
              {busy === 'backup' ? 'Backing up…' : 'Back up now'}
            </Text>
          </Pressable>
          <Pressable
            testID="sign-out"
            accessibilityRole="button"
            disabled={disabled}
            onPress={handleSignOut}
            style={styles.textButton}
          >
            <Text style={styles.textLabel}>Sign out</Text>
          </Pressable>
          <Pressable
            testID="delete-backup"
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => setConfirmingDelete(true)}
            style={styles.textButton}
          >
            <Text style={[styles.textLabel, styles.deleteLabel]}>
              Delete backup and sign out
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text testID="not-signed-in" style={styles.body}>
            {NOT_SIGNED_IN_TEXT}
          </Text>
          <Pressable
            testID="sign-in"
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={handleSignIn}
            style={[styles.primary, disabled && styles.primaryDisabled]}
          >
            <Text style={styles.primaryLabel}>
              {busy === 'signIn' ? 'Signing in…' : 'Sign in with Google'}
            </Text>
          </Pressable>
        </>
      )}

      {actionError ? (
        <Text testID="account-error" style={styles.error}>
          {actionError}
        </Text>
      ) : null}

      <Modal
        visible={restored !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setRestored(null)}
      >
        <View style={styles.backdrop}>
          <View testID="restore-result" style={styles.dialog}>
            <Text style={styles.dialogBody}>
              {restored ? restoreText(restored) : ''}
            </Text>
            <Pressable
              testID="restore-result-ok"
              accessibilityRole="button"
              onPress={() => setRestored(null)}
              style={[styles.dialogButton, styles.okButton]}
            >
              <Text style={styles.primaryLabel}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmingDelete}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setConfirmingDelete(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setConfirmingDelete(false)}
        >
          <Pressable
            testID="delete-confirm"
            style={styles.dialog}
            onPress={() => {}}
          >
            <Text style={styles.dialogTitle}>Delete backup and sign out?</Text>
            <Text style={styles.dialogBody}>
              This deletes your Vinaya backup from Google Drive and signs you
              out. Your habits on this phone stay.
            </Text>
            <View style={styles.row}>
              <Pressable
                testID="delete-confirm-cancel"
                accessibilityRole="button"
                onPress={() => setConfirmingDelete(false)}
                style={[styles.dialogButton, styles.cancel, styles.half]}
              >
                <Text style={styles.cancelLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="delete-confirm-delete"
                accessibilityRole="button"
                onPress={handleDelete}
                style={[styles.dialogButton, styles.confirm, styles.half]}
              >
                <Text style={styles.confirmLabel}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.v2CardBackground,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  heading: {
    color: colors.v2GreyText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  body: {
    color: colors.v2White,
    fontSize: 15,
    lineHeight: 22,
  },
  name: {
    color: colors.v2White,
    fontSize: 17,
    fontWeight: '700',
  },
  email: {
    color: colors.v2GreyText,
    fontSize: 14,
    marginTop: -6,
  },
  status: {
    color: colors.v2GreyText,
    fontSize: 14,
  },
  error: {
    color: colors.v2Red,
    fontSize: 14,
  },
  primary: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.v2Orange,
    marginTop: 4,
  },
  primaryDisabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 16,
  },
  textButton: {
    paddingVertical: 8,
  },
  textLabel: {
    color: colors.v2White,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteLabel: {
    color: colors.v2Red,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 12, 0.85)',
  },
  dialog: {
    width: '78%',
    borderRadius: 18,
    backgroundColor: colors.v2CardBackground,
    padding: 18,
    gap: 12,
  },
  dialogTitle: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 17,
  },
  dialogBody: {
    color: colors.v2GreyText,
    fontSize: 14,
    lineHeight: 20,
  },
  dialogButton: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButton: {
    backgroundColor: colors.v2Orange,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  cancel: {
    borderWidth: 1,
    borderColor: colors.v2GreyOutline,
  },
  cancelLabel: {
    color: colors.v2White,
    fontWeight: '700',
    fontSize: 16,
  },
  confirm: {
    backgroundColor: colors.v2Red,
  },
  confirmLabel: {
    color: colors.v2Background,
    fontWeight: '700',
    fontSize: 16,
  },
});
