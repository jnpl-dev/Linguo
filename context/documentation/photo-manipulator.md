# docs/photo-manipulator.md — @capawesome/capacitor-photo-manipulator

Reference for the AI agent. Written from the official plugin docs on 2026-11-07. Source: https://capawesome.io/docs/sdks/capacitor/photo-manipulator/
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capawesome/capacitor-photo-manipulator/`, the installed types win. Record the difference in `progress.md`.

## Important: this plugin is HEADLESS (no UI)
- It crops, resizes, rotates, flips, and converts images **from code**. It does NOT show a crop screen.
- The crop screen (the rectangle the user drags) MUST be built by the app (see "Linguo crop flow" below). The plugin only performs the crop once the app gives it pixel coordinates.

## Facts
- Package: `@capawesome/capacitor-photo-manipulator`. Plugin version line `0.x.x`, requires Capacitor `>= 8.x.x`.
- Platforms: Android, iOS, and a partial web implementation (Canvas API). Linguo targets Android; test on the device.
- No configuration required. Optional Android variable in `variables.gradle`: `$androidxExifInterfaceVersion` (default `1.4.1`); only change it if a dependency conflict occurs.
- Input paths: on Android and iOS, **only local file paths and `file://` URIs** are supported (not `https://`, `blob:`, or `data:`; those work only on web).
- Output: the result is written to a **new file in the cache directory** and deleted on the next app launch. Linguo does not store images, so there is no need to move it.
- The EXIF orientation of the source image is applied while decoding, so the output is always upright. All other metadata (EXIF, GPS) is stripped.
- Decode support on Android: JPEG, PNG, WebP, GIF, BMP, HEIC/HEIF (Android 9+), AVIF (Android 12+). Encode: JPEG, PNG, WebP.
- Unsupported formats reject with error code `UNSUPPORTED_FORMAT`.

## Install
```bash
npm install @capawesome/capacitor-photo-manipulator
npx cap sync android
```
Before installing run `npm view @capawesome/capacitor-photo-manipulator peerDependencies` and confirm it supports the installed Capacitor major version. The docs page does not mention a paid tier; if `npm install` fails with an auth or license error, STOP and report to the user.

## API
```ts
import { PhotoManipulator, ImageFormat } from '@capawesome/capacitor-photo-manipulator';
```

### getInfo
```ts
getInfo(options: { path: string }): Promise<{ width: number; height: number; format: string | null }>
```
- Reads dimensions without decoding pixels where possible.
- `width` / `height` are in pixels **after** the EXIF orientation has been applied.
- `format` may differ per platform (e.g. `heic` on iOS, `heif` on Android) and can be `null`.

### transform
```ts
transform(options: TransformOptions): Promise<{ path: string; width: number; height: number }>
```
Operations are always applied in this fixed order: **crop → resize → rotate → flip**. For another order, chain several `transform` calls (pass the output `path` of one call as the input `path` of the next).

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `path` | string | required | Local file path or `file://` URI of the source image |
| `crop` | `{ x, y, width, height }` | none | Region in **source pixels**. `x` / `y` are measured from the left / top edge. The region MUST be inside the image bounds |
| `resize` | `{ width?, height? }` | none | Target size in pixels, applied after the crop. If only one of `width` / `height` is given, the aspect ratio is kept |
| `rotate` | number | `0` | Clockwise degrees; only `90`, `180`, or `270` |
| `flipHorizontal` | boolean | `false` | |
| `flipVertical` | boolean | `false` | |
| `format` | `ImageFormat` | `ImageFormat.Jpeg` | Output format |
| `quality` | number 0–1 | `0.9` | Only applies to JPEG and WebP output |

`ImageFormat` values: `Jpeg = 'JPEG'`, `Png = 'PNG'`, `Webp = 'WEBP'` (WebP works on Android and web only).

Result: `path` (output file in the cache directory), `width`, `height` of the transformed image.

## Linguo crop flow (design intent)
Goal: after the photo is captured and before OCR, the user can crop to the text they want.

1. `OcrService.capture()` returns a photo URI (see `docs/camera.md`).
2. Open an `ion-modal` crop screen showing that image (use the Camera result's `webPath`, or `Capacitor.convertFileSrc(uri)`, as the `<img>` src).
3. Call `PhotoManipulator.getInfo({ path: uri })` to get the true pixel `width` and `height` (orientation already applied).
4. Draw a crop rectangle over the image with four drag handles, built with plain TypeScript, CSS, and pointer events. **Do not add a cropper library** without asking the user.
   - Start with the rectangle covering the image with a small inset margin.
   - Enforce a minimum size (for example 64 x 64 displayed pixels) and keep the rectangle inside the image.
5. Convert the displayed rectangle to source pixels:
   ```
   scaleX = imageInfo.width  / displayedImageWidth
   scaleY = imageInfo.height / displayedImageHeight
   crop.x      = Math.round(rect.left   * scaleX)
   crop.y      = Math.round(rect.top    * scaleY)
   crop.width  = Math.round(rect.width  * scaleX)
   crop.height = Math.round(rect.height * scaleY)
   ```
   Then clamp so that `x >= 0`, `y >= 0`, `x + width <= info.width`, `y + height <= info.height`, and `width`, `height >= 1`. (`rect` is measured relative to the displayed image element, not the screen.)
6. Buttons: **Crop** (apply), **Use full photo** (skip cropping), **Retake** (cancel and return to the Translate page).
7. On **Crop**: 
   ```ts
   const { path } = await PhotoManipulator.transform({
     path: uri,
     crop: { x, y, width, height },
     format: ImageFormat.Jpeg,
     quality: 0.9,
   });
   // pass `path` to OcrService.recognize(path)
   ```
8. If `getInfo` or `transform` fails, show a toast ("Could not crop the image. Using the full photo.") and continue with the original `uri`. Never block the flow.

### Suggested service
```ts
// services/crop.service.ts
async getSize(uri: string): Promise<{ width: number; height: number }>;
async crop(uri: string, rect: { x: number; y: number; width: number; height: number }): Promise<string>; // returns new file path
```
Keep the plugin calls inside this service. The crop modal component handles only the UI and coordinates.

## OCR guidance (project guideline, not from the plugin docs)
- Do not `resize` before OCR unless the photo is huge. Downscaling hurts recognition accuracy. If a resize is needed, keep the long edge at 1500 px or more.
- Cropping to the text region usually improves OCR accuracy and speed.

## Error handling
| Situation | Handling |
| --- | --- |
| Crop region outside bounds | Clamp coordinates before calling; if it still rejects, fall back to the full photo |
| `UNSUPPORTED_FORMAT` | Toast "This image format is not supported." and return to the Translate page |
| File not found / path error | Toast "Could not read the photo." and return to the Translate page |

## Still to verify on device
- That the output `path` is accepted by the OCR plugin's `path` option (see `docs/text-recognition.md`).
- That the displayed `<img>` is upright and its aspect ratio matches `getInfo` width / height. If a photo appears rotated, the coordinate conversion will be wrong; record this in `progress.md`.
- That `npm install` works without a license key.
- Crop quality and speed on a full-resolution photo from the test phone.
