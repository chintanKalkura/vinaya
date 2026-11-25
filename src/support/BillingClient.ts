// Google Play Billing behind a small interface, so tests use a fake:
// docs/feature-development/release-1-readiness/support-the-developer.md

// The four consumable products, in the order they are shown
export const SUPPORT_PRODUCT_IDS = [
  'support_49',
  'support_99',
  'support_199',
  'support_399',
] as const;

export interface SupportProduct {
  id: string;
  price: string; // Play's localised price, e.g. "₹49.00"
}

export interface BillingPurchase {
  productId: string;
  token: string;
  state: 'purchased' | 'pending' | 'unknown';
}

export interface BillingListeners {
  onPurchase: (purchase: BillingPurchase) => void;
  onError: () => void; // cancelled or failed: Play shows its own message
}

export interface BillingClient {
  connect(): Promise<boolean>; // false when Play billing isn't available
  disconnect(): Promise<void>;
  loadProducts(ids: readonly string[]): Promise<SupportProduct[]>;
  listen(listeners: BillingListeners): () => void;
  buy(productId: string): Promise<void>; // the result arrives through listen
  unfinishedPurchases(): Promise<BillingPurchase[]>;
  consume(purchase: BillingPurchase): Promise<void>;
}
