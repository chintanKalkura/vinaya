# Starting the App

```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android

# Lint
npm run lint

# Test (all)
npm test

# Test (single file)
npx jest path/to/file.test.tsx
```

## Release APK

Release builds start empty: the dev seed (`src/storage/devSeed.ts`) only runs in debug builds (`__DEV__`). Release builds are signed with the debug keystore (`android/app/build.gradle`), which is fine for installing on your own phone but not for the Play Store.

```bash
# Build android/app/build/outputs/apk/release/app-release.apk
cd android && ./gradlew assembleRelease

# Remove the debug install first: it shares the com.vinaya id, and its data
# (seeded habits) would otherwise carry over. This deletes all app data.
adb uninstall com.vinaya

# Install on the connected phone
adb install android/app/build/outputs/apk/release/app-release.apk
```

With several devices connected, add `-s <serial>` (from `adb devices`) to the `adb` commands.
