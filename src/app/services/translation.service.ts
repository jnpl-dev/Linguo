import { Injectable } from '@angular/core';
import type { Language } from '@capacitor-mlkit/translation';
import { Translation } from '@capacitor-mlkit/translation';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  async isModelDownloaded(lang: string): Promise<boolean> {
    const { languages } = await this.withTimeout(
      Translation.getDownloadedModels(),
      30_000,
      'Checking downloaded language models timed out.',
    );
    return languages.includes(lang as Language);
  }

  async downloadModel(lang: string): Promise<void> {
    await this.withTimeout(
      Translation.downloadModel({ language: lang as Language }),
      180_000,
      `Language model download timed out for '${lang}'. Check your internet connection.`,
    );
  }

  async ensureModels(source: string, target: string): Promise<void> {
    if (!(await this.isModelDownloaded(source))) {
      await this.downloadModel(source);
    }
    if (!(await this.isModelDownloaded(target))) {
      await this.downloadModel(target);
    }
  }

  async translate(text: string, source: string, target: string): Promise<string> {
    const { text: translated } = await this.withTimeout(
      Translation.translate({
        text,
        sourceLanguage: source as Language,
        targetLanguage: target as Language,
      }),
      60_000,
      'Translation timed out.',
    );
    return translated;
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
}
