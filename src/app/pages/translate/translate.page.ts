import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { OcrService, type CaptureSource } from '../../services/ocr.service';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.page.html',
  styleUrls: ['./translate.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, RouterLink],
})
export class TranslatePage {
  private ocr = inject(OcrService);
  private toastCtrl = inject(ToastController);

  photoStatus = signal<string>('No photo yet.');

  takePhoto(): Promise<void> {
    return this.capture('camera');
  }

  chooseFromGallery(): Promise<void> {
    return this.capture('gallery');
  }

  private async capture(source: CaptureSource): Promise<void> {
    try {
      const result = await this.ocr.capture(source);
      if (!result) {
        this.photoStatus.set('Cancelled.');
        return;
      }
      this.photoStatus.set(result.uri ?? 'Photo returned, but no URI.');
    } catch (e) {
      console.error('capture failed', e);
      const toast = await this.toastCtrl.create({
        message: 'Could not capture the photo.',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }
}
