import {
  BillingClient,
  BillingListeners,
  BillingPurchase,
  SupportProduct,
} from './BillingClient';

// For tests: products and purchases are set by the test
export class FakeBillingClient implements BillingClient {
  available = true;
  products: SupportProduct[] = [];
  unfinished: BillingPurchase[] = [];
  consumed: string[] = [];
  bought: string[] = [];
  listeners: BillingListeners | null = null;
  connected = false;

  async connect(): Promise<boolean> {
    this.connected = this.available;
    return this.available;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async loadProducts(ids: readonly string[]): Promise<SupportProduct[]> {
    return this.products.filter(p => ids.includes(p.id));
  }

  listen(listeners: BillingListeners): () => void {
    this.listeners = listeners;
    return () => {
      this.listeners = null;
    };
  }

  async buy(productId: string): Promise<void> {
    this.bought.push(productId);
  }

  async unfinishedPurchases(): Promise<BillingPurchase[]> {
    return this.unfinished;
  }

  async consume(purchase: BillingPurchase): Promise<void> {
    this.consumed.push(purchase.token);
    this.unfinished = this.unfinished.filter(p => p.token !== purchase.token);
  }

  // Test helpers: what Play would send back
  complete(purchase: BillingPurchase): void {
    this.listeners?.onPurchase(purchase);
  }

  fail(): void {
    this.listeners?.onError();
  }
}
