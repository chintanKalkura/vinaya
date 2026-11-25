# Feature: Support the developer.

Status: done in the app (25 Nov 2026), tested against a fake billing client. Real purchases wait for the Play Console setup below. Look: `../../style-choices/profile/support.md`.

## Goal
Users who want to can pay a small amount to support Vinaya's development. Nothing is unlocked by paying.

## Scope (owner's answers, 16 Nov 2026)
- Amounts: ₹49, ₹99, ₹199, ₹399. The custom amount was dropped (owner, 25 Nov 2026).
- No perks.

## Decisions
1. **Google Play Billing.** Required: an individual developer taking support payments in a Play app must use Play Billing (external payment links risk rejection). Google keeps its service fee.
2. **Products.** Four one-time **consumable** in-app products, so a user can support more than once: `support_49`, `support_99`, `support_199`, `support_399`, priced in INR in Play Console. Play converts prices for other countries; whether to set local prices by hand: owner's decision.
3. **Custom amount: dropped** (owner, 25 Nov 2026). Play Billing products have fixed prices, so only the four tiers are offered.
4. **Library.** Must use Play Billing Library 8 or later. Chosen (owner, 25 Nov 2026): `react-native-iap` (MIT; now maintained under `hyodotdev/openiap` and built on Nitro modules, which the app already uses), pinned to 17.3.5. `openiapStore=play` in `android/gradle.properties` makes every build use the Play store instead of guessing from the connected device. It sits behind `BillingClient` (`src/support/BillingClient.ts`), so tests use `FakeBillingClient`.
5. **Flow.** Profile → Support the developer → a short line on why support helps (approved wording in `support.md`) → amount buttons showing Play's localised prices → Play purchase sheet → thank-you message. No badge, feature or setting changes.
6. **Purchase handling.**
   - Consume every successful purchase (so it can be bought again), and handle purchases still unconsumed on the next app start.
   - Pending purchases (common with UPI) show "Payment pending" and are consumed when they complete.
   - Cancelled or failed purchases show nothing beyond Play's own message.
   - No server-side verification: nothing is unlocked, so there's nothing to protect.
7. **Offline / no Play.** If billing isn't available, no products load, or loading takes over 10 seconds, the section says support isn't available right now.
9. **Shared connection.** The start-up clean-up of unconsumed purchases and the Support screen share react-native-iap's one connection; it closes only when both are done.
8. **Data safety.** Purchase history is held by Google Play; the app stores nothing about payments.

## Setup required (outside the code)
- Payments profile in Play Console set up to sell (merchant account, bank details, tax info).
- Products created in Play Console and active; an app build uploaded to at least the internal testing track (products don't load otherwise).
- License testers added for test purchases.

## Out of scope
- Subscriptions, perks, ads

## Tests
- Billing wrapper with a fake client: products load in order; purchase → consumed → thank-you; pending → message, consumed later; cancel → no message; unconsumed purchase found at start → consumed.
- Billing unavailable → message.
- Manual: real test purchase with a license tester on an internal-track build.

## Acceptance criteria
- [ ] Profile shows the support amounts with Play's prices
- [ ] A purchase completes, shows a thank-you, and the same amount can be bought again
- [x] Paying unlocks nothing and changes nothing else in the app
