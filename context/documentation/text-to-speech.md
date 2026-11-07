# docs/text-to-speech.md — @capacitor-community/text-to-speech

Reference for the AI agent. Written from the package's npm documentation on 2026-11-06. Source: https://npmjs.com/package/@capacitor-community/text-to-speech
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor-community/text-to-speech/`, the installed types win. Record the difference in `progress.md`.

## Facts
- Capacitor community plugin; MIT license; Android, iOS, and web.
- The latest version I saw documented was **6.0.0**. I could NOT confirm that it supports Capacitor 8. **Check the package's `peerDependencies` (`npm view @capacitor-community/text-to-speech peerDependencies`) before installing.** If it is incompatible, STOP and report; do not force-install. A possible alternative to evaluate (with the user): Capawesome's "Speech Synthesis" plugin (check whether it is free or Insiders-only before suggesting it).
- Speech depends on voices installed on the phone. Some languages (often Tagalog) may have no voice.

## Install
```bash
npm install @capacitor-community/text-to-speech
npx cap sync android
```
No configuration required.

## Android 11+ manifest entry
Add inside `<manifest>` in `android/app/src/main/AndroidManifest.xml`:
```xml
<queries>
  <intent>
    <action android:name="android.intent.action.TTS_SERVICE" />
  </intent>
</queries>
```

## API
```ts
import { TextToSpeech } from '@capacitor-community/text-to-speech';
```
| Method | Signature | Notes |
| --- | --- | --- |
| `speak` | `speak(options: TTSOptions): Promise<void>` | Plays the text |
| `stop` | `stop(): Promise<void>` | Stops playback |
| `getSupportedLanguages` | `(): Promise<{ languages: string[] }>` | BCP 47 tags |
| `getSupportedVoices` | `(): Promise<{ voices: SpeechSynthesisVoice[] }>` | |
| `isLanguageSupported` | `(options: { lang: string }): Promise<{ supported: boolean }>` | Use before speaking |
| `openInstall` | `(): Promise<void>` | Android only: opens/checks TTS data install |
| `addListener('onRangeStart', ...)` | | Word-range events. Not needed |

### TTSOptions
| Prop | Type | Default | Note |
| --- | --- | --- | --- |
| `text` | string | required | Text to speak |
| `lang` | string | `"en-US"` | BCP 47 tag; must be in `getSupportedLanguages()` |
| `rate` | number | 1.0 | Speed |
| `pitch` | number | 1.0 | |
| `volume` | number | 1.0 | |
| `voice` | number | none | Voice index from `getSupportedVoices()` |
| `category` | string | `"ambient"` | iOS only; ignore |
| `queueStrategy` | `QueueStrategy` | `Flush` (0) | `Flush` stops current speech when a new request arrives; `Add` (1) queues |

## Linguo usage pattern
```ts
async function findSupportedTag(candidates: string[]): Promise<string | null> {
  for (const lang of candidates) {
    const { supported } = await TextToSpeech.isLanguageSupported({ lang });
    if (supported) return lang;
  }
  return null;
}

const tag = await findSupportedTag(['fil-PH', 'tl-PH']);   // ttsCandidates for Tagalog
if (!tag) { /* toast: "No voice installed for Tagalog on this device." */ return; }
await TextToSpeech.speak({ text, lang: tag, rate: 1.0, pitch: 1.0, volume: 1.0, queueStrategy: 0 });
```
- Call `TextToSpeech.stop()` for the Stop button.
- `speak` resolves when speech finishes (verify on device); set `status` back to `'idle'` in `finally`.

## Still to verify on device
- Capacitor 8 compatibility (see above).
- Which Tagalog tag (`fil-PH` or `tl-PH`) works, or whether none does.
- Whether `speak()` resolves at the end of speech or immediately.
