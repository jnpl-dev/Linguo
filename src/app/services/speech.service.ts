import { Injectable } from '@angular/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

import type { LanguageOption } from '../models/language';

/** A voice with its index into the FULL list returned by getSupportedVoices (what speak({voice}) expects). */
export interface VoiceOption {
  index: number;
  name: string;
  lang: string;
  localService: boolean;
}

@Injectable({ providedIn: 'root' })
export class SpeechService {
  async isSupported(lang: LanguageOption): Promise<string | null> {
    for (const tag of lang.ttsCandidates) {
      const { supported } = await TextToSpeech.isLanguageSupported({ lang: tag });
      if (supported) return tag;
    }
    return null;
  }

  /** Voices matching the language (primary BCP-47 subtag), keeping the original full-list index. */
  async getVoices(lang: LanguageOption): Promise<VoiceOption[]> {
    try {
      const { voices } = await TextToSpeech.getSupportedVoices();
      return voices
        .map((voice, index) => ({ voice, index }))
        .filter(({ voice }) => lang.ttsCandidates.some((c) => this.primarySubtag(voice.lang) === this.primarySubtag(c)))
        .map(({ voice, index }) => ({
          index,
          name: voice.name.trim(),
          lang: voice.lang,
          localService: voice.localService,
        }));
    } catch (e) {
      console.error('getSupportedVoices failed', e);
      return [];
    }
  }

  /**
   * Speaks with the best voice for the language, automatically:
   * prefers an offline (localService) voice matching the language, then any matching voice,
   * and falls back to letting the engine pick by locale tag. Throws NO_VOICE when the
   * engine supports no matching language at all.
   */
  async speak(text: string, lang: LanguageOption): Promise<void> {
    const tag = await this.isSupported(lang);
    if (!tag) {
      throw new Error('NO_VOICE');
    }
    const voice = await this.preferredVoice(lang);
    await this.withTimeout(
      TextToSpeech.speak({
        text,
        lang: tag,
        rate: 1,
        pitch: 1,
        volume: 1,
        ...(voice !== null ? { voice } : {}),
      }),
      Math.max(15_000, text.length * 200),
      'Speech timed out.',
    );
  }

  async stop(): Promise<void> {
    await this.withTimeout(TextToSpeech.stop(), 5_000, 'Stop timed out.');
  }

  /** Opens the system TTS resource installer (Android) so missing voice packs can be added. */
  async offerInstall(): Promise<void> {
    try {
      await TextToSpeech.openInstall();
    } catch (e) {
      console.error('openInstall failed', e);
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]).finally(() => clearTimeout(timer));
  }

  private async preferredVoice(lang: LanguageOption): Promise<number | null> {
    const voices = await this.getVoices(lang);
    if (voices.length === 0) return null;
    return (voices.find((v) => v.localService) ?? voices[0]).index;
  }

  private primarySubtag(tag: string): string {
    return tag.toLowerCase().split(/[-_]/)[0];
  }
}
