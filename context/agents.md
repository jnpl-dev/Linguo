# agents.md — Linguo

You are building **Linguo**, a basic Android camera translator, using Ionic Angular + Capacitor.
This file is your standing instructions. Read it at the start of every session.

## 1. What the app does
Flow: **capture photo → recognize text (OCR) → translate on-device → speak → save to history**.
Two screens: `translate` (main) and `history`. This is a small school project meant to be built in about one day. Prefer the simplest working solution.

## 2. Required reading order (every session)
1. `progress.md` — current status and next task.
2. `implementation-plan.md` — find the first unchecked task.
3. Read other files only as needed:
   - `concept.md` — product intent and scope.
   - `architecture.md` — folders, services, data flow, screens.
   - `tech-stack.md` — allowed packages, config, language codes.
   - `testing.md` — device test checklist.
   - `design.md` — UI rules (theme, layout, states). Read BEFORE any UI work.
   - `docs/` — API reference per plugin: `camera.md`, `text-recognition.md`, `translation.md`, `text-to-speech.md`, `preferences.md`. Read the relevant file BEFORE writing any code that calls that plugin.

## 3. Session protocol
1. Do exactly ONE task from `implementation-plan.md`.
2. Verify its "Done when" condition. If it requires a physical device, tell the user what to test and wait.
3. Tick the task box in `implementation-plan.md`.
4. Update `progress.md` (done, bugs, open questions, next task).
5. STOP and report in 2–4 sentences. Do NOT start the next task unless asked.

## 4. Hard rules (MUST / MUST NOT)
- MUST target Android only.
- MUST use only the packages listed in `tech-stack.md`. MUST ask before adding any other dependency.
- MUST NOT add a backend, `HttpClient`, online translation APIs, SQLite, or any database.
- MUST NOT add auto language detection, live camera translation, handwriting recognition, or non-Latin-script languages.
- MUST NOT store captured images. Only text is saved.
- MUST NOT guess plugin method names or options. Before using a plugin, read its file in `docs/`, then verify against the type definitions in `node_modules/<package>/`. If they differ, the installed types win; record the difference in `progress.md`.
- MUST NOT use deprecated Camera methods (`getPhoto`, `pickImages`). Use `takePhoto` and `chooseFromGallery` (see `docs/camera.md`).
- MUST NOT invent behavior that is listed as an open question in `progress.md`. Test it, or ask the user.
- MUST NOT silently swallow errors. Show an Ionic toast for every user-facing failure.
- MUST NOT refactor unrelated code while doing a task.
- If a task is blocked (plugin incompatibility, build failure, missing device capability), STOP and report the exact error and options. Do not invent a workaround that violates these rules.

## 5. Code conventions
- Angular **standalone components only**. No NgModules.
- **Signals** (`signal`, `computed`) for state. Use `inject()` for dependency injection.
- Use `async/await` for Capacitor calls. Avoid RxJS unless a library requires it.
- Import Ionic components from `@ionic/angular/standalone`. Register icons with `addIcons`.
- TypeScript strict mode. Explicit return types on all public service methods.
- File layout: see `architecture.md`. Services in `src/app/services/`, pages in `src/app/pages/`, types in `src/app/models/`.
- Wrap every Capacitor plugin call in try/catch.
- Keep components small. Put logic in services, not in templates.
- UI work MUST follow `design.md`. Use only Ionic components; do not add other UI libraries.

## 6. Commands
- Install dependencies: `npm install`
- Browser preview (UI only; native plugins will not work): `ionic serve`
- Build and sync: `ionic build && npx cap sync android`
- Run on device (USB debugging on): `npx cap run android`
- Open Android Studio: `npx cap open android`
- List installed versions: `npm ls --depth=0`

## 7. Environment facts
- Native features (camera, ML Kit, text-to-speech) work only on a real Android device. The user tests on a phone; you cannot.
- The first translation for a language needs internet to download its model (about 30 MB). After that, translation works offline.
- App ID: `com.yourname.linguo`. App name: `Linguo`. Do not change either after project creation.

## 8. Definition of done (whole project)
See `concept.md` section 11 and `testing.md`. Every item in the `testing.md` checklist passes on a real device, including with airplane mode on.

## 9. Skills
Installed skills: `capacitor-plugins`, `ionic-angular`, `ionic-design`.
- Use `capacitor-plugins` when installing or configuring a Capacitor plugin.
- Use `ionic-angular` when working on Ionic/Angular structure, navigation, or lifecycle hooks.
- Use `ionic-design` when building or changing UI, together with `design.md`.
- Priority: `agents.md`, `tech-stack.md`, and `design.md` ALWAYS override a skill. If a skill suggests a package, version, library, or feature that is not allowed in `tech-stack.md` or is forbidden in `agents.md` or `design.md`, ignore that suggestion and tell the user.
- Skills do not replace reading the relevant file in `docs/` and the type definitions in `node_modules/<package>/` before using a plugin.
