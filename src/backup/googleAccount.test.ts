import { GoogleOneTapSignIn } from 'react-native-nitro-google-signin';
import {
  DRIVE_APPDATA_SCOPE,
  getAccessToken,
  signInWithGoogle,
} from './googleAccount';

const google = GoogleOneTapSignIn as jest.Mocked<typeof GoogleOneTapSignIn>;

const success = {
  type: 'success' as const,
  data: {
    user: {
      id: 'u1',
      email: 'me@example.com',
      name: 'Me',
      givenName: null,
      familyName: null,
      photo: null,
    },
    scopes: [],
    idToken: 'id',
    serverAuthCode: null,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('signInWithGoogle', () => {
  it('should return the account and ask for Drive app-data access', async () => {
    google.signIn.mockResolvedValueOnce(success);

    expect([
      await signInWithGoogle(),
      google.requestScopes.mock.calls[0][0],
    ]).toEqual([
      { name: 'Me', email: 'me@example.com' },
      [DRIVE_APPDATA_SCOPE],
    ]);
  });

  it('should show all accounts when none is saved yet', async () => {
    google.signIn.mockResolvedValueOnce({
      type: 'noSavedCredentialFound',
      data: null,
    });
    google.createAccount.mockResolvedValueOnce(success);

    expect(await signInWithGoogle()).toEqual({
      name: 'Me',
      email: 'me@example.com',
    });
  });

  it('should return null when the user cancels the account picker', async () => {
    google.signIn.mockResolvedValueOnce({ type: 'cancelled', data: null });

    expect(await signInWithGoogle()).toBeNull();
  });

  it('should sign out and return null when the user declines Drive access', async () => {
    google.signIn.mockResolvedValueOnce(success);
    google.requestScopes.mockRejectedValueOnce({
      code: 'SIGN_IN_CANCELLED',
      message: 'cancelled',
    });

    expect([
      await signInWithGoogle(),
      google.signOut.mock.calls.length,
    ]).toEqual([null, 1]);
  });
});

describe('getAccessToken', () => {
  it('should return the access token', async () => {
    expect(await getAccessToken()).toBe('token');
  });
});
