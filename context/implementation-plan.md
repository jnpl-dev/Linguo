# implementation-plan.md — Linguo

Work through tasks in order. Do ONE task per session (see `agents.md` section 3). Each task has a "Done when" condition. Time estimates assume a one-day build.

Legend: [ ] not done, [x] done. `DEVICE` = needs the user's real Android phone.

## Phase 1 — Setup (about 1–2 h)
- [x] **1.1** Create the project: `ionic start linguo blank --type=angular` (standalone). Set Capacitor app name `Linguo` and ID `com.yourname.linguo`. Add the Android platform with `npx cap add android`.
  *Done when:* `ionic build && npx cap sync android` succeeds.
- [x] **1.2** Install the plugins listed in `tech-stack.md` section 2 and run `npx cap sync android`. Apply Android config from `tech-stack.md` section 5 (TTS `queries`, plugin README steps). Record versions in `progress.md`.
  Before installing each plugin, run `npm view <package> peerDependencies` and confirm it supports the installed Capacitor major version (especially `@capacitor-community/text-to-speech`).
  *Done when:* sync lists all five plugins and the Android build has no errors. If any plugin is incompatible with the Capacitor major version, STOP and report.
- [x] **1.3** `DEVICE` Run the blank app on the phone.
  *Done when:* the app launches on the device.
- [x] **1.4** Create the folder structure and empty files from `architecture.md` section 2, define routes (`translate`, `history`), and create placeholder pages with navigation between them. Define the language constant in `models/language.ts`.
  *Done when:* the app navigates between the two placeholder pages.

## Phase 2 — Core pipeline (about 2–3 h). Do this BEFORE real UI.
Use a temporary test layout on the translate page (plain buttons and text output). Replace it in Phase 3.
- [ ] **2.1** `DEVICE` Read `docs/camera.md`. Implement `OcrService.capture('camera' | 'gallery')` with Take Photo and Choose from Gallery buttons (`takePhoto` / `chooseFromGallery`, not `getPhoto`) that show whether a photo URI was returned (or cancelled).
  *Done when:* photo capture and gallery choice both work; cancel does nothing and shows no error.
- [ ] **2.2** `DEVICE` Read the OCR plugin README, then implement `OcrService.recognize()` and show the recognized text.
  *Done when:* a photo of printed English text produces readable text on screen; a photo with no text gives an empty result and a toast. Record the plugin's image input type in `progress.md`.
- [ ] **2.3** `DEVICE` Implement `TranslationService` (`isModelDownloaded`, `downloadModel`, `ensureModels`, `translate`) and a test button that translates a hardcoded sentence English → Tagalog.
  *Done when:* the model downloads (with internet) and a translation appears. Record whether progress is reported.
- [ ] **2.4** `DEVICE` Implement `SpeechService` (`isSupported`, `speak`, `stop`) and a test button.
  *Done when:* English text is spoken aloud; Stop works; an unsupported language shows the "No voice installed" toast. Record which Tagalog tag works, if any.
- [ ] **2.5** `DEVICE` Wire the full pipeline: capture → recognize → editable text → translate → display → speak.
  *Done when:* one full run works end to end on the phone.

## Phase 3 — Interface (about 2 h)
- [ ] **3.1** Read `design.md`, then build the real Translate page layout from `architecture.md` section 7.1 using Ionic components.
  *Done when:* the layout matches the spec and the pipeline still works.
- [ ] **3.2** Language selects and swap button, with default English → Tagalog. Prevent translating when source equals target (disable Translate and show a hint).
  *Done when:* swap works, including swapping the texts when a translation exists.
- [ ] **3.3** Loading states and error toasts for each pipeline step. `status` always resets in `finally`.
  *Done when:* each failure case (no text, no internet during download, no voice, plugin error) shows a clear message and the UI never stays stuck.
- [ ] **3.4** Speak and Stop buttons visible only when a translation exists; Stop is shown while speaking.
  *Done when:* buttons appear and hide correctly.

## Phase 4 — Local history (about 1–2 h)
- [ ] **4.1** Implement `HistoryService` with Preferences (key `linguo_history`, max 50, newest first, corrupt JSON treated as empty).
  *Done when:* items persist after the app is closed and reopened.
- [ ] **4.2** Auto-save after each successful translation.
  *Done when:* each translation appears in history once (no duplicates per tap).
- [ ] **4.3** Build the History page: list, empty state, view full item, Speak action.
  *Done when:* saved items show original, translated text, language pair, and date.
- [ ] **4.4** Delete one item (swipe) and Clear all (with confirmation).
  *Done when:* both work and persist after restart.

## Phase 5 — Testing and finish (about 1–2 h)
- [ ] **5.1** `DEVICE` Run every row of `testing.md` and record Pass/Fail.
- [ ] **5.2** Fix failures. Re-test the affected rows.
- [ ] **5.3** Fill in "Limitations" and "Suggested improvement" in `testing.md`.
- [ ] **5.4** `DEVICE` Final airplane-mode test and build a debug APK.
  *Done when:* the offline rows in `testing.md` pass.

## Cut list (drop in this order if time runs short)
1. Tap-to-expand detail on the History page (keep the list).
2. Clear all (keep single delete).
3. Extra languages beyond English and Tagalog.
Do NOT cut: history save, view, and delete (course data-operation requirement), and the testing sections in `testing.md`.
