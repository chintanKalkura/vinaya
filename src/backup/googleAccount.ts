import {
  GoogleOneTapSignIn,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '../config/google';
import { BackupAccount } from './backupState';

// Google sign-in through Credential Manager, and the Drive app-data access
// token through AuthorizationClient: google-drive-backup.md (decision 1)

export const DRIVE_APPDATA_SCOPE =
  'https://www.googleapis.com/auth/drive.appdata';

let configured = false;

function configure(): void {
  if (configured) return;
  GoogleOneTapSignIn.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: [DRIVE_APPDATA_SCOPE],
  });
  configured = true;
}

function isCancelled(error: unknown): boolean {
  return isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED;
}

// Signs in and asks for Drive app-data access. Returns null when the user
// cancels either step.
export async function signInWithGoogle(): Promise<BackupAccount | null> {
  configure();
  let response = await GoogleOneTapSignIn.signIn();
  if (response.type === 'noSavedCredentialFound') {
    response = await GoogleOneTapSignIn.createAccount();
  }
  if (!isSuccessResponse(response)) return null;

  try {
    await GoogleOneTapSignIn.requestScopes([DRIVE_APPDATA_SCOPE]);
  } catch (error) {
    if (!isCancelled(error)) throw error;
    await GoogleOneTapSignIn.signOut();
    return null;
  }
  const { user } = response.data;
  return { name: user.name ?? user.email ?? '', email: user.email ?? '' };
}

export async function getAccessToken(): Promise<string> {
  configure();
  return (await GoogleOneTapSignIn.getTokens()).accessToken;
}

// Drops a token Google rejected, so the next getAccessToken gets a new one
export async function clearAccessToken(token: string): Promise<void> {
  configure();
  await GoogleOneTapSignIn.clearCachedAccessToken(token);
}

export async function signOutOfGoogle(): Promise<void> {
  configure();
  await GoogleOneTapSignIn.signOut();
}

export async function revokeGoogleAccess(email: string): Promise<void> {
  configure();
  await GoogleOneTapSignIn.revokeAccess(email);
}
