import {
  Purchase,
  consumePurchaseAndroid,
  endConnection,
  fetchProducts,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'react-native-iap';
import { BillingClient, BillingPurchase } from './BillingClient';

// The real client, over react-native-iap (Play Billing Library 8+)
function toBillingPurchase(purchase: Purchase): BillingPurchase {
  return {
    productId: purchase.productId,
    token: purchase.purchaseToken ?? '',
    state: purchase.purchaseState,
  };
}

// react-native-iap holds one connection for the app, shared by the start-up
// clean-up and the Support screen; it closes when the last user disconnects
let users = 0;

export const playBillingClient: BillingClient = {
  async connect() {
    users += 1;
    try {
      return await initConnection();
    } catch {
      return false;
    }
  },

  async disconnect() {
    users = Math.max(0, users - 1);
    if (users > 0) return;
    try {
      await endConnection();
    } catch {}
  },

  async loadProducts(ids) {
    const products =
      (await fetchProducts({ skus: [...ids], type: 'in-app' })) ?? [];
    return products.map(p => ({ id: p.id, price: p.displayPrice }));
  },

  listen({ onPurchase, onError }) {
    const updates = purchaseUpdatedListener(purchase =>
      onPurchase(toBillingPurchase(purchase)),
    );
    const errors = purchaseErrorListener(() => onError());
    return () => {
      updates.remove();
      errors.remove();
    };
  },

  async buy(productId) {
    await requestPurchase({
      type: 'in-app',
      request: { google: { skus: [productId] } },
    });
  },

  async unfinishedPurchases() {
    const purchases = await getAvailablePurchases();
    return purchases.map(toBillingPurchase);
  },

  async consume(purchase) {
    await consumePurchaseAndroid(purchase.token);
  },
};
