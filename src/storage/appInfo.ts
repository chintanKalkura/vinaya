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
