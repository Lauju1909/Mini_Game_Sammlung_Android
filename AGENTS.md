# Agent Instructions (GitHub & Build Guidelines)

## ⚠️ Security & Sensitive Files
- **NEVER commit keystores:** `*.keystore`, `*.jks`, `keystore_credentials*.txt`. Keystores must stay strictly local.
- **NEVER commit generated build artifacts:** `node_modules/`, `android/.gradle/`, `android/build/`, `android/app/build/`, `local.properties`.

## Environment Requirements
- **Node.js:** Must be **Node.js >= 22.0.0** (Capacitor 8.5+ strictly requires Node 22).
- **Java:** JDK 21 (Temurin).
- **Android SDK:** Pre-installed on GitHub Actions runner (`ubuntu-latest`). Do NOT add `android-actions/setup-android` (it calls deprecated `sdkmanager tools` and fails).

## Canonical Build & Sync Commands
| Task | Command |
|---|---|
| Install deps | `npm ci` |
| Sync web assets | `npx cap sync android` |
| Local debug APK | `cd android && ./gradlew assembleDebug` |
| Local release APK | `cd android && ./gradlew assembleRelease` |

## Releases & Version Bumping
1. Update `versionCode` and `versionName` in `android/app/build.gradle`.
2. Update `"version"` in `package.json` to match.
3. Commit changes: `git commit -m "chore(release): bump version to x.y.z"`.
4. Tag: `git tag -a vx.y.z -m "Release vx.y.z"`.
5. Push: `git push origin main --tags`.
6. GitHub Actions (`.github/workflows/build-apk.yml`) will automatically compile the APK and attach it to the GitHub Release.

## F-Droid Metadata
- Maintain Store graphics and descriptions in `fastlane/metadata/android/de-DE/` and `en-US/`.
- F-Droid recipe file is located in `fdroid/`.
