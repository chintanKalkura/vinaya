import { FakeBillingClient } from './fakeBillingClient';
import { consumeLeftoverPurchases, handlePurchase } from './support';

const done = {
  productId: 'support_99',
  token: 't1',
  state: 'purchased' as const,
};
const pending = {
  productId: 'support_49',
  token: 't2',
  state: 'pending' as const,
};

describe('handlePurchase', () => {
  it('should consume a completed purchase and thank the user', async () => {
    const client = new FakeBillingClient();

    expect([await handlePurchase(client, done), client.consumed]).toEqual([
      'thanks',
      ['t1'],
    ]);
  });

  it('should report a pending purchase without consuming it', async () => {
    const client = new FakeBillingClient();

    expect([await handlePurchase(client, pending), client.consumed]).toEqual([
      'pending',
      [],
    ]);
  });

  it('should ignore a purchase in an unknown state', async () => {
    const client = new FakeBillingClient();

    expect(await handlePurchase(client, { ...done, state: 'unknown' })).toBe(
      'none',
    );
  });
});

describe('consumeLeftoverPurchases', () => {
  it('should consume completed purchases left from last time', async () => {
    const client = new FakeBillingClient();
    client.unfinished = [done, pending];

    await consumeLeftoverPurchases(client);

    expect([client.consumed, client.connected]).toEqual([['t1'], false]);
  });

  it('should do nothing when billing is unavailable', async () => {
    const client = new FakeBillingClient();
    client.available = false;
    client.unfinished = [done];

    await consumeLeftoverPurchases(client);

    expect(client.consumed).toEqual([]);
  });
});
