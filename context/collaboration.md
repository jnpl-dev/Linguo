# collaboration.md — Linguo

Guide for everyone working on this app. Read this first, then `context/agents.md` (the standing rules the AI agent follows — they apply to humans too). Keep code, docs, and behavior in sync: when you change behavior, update `design.md`, `architecture.md`, `testing.md`, and `progress.md` in the same change.

## 1. What this is

Linguo is an offline-first Android camera translator built with **Ionic 9 (standalone components, signals) + Angular 22 + Capacitor 8**: photo → ML Kit OCR → on-device ML Kit translation → text-to-speech → local history.

- App ID: `com.yourname.linguo`, app name: `Linguo`. **Never change either.**
- Two screens only: `translate` (main) and `history`.
- No backend, no `HttpClient`, no database. Storage = Capacitor Preferences (history JSON) + app-private files (history photos).

## 2. Prerequisites

| Tool | Notes |
| --- | --- |
| Node.js LTS (20.19+ / 22+) | `node -v` |
| npm | comes with Node |
| JDK 17+ | this project builds with JDK 24 (`C:\Program Files\Java\jdk-24` on the reference machine) |
| Android Studio (or standalone Android SDK) | provides SDK, platform-tools (adb), build-tools |
| A physical Android phone | ML Kit, camera, and TTS do not work in a browser/emulator |

Set these two environment variables before any Gradle build (reference machine is Windows; adjust paths for your OS):

```bash
export JAVA_HOME="C:\Program Files\Java\jdk-24"
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
```

## 3. Get the code and install

```bash
git clone https://github.com/jnpl-dev/Linguo.git
cd Linguo
npm install
```

**Important:** `npm install` runs `postinstall: patch-package`, which applies `patches/@capacitor-mlkit+translation+8.2.2.patch`. That patch removes a `requireWifi()` call that otherwise blocks every model download on non-Wi-Fi devices. If you ever see `patch-package` errors on install, stop and fix them — do not run with `--ignore-scripts`, or model downloads will hang.

Sanity check afterwards:

```bash
npm ls --depth=0        # installed versions
ls patches/             # the translation patch must exist
```

Useful scripts (see `package.json`):

```bash
npm start               # dev server at http://localhost:4200 (browser preview only — native plugins won't work)
npm run build           # production build into www/
npm run lint            # eslint + e2e typecheck + prettier check  (run before every commit)
npm run lint:fix        # autofix lint/format issues
npm run test:unit       # vitest unit tests
npm run test:e2e        # Playwright e2e (starts its own dev server)
```

## 4. USB debugging setup (first time on a new phone)

1. Phone → **Settings → About phone** → tap **Build number** 7 times → "You are now a developer".
2. **Settings → System → Developer options** → enable **USB debugging** (and **OEM unlocking** if the brand asks).
3. Plug the phone in with a data cable. On the phone, accept **"Allow USB debugging?"** (check "Always allow from this computer").
4. Verify:

```bash
adb devices
```

The device must show `device` (not `unauthorized` / `offline`).

**Wireless adb (optional):** Developer options → **Wireless debugging** → pair/connect, or with the phone on the same network:

```bash
adb connect <phone-ip>:5555     # IP changes when the hotspot/router restarts
```

**Git Bash on Windows quirk:** some `adb shell` arguments contain paths that MSYS mangles. Prefix them with `MSYS_NO_PATHCONV=1`, e.g. `MSYS_NO_PATHCONV=1 adb shell ls /data`.

## 5. Build and run on the phone

```bash
npm run build            # 1. build the web app
npx cap sync android     # 2. copy www/ + plugin config into android/
cd android               # 3. build + install the debug APK
./gradlew installDebug
```

(On Windows use `gradlew.bat` or `./gradlew` from Git Bash with `JAVA_HOME`/`ANDROID_HOME` exported as above. Android Studio: `npx cap open android`, then Run ▶.)

Then launch **Linguo** from the phone's app drawer — the debug APK is signed with a debug key, so it installs alongside any previous debug build.

Every native-facing change needs steps 1–3 again. Web-only edits just need a rebuild.

## 6. Project rules — read before coding

1. Read `context/progress.md` (current status), then `context/implementation-plan.md` (next task).
2. Before calling any Capacitor/ML Kit plugin, read its API file in `context/documentation/` **and** verify against the types in `node_modules/<package>/`. Installed types win over docs; note any difference in `progress.md`.
3. Every user-facing failure shows an Ionic toast. Never swallow an error silently.
4. Only packages listed in `context/tech-stack.md`. Ask before adding any dependency.
5. UI must follow `context/design.md` — Ionic components only, no Tailwind/Material/custom fonts.
6. Code style: standalone components, `signal`/`computed` state, `inject()`, `async/await`, TypeScript strict, explicit return types on public service methods, try/catch around every plugin call.
7. Run `npm run lint` before you commit; it must exit clean.

File layout: pages in `src/app/pages/<page>/`, services in `src/app/services/`, models in `src/app/models/`.

## 7. Git workflow

```bash
git status                 # always before committing
git checkout -b fix/short-description
git add <files>            # stage deliberately — never `git add .` blindly
git commit -m "fix: short imperative summary"
git push -u origin fix/short-description
```

- Do not commit build output (`www/`, `.angular/`), IDE files, `node_modules/`, or secrets. Check `.gitignore` covers a file before adding it.
- `patches/` **must** be committed — without it a fresh clone cannot download models.
- Keep commits small and scoped to one change; update the relevant `context/*.md` files in the same commit.

## 8. Testing on the device

`context/testing.md` is the checklist. After a behavior change, run the rows you affected and record Pass/Fail in `progress.md`. Native-only flows (camera, OCR, model download, TTS, history persistence) must be tested on the real phone.

Notes for the test phone used in this project (Vivo):
- `logcat` is blocked by the ROM — diagnose via toasts, `uiautomator dump`, and Chrome DevTools.
- To debug the WebView: enable USB debugging, then from the machine `adb forward tcp:9222 localabstract:webview_devtools_remote_<pid>` and open `chrome://inspect`. The port must be re-forwarded after every app restart.
- Model downloads can stall while the phone reports a thermal restriction; `adb shell cmd thermalservice override-status 1` lifts it during testing — always reset afterwards with `adb shell cmd thermalservice reset`.

## 9. Docs map (keep them truthful)

| File | What it holds |
| --- | --- |
| `context/progress.md` | current status, decisions, open questions — update every session |
| `context/implementation-plan.md` | task list with tick boxes |
| `context/design.md` | UI rules and per-screen layout — read before UI work |
| `context/architecture.md` | services, data flow, screen behavior |
| `context/tech-stack.md` | allowed packages, config, language codes |
| `context/testing.md` | device test checklist |
| `context/agents.md` | standing rules for the AI agent (also the project's ground rules) |
| `context/concept.md` | original course brief (amended where scope changed) |
| `context/documentation/` | per-plugin API references |
