import { Injectable } from '@angular/core';
import { Camera, type MediaResult } from '@capacitor/camera';
import { Script, TextRecognition } from '@capacitor-mlkit/text-recognition';

const CANCEL_CODES = ['OS-PLUG-CAMR-0006', 'OS-PLUG-CAMR-0020'];

/** Latin results shorter than this may be CJK garbage — try the CJK scripts too and keep the longest. */
const THIN_LATIN_LENGTH = 4;

const CJK_SCRIPTS = [Script.Japanese, Script.Chinese, Script.Korean] as const;

export type CaptureSource = 'camera' | 'gallery';

@Injectable({ providedIn: 'root' })
export class OcrService {
  async capture(source: CaptureSource): Promise<MediaResult | null> {
    try {
      if (source === 'camera') {
        return await Camera.takePhoto({ quality: 90 });
      }
      const { results } = await Camera.chooseFromGallery({ quality: 90 });
      return results[0] ?? null;
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code && CANCEL_CODES.includes(code)) {
        return null;
      }
      throw e;
    }
  }

  async recognize(uri: string): Promise<string> {
    const path = this.toImageUri(uri);
    const latin = await this.recognizeWith(path, Script.Latin);
    if (latin.replace(/\s/g, '').length >= THIN_LATIN_LENGTH) {
      return latin;
    }
    let best = latin;
    for (const script of CJK_SCRIPTS) {
      try {
        const text = await this.recognizeWith(path, script);
        if (text.length > best.length) best = text;
      } catch (e) {
        console.error(`recognition failed for script ${script}`, e);
      }
    }
    return best;
  }

  private async recognizeWith(path: string, script: Script): Promise<string> {
    const { text } = await TextRecognition.processImage({ path, script });
    return text.trim();
  }

  private toImageUri(uri: string): string {
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      return uri;
    }
    return `file://${uri}`;
  }
}
