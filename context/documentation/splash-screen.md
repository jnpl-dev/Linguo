# docs/splash-screen.md — @capacitor/splash-screen

Reference for the AI agent. Written from the official Capacitor v8 docs on 2026-11-09. Source: https://capacitorjs.com/docs/apis/splash-screen
Rule: if this file disagrees with the installed package's type definitions in `node_modules/@capacitor/splash-screen/`, the installed types win. Record the difference in `progress.md`.

## Facts
- Shows and hides the splash screen. It is shown automatically at app launch and hides itself after a short time.
- Linguo targets Android only. iOS-only options below do not apply.
- **This plugin does not create splash images.** It only controls showing and hiding. Image/icon assets live in the Android project (see "Assets").
- Not yet part of Linguo's approved dependency list in `tech-stack.md`. Check that file before installing; if it is not listed, ask the user first.

## Install
```bash
npm install @capacitor/splash-screen
npx cap sync android
```
Check whether the package is already installed (`npm ls @capacitor/splash-screen`) before installing.
After changing splash options in `capacitor.config.ts` or native resources, run `npx cap sync android` and rebuild the app.

## Android 12+ behavior (important)
- Capacitor uses the **Android 12 Splash Screen API** and the `androidx.core:core-splashscreen` compatibility library (so it also works on Android 11 and below). The Android 12+ system splash **cannot be disabled** (it is part of the OS).
- The Android theme `AppTheme.NoActionBarLaunch` in `android/app/src/main/res/values/styles.xml` controls the launch splash. By default its parent is `Theme.SplashScreen`.
- Customizing the **launch** splash (icon, background) on Android 12+ is done through that Android theme (see https://developer.android.com/guide/topics/ui/splash-screen), **not** through the config options below.
- Because of this, many config options **do not apply at launch**. See the table's last column.
- To use the older, image-based launch splash instead, change the parent of `AppTheme.NoActionBarLaunch` from `Theme.SplashScreen` to `AppTheme.NoActionBar` and set a background drawable:
  ```xml
  <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
      <item name="android:background">@drawable/splash</item>
  </style>
  ```
  The compat library is then disabled; on Android 12+ the OS splash still cannot be disabled. Do not make this change unless the user asks.
- The programmatic `show()` method does not use the Android 12 API (it uses the configured image/resource).
- Known Android 12 / 12L issue: the splash image may not appear when the app is launched from third-party launchers (for example Nova, MIUI, Realme, OPPO), from the Settings app info screen, or from IDEs such as Android Studio. Google fixed this on Android 13 but did not backport it. If the splash looks missing while testing from Android Studio, this is likely the cause, not a bug in the app.
- Optional Android project variable in `variables.gradle`: `coreSplashScreenVersion` (default `1.2.0`).

## Configuration (`capacitor.config.ts` → `plugins.SplashScreen`)
| Option | Type | Default | Applies at launch on Android 12+? | Description |
| --- | --- | --- | --- | --- |
| `launchShowDuration` | number (ms) | `500` | Yes | How long to show the launch splash when `launchAutoHide` is true |
| `launchAutoHide` | boolean | `true` | Yes | Hide automatically after `launchShowDuration` |
| `launchFadeOutDuration` | number (ms) | `200` | Yes (Android 12 API only) | Fade-out duration of the launch splash |
| `backgroundColor` | string `#RRGGBB` or `#RRGGBBAA` | none | **No** | Background behind the splash. Ignored if `useDialog` is true |
| `androidSplashResourceName` | string | `splash` | **No** | Name of the drawable used as the splash image |
| `androidScaleType` | `'CENTER' \| 'CENTER_CROP' \| 'CENTER_INSIDE' \| 'FIT_CENTER' \| 'FIT_END' \| 'FIT_START' \| 'FIT_XY' \| 'MATRIX'` | `FIT_XY` | **No** | How the splash image is scaled |
| `showSpinner` | boolean | none | **No** | Show a spinner on the splash |
| `androidSpinnerStyle` | `'horizontal' \| 'small' \| 'large' \| 'inverse' \| 'smallInverse' \| 'largeInverse'` | `large` | **No** | Android spinner style |
| `spinnerColor` | string hex | none | **No** | Spinner color |
| `splashFullScreen` | boolean | none | **No** | Hide the status bar on the splash |
| `splashImmersive` | boolean | none | **No** | Hide status bar and navigation buttons on the splash |
| `layoutName` | string | none | **No** | Use a custom layout (or a dialog layout if `useDialog` is true) |
| `useDialog` | boolean | none | **No** | Show the splash in a Dialog instead of an ImageView |
| `iosSpinnerStyle` | `'small' \| 'large'` | `large` | iOS only | Not used in Linguo |

"No" means: on Android 12+ these options have no effect on the splash shown at app launch. They only matter for the programmatic `show()` splash.

### Example config for Linguo
```ts
/// <reference types="@capacitor/splash-screen" />

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // keep the existing appId, appName, and webDir values
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1000,
      launchFadeOutDuration: 200,
      backgroundColor: '#e9eeff',   // matches the pale-blue bg in design.md (amended 2026-11-09); does not apply at launch on Android 12+
    },
  },
};

export default config;
```
Merge this into the existing `capacitor.config.ts`; do not replace other settings. (The same options work in `capacitor.config.json` under `"plugins": { "SplashScreen": { ... } }`.)

## API
```ts
import { SplashScreen } from '@capacitor/splash-screen';
```
| Method | Signature |
| --- | --- |
| `show` | `show(options?: ShowOptions): Promise<void>` |
| `hide` | `hide(options?: HideOptions): Promise<void>` |

| `ShowOptions` property | Type | Default | Description |
| --- | --- | --- | --- |
| `autoHide` | boolean | none | Hide automatically after `showDuration` |
| `fadeInDuration` | number (ms) | `200` | Fade-in time |
| `fadeOutDuration` | number (ms) | `200` | Fade-out time |
| `showDuration` | number (ms) | `3000` | How long to show when `autoHide` is true |

| `HideOptions` property | Type | Default | Description |
| --- | --- | --- | --- |
| `fadeOutDuration` | number (ms) | `200` | Fade-out time. **Not used on Android with the Android 12 API**; use `launchFadeOutDuration` in the config instead |

```ts
await SplashScreen.hide();                                   // hide now
await SplashScreen.show({ autoHide: false });                // show until hidden manually
await SplashScreen.show({ showDuration: 2000, autoHide: true });
```

## Hiding the splash
- By default the splash hides automatically after 500 ms.
- To keep it visible until the app is ready, set `launchAutoHide: false` and call `SplashScreen.hide()` as soon as the app is ready. The docs say to call `hide()` as soon as possible for the best user experience.
- To show it for a fixed time, set `launchShowDuration` in the Capacitor config.

### Linguo guidance
- Prefer the simple option: `launchAutoHide: true` with a short `launchShowDuration` (about 1000 ms). No code is needed.
- Only use manual hiding if the first screen shows empty content while loading. In that case, in `app.component.ts` (standalone component), call `await SplashScreen.hide()` after startup work finishes (for example after `HistoryService.load()`), wrapped in try/catch:
  ```ts
  async ngOnInit(): Promise<void> {
    try {
      await this.history.load();
    } finally {
      await SplashScreen.hide().catch(() => {});
    }
  }
  ```
  Never leave the splash stuck: always hide in `finally`.
- Do not use `showSpinner`, `useDialog`, or custom layouts. They do not apply at launch on Android 12+ and add complexity.
- Do not use `SplashScreen.show()` from app code in Linguo; the launch splash is enough.

## Assets (not covered by this plugin)
- Default resource name is `splash` (in `android/app/src/main/res/drawable*`). To use another name, set `androidSplashResourceName` and update the drawable name in `styles.xml` as shown above.
- On Android 12+ the launch splash uses the Android theme in `styles.xml` and the app icon, so changing the splash look means changing the theme and icon, not this plugin's config.
- Capacitor docs link to guides for adding icons and splash images: https://www.joshmorony.com/adding-icons-splash-screens-launch-images-to-capacitor-projects/ . If an asset-generation tool is needed, ask the user before adding any dependency.

## Still to verify on device
- The test phone's Android version (the Android 12 / 12L launcher issue above).
- That the launch splash appears and hides after about the configured duration.
- What the launch splash looks like with the default theme, and whether the user wants it changed.
