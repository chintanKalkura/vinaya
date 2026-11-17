import { BackupFile } from '../types/backup';
import { BackupStore, BackupStoreError } from './BackupStore';
import { parseBackupFile } from './schema';

// The backup in the Drive app-data folder: hidden from the user's Drive and
// readable only by Vinaya. Plain fetch to the Drive v3 REST API.

export const CURRENT_FILE = 'vinaya-backup.json';
export const PREVIOUS_FILE = 'vinaya-backup.prev.json';

const FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const BOUNDARY = 'vinaya-backup-boundary';

interface DriveFile {
  id: string;
  name: string;
}

async function failure(response: Response): Promise<BackupStoreError> {
  let reason = '';
  try {
    const body = await response.json();
    reason = body?.error?.errors?.[0]?.reason ?? '';
  } catch {}
  if (response.status === 401) {
    return new BackupStoreError('unauthorized', 'Drive access token rejected');
  }
  if (reason === 'storageQuotaExceeded') {
    return new BackupStoreError('full', 'Google Drive is full');
  }
  if (response.status === 403 && reason.startsWith('insufficient')) {
    return new BackupStoreError('unauthorized', `Drive refused: ${reason}`);
  }
  return new BackupStoreError(
    'other',
    `Drive request failed: ${response.status} ${reason}`,
  );
}

export class DriveBackupStore implements BackupStore {
  constructor(
    private readonly getAccessToken: () => Promise<string>,
    private readonly clearAccessToken: (token: string) => Promise<void>,
  ) {}

  // Retries once with a new token when Google rejects the cached one
  private async request(
    url: string,
    init: RequestInit = {},
  ): Promise<Response> {
    for (let attempt = 0; ; attempt++) {
      const token = await this.getAccessToken();
      let response: Response;
      try {
        response = await fetch(url, {
          ...init,
          headers: { ...init.headers, Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        throw new BackupStoreError('offline', String(error));
      }
      if (response.status === 401 && attempt === 0) {
        await this.clearAccessToken(token);
        continue;
      }
      if (!response.ok) throw await failure(response);
      return response;
    }
  }

  private async list(): Promise<Record<string, DriveFile>> {
    const q = encodeURIComponent(
      `name = '${CURRENT_FILE}' or name = '${PREVIOUS_FILE}'`,
    );
    const response = await this.request(
      `${FILES_URL}?spaces=appDataFolder&q=${q}&fields=files(id,name)`,
    );
    const { files } = (await response.json()) as { files: DriveFile[] };
    return Object.fromEntries(files.map(file => [file.name, file]));
  }

  private async remove(file: DriveFile | undefined): Promise<void> {
    if (file)
      await this.request(`${FILES_URL}/${file.id}`, { method: 'DELETE' });
  }

  async read(): Promise<BackupFile | null> {
    const files = await this.list();
    const file = files[CURRENT_FILE] ?? files[PREVIOUS_FILE];
    if (!file) return null;
    const response = await this.request(`${FILES_URL}/${file.id}?alt=media`);
    return parseBackupFile(await response.text());
  }

  // The current file becomes the previous one before the new one is uploaded,
  // so a failed upload still leaves the previous backup to read
  async write(backup: BackupFile): Promise<void> {
    const files = await this.list();
    await this.remove(files[PREVIOUS_FILE]);
    const current = files[CURRENT_FILE];
    if (current) {
      await this.request(`${FILES_URL}/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: PREVIOUS_FILE }),
      });
    }

    const metadata = { name: CURRENT_FILE, parents: ['appDataFolder'] };
    const body = [
      `--${BOUNDARY}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${BOUNDARY}`,
      'Content-Type: application/json',
      '',
      JSON.stringify(backup),
      `--${BOUNDARY}--`,
    ].join('\r\n');
    await this.request(UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${BOUNDARY}` },
      body,
    });
  }

  async delete(): Promise<void> {
    const files = await this.list();
    await this.remove(files[CURRENT_FILE]);
    await this.remove(files[PREVIOUS_FILE]);
  }
}
