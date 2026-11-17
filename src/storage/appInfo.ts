import { NativeModules } from 'react-native';

// Epoch ms of the last install or update of the APK; null when unavailable
export async function getAppLastUpdateTime(): Promise<number | null> {
  const appInfo = NativeModules.AppInfo;
  if (!appInfo) return null;
  try {
    return await appInfo.getLastUpdateTime();
  } catch {
    return null;
  }
}

// versionName from build.gradle, e.g. "1.0"; null when unavailable
export async function getAppVersionName(): Promise<string | null> {
  const appInfo = NativeModules.AppInfo;
  if (!appInfo?.getVersionName) return null;
  try {
    return await appInfo.getVersionName();
  } catch {
    return null;
  }
}
