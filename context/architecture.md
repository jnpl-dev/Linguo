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
Device (photo, models, history JSON)
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
- `add(item: Omit<HistoryItem,'id'|'createdAt'>): Promise<void>` — adds to the front, trims to max 50 items, persists.
- `remove(id: string): Promise<void>`
- `clear(): Promise<void>`
- Storage: `@capacitor/preferences`, key `linguo_history`, value is a JSON string of `HistoryItem[]`.
- If stored JSON is missing or corrupt, treat as an empty list. Do not crash.

## 6. Data flow: main pipeline
1. User selects source and target languages (must differ).
2. User taps **Take Photo** → `OcrService.capture()`.
   - `null` → do nothing.
3. `OcrService.recognize(photo)` → set `recognizedText`.
   - Empty result → toast "No text found. You can type text manually."
4. User may edit `recognizedText` in the textarea.
5. User taps **Translate** (disabled when text is empty or languages are equal):
   1. `TranslationService.ensureModels(source, target)` (status `downloading`; needs internet the first time; on failure toast "Could not download language model. Check your internet connection.").
   2. `TranslationService.translate(...)` → set `translatedText`.
   3. `HistoryService.add(...)` automatically.
6. User taps **Speak** → `SpeechService.speak(translatedText, targetLanguage)`. **Stop** calls `SpeechService.stop()`.

Manual path: the user can skip steps 2–3 and type text directly, then Translate.

## 7. Screens

### 7.1 Translate page (`translate`)
State (signals): `sourceLang`, `targetLang`, `recognizedText`, `translatedText`, `status` (`'idle' | 'recognizing' | 'downloading' | 'translating' | 'speaking'`).

Layout, top to bottom:
1. Header: title "Linguo", button to History.
2. Row: source language select, swap button, target language select.
3. **Take Photo** button.
4. Textarea bound to `recognizedText` (placeholder: "Take a photo or type text here").
5. **Translate** button.
6. Result card showing `translatedText`, with **Speak** and **Stop** buttons (visible only when `translatedText` is non-empty).

Behavior rules:
- Swap button swaps `sourceLang` and `targetLang`; if `translatedText` exists, also swap the texts.
- While `status` is not `idle`, disable the buttons and show an `ion-spinner` with a short label ("Reading text…", "Downloading language model…", "Translating…").
- Initial languages: source English, target Tagalog.

### 7.2 History page (`history`)
- `ion-list` of items, newest first. Each row shows: first line of source text, first line of translated text, language pair (e.g. "EN → TL"), date.
- Tap a row: open an `ion-modal` or expand to show full original and translated text, with a **Speak** button.
- Swipe (`ion-item-sliding`) to delete one item.
- Header button **Clear all** with an `ion-alert` confirmation.
- Empty state: "No saved translations yet."
- Call `HistoryService.load()` in `ionViewWillEnter`.

## 8. Error handling rules
- Services throw; pages catch and call a shared helper to show a toast.
- Cancelled photo is not an error.
- Never leave `status` stuck: always reset to `'idle'` in `finally`.

## 9. Out of scope in code
No settings screen, no onboarding, no theming system, no analytics, no tests beyond manual device testing.
