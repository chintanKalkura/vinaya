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

## Release builds

Release builds start empty: the dev seed (`src/storage/devSeed.ts`) only runs in debug builds (`__DEV__`). They are shrunk with R8 (`android/app/build.gradle`, keep rules in `proguard-rules.pro`), so check sign-in and backup on a device after changing native dependencies.

### Upload key (one-time, never committed)

Play App Signing holds the app signing key; you sign uploads with your own upload key. Create it outside the repo and keep a backup of the file and both passwords:

```bash
mkdir -p ~/keys && keytool -genkeypair -v -storetype PKCS12 \
  -keystore ~/keys/vinaya-upload.jks -alias vinaya-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Then add to `~/.gradle/gradle.properties` (or set as environment variables):

```
VINAYA_UPLOAD_STORE_FILE=/Users/<you>/keys/vinaya-upload.jks
VINAYA_UPLOAD_STORE_PASSWORD=...
VINAYA_UPLOAD_KEY_ALIAS=vinaya-upload
VINAYA_UPLOAD_KEY_PASSWORD=...
```

Add the upload key's SHA-1 (`keytool -list -v -keystore ~/keys/vinaya-upload.jks -alias vinaya-upload`) to the Android OAuth client (`google-cloud-setup.md`). Without these properties, release builds are signed with the debug key (Gradle prints a warning): fine for your own phone, rejected by Play.

### Play bundle

```bash
# Build android/app/build/outputs/bundle/release/app-release.aab
cd android && ./gradlew bundleRelease
```

Bump `versionCode` (by 1) and `versionName` in `android/app/build.gradle` in the release PR before every upload.

### Release APK on your own phone

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
