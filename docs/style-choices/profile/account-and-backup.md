# Account and Backup

Scope: the Account & backup card in the Profile tab. Where a screen PNG or an earlier spec disagrees with this document, this document wins.

Implemented in `../../../src/screens/profile/AccountSection.tsx`, shown by `../../../src/screens/ProfileScreen.tsx`. Behaviour: `../../feature-development/release-1-readiness/google-drive-backup.md`.

## Profile tab

Opened from Profile in the bottom menu, which turns orange; Habits returns to the Habits screen with its view and filters kept. Android back on Profile returns to Habits. The title "Vinaya - Profile" uses the Habits title look (serif italic, white). For now the tab holds only this card; the other sections come with `profile-tab.md`. Journal and Level-Up still do nothing.

## Design

One card (`v2CardBackground`, 18 radius) headed "ACCOUNT & BACKUP" in small grey capitals.

```
Signed out                          Signed in
┌ ACCOUNT & BACKUP ──────────┐      ┌ ACCOUNT & BACKUP ─────────────┐
│ You're not signed in. Sign │      │ Chintan Kalkura               │
│ in with your Google account│      │ chintu…@gmail.com             │
│ to back up your data, so   │      │ Last backed up 17 Nov 2026    │
│ that you don't lose your   │      │ [ Back up now ]               │
│ progress. 🙂               │      │ Sign out                      │
│ [ Sign in with Google ]    │      │ Delete backup and sign out    │
└────────────────────────────┘      └───────────────────────────────┘
```

| Element | Look |
|---|---|
| Not-signed-in text | white, 15 |
| Name / email | white bold 17 / grey 14 |
| "Last backed up 17 Nov 2026" or "Not backed up yet" | grey 14 |
| Last backup error, in place of the date | red (`v2Red`) 14 |
| Sign in with Google, Back up now | orange (`v2Orange`) button, dark label; "Signing in…" / "Backing up…" and dimmed while running |
| Sign out | white text button |
| Delete backup and sign out | red text button |

Errors shown in place of the date: "Couldn't reach Google Drive. Will try again next time.", "Your Google Drive is full.", "Vinaya no longer has access to your Google Drive. Sign in again.", "Backup failed. Will try again next time.", and the newer-version message. A failed sign-in, sign-out or delete shows a red line under the buttons ("Couldn't sign in. Try again.").

## Dialogs

Both use the banner menu's confirm card (`../habits-section/banner-menu.md`): centred, dark backdrop.

- **Restore result**, after signing in when a backup exists: "Added 12 habits and 3 groups from your backup." (singular "1 habit", "1 group"; a zero part is left out), or "Your backup had nothing new for this phone." An orange OK closes it. Nothing is shown when there is no backup.
- **Delete confirm**: "Delete backup and sign out?" with "This deletes your Vinaya backup from Google Drive and signs you out. Your habits on this phone stay.", Cancel and a red Delete.

## Why

Orange marks the main action in each state, as the + does on Habits. Delete is red and asks first because it can't be undone; sign out isn't destructive, so it is a plain text button. The error replaces the date so the card always shows one backup status line.
