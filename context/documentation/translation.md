# docs/translation.md — @capacitor-mlkit/translation

Reference for the AI agent. Written from official plugin docs on 2026-11-06. Source: https://capawesome.io/docs/sdks/capacitor/mlkit/translation/
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor-mlkit/translation/`, the installed types win. Record the difference in `progress.md`.

## Facts
- Wraps Google ML Kit Translation. Runs **on the device** using downloaded language models.
- Android and iOS only; **no web implementation** (methods fail in the browser).
- Compatibility: plugin 8.x requires Capacitor >= 8 (versions 7.x and below are deprecated).
- Each language model is about 30 MB.
- `translate(...)` downloads missing models **automatically** on first use, which may take a while. Calling `downloadModel(...)` first gives better UX (show "Downloading language model…").
- There is **no documented download progress listener**. Show an indeterminate spinner.
- Offline works after the models for both languages are downloaded.
- The source language must be given. Auto-detection is out of scope for Linguo.

## Install
```bash
npm install @capacitor-mlkit/translation
npx cap sync android
```
No configuration required. Optional Gradle variable `$mlkitTranslateVersion` only if dependency conflicts occur.

## API
```ts
import { Translation, Language } from '@capacitor-mlkit/translation';
```

| Method | Signature |
| --- | --- |
| `translate` | `translate(options: { text: string; sourceLanguage: Language; targetLanguage: Language }): Promise<{ text: string }>` |
| `downloadModel` | `downloadModel(options: { language: Language }): Promise<void>` |
| `getDownloadedModels` | `getDownloadedModels(): Promise<{ languages: Language[] }>` |
| `deleteDownloadedModel` | `deleteDownloadedModel(options: { language: Language }): Promise<void>` |

## Examples
```ts
// Translate
const { text } = await Translation.translate({
  text: 'Good morning!',
  sourceLanguage: Language.English,
  targetLanguage: Language.Tagalog,
});

// Check, then download a model
const { languages } = await Translation.getDownloadedModels();
if (!languages.includes(Language.Tagalog)) {
  await Translation.downloadModel({ language: Language.Tagalog });
}
```

## Language enum values used by Linguo (verified)
| Label | Enum member | Value |
| --- | --- | --- |
| English | `Language.English` | `'en'` |
| Tagalog | `Language.Tagalog` | `'tl'` |
| Spanish | `Language.Spanish` | `'es'` |
| French | `Language.French` | `'fr'` |
| German | `Language.German` | `'de'` |
| Indonesian | `Language.Indonesian` | `'id'` |
The enum contains 50+ languages. Use enum members in code, not hardcoded strings.

## Implementation guidance for Linguo
- `ensureModels(source, target)`: call `getDownloadedModels()`, then `downloadModel` for each missing language, sequentially.
- If a download fails (no internet), throw; the page shows: "Could not download language model. Check your internet connection."
- Do not call translation methods in the browser (`ionic serve`); guard with `Capacitor.isNativePlatform()` or expect failure.

## Answers to earlier open questions
- Download progress: **not documented**. Use an indeterminate spinner.
- All six Linguo languages exist in the `Language` enum.
