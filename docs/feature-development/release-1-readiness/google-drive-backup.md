# Feature: Google sign-in with backup to the user's Google Drive.

Status: done in the app. Outside the code: the web account-deletion page, the Play App Signing SHA-1 and moving the consent screen to In production (`play-store-release-checklist.md`).

## Goal
Users who sign in with Google get a weekly backup of their habits to their own Google Drive and can bring that data to a new phone. Signing in is optional. The backup format is the contract for a later move to Vinaya's own backend, which will use the same Google account as identity.

## Scope (owner's answers, 16 Nov 2026)
- Back up automatically once a week, plus a "Back up now" button.
- On restore, merge the backup with what's on the phone; local data wins, since a backup can be up to a week old.
- Sign-in is optional. Without it, a disclaimer says backup and moving to a new phone aren't supported.
- The same Google account will be the identity on the future backend.

## Decisions
1. **Sign-in.** "Sign in with Google" using Android Credential Manager, through `react-native-nitro-google-signin` (MIT, free): Credential Manager signs the user in and Google's AuthorizationClient grants the `drive.appdata` access token. The free version of `@react-native-google-signin/google-signin` uses Google's deprecated legacy SDK, and its Credential Manager version is paid. Drive is called with `fetch` to the Drive v3 REST API; no Drive SDK. Only the `drive.appdata` scope is requested: it is non-sensitive, so only basic OAuth verification is needed. No email or profile data is stored by the app beyond the account's display name and email shown in Profile.
2. **Where the backup lives.** The Drive app-data folder: hidden from the user's Drive file list and readable only by Vinaya. It counts against the user's Drive storage.
3. **Backup file.** One JSON file, `vinaya-backup.json`, plus the previous one kept as `vinaya-backup.prev.json` so a broken upload never leaves the user with nothing.
   ```
   { schemaVersion: 1, exportedAt, appVersion, deviceId,
     habits: Record<id, Habit>, habitGroups: Record<id, HabitGroup>,
     tombstones: { id, kind: 'habit'|'group', deletedAt }[],
     settings: DisplaySettings }
   ```
   `schemaVersion` increases on any breaking change, and the restore code migrates older versions forward.
4. **Tombstones.** Deleting a habit or group records `{ id, kind, deletedAt }` locally. Without them, a merge would bring deleted items back from an older backup. Tombstones older than 180 days are dropped.
5. **Merge rules** (one pure function, `mergeBackup(local, remote)`, unit-tested and reusable on the backend):
   - Item only on the phone → kept.
   - Item only in the backup → added, unless a local tombstone has its id. Added items go after local items in sort order.
   - Item in both → the local item wins whole, its log included (name, cadence, targets, colour, status, freeze state, group members, `history` and `recentLog`).
     - Changed on 26 Nov 2026 (bug fix). Logs used to be combined by date, but a day unmarked on the phone has no entry, so the backup's entry for that date brought the mark back on the next backup.
     - Trade-off accepted by the owner: the same habit used on two phones doesn't sync its marks. Whichever phone backs up last decides the backup's log for it, and each phone keeps its own.
   - Tombstones from both sides are combined and applied: an item tombstoned on either side is removed.
   - Settings: local wins if the user has changed any setting on this phone, otherwise the backup's settings are used.
   - After merging, every group is re-checked for today and freezes are re-applied.
6. **When it backs up.**
   - Automatically: when the app comes to the foreground, signed in, and the last successful backup was 7 or more days ago. It runs in the background without blocking the screen.
   - "Back up now" in Profile.
   - Every backup first downloads the existing backup, merges it with local data (rule 5, local wins), then uploads. This stops an old phone from overwriting a newer phone's data.
   - Profile shows "Last backed up <date>" or the last error.
7. **When it restores.** Right after sign-in, if a backup exists, the app merges it. On a new phone with no local data, this is a full restore. The user sees a confirmation of what was added ("Added 12 habits and 3 groups from your backup").
8. **Not signed in.** Profile shows: "You're not signed in. Sign in with your Google account to back up your data, so that you don't lose your progress. 🙂" Same line in the first-launch walkthrough (`how-to-use.md`).
9. **Sign out** keeps local data and stops backups. The backup in Drive stays.
10. **Delete account data** (required by Play, because Google sign-in counts as an app account):
    - In-app: Profile → "Delete backup and sign out" deletes both backup files from the app-data folder, revokes the app's access, and signs out. Local data on the phone stays. Confirmation step names what is deleted.
    - Web: a page on the privacy policy site explaining the in-app path, and how to do it without the app (Google Drive → Settings → Manage apps → Vinaya → Delete hidden app data, then remove Vinaya's access in the Google Account).
11. **Errors.** No network, Drive full, or revoked access → backup fails quietly in the background, the error shows in Profile, and the next app open retries. A restore that fails changes nothing locally.
12. **Android Auto Backup** stays off (`allowBackup="false"`), so it doesn't fight with this backup.
13. **Writes** go through the storage write queue (`storage-write-safety.md`), so a merge can't race a tap.
14. **Moving to the backend later.** On first sign-in to the backend build, the app downloads the Drive backup, sends it to the backend, and the backend applies the same `mergeBackup` rules (ported or shared). Identity is the Google account's stable id (`sub`). After that, Drive backups stop. Nothing in this spec should assume Drive beyond a small `BackupStore` interface (`read()`, `write()`, `delete()`), so the backend can be another implementation.

## Setup required (outside the code)
- Google Cloud project with the OAuth consent screen (app name, support email, privacy policy URL) set to **In production**. In Testing mode, users are limited to test users and sign-ins expire.
- Android OAuth client IDs for the debug key, the upload key and the **Play App Signing** key (SHA-1 from Play Console → App integrity). Sign-in fails in Play-installed builds if the Play key's SHA-1 is missing.
- Drive API enabled in the project.

## Out of scope
- Own backend
- Sync between two active phones (merges happen only on backup and sign-in)
- Encrypting the backup beyond what Drive provides

## Tests
- `mergeBackup`: each rule in decision 5, including the phone's log winning for an item in both (a day unmarked on the phone stays unmarked; two phones with the same habit), a backup-only item arriving with its full log, tombstone on each side, items added after local sort order, settings rule, and idempotency (merging the same backup twice changes nothing).
- Schema: version 1 round-trips; an unknown newer version is refused with a message.
- Backup service with a fake `BackupStore`: weekly trigger at 7 days, not at 6; download-merge-upload order; previous file kept; failure leaves local data unchanged and records the error.
- Delete: both files removed, access revoked, local data kept.
- Profile: not-signed-in disclaimer; last backup time; error shown.

## Acceptance criteria
- [x] The app works fully without signing in, and says backup and moving phones need sign-in
- [ ] Signed in, a backup happens within a day of being 7 days old, and "Back up now" works *(check on a real phone)*
- [ ] Signing in on a new phone brings back all habits, groups, logs and streaks *(check on a real phone)*
- [x] Restoring onto a phone with data keeps the phone's changes and doesn't bring back deleted items *(covered by the merge tests)*
- [ ] "Delete backup and sign out" removes the backup from Drive; a web page explains how to do it without the app *(check on a real phone)*
