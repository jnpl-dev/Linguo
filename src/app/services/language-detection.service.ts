import { Injectable } from '@angular/core';
import { LanguageIdentification } from '@capacitor-mlkit/language-identification';

import { LANGUAGES, type LanguageOption } from '../models/language';

const FALLBACK_CONFIDENCE = 0.2;

@Injectable({ providedIn: 'root' })
export class LanguageDetectionService {
  /** Returns a supported Linguo language, or null if none could be identified. */
  async detect(text: string): Promise<LanguageOption | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;
    try {
      const { language } = await LanguageIdentification.identifyLanguage({ text: trimmed });
      const hit = this.mapTag(language);
      if (hit) return hit;

      const { identifiedLanguages } = await LanguageIdentification.identifyPossibleLanguages({
        text: trimmed,
        confidenceThreshold: FALLBACK_CONFIDENCE,
      });
      for (const entry of identifiedLanguages) {
        if (entry.confidence < FALLBACK_CONFIDENCE) break;
        const match = this.mapTag(entry.language);
        if (match) return match;
      }
      return null;
    } catch (e) {
      console.error('language detection failed', e);
      return null;
    }
  }

  private mapTag(tag: string): LanguageOption | null {
    const primary = tag.toLowerCase().split(/[-_]/)[0];
    return LANGUAGES.find((l) => l.detectTags.includes(primary)) ?? null;
  }
}
