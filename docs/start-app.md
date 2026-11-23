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

### Upload key (never committed, never left on this machine)

Play App Signing holds the app signing key; uploads are signed with your own upload key. The master copy of `vinaya-upload.jks` lives in your private Google Drive; its password lives separately (a password manager). The repo ignores `*.jks` and `*.keystore`.

Created once (then uploaded to Drive and deleted locally):

```bash
mkdir -p ~/keys && keytool -genkeypair -v -storetype PKCS12 \
  -keystore ~/keys/vinaya-upload.jks -alias vinaya-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Its SHA-1 (`keytool -list -v -keystore ~/keys/vinaya-upload.jks -alias vinaya-upload`) is on its own Android OAuth client (`google-cloud-setup.md`). If the key is lost or leaked, Play support can reset an upload key.

For each signed build, download the `.jks` from Drive to `~/keys/vinaya-upload.jks`, then in one terminal session (the passwords are typed, not stored; `read -s` keeps them off screen and out of history):

```bash
cd android
read -s "VINAYA_UPLOAD_STORE_PASSWORD?Upload key password: "; echo
export VINAYA_UPLOAD_STORE_PASSWORD
export VINAYA_UPLOAD_KEY_PASSWORD=$VINAYA_UPLOAD_STORE_PASSWORD
export VINAYA_UPLOAD_STORE_FILE=~/keys/vinaya-upload.jks
export VINAYA_UPLOAD_KEY_ALIAS=vinaya-upload
./gradlew bundleRelease
```

The build must not print "upload key not configured"; without these variables, release builds are signed with the debug key: fine for your own phone, rejected by Play. Clean up right after:

```bash
./gradlew --stop      # the Gradle daemon holds the passwords in memory
unset VINAYA_UPLOAD_STORE_PASSWORD VINAYA_UPLOAD_KEY_PASSWORD
rm ~/keys/vinaya-upload.jks   # and any copy left in ~/Downloads
```

Check the signer without the key: `keytool -printcert -jarfile android/app/build/outputs/bundle/release/app-release.aab` (owner "CN=Chintan Kalkura, OU=ckStudio", not "Android Debug").

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
