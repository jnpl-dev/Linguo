# docs/text-recognition.md — @capacitor-mlkit/text-recognition

Reference for the AI agent. Written from official plugin docs on 2026-11-06. Source: https://capawesome.io/docs/sdks/capacitor/mlkit/text-recognition/
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor-mlkit/text-recognition/`, the installed types win. Record the difference in `progress.md`.

## Facts
- Wraps Google ML Kit Text Recognition (on-device OCR). Android and iOS only; **no web support**.
- Compatibility: plugin 8.x requires Capacitor >= 8. The method was added in plugin version 8.2.0.
- The plugin bundles one model per script (Latin, Chinese, Devanagari, Japanese, Korean). All five are bundled, which adds several MB each to the app size. This is expected; do not try to remove them.
- No configuration required.

## Install
```bash
npm install @capacitor-mlkit/text-recognition
npx cap sync android
```
Optional Android variables (only if Gradle dependency conflicts occur): `$mlkitTextRecognitionVersion` etc. in `android/variables.gradle`. Do not set them otherwise.

## API
```ts
import { TextRecognition, Script } from '@capacitor-mlkit/text-recognition';

processImage(options: ProcessImageOptions): Promise<ProcessImageResult>
```

### ProcessImageOptions
| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `path` | string | required | **Local file path** to the image, e.g. `file:///path/to/image.jpg`. Remote URLs are NOT supported. |
| `script` | `Script` | `Script.Latin` | Script of the text to recognize |

### ProcessImageResult
| Prop | Type | Description |
| --- | --- | --- |
| `text` | string | The full recognized text. **Linguo uses only this.** |
| `blocks` | `TextBlock[]` | Blocks with lines, elements, bounding boxes. Not needed for v1. |

### Script enum
`Latin = 'LATIN'`, `Chinese = 'CHINESE'`, `Devanagari = 'DEVANAGARI'`, `Japanese = 'JAPANESE'`, `Korean = 'KOREAN'`.
Linguo v1 uses `Script.Latin` only.

## Usage for Linguo
```ts
const { text } = await TextRecognition.processImage({
  path: photoUri,          // MediaResult.uri from @capacitor/camera
  script: Script.Latin,
});
return text.trim();        // empty string => "No text found"
```
- Wrap in try/catch. An empty `text` is not an error: show the "No text found" toast.

## Answers to earlier open questions
- Image input: a **local file path** (`file:///...`), not base64. Use the Camera `MediaResult.uri`.

## Still to verify on device
- That `MediaResult.uri` from `@capacitor/camera` works directly as `path` (expected, since both use file URIs).
- Behavior for photos with Tagalog text (it is Latin script, so it should work); record accuracy in `testing.md`.
