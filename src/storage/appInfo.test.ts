import { NativeModules } from 'react-native';
import { getAppLastUpdateTime, getAppVersionName } from './appInfo';

afterEach(() => {
  delete NativeModules.AppInfo;
});

describe('getAppLastUpdateTime', () => {
  it('should return the install or update time from the native module', async () => {
    NativeModules.AppInfo = {
      getLastUpdateTime: jest.fn().mockResolvedValue(1700000000000),
    };

    expect(await getAppLastUpdateTime()).toBe(1700000000000);
  });

  it('should return null when the native module is missing', async () => {
    expect(await getAppLastUpdateTime()).toBeNull();
  });

  it('should return null when the native module fails', async () => {
    NativeModules.AppInfo = {
      getLastUpdateTime: jest.fn().mockRejectedValue(new Error('boom')),
    };

    expect(await getAppLastUpdateTime()).toBeNull();
  });
});

describe('getAppVersionName', () => {
  it('should return the version name from the native module', async () => {
    NativeModules.AppInfo = {
      getVersionName: jest.fn().mockResolvedValue('1.0'),
    };

    expect(await getAppVersionName()).toBe('1.0');
  });

  it('should return null when the native module is missing', async () => {
    expect(await getAppVersionName()).toBeNull();
  });
});
