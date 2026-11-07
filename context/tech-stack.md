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

Install each with `npm install <package>` followed by `npx cap sync android`.

If a plugin does not support the installed Capacitor major version, STOP and report. Do not downgrade Capacitor or force install without asking.

## 3. Forbidden
`HttpClient` / any network API calls, online translation services, SQLite or other databases, `@capacitor/filesystem` (images are not stored), pdf libraries, OCR libraries other than the ML Kit plugin, state management libraries (NgRx etc.), UI libraries other than Ionic.

## 4. Supported languages (constant in `models/language.ts`)
Latin-script languages only. Confirm each `mlkitCode` against the translation plugin's `Language` enum before use; use the enum values, not hardcoded strings where possible.

| Label | mlkitCode (expected) | ttsCandidates (try in order) |
| --- | --- | --- |
| English | `en` | `en-US`, `en-GB` |
| Tagalog | `tl` | `fil-PH`, `tl-PH` |
| Spanish | `es` | `es-ES`, `es-MX` |
| French | `fr` | `fr-FR` |
| German | `de` | `de-DE` |
| Indonesian | `id` | `id-ID` |

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
- The text-to-speech plugin exposes `speak`, `stop`, `getSupportedLanguages`, `isLanguageSupported`.

Open (must be tested on device; record answers in `progress.md`):
- What image input the OCR plugin accepts (file path vs base64).
- Whether download progress is reported by the translation plugin.
- Which Tagalog TTS tag, if any, works on the test phone.
- Whether Camera and ML Kit plugin versions are compatible with the installed Capacitor version.

## 7. Decisions (do not change without asking)
- Camera plugin is used for capture because it is the course-taught capability; ML Kit plugins are relevant community plugins.
- History uses Preferences (JSON list, max 50 items) to meet the course "local data management" requirement. No images stored.
- Source text is editable before translation so OCR errors can be fixed.
- Translation is on-device (no HttpClient).
