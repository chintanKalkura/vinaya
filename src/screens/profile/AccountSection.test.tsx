import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AccountSection, {
  NOT_SIGNED_IN_TEXT,
  lastBackupText,
  restoreText,
} from './AccountSection';
import { deleteBackupAndSignOut, signIn, signOut } from '../../backup/account';
import { backupNow } from '../../backup/backupService';
import { updateBackupState } from '../../backup/backupState';

jest.mock('../../backup/account', () => ({
  createDriveStore: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
  deleteBackupAndSignOut: jest.fn(),
}));
jest.mock('../../backup/backupService', () => ({
  backupNow: jest.fn(),
}));

const ACCOUNT = { name: 'Me', email: 'me@example.com' };

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('AccountSection signed out', () => {
  it('should show the not-signed-in message', async () => {
    const { findByText } = render(<AccountSection onDataChanged={() => {}} />);

    expect(await findByText(NOT_SIGNED_IN_TEXT)).toBeTruthy();
  });

  it('should show what a restore added after signing in', async () => {
    (signIn as jest.Mock).mockImplementationOnce(async () => {
      await updateBackupState({ account: ACCOUNT });
      return { account: ACCOUNT, added: { habits: 12, groups: 3 } };
    });
    const onDataChanged = jest.fn();
    const utils = render(<AccountSection onDataChanged={onDataChanged} />);

    fireEvent.press(await utils.findByTestId('sign-in'));

    expect([
      !!(await utils.findByText(
        'Added 12 habits and 3 groups from your backup.',
      )),
      onDataChanged.mock.calls.length,
    ]).toEqual([true, 1]);
  });

  it('should say when sign-in fails', async () => {
    (signIn as jest.Mock).mockRejectedValueOnce(new Error('DEVELOPER_ERROR'));
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    fireEvent.press(await utils.findByTestId('sign-in'));

    expect(await utils.findByText("Couldn't sign in. Try again.")).toBeTruthy();
  });
});

describe('AccountSection signed in', () => {
  it('should show the account and the last backup date', async () => {
    await updateBackupState({
      account: ACCOUNT,
      lastBackupAt: new Date(2026, 10, 17).getTime(),
    });
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    expect([
      !!(await utils.findByText('Me')),
      !!utils.getByText('me@example.com'),
      !!utils.getByText('Last backed up 17 Nov 2026'),
    ]).toEqual([true, true, true]);
  });

  it('should show the last backup error in place of the date', async () => {
    await updateBackupState({
      account: ACCOUNT,
      lastBackupAt: 1,
      lastError: 'Your Google Drive is full.',
    });
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    expect((await utils.findByTestId('backup-status')).props.children).toBe(
      'Your Google Drive is full.',
    );
  });

  it('should back up when Back up now is pressed', async () => {
    await updateBackupState({ account: ACCOUNT });
    (backupNow as jest.Mock).mockImplementationOnce(async () => {
      await updateBackupState({
        lastBackupAt: new Date(2026, 10, 18).getTime(),
      });
      return { habits: 0, groups: 0 };
    });
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    fireEvent.press(await utils.findByTestId('back-up-now'));

    expect(await utils.findByText('Last backed up 18 Nov 2026')).toBeTruthy();
  });

  it('should sign out', async () => {
    await updateBackupState({ account: ACCOUNT });
    (signOut as jest.Mock).mockImplementationOnce(() =>
      AsyncStorage.removeItem('backup_state_v1'),
    );
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    fireEvent.press(await utils.findByTestId('sign-out'));

    expect(await utils.findByText(NOT_SIGNED_IN_TEXT)).toBeTruthy();
  });

  it('should ask before deleting the backup', async () => {
    await updateBackupState({ account: ACCOUNT });
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    fireEvent.press(await utils.findByTestId('delete-backup'));

    expect([
      !!utils.getByText('Delete backup and sign out?'),
      (deleteBackupAndSignOut as jest.Mock).mock.calls.length,
    ]).toEqual([true, 0]);
  });

  it('should delete the backup and sign out once confirmed', async () => {
    await updateBackupState({ account: ACCOUNT });
    (deleteBackupAndSignOut as jest.Mock).mockImplementationOnce(() =>
      AsyncStorage.removeItem('backup_state_v1'),
    );
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    fireEvent.press(await utils.findByTestId('delete-backup'));
    fireEvent.press(utils.getByTestId('delete-confirm-delete'));

    await waitFor(() =>
      expect(utils.getByText(NOT_SIGNED_IN_TEXT)).toBeTruthy(),
    );
  });

  it('should keep the account when deleting fails', async () => {
    await updateBackupState({ account: ACCOUNT });
    (deleteBackupAndSignOut as jest.Mock).mockRejectedValueOnce(
      new Error('offline'),
    );
    const utils = render(<AccountSection onDataChanged={() => {}} />);

    fireEvent.press(await utils.findByTestId('delete-backup'));
    fireEvent.press(utils.getByTestId('delete-confirm-delete'));

    expect([
      !!(await utils.findByText("Couldn't delete your backup. Try again.")),
      !!utils.getByText('Me'),
    ]).toEqual([true, true]);
  });
});

describe('restoreText', () => {
  it.each([
    [{ habits: 1, groups: 0 }, 'Added 1 habit from your backup.'],
    [{ habits: 0, groups: 2 }, 'Added 2 groups from your backup.'],
    [{ habits: 0, groups: 0 }, 'Your backup had nothing new for this phone.'],
  ])('should describe %j', (added, text) => {
    expect(restoreText(added)).toBe(text);
  });
});

describe('lastBackupText', () => {
  it('should say when there has been no backup', () => {
    expect(lastBackupText(undefined)).toBe('Not backed up yet');
  });
});

describe('AccountSection menu rows', () => {
  it('should hide Sign out and Delete data when signed out', async () => {
    const { findByText, queryByTestId } = render(
      <AccountSection onDataChanged={() => {}} />,
    );
    await findByText(NOT_SIGNED_IN_TEXT);

    expect([queryByTestId('sign-out'), queryByTestId('delete-backup')]).toEqual(
      [null, null],
    );
  });

  it('should draw the Profile menu rows above Sign out', async () => {
    await updateBackupState({ account: ACCOUNT });
    const { findByTestId, toJSON } = render(
      <AccountSection onDataChanged={() => {}}>
        <Text>Display settings</Text>
      </AccountSection>,
    );
    await findByTestId('sign-out');
    const tree = JSON.stringify(toJSON());

    expect(tree.indexOf('Display settings')).toBeLessThan(
      tree.indexOf('Sign out'),
    );
  });

  it('should label the delete row Delete data', async () => {
    await updateBackupState({ account: ACCOUNT });
    const { findByText } = render(<AccountSection onDataChanged={() => {}} />);

    expect(await findByText('Delete data')).toBeTruthy();
  });
});
