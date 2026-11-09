# docs/splash-screens-and-icons.md — Splash screens and app icons (@capacitor/assets)

Reference for the AI agent. Written from the official Capacitor v8 guide on 2026-11-09. Source: https://capacitorjs.com/docs/guides/splash-screens-and-icons
Related: `docs/splash-screen.md` (the `@capacitor/splash-screen` plugin that shows and hides the splash). This file is about **creating the image assets** for the splash screen and the app icon.
Rule: if this file disagrees with the installed tool's own help (`npx capacitor-assets --help`), the tool's help wins. Record the difference in `progress.md`.

## Facts
- `@capacitor/assets` is a command-line tool that generates icon and splash screen images for iOS, Android, and PWA projects from a few source images.
- It is a **development tool**, installed as a dev dependency. It is not a runtime plugin and adds nothing to the app's code.
- Linguo targets Android only. Use the `--android` flag so only the Android project is changed.
- It is **not** in `tech-stack.md`'s approved list. Ask the user before installing it.
- The user supplies the source images. Do not create or invent artwork unless the user asks for it.

## Install
```bash
npm install @capacitor/assets --save-dev
```

## Source images
Create a folder named `assets` in the **project root** (next to `package.json`) with this structure:
```text
assets/
├── icon-only.png
├── icon-foreground.png
├── icon-background.png
├── splash.png
└── splash-dark.png
```
| File | Minimum size | Notes |
| --- | --- | --- |
| `icon-only.png` | 1024 x 1024 px | App icon |
| `icon-foreground.png` | 1024 x 1024 px | Foreground layer of the icon (for Android adaptive icons) |
| `icon-background.png` | 1024 x 1024 px | Background layer of the icon (for Android adaptive icons) |
| `splash.png` | 2732 x 2732 px | Splash screen image |
| `splash-dark.png` | 2732 x 2732 px | Splash screen image for dark mode |

- Format: `png` or `jpg`.
- Sizes are minimums; larger square images are fine.
- The page lists the file names and sizes. The "(for Android adaptive icons)" and "dark mode" descriptions are general knowledge, not stated on the page; verify with `npx capacitor-assets --help` if in doubt.

## Generate
```bash
npx capacitor-assets generate --android
```
- Without a platform flag it generates for every platform; the page lists the flags `--ios`, `--android`, and `--pwa`. Linguo uses `--android` only.
- The tool applies the generated images to the native project (for PWA it generates a manifest file).
- Other options may exist. Run `npx capacitor-assets generate --help` to see them; do not guess flags.

After generating:
```bash
npx cap sync android
```
Then rebuild and run on the phone: `npx cap run android`.
(Tip, not from the docs: if the old icon still shows, uninstall the app from the phone and reinstall; launchers sometimes cache icons.)

## Android 12+ splash behavior
- On Android 12 and above, Google changed how splash screens work: the system shows a **smaller icon on a colored background**, not a full-screen image.
- A full-screen splash image (`splash.png`) is only possible on Android 11 and older.
- So on modern phones, the visible launch splash is driven by the app icon and the Android theme, as described in `docs/splash-screen.md`. Do not expect `splash.png` to fill the screen on Android 12+.
- Google's documentation: https://developer.android.com/develop/ui/views/launch/splash-screen

## Linguo design guidance (project decisions)
- App name on the icon label: **Linguo** (set in Capacitor config and Android resources at project creation; do not change here).
- Colors: use the accent/background colors from `design.md` (pale blue `#E9EEFF` background, per the 2026-11-09 amendment; the original teal `#0D9488` is obsolete) as the icon background or splash background so the launch experience matches the app.
- Keep the icon simple: one clear symbol (for example a speech bubble or a letter "L") with plenty of empty space around it. Android crops adaptive icons into shapes, so keep the important part near the center (general guidance, not from the Capacitor docs).
- Provide a dark variant (`splash-dark.png`) only if the user wants one; otherwise reuse the light image or skip dark mode.
- Do not use real brand logos, copyrighted images, or screenshots of other apps.

## Agent workflow for this task
1. Confirm with the user that they want custom icon and splash images, and that `@capacitor/assets` may be installed.
2. Ask the user for the source images, or to confirm where they are. Do not generate artwork.
3. Create/verify the `assets/` folder and file names and sizes. Report any missing or undersized files instead of continuing.
4. Install the dev dependency, run `npx capacitor-assets generate --android`, then `npx cap sync android`.
5. Ask the user to run the app on the phone and confirm the new icon and launch splash.
6. Update `progress.md` (what was generated, any warnings) and stop.

## Still to verify on device
- That the new icon appears on the home screen and in the app drawer.
- What the launch splash looks like on the test phone's Android version (see `docs/splash-screen.md` for the Android 12 / 12L launcher caveat).
- That the build still succeeds after generating assets.
