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
Use a temporary test layout on the translate page (plain buttons and text output). Replace it in Phase 3. Tasks 2.6–2.8 add pipeline UI (crop modal, detected-language caption, voice picker) — keep them minimal; Phase 3 restyles everything.
- [x] **2.1** `DEVICE` Read `context/documentation/camera.md`. Implement `OcrService.capture('camera' | 'gallery')` with Take Photo and Choose from Gallery buttons (`takePhoto` / `chooseFromGallery`, not `getPhoto`) that show whether a photo URI was returned (or cancelled).
  *Done when:* photo capture and gallery choice both work; cancel does nothing and shows no error.
- [x] **2.2** `DEVICE` Read the OCR plugin README, then implement `OcrService.recognize()` and show the recognized text.
  *Done when:* a photo of printed English text produces readable text on screen; a photo with no text gives an empty result and a toast. Record the plugin's image input type in `progress.md`.
- [x] **2.3** `DEVICE` Implement `TranslationService` (`isModelDownloaded`, `downloadModel`, `ensureModels`, `translate`) and a test button that translates a hardcoded sentence English → Tagalog.
  *Done when:* the model downloads (with internet) and a translation appears. Record whether progress is reported.
- [x] **2.4** `DEVICE` Implement `SpeechService` (`isSupported`, `speak`, `stop`) and a test button.
  *Done when:* English text is spoken aloud; Stop works; an unsupported language shows the "No voice installed" toast. Record which Tagalog tag works, if any.
  *Ticked 2026-11-09:* Q3 answered (`fil-PH`/`tl-PH`/`fil`/`tl` all supported; Q9: one Filipino voice, auto-picked); Stop robustness verified under F1; NO_VOICE toast + `openInstall()` coded — device check of the no-voice path remains in testing.md row 14.
- [x] **2.5** `DEVICE` Wire the full pipeline: capture → recognize → editable text → translate → display → speak.
  *Done when:* one full run works end to end on the phone.
- [x] **2.6** `DEVICE` Crop step: install `@capacitor-photo-manipulator` after `npm view ... peerDependencies` confirms Capacitor 8; read `context/documentation/photo-manipulator.md` and verify against `node_modules` types. Build the crop modal (image + drag rectangle with plain TS/CSS/pointer events, no cropper library) between capture and OCR: Crop / Use full photo / Retake.
  *Done when:* cropping down to one sentence OCRs only that sentence; Use full photo and Retake work; `getInfo`/`transform` failure toasts and falls back to the full photo; an EXIF-rotated photo crops in the right place. Record whether OCR accepts the cache output path (Q7).
  *Ticked 2026-11-08:* user-tested across sessions (crop → OCR works, fallbacks coded per doc); Q7 = yes.
- [x] **2.7** `DEVICE` Language detection: install `@capacitor-mlkit/language-identification@8.2.2`, read `context/documentation/language-identification.md`, implement `LanguageDetectionService.detect()` (always-on while the temporary layout has no language selects) and show a "Detected: X" caption before translating.
  *Done when:* a photo of Spanish/French/etc. text auto-resolves the source language and translates; `'und'`/unsupported text shows the "Couldn't detect" toast and does not translate; works in airplane mode. Record the Tagalog tag, `tl` or `fil` (Q8).
  *Ticked 2026-11-08:* detection runs under Auto-detect (language row added); Q8 = `fil`; ja/zh/ko verified on device.
- [x] **2.8** `DEVICE` Voice selection: extend `SpeechService` with `getSupportedVoices()` filtered to the target language, pass the `voice` index to `speak()`, and add a minimal voice picker to the temporary layout; on `NO_VOICE` keep the toast and offer `TextToSpeech.openInstall()`.
  *Done when:* at least two voices for the same language sound different and the selection applies to Speak; the no-voice path shows the toast; record Q6 (voice index) and finish Q3 (which Tagalog tag works, if any) in `progress.md`.
  *Re-scoped 2026-11-08 by user:* device has exactly one voice per language (Q9) → pickers removed, voice is now AUTO per language (full-list index, localService-first); NO_VOICE toast + `openInstall()` retained; Filipino accent = device limitation (Q3/Q9 recorded).

## Phase 3 — Interface (about 2 h)
- [x] **3.1** Read `design.md`, then build the real Translate page layout from `architecture.md` section 7.1 using Ionic components.
  *Done when:* the layout matches the spec and the pipeline still works.
  *Ticked 2026-11-09:* built and user-tested across rounds A1/B1 (final order: placeholder → capture → Text+caption → language row → Translate|Speak original → Translation → Speak|Save); pipeline verified end-to-end after each reorder.
- [x] **3.2** Language selects and swap button, with default English → Tagalog. Prevent translating when source equals target (disable Translate and show a hint).
  *Done when:* swap works, including swapping the texts when a translation exists.
  *Ticked 2026-11-08:* From/To/swap implemented (default Auto-detect → Tagalog per language-identification.md doc; same-language disables Translate + hint); user: "language selector is good".
- [x] **3.3** Loading states and error toasts for each pipeline step. `status` always resets in `finally`.
  *Done when:* each failure case (no text, no internet during download, no voice, plugin error) shows a clear message and the UI never stays stuck.
  *Ticked 2026-11-09:* busy spinner + toasts for every failure path; F1 guaranteed `finally` resets (stuck-spinner bug fixed); offline/error rows exercised on device.
- [x] **3.4** Speak and Stop buttons visible only when a translation exists; Stop is shown while speaking.
  *Done when:* buttons appear and hide correctly.
  *Ticked 2026-11-09 (superseded by F1 design):* buttons are always visible but **disabled** until their text exists (design.md rule), and the active one swaps to **Stop speaking** while audio plays — verified on device.

## Phase 4 — Local history (about 1–2 h)
- [x] **4.1** Implement `HistoryService` with Preferences (key `linguo_history`, max 50, newest first, corrupt JSON treated as empty).
  *Done when:* items persist after the app is closed and reopened.
  *Ticked 2026-11-08:* verified on device — entry survived force-stop + relaunch; corrupt JSON path returns `[]`.
- [x] **4.2** ~~Auto-save after each successful translation.~~ **Re-scoped by user (2026-11-08): manual "Save to History" button** on the Translate page (enabled when both texts exist; stores the resolved language, never `'auto'`).
  *Done when:* each translation appears in history once (no duplicates per tap).
  *Ticked 2026-11-08:* Save → toast "Saved to history." → persisted; second tap → "Already in history.", list stays at 1.
- [x] **4.3** Build the History page: list, empty state, view full item, Speak action. ~~Tap opens modal.~~ **Re-scoped by user (2026-11-08): tap loads both texts + languages into the Translate form and navigates back** (Speak happens from the Translate page after loading).
  *Done when:* saved items show original, translated text, language pair, and date.
  *Ticked 2026-11-08:* list + date/pair labels verified; tap → form populated with en→tl pair + navigate back; empty state renders.
- [x] **4.4** Delete one item (swipe) and Clear all (with confirmation).
  *Done when:* both work and persist after restart.
  *Ticked 2026-11-08:* swipe Delete removes entry (verified via item-options click); Clear all → ion-alert confirm → empty state + `Preferences.remove`; removal persisted.

## Fixes & extras — user-requested 2026-11-08
- [x] **F1** Speak robustness: hang guard (`withTimeout`, `max(15s, 200ms/char)`) in `SpeechService.speak`/`stop`; `stopSpeaking()` forces idle + invalidates stale sessions (`speakGen`); NO_VOICE `openInstall()` no longer awaited; two-way Speak buttons (active one becomes "Stop speaking", other disabled); standalone Stop button removed.
  *Verified:* EN/JA speak-original both reach "Stop speaking" and return to idle; toggle round-trip leaves no stuck spinner; stop is instant.
- [x] **F2** Cropped-image placeholder on the Translate page (`previewSrc` signal → `img`, set by apply-crop/Use-full-photo, cleared by Retake/history-load).
  *Verified:* preview img renders the photo-manipulator cache path on device.

## Adjustments — user-requested 2026-11-08 (second batch)
- [x] **A1** Translate page reorder (user-specified): image placeholder at top (always visible; empty state = dashed box + `image-outline` + "Photo will appear here"), then capture buttons, then language row, then Text (+Detected caption), then side-by-side row **Translate | Speak original**, then Translation, spinner, then side-by-side row **Speak | Save to History**.
  *Verified on device:* CDP DOM-order assertion matches the spec exactly; empty-state icon + caption render.
- [x] **A2** History stores the photo: install `@capacitor/filesystem@8.1.5` (user-approved stack change; `context/documentation/filesystem.md` read, types verified — no differences); `HistoryItem.image?` (relative path under `Directory.Data/linguo-history/`); Save copies the current photo (raw `previewPath`) out of the cache after dedupe; copy failure → still saves text + toast `'saved-no-image'`; delete/clear/trim also delete files (ignoring `OS-PLUG-FILE-0008`); tap restores the image into the placeholder via `resolveImage` + `convertFileSrc`.
  *Verified on device (full cycle):* gallery→crop→Save → `stat` file exists (3.6 MB) → force-stop+relaunch → tap entry → `<img>` renders with `naturalWidth: 3672` from `/files/linguo-history/` → entry delete → file gone (`OS-PLUG-FILE-0008`); text-only entries unaffected; user's own entries preserved throughout.

## Adjustments — user-requested 2026-11-08 (third batch)
- [x] **B1** Translate page reorder (user-specified): Text (+Detected caption) now comes **before** the language row. Final order: placeholder → Take Photo / Choose from Gallery → Text + caption → language row (+ hint) → **Translate | Speak original** → Translation → spinner → **Speak | Save/Translate new**.
- [x] **B2** Loaded history is read-only + **Translate new**: after a History tap fills the form, `loadedFromHistory` disables Text, Translation, language selects, swap, Take Photo, Choose from Gallery, and Translate (Speak stays active); the action button reads **Translate new**, which clears text, translation, caption, and image (keeps languages) and re-enables everything. Save behaves as before for fresh content. (User decision 2026-11-08: revert happens only via Translate new, never on edit.)
- [x] **B3** History long-press multi-select: hold a row ~500 ms (pointer timer, cancels on scroll/move) → selection mode with that row checked; checkboxes on all rows, tap toggles; header = cancel X + "N selected" + **Select all/Deselect** + trash → `ion-alert` confirm → `HistoryService.removeMany(ids)` (one persist + image deletes) → toast → exit; unchecking the last row exits automatically. **"Clear all" removed** (header buttons, `clearAll()`/`doClear()`, and `HistoryService.clear()` deleted). Swipe single-delete and tap-to-load kept; swipe options hidden while selecting.
- [x] **B4** Docs aligned: design.md (new order, read-only rule, selection mode, Clear-all removal), architecture.md (manual save, two-way speak, rewritten §7.1/§7.2, `removeMany`), testing.md (rows 12–27 renumbered for Translate new / multi-select / no-Clear-all; Limitations and Improvement candidates refreshed), concept.md §2.4/§3.2, progress.md.
- [x] **B5** New `context/collaboration.md` for human collaborators (setup, USB debugging, build/deploy, conventions, gotchas).
- [x] **B6** Verify: `npm run lint` + `npm run build` clean; deploy to device and check every flow in the batch.
  *Ticked 2026-11-09:* lint + build clean; deployed via installDebug; read-only load, Translate new, multi-select delete, no-Clear-all all checked on device.

## Phase 5 — Testing and finish (about 1–2 h)
- [ ] **5.1** `DEVICE` Run every row of `testing.md` and record Pass/Fail.
- [ ] **5.2** Fix failures. Re-test the affected rows.
- [ ] **5.3** Fill in "Limitations" and "Suggested improvement" in `testing.md`.
- [ ] **5.4** `DEVICE` Final airplane-mode test and build a debug APK.
  *Done when:* the offline rows in `testing.md` pass.

## Cut list (drop in this order if time runs short)
1. Tap-to-expand detail on the History page (keep the list).
2. ~~Clear all (keep single delete).~~ Already removed by user decision (2026-11-08); multi-select delete exists instead.
3. Extra languages beyond English and Tagalog.
Do NOT cut: history save, view, and delete (course data-operation requirement), and the testing sections in `testing.md`.
