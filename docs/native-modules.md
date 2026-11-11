# Native Modules

Located in `android/app/src/main/java/com/vinaya/`:

| File | Bridge name | Purpose |
|---|---|---|
| `MindfulnessReceiver.kt` | — | `BroadcastReceiver`: alarm chain, notification actions, BOOT/DATE_CHANGED recovery |
| `MindfulnessModule.kt` | `"MindfulnessScheduler"` | RN bridge: `init`, `setBellState`, `getBellState`, `getNextAlarmMs` |
| `MindfulnessPackage.kt` | — | Registers `MindfulnessModule` |
| `SharedPrefsModule.kt` | `"SharedPrefs"` | RN bridge: key/value store for home-screen widget data |
| `SharedPrefsPackage.kt` | — | Registers `SharedPrefsModule` |

SharedPreferences namespace: `"com.vinaya.prefs"`. Keys prefixed `mindfulness_*` are owned by the bell system.
