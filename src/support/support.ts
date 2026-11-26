import { BillingClient, BillingPurchase } from './BillingClient';

// Purchase handling: support-the-developer.md (decision 6). Nothing is
// unlocked and nothing about payments is stored.

export type PurchaseOutcome = 'thanks' | 'pending' | 'none';

// A completed purchase is consumed so the same amount can be bought again;
// a pending one (common with UPI) is consumed once Play reports it complete
export async function handlePurchase(
  client: BillingClient,
  purchase: BillingPurchase,
): Promise<PurchaseOutcome> {
  if (purchase.state === 'pending') return 'pending';
  if (purchase.state !== 'purchased') return 'none';
  await client.consume(purchase);
  return 'thanks';
}

// At app start: consume any completed purchase left unconsumed (the app
// closed mid-purchase, or a pending payment went through while it was shut)
export async function consumeLeftoverPurchases(
  client: BillingClient,
): Promise<void> {
  try {
    if (!(await client.connect())) return;
    const purchases = await client.unfinishedPurchases();
    for (const purchase of purchases) {
      if (purchase.state === 'purchased') {
        await client.consume(purchase).catch(() => {});
      }
    }
  } catch {
    // Tried again next start
  } finally {
    await client.disconnect();
  }
}
