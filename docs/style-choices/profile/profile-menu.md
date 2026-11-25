# Profile Menu

Scope: the Profile tab below the Account & backup card, and the About screen. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/ProfileScreen.tsx`, `../../../src/screens/profile/MenuRow.tsx`, `AccountSection.tsx` (Sign out and Delete data) and `AboutScreen.tsx`. Behaviour: `../../feature-development/release-1-readiness/profile-tab.md`.

## Layout

The title "Vinaya - Profile" in the Habits title look, the Account & backup card (`account-and-backup.md`), then a list of rows on the screen background.

```
┌ ACCOUNT & BACKUP ─────────┐
│ name / email / backup     │
│ [ Back up now ]           │
└───────────────────────────┘
 Display settings        >     (display settings PR)
 Support the developer   >     (support PR)
 How to use              >     (how-to-use PR)
 Sign out                      signed in only
 Delete data                   red, signed in only
 About                   >
```

| Part | Look |
|---|---|
| Row | label white, 16, semibold; at least 56dp tall; hairline divider (`v2Border`) below |
| Chevron | lucide `ChevronRight`, grey, on rows that open a screen |
| Delete data | red label (`v2Red`); opens the existing confirm ("Delete backup and sign out?"): deletes the backup in the cloud, revokes access and signs out; habits on this phone stay |

Each row opens its own screen in the Profile tab's stack. Those screens have a back arrow and a bold 22 title, in the form screens' style (`ScreenHeader.tsx`); Android back returns to the menu.

## About

| Row | Look |
|---|---|
| Version | label, and the app version (`1.0.0`) in grey at the right |
| Privacy policy | label and a grey external-link icon |
| Delete account data | label and a grey external-link icon |

**The two links are not wired yet.** They show, but tapping them opens nothing until `PRIVACY_POLICY_URL` and `ACCOUNT_DELETION_URL` are set in `../../../src/config/links.ts`, once the pages are published (`../../feature-development/release-1-readiness/play-store-release-checklist.md`). Play requires both links before release.

## Why

A menu of rows keeps Profile short as sections are added, with each section on its own screen. Sign out and Delete data are separate rows, below the settings and above About, so the account actions are easy to find without crowding the card; they show only when there is an account to act on.
