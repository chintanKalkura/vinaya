import { BackupStoreError } from './BackupStore';
import {
  CURRENT_FILE,
  DriveBackupStore,
  PREVIOUS_FILE,
} from './driveBackupStore';
import { toBackupFile } from './schema';

const BACKUP = toBackupFile(
  { habits: {}, habitGroups: {}, tombstones: [] },
  { exportedAt: 1, appVersion: '1.0', deviceId: 'd' },
);

interface Call {
  method: string;
  url: string;
  body?: string;
}

// A small fake of the Drive endpoints the store uses
function fakeDrive(files: { id: string; name: string }[]) {
  const calls: Call[] = [];
  const contents: Record<string, string> = {};
  for (const file of files) contents[file.id] = JSON.stringify(BACKUP);
  const respond = (status: number, body: unknown = {}) =>
    ({
      ok: status < 300,
      status,
      json: async () => body,
      text: async () =>
        typeof body === 'string' ? body : JSON.stringify(body),
    } as Response);

  const fetchMock = jest.fn(async (url: string, init: RequestInit = {}) => {
    const method = init.method ?? 'GET';
    calls.push({ method, url, body: init.body as string | undefined });
    if (method === 'GET' && url.includes('spaces=appDataFolder')) {
      return respond(200, { files });
    }
    if (method === 'GET' && url.includes('alt=media')) {
      const id = url.split('/files/')[1].split('?')[0];
      return respond(200, contents[id]);
    }
    return respond(200);
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return { calls, fetchMock, respond };
}

function makeStore() {
  const clearAccessToken = jest.fn().mockResolvedValue(undefined);
  const store = new DriveBackupStore(
    jest.fn().mockResolvedValue('token'),
    clearAccessToken,
  );
  return { store, clearAccessToken };
}

const summary = (calls: Call[]) =>
  calls.map(c => `${c.method} ${c.url.split('?')[0].split('/').pop()}`);

describe('DriveBackupStore read', () => {
  it('should return null when there is no backup', async () => {
    fakeDrive([]);

    expect(await makeStore().store.read()).toBeNull();
  });

  it('should read the current backup', async () => {
    const { calls } = fakeDrive([
      { id: 'cur', name: CURRENT_FILE },
      { id: 'prev', name: PREVIOUS_FILE },
    ]);

    const backup = await makeStore().store.read();

    expect([backup, calls[1].url]).toEqual([
      BACKUP,
      'https://www.googleapis.com/drive/v3/files/cur?alt=media',
    ]);
  });

  it('should fall back to the previous backup when the current one is missing', async () => {
    const { calls } = fakeDrive([{ id: 'prev', name: PREVIOUS_FILE }]);

    await makeStore().store.read();

    expect(calls[1].url).toContain('/files/prev?alt=media');
  });
});

describe('DriveBackupStore write', () => {
  it('should drop the old previous, keep the current as previous, then upload', async () => {
    const { calls } = fakeDrive([
      { id: 'cur', name: CURRENT_FILE },
      { id: 'prev', name: PREVIOUS_FILE },
    ]);

    await makeStore().store.write(BACKUP);

    expect([summary(calls), calls[2].body]).toEqual([
      ['GET files', 'DELETE prev', 'PATCH cur', 'POST files'],
      JSON.stringify({ name: PREVIOUS_FILE }),
    ]);
  });

  it('should upload into the app-data folder', async () => {
    const { calls } = fakeDrive([]);

    await makeStore().store.write(BACKUP);

    expect(calls[1].body).toContain(
      JSON.stringify({ name: CURRENT_FILE, parents: ['appDataFolder'] }),
    );
  });
});

describe('DriveBackupStore delete', () => {
  it('should remove the current and previous backups', async () => {
    const { calls } = fakeDrive([
      { id: 'cur', name: CURRENT_FILE },
      { id: 'prev', name: PREVIOUS_FILE },
    ]);

    await makeStore().store.delete();

    expect(summary(calls)).toEqual(['GET files', 'DELETE cur', 'DELETE prev']);
  });
});

describe('DriveBackupStore errors', () => {
  it('should report no network as offline', async () => {
    const { fetchMock } = fakeDrive([]);
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(makeStore().store.read()).rejects.toMatchObject({
      reason: 'offline',
    });
  });

  it('should report a full Drive', async () => {
    const { fetchMock, respond } = fakeDrive([]);
    fetchMock.mockResolvedValueOnce(
      respond(403, { error: { errors: [{ reason: 'storageQuotaExceeded' }] } }),
    );

    await expect(makeStore().store.read()).rejects.toMatchObject({
      reason: 'full',
    });
  });

  it('should get a new token and retry once when the token is rejected', async () => {
    const { fetchMock, respond } = fakeDrive([]);
    fetchMock.mockResolvedValueOnce(respond(401));
    const { store, clearAccessToken } = makeStore();

    expect([await store.read(), clearAccessToken.mock.calls]).toEqual([
      null,
      [['token']],
    ]);
  });

  it('should report revoked access when the new token is rejected too', async () => {
    const { fetchMock, respond } = fakeDrive([]);
    fetchMock
      .mockResolvedValueOnce(respond(401))
      .mockResolvedValueOnce(respond(401));

    await expect(makeStore().store.read()).rejects.toEqual(
      new BackupStoreError('unauthorized', 'Drive access token rejected'),
    );
  });
});
