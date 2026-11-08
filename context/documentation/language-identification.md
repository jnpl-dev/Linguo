# docs/language-identification.md — @capacitor-mlkit/language-identification

Reference for the AI agent. Written from the official plugin docs on 2026-11-07. Source: https://capawesome.io/docs/sdks/capacitor/mlkit/language-identification/
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor-mlkit/language-identification/`, the installed types win. Record the difference in `progress.md`.

## Facts
- Wraps Google ML Kit Language Identification. Detects the language of a string of text **on the device**.
- The model is bundled with the SDK: **no model download, works offline**.
- Android and iOS only; **no web implementation** (methods fail in the browser).
- Compatibility: plugin 8.x requires Capacitor `>= 8.x.x`. Both methods were added in plugin version 8.2.0, so any 8.2.x version (such as 8.2.2) is fine.
- Free and open source (part of the Capawesome ML Kit plugin suite).
- Identifies more than 100 languages. Results are BCP-47 language tags (`en`, `de`, `zh`, ...).
- `'und'` means **undetermined**: no language met the confidence threshold. Always handle it.
- No configuration required. Optional Android variable in `variables.gradle`: `$mlkitLanguageIdVersion` (default `17.0.6`); only change it if a dependency conflict occurs.

## Install
```bash
npm install @capacitor-mlkit/language-identification@8.2.2
npx cap sync android
```
(Use exactly version 8.2.2 if the user pinned it; otherwise any 8.2.x or newer 8.x that matches the installed Capacitor major.)

## API
```ts
import { LanguageIdentification } from '@capacitor-mlkit/language-identification';
```

### identifyLanguage
```ts
identifyLanguage(options: { text: string; confidenceThreshold?: number }): Promise<{ language: string }>
```
| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | string | required | Text to identify |
| `confidenceThreshold` | number 0.0–1.0 | `0.5` | Minimum confidence for a language to be returned |

Result: `language` is the BCP-47 tag of the most likely language, or `'und'` if none met the threshold.

### identifyPossibleLanguages
```ts
identifyPossibleLanguages(options: { text: string; confidenceThreshold?: number }): Promise<{ identifiedLanguages: { language: string; confidence: number }[] }>
```
| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | string | required | Text to identify |
| `confidenceThreshold` | number 0.0–1.0 | `0.01` | Minimum confidence for a language to be included |

Result: `identifiedLanguages` is ordered by **descending confidence**. If nothing meets the threshold, it contains a single entry whose `language` is `'und'`.

## Linguo auto-detect flow (design intent)
Goal: the user can leave the source language on **Auto-detect**, and the app works out the language of the recognized text before translating.

### Behavior
1. The source language select gets a first option **Auto-detect** (value `'auto'`). It is not a translation language; it never reaches `Translation.translate`.
2. When the user taps **Translate** and the source is `'auto'`:
   1. `LanguageDetectionService.detect(text)` returns a supported Linguo language code, or `null`.
   2. `null` → toast "Couldn't detect the language. Please choose it manually." Do not translate. Leave the select on Auto-detect.
   3. A language is returned → show it in the UI ("Detected: Spanish", for example, as a small caption or chip under the language row), then continue the normal pipeline using that language as the source (`ensureModels`, `translate`, save to history).
3. If the detected language equals the target language: toast "The text already seems to be in <language>." and do not translate.
4. **History stores the resolved language** (the detected one), never `'auto'`.
5. The swap button is disabled while the source is `'auto'` and nothing has been detected yet. If a detection result exists, swapping uses the detected language as the new target.
6. Manual choice always wins: if the user picks a specific source language, do not run detection.

### Detection logic (`LanguageDetectionService.detect`)
1. Trim the text. If it is empty, return `null`.
2. Call `identifyLanguage({ text })`.
3. Normalize the tag: lowercase it and take the primary subtag (the part before the first `-` or `_`), e.g. `en-Latn` → `en`.
4. Map the tag to one of Linguo's supported languages (see `tech-stack.md` section 4 and `docs/translation.md`). **Tagalog may be reported as `tl` or `fil`; map both to Tagalog.** Verify on the device which one appears.
5. If the result is `'und'` or is not a supported Linguo language, fall back to `identifyPossibleLanguages({ text })`, keep only entries whose normalized tag maps to a supported language, and take the one with the highest confidence, but only if its confidence is at least `0.2` (project heuristic; tune on the device and record the final value in `progress.md`).
6. Otherwise return `null`.
Wrap plugin calls in try/catch; on any plugin error return `null` and let the page show the "Couldn't detect" toast.

### Suggested service
```ts
// services/language-detection.service.ts
async detect(text: string): Promise<LanguageOption | null>;
```
Keep plugin calls inside this service. Pages never call the plugin directly. The supported-language list and the tag-to-language mapping live in `models/language.ts`.

### Example skeleton (adapt; do not copy blindly)
```ts
const { language } = await LanguageIdentification.identifyLanguage({ text });
const tag = language.toLowerCase().split(/[-_]/)[0];
const match = SUPPORTED_LANGUAGES.find(l => l.detectTags.includes(tag));   // detectTags e.g. ['tl', 'fil'] for Tagalog
if (match) return match;

const { identifiedLanguages } = await LanguageIdentification.identifyPossibleLanguages({ text });
const best = identifiedLanguages
  .map(r => ({ r, match: SUPPORTED_LANGUAGES.find(l => l.detectTags.includes(r.language.toLowerCase().split(/[-_]/)[0])) }))
  .find(x => x.match && x.r.confidence >= 0.2);
return best?.match ?? null;
```
This needs a new field on `LanguageOption`: `detectTags: string[]` (BCP-47 primary subtags the detector may return for that language).

## Caveats (general guidance, not from the plugin docs)
- Short or noisy text, which is typical of OCR output, can give `'und'` or a wrong language. The editable text field and the manual source selection are the user's safety net; never remove them.
- Mixed-language text returns one dominant language at best.
- Text in languages Linguo doesn't support will be reported as `null`; the toast should tell the user to choose manually.

## Still to verify on device
- Which tag the detector returns for Tagalog text (`tl`, `fil`, or something else).
- Detection quality on real OCR output of short and long English, Tagalog, Spanish, French, German, and Indonesian text; record failures in `testing.md`.
- Whether the `0.2` fallback confidence is a good value.
