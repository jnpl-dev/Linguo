import { NgStyle } from '@angular/common';
import { Component, computed, inject, signal, viewChild, type ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, images, imageOutline, sparklesOutline, swapHorizontal, timeOutline } from 'ionicons/icons';

import { LANGUAGES, type LanguageOption } from '../../models/language';
import { CropService, type CropRect } from '../../services/crop.service';
import { HistoryService } from '../../services/history.service';
import { LanguageDetectionService } from '../../services/language-detection.service';
import { OcrService, type CaptureSource } from '../../services/ocr.service';
import { SpeechService } from '../../services/speech.service';
import { TranslationService } from '../../services/translation.service';

type Status = 'idle' | 'recognizing' | 'detecting' | 'downloading' | 'translating' | 'speaking';

const STATUS_LABEL: Record<Status, string> = {
  idle: '',
  recognizing: 'Reading text…',
  detecting: 'Detecting language…',
  downloading: 'Downloading language model…',
  translating: 'Translating…',
  speaking: 'Speaking…',
};

const AUTO = 'auto';

type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se';

interface FracRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  start: FracRect;
  imgW: number;
  imgH: number;
}

const INITIAL_RECT: FracRect = { x: 0.05, y: 0.05, w: 0.9, h: 0.9 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

addIcons({ swapHorizontal, imageOutline, camera, images, sparklesOutline, timeOutline });

@Component({
  selector: 'app-translate',
  templateUrl: './translate.page.html',
  styleUrls: ['./translate.page.scss'],
  imports: [
    NgStyle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonFooter,
    IonIcon,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonSpinner,
    RouterLink,
  ],
})
export class TranslatePage {
  private ocr = inject(OcrService);
  private crop = inject(CropService);
  private translation = inject(TranslationService);
  private detection = inject(LanguageDetectionService);
  private speech = inject(SpeechService);
  private history = inject(HistoryService);
  private toastCtrl = inject(ToastController);

  readonly languages = LANGUAGES;

  status = signal<Status>('idle');
  sourceCode = signal(AUTO);
  targetCode = signal(LANGUAGES[1].mlkitCode);
  recognizedText = signal('Good morning!');
  translatedText = signal('');
  detectedLang = signal<LanguageOption | null>(null);

  cropOpen = signal(false);
  cropSrc = signal('');
  previewSrc = signal('');
  /** Raw file path/URI of the image behind previewSrc (what gets copied on Save). */
  previewPath = signal('');
  rect = signal<FracRect>({ ...INITIAL_RECT });

  /** Which speak button is currently playing (its button becomes the two-way Stop control). */
  speakingWhich = signal<'original' | 'translated' | null>(null);

  /**
   * True while the form shows a saved history entry: all editing controls are
   * disabled and the action button reads "Translate new" (user decision 2026-11-08).
   */
  loadedFromHistory = signal(false);

  /** Bumped on every speak/stop start so stale finally-blocks never reset a newer session. */
  private speakGen = 0;

  busy = computed(() => this.status() !== 'idle');
  statusLabel = computed(() => STATUS_LABEL[this.status()]);

  sourceLang = computed<LanguageOption | null>(() => {
    const code = this.sourceCode();
    if (code === AUTO) return null;
    return LANGUAGES.find((l) => l.mlkitCode === code) ?? null;
  });

  targetLang = computed<LanguageOption>(() => LANGUAGES.find((l) => l.mlkitCode === this.targetCode()) ?? LANGUAGES[1]);

  effectiveSource = computed<LanguageOption | null>(() => this.sourceLang() ?? this.detectedLang());

  sameLanguage = computed(() => {
    const src = this.sourceLang();
    return src !== null && src.mlkitCode === this.targetLang().mlkitCode;
  });

  canSwap = computed(() => !this.busy() && !this.loadedFromHistory() && this.effectiveSource() !== null);

  private cropUri = '';
  private cropInfo: { width: number; height: number } | null = null;
  private drag: DragState | null = null;
  private cropImg = viewChild<ElementRef<HTMLImageElement>>('cropImg');

  async takePhoto(): Promise<void> {
    await this.capture('camera');
  }

  async chooseFromGallery(): Promise<void> {
    await this.capture('gallery');
  }

  onTextInput(event: Event): void {
    const value = (event as CustomEvent<{ value: string | null | undefined }>).detail.value;
    this.recognizedText.set(value ?? '');
    this.detectedLang.set(null);
  }

  onTranslationInput(event: Event): void {
    const value = (event as CustomEvent<{ value: string | null | undefined }>).detail.value;
    this.translatedText.set(value ?? '');
  }

  onSourceChange(event: Event): void {
    const value = (event as CustomEvent<{ value: string | null }>).detail.value ?? AUTO;
    this.sourceCode.set(value);
    this.detectedLang.set(null);
  }

  onTargetChange(event: Event): void {
    const value = (event as CustomEvent<{ value: string | null }>).detail.value;
    if (value) this.targetCode.set(value);
  }

  swap(): void {
    if (!this.canSwap()) return;
    const eff = this.effectiveSource();
    if (!eff) return;
    const oldTarget = this.targetLang();
    this.sourceCode.set(oldTarget.mlkitCode);
    this.targetCode.set(eff.mlkitCode);
    this.detectedLang.set(null);
    const a = this.recognizedText();
    const b = this.translatedText();
    this.recognizedText.set(b);
    this.translatedText.set(a);
  }

  async translate(): Promise<void> {
    if (this.busy() || this.loadedFromHistory()) return;
    const text = this.recognizedText().trim();
    if (!text) return;
    const target = this.targetLang();
    try {
      let source: LanguageOption | null = this.sourceLang();
      if (source === null) {
        this.status.set('detecting');
        const detected = await this.detection.detect(text);
        if (!detected) {
          await this.toast("Couldn't detect the language. Please choose it manually.");
          return;
        }
        if (detected.mlkitCode === target.mlkitCode) {
          await this.toast(`The text already seems to be in ${detected.label}.`);
          return;
        }
        this.detectedLang.set(detected);
        source = detected;
      } else if (source.mlkitCode === target.mlkitCode) {
        return;
      }
      this.status.set('downloading');
      try {
        await this.translation.ensureModels(source.mlkitCode, target.mlkitCode);
      } catch (e) {
        console.error('model download failed', e);
        await this.toast(this.errorMessage(e, 'Could not download language model. Check your internet connection.'));
        return;
      }
      this.status.set('translating');
      const out = await this.translation.translate(text, source.mlkitCode, target.mlkitCode);
      this.translatedText.set(out);
    } catch (e) {
      console.error('translate failed', e);
      await this.toast(this.errorMessage(e, 'Could not translate the text.'));
    } finally {
      this.status.set('idle');
    }
  }

  async speakOriginal(): Promise<void> {
    if (this.busy()) return;
    const text = this.recognizedText().trim();
    if (!text) return;
    let lang = this.effectiveSource();
    if (!lang) {
      this.status.set('detecting');
      lang = await this.detection.detect(text);
      if (!lang) {
        this.status.set('idle');
        await this.toast("Couldn't detect the language. Please choose it manually.");
        return;
      }
      this.detectedLang.set(lang);
    }
    await this.speak(text, lang, 'original');
  }

  async speakTranslated(): Promise<void> {
    if (this.busy()) return;
    await this.speak(this.translatedText(), this.targetLang(), 'translated');
  }

  async stopSpeaking(): Promise<void> {
    this.speakGen++;
    this.speakingWhich.set(null);
    this.status.set('idle');
    try {
      await this.speech.stop();
    } catch (e) {
      console.error('stop failed', e);
    }
  }

  async saveHistory(): Promise<void> {
    if (this.busy()) return;
    const sourceText = this.recognizedText().trim();
    const translatedText = this.translatedText().trim();
    if (!sourceText || !translatedText) return;
    let resolved = this.effectiveSource();
    if (!resolved) {
      resolved = await this.detection.detect(sourceText);
      if (!resolved) {
        await this.toast("Couldn't detect the language. Please choose it manually.");
        return;
      }
      this.detectedLang.set(resolved);
    }
    const result = await this.history.add({
      sourceText,
      translatedText,
      sourceLang: resolved.mlkitCode,
      targetLang: this.targetLang().mlkitCode,
      imageSource: this.previewPath() || undefined,
    });
    if (result === 'saved') {
      await this.toast('Saved to history.', 'success');
    } else if (result === 'duplicate') {
      await this.toast('Already in history.', 'success');
    } else if (result === 'saved-no-image') {
      await this.toast('Saved to history, but the image could not be saved.');
    } else {
      await this.toast('Could not save to history.');
    }
  }

  /** Clears the loaded history entry so the form starts a fresh translation (languages kept). */
  translateNew(): void {
    if (this.busy()) return;
    this.recognizedText.set('');
    this.translatedText.set('');
    this.detectedLang.set(null);
    this.previewSrc.set('');
    this.previewPath.set('');
    this.loadedFromHistory.set(false);
  }

  async ionViewWillEnter(): Promise<void> {
    const item = this.history.takePending();
    if (!item) return;
    this.recognizedText.set(item.sourceText);
    this.translatedText.set(item.translatedText);
    this.sourceCode.set(item.sourceLang);
    this.targetCode.set(item.targetLang);
    this.detectedLang.set(null);
    this.loadedFromHistory.set(true);
    const uri = item.image ? await this.history.resolveImage(item.image) : null;
    this.previewSrc.set(uri ? Capacitor.convertFileSrc(uri) : '');
    this.previewPath.set(uri ?? '');
  }

  onDragStart(event: PointerEvent, mode: DragMode): void {
    event.preventDefault();
    event.stopPropagation();
    const img = this.cropImg()?.nativeElement;
    if (!img) return;
    const bounds = img.getBoundingClientRect();
    this.drag = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      start: { ...this.rect() },
      imgW: bounds.width,
      imgH: bounds.height,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  onDragMove(event: PointerEvent): void {
    const d = this.drag;
    if (!d) return;
    const dx = (event.clientX - d.startX) / d.imgW;
    const dy = (event.clientY - d.startY) / d.imgH;
    const minW = Math.max(64 / d.imgW, 0.02);
    const minH = Math.max(64 / d.imgH, 0.02);
    let { x, y, w, h } = d.start;
    switch (d.mode) {
      case 'move':
        x = clamp(x + dx, 0, 1 - w);
        y = clamp(y + dy, 0, 1 - h);
        break;
      case 'se':
        w = clamp(w + dx, minW, 1 - x);
        h = clamp(h + dy, minH, 1 - y);
        break;
      case 'sw':
        x = clamp(x + dx, 0, x + w - minW);
        w = d.start.w + (d.start.x - x);
        h = clamp(h + dy, minH, 1 - y);
        break;
      case 'ne':
        x = clamp(x + dx, 0, x + w - minW);
        w = d.start.w + (d.start.x - x);
        y = clamp(y + dy, 0, y + h - minH);
        h = d.start.h + (d.start.y - y);
        break;
      case 'nw':
        x = clamp(x + dx, 0, x + w - minW);
        w = d.start.w + (d.start.x - x);
        y = clamp(y + dy, 0, y + h - minH);
        h = d.start.h + (d.start.y - y);
        break;
    }
    this.rect.set({ x, y, w, h });
  }

  onDragEnd(): void {
    this.drag = null;
  }

  async applyCrop(): Promise<void> {
    const uri = this.cropUri;
    const info = this.cropInfo;
    if (!uri || !info) return;
    const r = this.rect();
    const rect: CropRect = {
      x: clamp(Math.round(r.x * info.width), 0, info.width - 1),
      y: clamp(Math.round(r.y * info.height), 0, info.height - 1),
      width: 0,
      height: 0,
    };
    rect.width = clamp(Math.round(r.w * info.width), 1, info.width - rect.x);
    rect.height = clamp(Math.round(r.h * info.height), 1, info.height - rect.y);
    this.cropOpen.set(false);
    let path = uri;
    let cropped = false;
    try {
      path = await this.crop.crop(uri, rect);
      cropped = true;
    } catch (e) {
      console.error('crop failed', e);
      const code = (e as { code?: string })?.code;
      if (code === 'UNSUPPORTED_FORMAT') {
        await this.toast('This image format is not supported.');
        return;
      }
      if (code === 'FILE_NOT_FOUND') {
        await this.toast('Could not read the photo.');
        return;
      }
      await this.toast('Could not crop the image. Using the full photo.');
    }
    this.previewSrc.set(cropped ? Capacitor.convertFileSrc(path) : this.cropSrc());
    this.previewPath.set(path);
    await this.recognizeFrom(path);
  }

  async useFullPhoto(): Promise<void> {
    const uri = this.cropUri;
    this.cropOpen.set(false);
    if (!uri) return;
    this.previewSrc.set(this.cropSrc());
    this.previewPath.set(uri);
    await this.recognizeFrom(uri);
  }

  async retake(): Promise<void> {
    this.cropOpen.set(false);
    this.cropUri = '';
    this.cropInfo = null;
    this.previewSrc.set('');
    this.previewPath.set('');
  }

  async onCropDismiss(): Promise<void> {
    this.cropOpen.set(false);
    this.cropUri = '';
    this.cropInfo = null;
  }

  private async capture(source: CaptureSource): Promise<void> {
    if (this.busy()) return;
    try {
      const result = await this.ocr.capture(source);
      if (!result?.uri) return;
      this.cropUri = result.uri;
      this.cropSrc.set(result.webPath ?? Capacitor.convertFileSrc(result.uri));
      this.rect.set({ ...INITIAL_RECT });
      this.status.set('recognizing');
      try {
        this.cropInfo = await this.crop.getSize(result.uri);
      } catch (e) {
        console.error('getInfo failed', e);
        await this.toast('Could not read the photo.');
        await this.recognizeFrom(result.uri);
        return;
      }
      this.status.set('idle');
      this.cropOpen.set(true);
    } catch (e) {
      console.error('capture failed', e);
      await this.toast('Could not capture the photo.');
      this.status.set('idle');
    }
  }

  private async recognizeFrom(uri: string): Promise<void> {
    this.status.set('recognizing');
    try {
      const text = await this.ocr.recognize(uri);
      if (!text) {
        await this.toast('No text found. You can type text manually.');
        return;
      }
      this.recognizedText.set(text);
      this.detectedLang.set(null);
    } catch (e) {
      console.error('recognize failed', e);
      await this.toast('Could not read the photo.');
    } finally {
      this.status.set('idle');
    }
  }

  private async speak(text: string, lang: LanguageOption, which: 'original' | 'translated'): Promise<void> {
    if (!text) return;
    const gen = ++this.speakGen;
    this.speakingWhich.set(which);
    this.status.set('speaking');
    try {
      await this.speech.speak(text, lang);
    } catch (e) {
      if (e instanceof Error && e.message === 'NO_VOICE') {
        await this.toast(`No voice installed for ${lang.label} on this device.`);
        void this.speech.offerInstall();
      } else {
        console.error('speak failed', e);
        await this.toast('Could not speak the text.');
      }
    } finally {
      if (this.speakGen === gen) {
        this.speakingWhich.set(null);
        this.status.set('idle');
      }
    }
  }

  private errorMessage(e: unknown, fallback: string): string {
    if (e instanceof Error && e.message.includes('timed out')) {
      return e.message;
    }
    return fallback;
  }

  private async toast(message: string, color: 'danger' | 'success' = 'danger'): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: color === 'success' ? 2000 : 3000,
      color,
      position: 'bottom',
    });
    await t.present();
  }
}
