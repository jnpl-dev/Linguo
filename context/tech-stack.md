# tech-stack.md — Linguo

Allowed technologies and configuration. Do not add anything not listed here without asking the user.

## 1. Core
| Technology | Rule |
| --- | --- |
| Ionic (Angular) | Create with `ionic start linguo blank --type=angular`; choose **standalone** components |
| Angular | Use the version the Ionic starter installs. Do not upgrade during the project |
| TypeScript | Strict mode on |
| Capacitor | Use the current major version (expected 8.x). All Capacitor plugins MUST match this major version |
| Target platform | Android only |

After setup, run `npm ls --depth=0` and record exact versions in `progress.md`.

## 2. Allowed plugins
| Package | Purpose |
| --- | --- |
| `@capacitor/camera` | Take a photo or pick from gallery |
| `@capacitor-mlkit/text-recognition` | OCR: extract text from the image |
| `@capacitor-mlkit/translation` | On-device translation; language model download/list/delete |
| `@capacitor-community/text-to-speech` | Speak translated text |
| `@capacitor/preferences` | Store translation history JSON |
| `@capawesome/capacitor-photo-manipulator` | Headless crop of the captured photo before OCR (approved 2026-11-07) |
| `@capacitor-mlkit/language-identification` | On-device language detection for the auto-detect source language (approved 2026-11-07) |
| `@capacitor/filesystem` | Copy the saved photo out of the cache into app-private storage for history entries (approved 2026-11-08) |

Install each with `npm install <package>` followed by `npx cap sync android`.

If a plugin does not support the installed Capacitor major version, STOP and report. Do not downgrade Capacitor or force install without asking.

## 3. Forbidden
`HttpClient` / any network API calls, online translation services, SQLite or other databases, pdf libraries, OCR libraries other than the ML Kit plugin, state management libraries (NgRx etc.), UI libraries other than Ionic. (`@capacitor/filesystem` was unblocked 2026-11-08 and may be used ONLY for history image copies in `Directory.Data` — see `architecture.md`.)

## 4. Supported languages (constant in `models/language.ts`)
Latin-script languages only, PLUS Japanese, Chinese, and Korean (user-approved exceptions, 2026-11-08). Confirm each `mlkitCode` against the translation plugin's `Language` enum before use; use the enum values, not hardcoded strings where possible.

| Label | mlkitCode (expected) | ttsCandidates (try in order) |
| --- | --- | --- |
| English | `en` | `en-US`, `en-GB` |
| Tagalog | `tl` | `fil-PH`, `tl-PH` |
| Spanish | `es` | `es-ES`, `es-MX` |
| French | `fr` | `fr-FR` |
| German | `de` | `de-DE` |
| Indonesian | `id` | `id-ID` |
| Japanese | `ja` | `ja-JP` |
| Chinese | `zh` | `zh-CN`, `zh-TW` |
| Korean | `ko` | `ko-KR` |

Verified2026-11-08 against installed types: `Language.Japanese='ja'`, `Language.Chinese='zh'`, `Language.Korean='ko'`; OCR `Script` enum has `Japanese`, `Chinese`, `Korean` (models bundled). Voice matching uses the primary BCP-47 subtag, so `zh-CN` matches device voices `zh`, `zh-Hans`, `zh-Hant`.

Tagalog speech voices are often missing on devices. This is expected: handle it with the "No voice installed" toast, not as a bug.

## 5. Android configuration
Apply only what each plugin's README requires. Known items:
- **Text-to-speech (Android 11+):** add this inside `<manifest>` in `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <queries>
    <intent>
      <action android:name="android.intent.action.TTS_SERVICE" />
    </intent>
  </queries>
  ```
- **Camera:** follow the `@capacitor/camera` README for Android permissions. Do not add permissions the README does not require.
- **ML Kit plugins:** follow each README for Gradle or manifest steps. Check `minSdkVersion` requirements in `android/variables.gradle` and raise it only if a plugin README requires it.
- **Internet permission:** already present by default in Capacitor Android; needed only for first-time model downloads.

## 6. Verified facts and open questions
Verified from documentation:
- The translation plugin runs on-device; models are about 30 MB each and can be downloaded ahead for offline use.
- The translation plugin exposes `Translation.translate({ text, sourceLanguage, targetLanguage })` and model management methods (download, list downloaded, delete).
- The text-to-speech plugin exposes `speak`, `stop`, `getSupportedLanguages`, `isLanguageSupported`. Installed types add: `getSupportedVoices()` → `{ voices: SpeechSynthesisVoice[] }` (`name`, `lang`, `localService`, `default`), `speak({ voice?: number })` (voice index), and Android-only `openInstall()` (opens the system TTS resource installer).
- The language-identification plugin exposes `identifyLanguage({ text, confidenceThreshold? })` → `{ language }` (BCP-47 or `'und'`) and `identifyPossibleLanguages(...)` → `{ identifiedLanguages }`; its model ships with the SDK — no download, works offline.
- The photo-manipulator plugin exposes `getInfo({ path })` and `transform({ path, crop?, resize?, rotate?, ... })` → `{ path, width, height }`; output is a new cache file deleted on next app launch (no image storage).

Open (must be tested on device; record answers in `progress.md`):
- What image input the OCR plugin accepts (file path vs base64).
- Whether download progress is reported by the translation plugin.
- Which Tagalog TTS tag, if any, works on the test phone.
- Whether Camera and ML Kit plugin versions are compatible with the installed Capacitor version.

## 7. Decisions (do not change without asking)
- Camera plugin is used for capture because it is the course-taught capability; ML Kit plugins are relevant community plugins.
- History uses Preferences (JSON list, max 50 items) to meet the course "local data management" requirement. Each entry may also store a copy of its cropped photo in app-private files (`Directory.Data/linguo-history/`, user request 2026-11-08); images are never stored anywhere else.
- Source text is editable before translation so OCR errors can be fixed.
- Translation is on-device (no HttpClient).
