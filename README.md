# Linguo

**Offline-first camera translator for Android.** Point your camera at printed text — or type it — and get a translation you can read and hear, without sending anything to a server.

Linguo is an Ionic + Angular + Capacitor app (two screens only: **Translate** and **History**) built as a case study in on-device ML: OCR, language identification, translation, and text-to-speech all run locally via Google ML Kit and the device's speech engine.

<p align="center">
  <img src="assets/splash.png" alt="Linguo splash screen — mascot on pale blue" width="360">
</p>

## How it works

1. **Capture** — take a photo or pick one from the gallery, then crop to the region you care about.
2. **Recognize** — on-device OCR reads the text (editable afterwards). Latin script plus Japanese, Chinese, and Korean are supported.
3. **Detect** — with *Auto-detect* as the source, the app identifies the language and shows a "Detected: …" caption.
4. **Translate** — on-device ML Kit translation between nine languages.
5. **Speak** — hear the original or the translation; the speaking button turns into **Stop** while audio plays.
6. **Save** — store the result in History with its photo, languages, and date.

## Features

### Translate page
- **Take Photo / Gallery** capture with cancel-safe flows and an optional crop step before OCR
- Editable recognized text with placeholder and empty-state guards (Translate stays disabled until there is text)
- **Auto-detect** source language or pick explicitly; live "Detected: English"-style caption
- Language row with From / To selects and a swap button; same-language pairs disable Translate with a hint
- Two-way **Speak** buttons (original + translation); the app auto-selects the best installed voice per language
- **Save to History** copies the cropped photo into app-private storage alongside both texts
- First translation in each language downloads that language's model (~30 MB once, over any connection — a `patch-package` fix removes the plugin's Wi-Fi-only restriction); afterwards it works fully offline

### History page
- Newest-first list with language pair, date, and both text lines
- **Tap an entry** → loads read-only into Translate (inputs disabled, button reads **Translate new**)
- **Swipe to delete** an entry — its stored image file is deleted too
- **Press-and-hold multi-select** with Select all / Deselect and a confirmed bulk delete
- Persists across restarts (Capacitor Preferences); empty state when nothing is saved; capped at 50 entries (oldest trimmed)
- No "Clear all" button — bulk deletion only via explicit multi-select + confirmation

### Launch & identity
- Pale-blue system splash with the mascot for ~1.5 s on launch (Android 12+ splash API)
- Mascot launcher icon (adaptive, arm64)

## Offline-first

The core pipeline — OCR, translation (after a language's one-time model download), language detection, and TTS with installed voices — works in airplane mode. No account, no server, no analytics. The only network uses are translation-model downloads and the Nunito webfont (the app falls back to system fonts when offline).

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | Ionic 9 + Angular 22 (standalone, signals) |
| Native shell | Capacitor 8 (Android only) |
| OCR | `@capacitor-mlkit/text-recognition` (bundled, on-device) |
| Translation | `@capacitor-mlkit/translation` + `language-identification` |
| Speech | `@capacitor-community/text-to-speech` |
| Images | `@capawesome/capacitor-photo-manipulator` (crop), `@capacitor/filesystem` (history copies only) |
| State | `@capacitor/preferences` (history + settings) |

Full plugin list and rules: [`context/tech-stack.md`](context/tech-stack.md).

## Building

```bash
npm install
npm run lint            # must exit clean
npm run build
npx cap sync android
cd android
./gradlew installDebug  # debug APK → connected device
```

Gradle needs a JDK of 24 or older (Android Studio's bundled JBR 25 fails with Gradle 8.14.3 — set **Gradle JDK** to `jdk-24`). See [`context/collaboration.md`](context/collaboration.md) for environment setup, wireless adb, release signing, and the Android Studio APK wizard.

**APK sizes** (arm64-only, ML Kit models bundled): release ≈ 35 MB, debug ≈ 46 MB.

## Documentation

| File | Contents |
| --- | --- |
| [`context/implementation-plan.md`](context/implementation-plan.md) | Task plan and status |
| [`context/progress.md`](context/progress.md) | Session log, decisions, device findings |
| [`context/design.md`](context/design.md) | UI rules and screen specs |
| [`context/collaboration.md`](context/collaboration.md) | Setup, build, deploy, gotchas |
| [`context/testing.md`](context/testing.md) | On-device test checklist |
| [`context/architecture.md`](context/architecture.md) | Code structure and data flow |

## Scope

Course case study, Android-only, tested on a Vivo V2301A (Android 16). Known limitations are tracked in [`context/testing.md`](context/testing.md) §3 (model quality vs. online services, voice availability depends on the device, full-resolution history images).
