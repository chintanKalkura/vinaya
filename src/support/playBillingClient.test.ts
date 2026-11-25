import { endConnection, fetchProducts } from 'react-native-iap';
import { playBillingClient } from './playBillingClient';

jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(async () => true),
  endConnection: jest.fn(async () => true),
  fetchProducts: jest.fn(async () => []),
}));

describe('playBillingClient', () => {
  it('should keep the shared connection open until the last user leaves', async () => {
    await playBillingClient.connect();
    await playBillingClient.connect();

    await playBillingClient.disconnect();
    const afterFirst = (endConnection as jest.Mock).mock.calls.length;
    await playBillingClient.disconnect();

    expect([
      afterFirst,
      (endConnection as jest.Mock).mock.calls.length,
    ]).toEqual([0, 1]);
  });

  it('should load products with Play prices', async () => {
    (fetchProducts as jest.Mock).mockResolvedValueOnce([
      { id: 'support_49', displayPrice: '₹49.00' },
    ]);

    expect(await playBillingClient.loadProducts(['support_49'])).toEqual([
      { id: 'support_49', price: '₹49.00' },
    ]);
  });
});
