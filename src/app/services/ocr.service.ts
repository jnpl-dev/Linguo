import { Injectable } from '@angular/core';
import { Camera, type MediaResult } from '@capacitor/camera';

const CANCEL_CODES = ['OS-PLUG-CAMR-0006', 'OS-PLUG-CAMR-0020'];

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
}
