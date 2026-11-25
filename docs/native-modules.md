# Native Modules

Located in `android/app/src/main/java/com/vinaya/`:

| File | Bridge name | Purpose |
|---|---|---|
| `AppInfoModule.kt` | `"AppInfo"` | RN bridge: `getLastUpdateTime` (APK install/update time, used to reseed dev fixtures), `getVersionName` (written into backups) |
| `SystemBarsModule.kt` | `"SystemBars"` | `setLightNavigationBar(light)`: dark navigation bar icons on the light theme (`src/systemBars.ts`) |
| `AppInfoPackage.kt` | — | Registers `AppInfoModule` and `SystemBarsModule` |

The v1 Mindfulness Bell (`MindfulnessReceiver`, `MindfulnessModule`), the `SharedPrefs` module and the home-screen `CountdownWidget` were removed for release 1 (`feature-development/release-1-readiness/release-build-config.md`). They are kept under the git tag `v1-reference`.
