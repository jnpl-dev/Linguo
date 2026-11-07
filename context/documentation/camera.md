# docs/camera.md — @capacitor/camera

Reference for the AI agent. Written from official docs on 2026-11-06 (Capacitor Camera plugin v8.1.0+ API). Source: https://capacitorjs.com/docs/next/apis/camera
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor/camera/`, the installed types win. Record the difference in `progress.md`.

## Important: API changed in plugin 8.1.0
- `getPhoto(...)` and `pickImages(...)` are **deprecated**. Do NOT use them.
- Use `takePhoto(...)` (camera) and `chooseFromGallery(...)` (gallery).
- `CameraSource.Prompt` and `resultType` were removed. There is no built-in "camera or gallery" prompt. Build it with two buttons (or Ionic's built-in `ion-action-sheet`, which needs no new dependency).

## Install
```bash
npm install @capacitor/camera
npx cap sync android
```

## Android notes
- No permissions are required unless `saveToGallery: true` is used. Therefore: do NOT set `saveToGallery` and do NOT add storage permissions.
- The gallery uses the Android Photo Picker. Older devices fall back automatically. The optional `<service ... ModuleDependencies>` manifest entry is only for installing the backported picker on older devices; skip it for v1.
- Not usable in the browser for real camera testing (web needs PWA Elements). Test on a device.

## Methods used in Linguo

### takePhoto
```ts
takePhoto(options: TakePhotoOptions): Promise<MediaResult>
```
Useful options (all optional):
| Option | Type | Default | Note |
| --- | --- | --- | --- |
| `quality` | number 0–100 | 100 | JPEG quality. Use 90. |
| `correctOrientation` | boolean | true | Keep true. |
| `editable` | `'in-app' \| 'external' \| 'no'` | `'no'` | Keep `'no'` for v1. |
| `includeMetadata` | boolean | false | Not needed. |
| `saveToGallery` | boolean | false | Keep false. |
| `targetWidth` / `targetHeight` | number | none | Must be used together. Optional downscale. |

### chooseFromGallery
```ts
chooseFromGallery(options: ChooseFromGalleryOptions): Promise<{ results: MediaResult[] }>
```
Options: `mediaType` (default `MediaTypeSelection.Photo`), `allowMultipleSelection` (default false), `quality`. Use defaults; take `results[0]`.

### MediaResult (returned by both)
| Field | Type | Meaning |
| --- | --- | --- |
| `type` | `MediaType` | Photo = 0, Video = 1 |
| `uri` | string | Native file URI. **Not available on web.** Pass this to the OCR plugin. |
| `webPath` | string | URL usable as `<img src>`. Use only for previews. |
| `thumbnail` | string | Base64 thumbnail (native). Not needed. |
| `saved` | boolean | Gallery save status. Not needed. |
| `metadata` | object | Only if `includeMetadata: true`. |

## Cancel and errors
On native, failures throw an error with `error.code`. Relevant codes:
| Code | Meaning | Handling |
| --- | --- | --- |
| `OS-PLUG-CAMR-0006` | Take photo cancelled | Treat as cancel: return `null`, no toast |
| `OS-PLUG-CAMR-0020` | Gallery choice cancelled | Treat as cancel: return `null`, no toast |
| `OS-PLUG-CAMR-0003` | Cannot access camera (permission) | Toast: "Camera access denied" |
| `OS-PLUG-CAMR-0005` | Gallery access not provided | Toast |
| `OS-PLUG-CAMR-0007` | No camera available | Toast |
| `OS-PLUG-CAMR-0010` / `-0012` | Could not take / process photo | Toast generic error |
Any other code: show a generic error toast with the message.

## Example pattern (adapt; do not copy blindly)
```ts
import { Camera } from '@capacitor/camera';

const CANCEL_CODES = ['OS-PLUG-CAMR-0006', 'OS-PLUG-CAMR-0020'];

async function capture(source: 'camera' | 'gallery'): Promise<string | null> {
  try {
    if (source === 'camera') {
      const r = await Camera.takePhoto({ quality: 90 });
      return r.uri ?? null;
    }
    const { results } = await Camera.chooseFromGallery({ quality: 90 });
    return results[0]?.uri ?? null;
  } catch (e: any) {
    if (CANCEL_CODES.includes(e?.code)) return null;
    throw e;
  }
}
```

## Open questions to verify on device
- Is `uri` accepted as-is by the OCR plugin's `path` option (see `docs/text-recognition.md`)? If not, check whether a different path form is needed.
- Does the user-cancel error actually carry the codes above on the test phone? If a cancel shows a toast, log `e.code` and add it to `CANCEL_CODES`.
