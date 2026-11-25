/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The library's own mock (zero insets, and the real contexts React Navigation
// reads), with plain hooks so jest.restoreAllMocks() can't wipe them
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock').default;
  const { useContext } = require('react');
  const metrics = mock.initialWindowMetrics;
  return {
    ...mock,
    useSafeAreaInsets: () =>
      useContext(mock.SafeAreaInsetsContext) ?? metrics.insets,
    useSafeAreaFrame: () =>
      useContext(mock.SafeAreaFrameContext) ?? metrics.frame,
  };
});

jest.mock('react-native-nitro-google-signin', () => ({
  GoogleOneTapSignIn: {
    configure: jest.fn(),
    signIn: jest.fn(),
    createAccount: jest.fn(),
    requestScopes: jest.fn().mockResolvedValue({ accessToken: 'token' }),
    getTokens: jest
      .fn()
      .mockResolvedValue({ idToken: 'id', accessToken: 'token' }),
    clearCachedAccessToken: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn().mockResolvedValue(undefined),
    revokeAccess: jest.fn().mockResolvedValue(undefined),
  },
  isSuccessResponse: response => response.type === 'success' && !!response.data,
  isErrorWithCode: error => !!error && typeof error.code === 'string',
  statusCodes: { SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED' },
}));

// Play Billing: unavailable unless a test injects FakeBillingClient
jest.mock('react-native-iap', () => ({
  initConnection: async () => false,
  endConnection: async () => true,
  fetchProducts: async () => [],
  getAvailablePurchases: async () => [],
  requestPurchase: async () => null,
  consumePurchaseAndroid: async () => true,
  purchaseUpdatedListener: () => ({ remove: () => {} }),
  purchaseErrorListener: () => ({ remove: () => {} }),
}));
