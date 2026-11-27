# Feature: Profile tab.

Status: done in the app: the account card, the menu (Display settings, Support the developer, How to use, About), Sign out and Delete data. **Not wired:** the About links, which wait for the privacy and deletion pages (`play-store-release-checklist.md`).

## Goal
One place for the account, backup, display settings, supporting the developer, and help.

## Scope (owner's answer, 16 Nov 2026)
The Profile tab holds:
- Account and backup (`google-drive-backup.md`): sign in / sign out, signed-in account, last backup time or error, "Back up now", "Delete backup and sign out", and the not-signed-in disclaimer.
- Display settings (`display-settings.md`).
- Support the developer (`support-the-developer.md`).
- Help: the how-to-use page and a way to replay the first-launch walkthrough (`how-to-use.md`).

## Known decisions
1. Opened from the Profile tab in the bottom menu (`bottom-tab-navigation.md`).
2. Also shows the app version and links to the privacy policy and the account-deletion page (both required for Play; see `play-store-release-checklist.md`).

## Decided (owner, 25 Nov 2026)
- **Layout:** the Account & backup card, then a menu of rows, each opening its own screen in a Profile stack: Display settings, Support the developer, How to use, Sign out and Delete data (signed in only), About. See `../../style-choices/profile/profile-menu.md`.
- **Sign out and Delete data** are menu rows, not buttons in the card. Delete data deletes the cloud backup and signs out; habits on the phone stay.
- **About:** version, Privacy policy and Delete account data. **The two links are not wired yet:** they show but open nothing until the URLs are set in `src/config/links.ts`.
- **Help** is the How to use row (`how-to-use.md`).

## Tests
- To be written with the design. At minimum: each section is reachable; signed-in and signed-out states; version shown; links open.

## Acceptance criteria
- [x] Account and backup, display settings, support the developer and help are all reachable from Profile
- [ ] Privacy policy and account-deletion links open
