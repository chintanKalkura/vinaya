# Google Cloud Setup

Google sign-in and Drive backup (`feature-development/release-1-readiness/google-drive-backup.md`) need a Google Cloud project. Done once; the Web client ID goes in `src/config/google.ts`.

1. **Project.** In Google Cloud Console, create the project and enable the **Google Drive API** (APIs & Services → Library).
2. **Branding and audience** (Google Auth Platform):
   - Branding: app name, user support email, developer contact email.
   - Audience: user type **External**. While testing, add the Google accounts that will sign in under **Test users**. Before release, set publishing status to **In production**; in Testing, only test users can sign in and sign-ins expire.
3. **Scope** (Google Auth Platform → Data Access → Add or remove scopes): `https://www.googleapis.com/auth/drive.appdata`. It is listed under non-sensitive scopes, so no special review is needed.
4. **Android clients** (Google Auth Platform → Clients → Create client → Android): an Android client holds one SHA-1, so make **one client per signing key**, all with package `com.vinaya`. Sign-in only works in a build whose signing key has a client.
   - **Debug** (debug builds and release APKs built without the upload key): `keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android`
   - **Upload key** (signed bundles; see `start-app.md`): `keytool -list -v -keystore ~/keys/vinaya-upload.jks -alias vinaya-upload`
   - **Play App Signing** key, after the first upload (Play Console → App integrity). Builds installed from Play are signed with it, so sign-in fails there without this client.
5. **Web client** (Create client → Web application, no redirect URIs). Its client ID is `GOOGLE_WEB_CLIENT_ID` in `src/config/google.ts`; Credential Manager uses it as the server client ID. It isn't a secret.
6. **Testing on an emulator** needs a Google account signed in on the device (a Google Play image).
