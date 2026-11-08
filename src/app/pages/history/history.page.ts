import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmarkDone, close, trash } from 'ionicons/icons';

import type { HistoryItem } from '../../models/history-item';
import { LANGUAGES } from '../../models/language';
import { HistoryService } from '../../services/history.service';

addIcons({ trash, close, checkmarkDone });

/** Hold duration before selection mode opens. */
const HOLD_MS = 500;
/** Pointer travel (px) that cancels a hold (scroll/accidental move). */
const HOLD_MOVE_PX = 10;

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [
    DatePipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonContent,
    IonList,
    IonItemSliding,
    IonItem,
    IonLabel,
    IonItemOptions,
    IonItemOption,
    IonCheckbox,
  ],
})
export class HistoryPage {
  private history = inject(HistoryService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly items = this.history.items;

  /** True while long-press selection mode is open (checkboxes visible). */
  readonly selecting = signal(false);
  private readonly selectedIds = signal<Set<string>>(new Set());

  readonly selectedCount = computed(() => this.selectedIds().size);

  /** Long-press state. */
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private holdStart: { x: number; y: number } | null = null;
  /** Set when a hold fired, so the following click does not open the entry. */
  private holdFired = false;

  label(code: string): string {
    return LANGUAGES.find((l) => l.mlkitCode === code)?.label ?? code;
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  allSelected(): boolean {
    return this.items().length > 0 && this.selectedIds().size === this.items().length;
  }

  open(item: HistoryItem): void {
    if (this.holdFired) {
      this.holdFired = false;
      return;
    }
    if (this.selecting()) {
      this.toggle(item);
      return;
    }
    this.history.setPending(item);
    void this.router.navigate(['/translate']);
  }

  onItemPointerDown(event: PointerEvent, item: HistoryItem): void {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    this.holdStart = { x: event.clientX, y: event.clientY };
    this.holdTimer = setTimeout(() => {
      this.holdTimer = null;
      this.holdStart = null;
      this.holdFired = true;
      this.enterSelection(item);
    }, HOLD_MS);
  }

  onItemPointerMove(event: PointerEvent): void {
    if (!this.holdTimer || !this.holdStart) return;
    const dx = event.clientX - this.holdStart.x;
    const dy = event.clientY - this.holdStart.y;
    if (Math.hypot(dx, dy) > HOLD_MOVE_PX) this.cancelHold();
  }

  onItemPointerUp(): void {
    this.cancelHold();
  }

  /** Enters selection mode with the held item checked. */
  private enterSelection(item: HistoryItem): void {
    this.selectedIds.set(new Set([item.id]));
    this.selecting.set(true);
  }

  private cancelHold(): void {
    if (this.holdTimer) clearTimeout(this.holdTimer);
    this.holdTimer = null;
    this.holdStart = null;
  }

  toggle(item: HistoryItem): void {
    const next = new Set(this.selectedIds());
    if (next.has(item.id)) next.delete(item.id);
    else next.add(item.id);
    this.selectedIds.set(next);
    if (next.size === 0) this.exitSelection();
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.exitSelection();
      return;
    }
    this.selectedIds.set(new Set(this.items().map((h) => h.id)));
  }

  exitSelection(): void {
    this.selecting.set(false);
    this.selectedIds.set(new Set());
  }

  async confirmDeleteSelected(): Promise<void> {
    const count = this.selectedCount();
    if (count === 0) return;
    const alert = await this.alertCtrl.create({
      header: `Delete ${count} ${count === 1 ? 'entry' : 'entries'}?`,
      message: 'The selected translations will be removed.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteSelected();
          },
        },
      ],
    });
    await alert.present();
  }

  private async deleteSelected(): Promise<void> {
    const ids = [...this.selectedIds()];
    await this.history.removeMany(ids);
    this.exitSelection();
    await this.toast(`${ids.length} ${ids.length === 1 ? 'entry' : 'entries'} deleted.`, 'success');
  }

  async remove(item: HistoryItem): Promise<void> {
    await this.history.remove(item.id);
    await this.toast('Entry deleted.', 'success');
  }

  private async toast(message: string, color: 'danger' | 'success' = 'danger'): Promise<void> {
    const t = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await t.present();
  }
}
