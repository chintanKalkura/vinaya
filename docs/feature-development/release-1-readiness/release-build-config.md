# Feature: Release build configuration for Google Play.

Status: done in the code. Outside the code: Play App Signing enrolment, the internal testing upload, and the upload and Play key SHA-1s on the Android OAuth client.

## Goal
The project builds a signed Android App Bundle that Google Play accepts, with no leftover v1 parts or permissions Play would reject.

## Scope
- Remove what v2 doesn't use and Play restricts.
- Set up release signing for Play App Signing.
- Build an AAB with versioning that increases on every upload.

## Decisions
1. **Permissions.** Remove `USE_EXACT_ALARM` (Play limits it to alarm-clock and calendar apps), `RECEIVE_BOOT_COMPLETED` and `POST_NOTIFICATIONS` while reminders and the Mindfulness Bell aren't wired into v2. They come back with the feature that uses them, using `SCHEDULE_EXACT_ALARM` with a runtime check if exact alarms are still needed. Keep `INTERNET` (needed for backup and billing).
2. **v1 widget.** Remove the `CountdownWidget` receiver, its provider XML and Kotlin class. Remove `MindfulnessReceiver` registration until the bell returns. Keep the Kotlin sources for the bell in git history or `src_v1_backup`-style reference, not in the build. Done: notifee, `src/notifications/`, the bell, `SharedPrefs` and widget native code and resources were removed (owner's decision) and are kept under the git tag `v1-reference`. The merged release manifest has `INTERNET` only, plus AndroidX's app-private `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`; Credential Manager's `USE_BIOMETRIC` and `USE_FINGERPRINT` are removed with `tools:node="remove"`.
3. **Signing.** Generate an upload keystore, kept outside the repo. Gradle reads its path and passwords from `~/.gradle/gradle.properties` (or environment variables), never from committed files. Enrol in Play App Signing (Google holds the app signing key). The debug keystore stays for debug builds only.
4. **Bundle.** `./gradlew bundleRelease` produces `app-release.aab`. Document the command in `docs/start-app.md`.
5. **Versioning.** `versionCode` increases by 1 for every Play upload; `versionName` follows `1.0.0` style. Both set in `android/app/build.gradle`, bumped by hand in the release PR.
6. **Application ID.** Check `com.vinaya` is not already taken on Play before the first upload; it can't change afterwards. If taken, choose a new ID before release (design decision required). Decided (owner, 22 Nov 2026): keep `com.vinaya`. play.google.com has no listing for it (404); an unpublished app also 404s, so it is confirmed only at the first upload.
7. **Shrinking.** Turn on R8 (`minifyEnabled true`, `shrinkResources true`) for release, keeping the rules React Native, Notifee, AsyncStorage, SVG, billing and Google Sign-In need. Verify on a device. Checked 25 Nov 2026 with react-native-iap and React Navigation: `assembleRelease` with R8 builds and runs on the emulator; the library merges the `com.android.vending.BILLING` permission.
8. **Target SDK.** Stays at 36, which Play requires for new apps.
9. **Backup flag.** `android:allowBackup` decided with `google-drive-backup.md`.

## Out of scope
- Play Console setup and store listing (see `play-store-release-checklist.md`)

## Tests
- Manual: `bundleRelease` succeeds; install via internal testing track on a device; app opens empty; marking, editing and deleting work with R8 on.
- Merged manifest (`app/build/intermediates/merged_manifests/release`) has no exact-alarm permission and no widget receiver.

## Acceptance criteria
- [ ] A signed release AAB builds from a clean checkout with the upload key configured locally
- [x] No keystore or password is committed
- [x] The merged release manifest has only permissions v2 uses
- [x] The v1 countdown widget is no longer offered on the home screen
