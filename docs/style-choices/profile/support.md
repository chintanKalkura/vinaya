# Support the Developer

Scope: Profile → Support the developer. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/profile/SupportScreen.tsx`, with billing in `../../../src/support/` and wording in `../../../src/content/support.ts`. Behaviour: `../../feature-development/release-1-readiness/support-the-developer.md`.

## Layout

The Profile stack header "Support the developer", then:

```
Vinaya is free, with no ads and nothing locked away. If it
helps your practice, a small amount supports its development.

[  ₹49.00  ] [  ₹99.00  ]
[ ₹199.00  ] [ ₹399.00  ]

     Thank you for supporting Vinaya.
```

| Part | Look |
|---|---|
| Why line | main text, 16/24 |
| Amount buttons | two per row, orange fill, 56 tall, 14 radius, Play's localised price in bold 18 (`v2Background`); always in the order 49, 99, 199, 399; dimmed and disabled while a purchase is open |
| Loading | orange spinner under the why line, for up to 10 seconds |
| Thank-you | "Thank you for supporting Vinaya." orange bold 17, centred, after a completed purchase |
| Pending | "Payment pending. It completes once your payment goes through." grey 15 (UPI and other slow payments) |
| Unavailable | "Support isn't available right now. Check your connection and that Google Play is up to date, then try again." grey 15, in place of the buttons, when Play billing can't connect, loads no products, or takes over 10 seconds |

Cancelled or failed purchases show nothing beyond Play's own sheet. Paying unlocks nothing, and nothing about payments is stored in the app.

## Why

Four large buttons with Play's own prices keep the choice simple and honest about the amount; the thank-you replaces any perk.
