/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const {View} = require('react-native');
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
  };
});

jest.mock('react-native-nitro-google-signin', () => ({
  GoogleOneTapSignIn: {
    configure: jest.fn(),
    signIn: jest.fn(),
    createAccount: jest.fn(),
    requestScopes: jest.fn().mockResolvedValue({accessToken: 'token'}),
    getTokens: jest.fn().mockResolvedValue({idToken: 'id', accessToken: 'token'}),
    clearCachedAccessToken: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn().mockResolvedValue(undefined),
    revokeAccess: jest.fn().mockResolvedValue(undefined),
  },
  isSuccessResponse: response => response.type === 'success' && !!response.data,
  isErrorWithCode: error => !!error && typeof error.code === 'string',
  statusCodes: {SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED'},
}));
