import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasSeenOnboarding, markOnboardingSeen } from './onboardingStorage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('onboardingStorage', () => {
  it('should not be seen on a fresh install', async () => {
    expect(await hasSeenOnboarding()).toBe(false);
  });

  it('should be seen once marked', async () => {
    await markOnboardingSeen();

    expect(await hasSeenOnboarding()).toBe(true);
  });

  it('should count a failed read as seen', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('x'));

    expect(await hasSeenOnboarding()).toBe(true);
  });
});
