#!/usr/bin/env node
/**
 * Regenerates Linguo brand image assets.
 *
 * Outputs:
 *   assets/icon-only.png        copy of the primary logo (launcher icon source)
 *   assets/icon-foreground.png  copy of the primary logo (adaptive icon layer)
 *   assets/icon-background.png  solid #e9eeff (adaptive icon background layer)
 *   assets/splash.png           #e9eeff canvas + secondary mascot at 48% width
 *   android/.../drawable-xxxhdpi/splash_icon.png
 *                               transparent canvas + secondary mascot at 66% width
 *                               (Android 12+ system splash icon, circle-mask safe)
 *
 * splash.png is deliberately small-centered: @capacitor/assets resizes it to
 * portrait/landscape templates with sharp's default cover fit (center crop),
 * which keeps only the central ~56% of a square source on portrait screens.
 *
 * Next: npx capacitor-assets generate --android
 */
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const primary = join(root, 'src/assets/icon/linguo-primary.png');
const secondary = join(root, 'src/assets/icon/linguo-secondary.png');
const bg = '#e9eeff';

await mkdir(join(root, 'assets'), { recursive: true });
await copyFile(primary, join(root, 'assets/icon-only.png'));
await copyFile(primary, join(root, 'assets/icon-foreground.png'));

await sharp({ create: { width: 1024, height: 1024, channels: 4, background: bg } })
  .png()
  .toFile(join(root, 'assets/icon-background.png'));

const splashSize = 2732;
const splashLogo = await sharp(secondary)
  .resize(Math.round(splashSize * 0.48))
  .png()
  .toBuffer();
await sharp({ create: { width: splashSize, height: splashSize, channels: 4, background: bg } })
  .composite([{ input: splashLogo, gravity: 'centre' }])
  .png()
  .toFile(join(root, 'assets/splash.png'));

const iconSize = 1024;
const iconLogo = await sharp(secondary)
  .resize(Math.round(iconSize * 0.66))
  .png()
  .toBuffer();
const resDir = join(root, 'android/app/src/main/res/drawable-xxxhdpi');
await mkdir(resDir, { recursive: true });
await sharp({
  create: { width: iconSize, height: iconSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: iconLogo, gravity: 'centre' }])
  .png()
  .toFile(join(resDir, 'splash_icon.png'));

console.log('Brand assets written to assets/ and android/app/src/main/res/drawable-xxxhdpi/splash_icon.png');
console.log('Next: npx capacitor-assets generate --android');
