# Native Modules

Located in `android/app/src/main/java/com/vinaya/`:

| File | Bridge name | Purpose |
|---|---|---|
| `MindfulnessReceiver.kt` | — | `BroadcastReceiver`: alarm chain, notification actions, BOOT/DATE_CHANGED recovery |
| `MindfulnessModule.kt` | `"MindfulnessScheduler"` | RN bridge: `init`, `setBellState`, `getBellState`, `getNextAlarmMs` |
| `MindfulnessPackage.kt` | — | Registers `MindfulnessModule` |
| `SharedPrefsModule.kt` | `"SharedPrefs"` | RN bridge: key/value store for home-screen widget data |
| `SharedPrefsPackage.kt` | — | Registers `SharedPrefsModule` |
| `AppInfoModule.kt` | `"AppInfo"` | RN bridge: `getLastUpdateTime` (APK install/update time, used to reseed dev fixtures) |
| `AppInfoPackage.kt` | — | Registers `AppInfoModule` |

SharedPreferences namespace: `"com.vinaya.prefs"`. Keys prefixed `mindfulness_*` are owned by the bell system.
