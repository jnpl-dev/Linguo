import { Injectable } from '@angular/core';
import { ImageFormat, PhotoManipulator } from '@capawesome/capacitor-photo-manipulator';

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class CropService {
  /** Image dimensions in source pixels (EXIF orientation already applied). */
  async getSize(uri: string): Promise<{ width: number; height: number }> {
    const info = await PhotoManipulator.getInfo({ path: uri });
    return { width: info.width, height: info.height };
  }

  /** Crops the image and returns the cache file path of the result. */
  async crop(uri: string, rect: CropRect): Promise<string> {
    const { path } = await PhotoManipulator.transform({
      path: uri,
      crop: {
        x: Math.max(0, Math.round(rect.x)),
        y: Math.max(0, Math.round(rect.y)),
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      },
      format: ImageFormat.Jpeg,
      quality: 0.9,
    });
    return path;
  }
}
