import AsyncStorage from '@react-native-async-storage/async-storage';

// Set once the walkthrough is finished or skipped. Kept on this phone only,
// so a restore never brings the walkthrough back.
const ONBOARDING_KEY = 'onboarding_seen_v1';

// A read that fails counts as seen, so the walkthrough never blocks the app
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) !== null;
  } catch {
    return true;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, String(Date.now()));
  } catch {} // shown again next launch, which is harmless
}
