# architecture.md — Linguo

Defines structure, services, data flow, data model, and screens. Follow it exactly. If something here conflicts with a plugin's real API, the plugin's real API wins; report the difference in `progress.md`.

## 1. Layers
```
Pages (standalone components, signals)
   ↓ call
Services (inject(), async/await)
   ↓ call
Capacitor plugins (Camera, ML Kit OCR, ML Kit Translation, TTS, Preferences)
   ↓
Device (photo, models, history JSON, history image copies)
```
No backend. No database. Pages never call plugins directly; they call services.

## 2. Folder structure
```
src/app/
  models/
    history-item.ts
    language.ts
  services/
    ocr.service.ts
    translation.service.ts
    speech.service.ts
    history.service.ts
  pages/
    translate/
      translate.page.ts
      translate.page.html
      translate.page.scss
    history/
      history.page.ts
      history.page.html
      history.page.scss
  app.routes.ts
  app.component.ts
```

## 3. Routes
| Path | Page | Notes |
| --- | --- | --- |
| `''` | redirect to `translate` | |
| `translate` | TranslatePage | Default home |
| `history` | HistoryPage | Back button returns to translate |

Use lazy-loaded standalone components (`loadComponent`).

## 4. Models

```ts
// models/language.ts
export interface LanguageOption {
  label: string;        // shown in UI, e.g. "Tagalog"
  mlkitCode: string;    // code used by the translation plugin (use plugin's Language enum values)
  ttsCandidates: string[]; // BCP-47 tags to try for speech, in order
}
```

```ts
// models/history-item.ts
export interface HistoryItem {
  id: string;            // crypto.randomUUID()
  sourceText: string;
  translatedText: string;
  sourceLang: string;    // mlkitCode
  targetLang: string;    // mlkitCode
  createdAt: number;     // Date.now()
  image?: string;        // relative path under Directory.Data, e.g. `linguo-history/<id>.jpg` (absent for typed-only entries)
}
```

The supported language list lives in `tech-stack.md` section 4. Define it once as a constant in `models/language.ts` and import it everywhere.

## 5. Services

### OcrService
- `capture(): Promise<Photo | null>` — opens the camera or gallery with the Camera plugin (source prompt so the user can choose). Returns `null` if the user cancels. Cancel is NOT an error.
- `recognize(photo: Photo): Promise<string>` — runs ML Kit Text Recognition on the photo and returns the full recognized text, or an empty string if no text is found.
- Open question: how the OCR plugin accepts the image (file path vs base64). Read the plugin README and set the Camera `resultType` to match. Record the answer in `progress.md`.

### TranslationService
- `isModelDownloaded(lang: string): Promise<boolean>`
- `downloadModel(lang: string): Promise<void>`
- `ensureModels(source: string, target: string): Promise<void>` — downloads whichever of the two models is missing.
- `translate(text: string, source: string, target: string): Promise<string>`
- Uses `@capacitor-mlkit/translation`. Use the plugin's `Language` enum values for codes.
- Open question: whether the plugin reports download progress. If not, show an indeterminate spinner.

### SpeechService
- `isSupported(lang: LanguageOption): Promise<string | null>` — tries each tag in `ttsCandidates` with the plugin's language-support check; returns the first supported tag or `null`.
- `speak(text: string, lang: LanguageOption): Promise<void>`
- `stop(): Promise<void>`
- Uses `@capacitor-community/text-to-speech`. If `isSupported` returns `null`, do not speak; the caller shows a toast: "No voice installed for <language> on this device."

### HistoryService
- `items = signal<HistoryItem[]>([])` (newest first)
- `load(): Promise<void>` — reads from Preferences into the signal. Call once at app start and when HistoryPage opens.
- `add(entry): Promise<SaveResult>` — dedupe by the 4 text/language fields first; then, when `imageSource` (the current photo's cache path) is given, copies it to `linguo-history/<id>.jpg` under `Directory.Data` and stores the relative path in `item.image`. Copy failure still saves the text entry and returns `'saved-no-image'` (page shows a toast). Adds to the front, trims to max 50 (dropped entries' image files are deleted), persists.
- `remove(id): Promise<void>` / `removeMany(ids): Promise<void>` — also delete the entries' image files in the same operation (missing file code `OS-PLUG-FILE-0008` is ignored; other failures are logged). `removeMany` does one persist for the whole batch (used by the History page's multi-select delete). There is **no `clear()`** anymore (Clear all was removed by user decision 2026-11-08).
- `resolveImage(rel): Promise<string | null>` — `getUri` for a stored image (null when the file is gone); the page runs the result through `Capacitor.convertFileSrc` for display.
- Storage: `@capacitor/preferences` (key `linguo_history`, JSON string of `HistoryItem[]`) + `@capacitor/filesystem` (`Directory.Data`, folder `linguo-history/`) for the image copies. Cache paths are never stored — the photo-manipulator cache is wiped on every app launch.
- If stored JSON is missing or corrupt, treat as an empty list. Do not crash.

## 6. Data flow: main pipeline
1. User selects source and target languages (must differ).
2. User taps **Take Photo** → `OcrService.capture()`.
   - `null` → do nothing.
3. `OcrService.recognize(photo)` → set `recognizedText`.
   - Empty result → toast "No text found. You can type text manually."
4. User may edit `recognizedText` in the textarea.
5. User taps **Translate** (disabled when text is empty, languages are equal, or the form shows a loaded history entry):
   1. `TranslationService.ensureModels(source, target)` (status `downloading`; needs internet the first time; on failure toast "Could not download language model. Check your internet connection.").
   2. `TranslationService.translate(...)` → set `translatedText`.
   3. Nothing is saved automatically — the user taps **Save to History** (`HistoryService.add(...)`) when they want to keep the pair.
6. Speak controls are two-way (user decision 2026-11-08): tapping **Speak** / **Speak original** calls `SpeechService.speak(...)`; while it plays, that same button becomes **Stop speaking** and calls `SpeechService.stop()`. The other speak button is disabled during playback.

Manual path: the user can skip steps 2–3 and type text directly, then Translate.

History path: tapping a History row queues the entry (`HistoryService.setPending`); the Translate page's `ionViewWillEnter` fills the form, sets `loadedFromHistory` (all editing controls disabled, action button shows **Translate new**), and **Translate new** clears the content and re-enables editing.

## 7. Screens

### 7.1 Translate page (`translate`)
State (signals): `sourceCode`, `targetCode`, `recognizedText`, `translatedText`, `detectedLang`, `previewSrc`/`previewPath` (photo), `cropOpen`/`cropSrc`/`rect` (crop modal), `speakingWhich` (`'original' | 'translated' | null`), `loadedFromHistory`, `status` (`'idle' | 'recognizing' | 'detecting' | 'downloading' | 'translating' | 'speaking'`).

Layout, top to bottom (final order, user decision 2026-11-08 third round):
1. Header: title "Linguo", button to History.
2. Image placeholder (always visible; empty state or preview of the current photo).
3. **Take Photo** + **Choose from Gallery** (stacked, block buttons).
4. Textarea bound to `recognizedText` + optional "Detected: X" caption.
5. Row: source language select, swap button, target language select (+ same-language hint).
6. Row: **Translate** + **Speak original**.
7. Textarea bound to `translatedText`.
8. Spinner + status line while busy.
9. Row: **Speak** + **Save to History** (or **Translate new** when `loadedFromHistory`).

Behavior rules:
- Swap button swaps source and target languages and swaps the two texts (disabled while busy or while showing a loaded entry).
- While `status` is not `idle`, disable the buttons and show an `ion-spinner` with a short label ("Reading text…", "Detecting language…", "Downloading language model…", "Translating…").
- Initial languages: source **Auto-detect**, target Tagalog.
- Loaded-from-history (`loadedFromHistory`): Text, Translation, language selects, swap, Take Photo, Choose from Gallery, and Translate are disabled; Speak stays enabled; the action button is **Translate new**, which clears text, translation, detected caption, and image (keeps languages) and flips `loadedFromHistory` back to false.
- Crop modal (`ion-modal`, open after capture): drag frame → **Crop** / **Use full photo** / **Retake**; crop/OCR errors show toasts (see design.md §6).

### 7.2 History page (`history`)
- `ion-list` of items, newest first (`HistoryService.items`, loaded in the constructor). Each row shows: translated text, source text, language pair (e.g. "EN → TL"), date.
- Tap a row (normal mode): queue the entry (`setPending`) and navigate to `/translate` — the form loads it read-only with **Translate new** (no modal).
- Swipe (`ion-item-sliding`) deletes one item (+ its image), with a success toast. Swipe options are hidden while selecting.
- Long-press (~500 ms, no scroll) opens **selection mode**: checkboxes appear, header becomes cancel + "N selected" + **Select all/Deselect** + trash; trash → `ion-alert` confirm → `HistoryService.removeMany(ids)` → toast → exit. Unchecking the last row exits automatically.
- **No "Clear all" button** and no `HistoryService.clear()` (removed by user decision 2026-11-08).
- Empty state: "No saved translations yet."

## 8. Error handling rules
- Services throw; pages catch and call a shared helper to show a toast.
- Cancelled photo is not an error.
- Never leave `status` stuck: always reset to `'idle'` in `finally`.

## 9. Out of scope in code
No settings screen, no onboarding, no theming system, no analytics, no tests beyond manual device testing.
