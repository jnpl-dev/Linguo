import { Injectable, signal } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

import type { HistoryItem } from '../models/history-item';

const KEY = 'linguo_history';
const MAX_ITEMS = 50;
const IMAGE_DIR = 'linguo-history';

export type SaveResult = 'saved' | 'saved-no-image' | 'duplicate' | 'error';

export type NewEntry = Omit<HistoryItem, 'id' | 'createdAt' | 'image'> & {
  /** Raw file path/URI of the current photo (cache); copied into app storage when saving. */
  imageSource?: string;
};

@Injectable({ providedIn: 'root' })
export class HistoryService {
  readonly items = signal<HistoryItem[]>([]);
  private pendingItem = signal<HistoryItem | null>(null);

  constructor() {
    void this.load();
  }

  /** Adds an entry to the front of the list (max 50), copying the photo into app storage. */
  async add(entry: NewEntry): Promise<SaveResult> {
    const duplicate = this.items().some(
      (h) =>
        h.sourceText === entry.sourceText &&
        h.translatedText === entry.translatedText &&
        h.sourceLang === entry.sourceLang &&
        h.targetLang === entry.targetLang,
    );
    if (duplicate) return 'duplicate';

    const { imageSource, ...texts } = entry;
    const id = crypto.randomUUID();
    let image: string | undefined;
    let imageFailed = false;
    if (imageSource) {
      try {
        await this.ensureImageDir();
        const rel = `${IMAGE_DIR}/${id}.jpg`;
        await Filesystem.copy({ from: imageSource, to: rel, toDirectory: Directory.Data });
        image = rel;
      } catch (e) {
        console.error('history image copy failed', e);
        imageFailed = true;
      }
    }

    const next = [{ ...texts, id, createdAt: Date.now(), ...(image ? { image } : {}) }, ...this.items()];
    const dropped = next.slice(MAX_ITEMS);
    this.items.set(next.slice(0, MAX_ITEMS));
    for (const old of dropped) {
      if (old.image) await this.deleteImage(old.image);
    }

    try {
      await this.persist();
    } catch (e) {
      console.error('history save failed', e);
      this.items.set(this.items().filter((h) => h.id !== id));
      if (image) await this.deleteImage(image);
      return 'error';
    }
    return imageFailed ? 'saved-no-image' : 'saved';
  }

  async remove(id: string): Promise<void> {
    const item = this.items().find((h) => h.id === id);
    this.items.set(this.items().filter((h) => h.id !== id));
    try {
      await this.persist();
    } catch (e) {
      console.error('history remove failed', e);
    }
    if (item?.image) await this.deleteImage(item.image);
  }

  /** Removes many entries with a single persist; deletes their image files. */
  async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    const removed = this.items().filter((h) => idSet.has(h.id));
    this.items.set(this.items().filter((h) => !idSet.has(h.id)));
    try {
      await this.persist();
    } catch (e) {
      console.error('history removeMany failed', e);
    }
    for (const item of removed) {
      if (item.image) await this.deleteImage(item.image);
    }
  }

  /** Resolves a stored image path to a full file URI, or null when the file is gone. */
  async resolveImage(rel: string): Promise<string | null> {
    try {
      const { uri } = await Filesystem.getUri({ path: rel, directory: Directory.Data });
      return uri;
    } catch (e) {
      console.error('history image resolve failed', e);
      return null;
    }
  }

  /** Queues an item for the Translate form; consumed by the next ionViewWillEnter. */
  setPending(item: HistoryItem): void {
    this.pendingItem.set(item);
  }

  takePending(): HistoryItem | null {
    const item = this.pendingItem();
    this.pendingItem.set(null);
    return item;
  }

  private async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: KEY });
      if (!value) return;
      const parsed = JSON.parse(value);
      this.items.set(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error('history load failed', e);
      this.items.set([]);
    }
  }

  private async persist(): Promise<void> {
    await Preferences.set({ key: KEY, value: JSON.stringify(this.items()) });
  }

  private async ensureImageDir(): Promise<void> {
    try {
      await Filesystem.mkdir({ path: IMAGE_DIR, directory: Directory.Data, recursive: true });
    } catch (e) {
      if ((e as { code?: string })?.code !== 'OS-PLUG-FILE-0010') throw e;
    }
  }

  private async deleteImage(rel: string): Promise<void> {
    try {
      await Filesystem.deleteFile({ path: rel, directory: Directory.Data });
    } catch (e) {
      if ((e as { code?: string })?.code !== 'OS-PLUG-FILE-0008') {
        console.error('history image delete failed', e);
      }
    }
  }
}
