# Release: Google Play account setup and release checklist.

Status: reference checklist. Not code; tick items off as they're done. Rules checked on 16 Nov 2026; re-check Google's pages before each step, they change.

## Goal
Vinaya 1.0 live on Google Play from a personal developer account.

## 1. Developer account (personal)
- [ ] Create a Google account dedicated to publishing (recommended), with 2-Step Verification on.
- [ ] Sign up at Play Console as **Personal**. US$25 one-time fee by credit/debit card (no prepaid cards). Must be 18+.
- [ ] Identity verification: government ID and a card in your legal name. Wrong details forfeit the fee.
- [ ] Verify the contact email and phone, and complete Android device verification from the Play Console mobile app if asked.
- [ ] Choose the public developer name.
- [ ] Payments profile set up as a **merchant** so you can sell the support products: bank account and tax details. Once you sell in-app products from a personal account, your legal name and address are shown on the store listing.

## 2. Websites you need (free: GitHub Pages works)
- [ ] **Privacy policy**: what's stored on the phone, the optional Google sign-in, backup to the user's own Drive (`drive.appdata`), Play purchase handling, no ads, no analytics (update if that changes), contact email.
- [ ] **Account deletion page**: in-app path and the no-app path (`google-drive-backup.md`, decision 10).

## 3. Google Cloud (for sign-in and Drive)
- [ ] Project created; Drive API enabled.
- [ ] OAuth consent screen: app name, logo, support email, privacy policy URL, scope `drive.appdata` (non-sensitive). Publishing status set to **In production**.
- [ ] Android OAuth clients for the debug key, upload key and Play App Signing key SHA-1s.

## 4. App build (`release-build-config.md`)
- [ ] Upload key created and backed up somewhere safe; Play App Signing enrolled on first upload.
- [ ] Signed AAB from `bundleRelease`, target SDK 36, Billing Library 8+.
- [ ] `versionCode` bumped for every upload.

## 5. App in Play Console
- [ ] Create app: name, default language, App, Free.
- [ ] Store listing: short description (80 chars), full description (4,000 chars), 512×512 icon, 1024×500 feature graphic, at least 2 phone screenshots.
- [ ] App content:
  - [ ] Privacy policy URL
  - [ ] Ads: no ads
  - [ ] App access: works without sign-in (say so; give instructions if reviewers need anything)
  - [ ] Content rating questionnaire (unrated apps aren't allowed)
  - [ ] Target audience: adults (18+ or 13+), not children, to stay out of the Families programme
  - [ ] Data safety: answer for Google sign-in (email/name used for sign-in), backup to the user's Drive, and purchases through Play. Check Google's Data safety guidance on what counts as "collected" when data goes to the user's own Drive and not to your servers.
  - [ ] Data deletion: account deletion URL
- [ ] In-app products `support_49`, `support_99`, `support_199`, `support_399` (plus any extra tiers) created and active.

## 6. Internal testing (no review, quick)
- [ ] Upload the AAB to the internal track; install on your phone from Play.
- [ ] Check Google sign-in works on the Play-installed build (catches a missing Play App Signing SHA-1).
- [ ] Add license testers; make test purchases for each tier; check pending and cancel.
- [ ] Back up, uninstall, reinstall, sign in: data comes back.

## 7. Closed testing (required for new personal accounts)
- [ ] Create a closed testing track and an email list or Google Group of testers.
- [ ] At least **12 testers** opted in for **14 continuous days**, and actually using the app. Recruit 15–20 so drop-outs don't reset the clock.
- [ ] Testers: friends, family, colleagues, or free developer tester-swap groups. Each needs a Google account, the opt-in link, and to keep the app installed.
- [ ] Collect feedback; ship fixes to the closed track during the 14 days (updates don't reset the clock as long as testers stay opted in).

## 8. Production
- [ ] Apply for production access: answer the questions about the test, the app and its readiness. A decision usually takes a few days.
- [ ] Production release with a staged rollout (e.g. 20% → 100%).
- [ ] Watch Android vitals (crash and ANR rates) and reviews in the first week.

## Acceptance criteria
- [ ] Vinaya is live on Google Play, installable by anyone
- [ ] Sign-in, backup, restore and support purchases work in the Play-installed build
