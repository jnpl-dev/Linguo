# progress.md — Linguo

Read this at the start of every session. Update it at the end of every session (see `agents.md` section 3).

## Status
- Current phase: 2 (in progress)
- Last completed task: 2.1
- Next task: 2.2 (DEVICE)

## Installed versions
Fill in after task 1.2 with `npm ls --depth=0`.
- Ionic: @ionic/angular 9.0.10
- Angular: 22.2.3
- Capacitor: @capacitor/core 8.6.0
- @capacitor/camera: 8.2.6
- @capacitor-mlkit/text-recognition: 8.2.2
- @capacitor-mlkit/translation: 8.2.2
- @capacitor-community/text-to-speech: 8.0.2
- @capacitor/preferences: 8.0.1

## Test device
- Phone model: Vivo V2301A (adb serial 10AE2P16UF005UG)
- Android version: 16 (API 36)

## Completed tasks
Append one line per task: `date — task id — short note`.
- 2026-11-06 — install-skills — installed capacitor-plugins and ionic-angular (project scope)
- 2026-11-06 — install-skills — installed ionic-design (project scope)
- 2026-11-06 — 1.1 — project scaffolded (pre-existing); set appId com.yourname.linguo, installed @capacitor/android@8.6.0, added android platform, `ionic build && npx cap sync android` succeeded
- 2026-11-06 — 1.2 (partial) — five plugins installed and verified against node_modules types; TTS `<queries>` added to AndroidManifest.xml; `npx cap sync android` lists all five; Gradle build blocked by missing JDK 21 (see B1)
- 2026-11-06 — 1.2 — done: sync lists all five plugins, `gradlew assembleDebug` BUILD SUCCESSFUL (APK 117 MB at android/app/build/outputs/apk/debug/); versions recorded above
- 2026-11-06 — 1.3 — blank app installed and launched on Vivo V2301A (verified: PID running, .MainActivity foreground)
- 2026-11-06 — 1.4 — folder structure created (models, services skeletons, pages/translate + pages/history), routes `''→translate`, `history`; starter `home/` removed; `LANGUAGES` constant + `HistoryItem` defined; e2e test rewritten for navigation and passing (Playwright chromium installed); build + unit tests pass
- 2026-11-06 — 2.1 — OcrService.capture() (takePhoto/chooseFromGallery, cancel→null, errors→toast) + temporary test buttons; verified on device: photo, gallery, and cancel all behave correctly

## In progress
(none)

## Bugs and issues
Format: `id — description — status (open/fixed) — fix`.
- B1 — Gradle build fails: all five plugins require a Java 21 toolchain (`kotlin { jvmToolchain(21) }` / `VERSION_21`), machine has only JDK 22, 24, and Android Studio JBR 25 (Gradle 8.14.3 rejects Java 25: "Unsupported class file major version 69"). Error: "Cannot find a Java installation ... matching: {languageVersion=21} ... Toolchain download repositories have not been configured." — status: **fixed** — fix: added `org.gradle.toolchains.foojay-resolver-convention` 1.0.0 to `android/settings.gradle`; Gradle auto-provisioned Temurin 21 into `~/.gradle/jdks`. `assembleDebug` now BUILD SUCCESSFUL.

## Open questions (answer by testing on device; do not guess)
- [ ] Q1: What image input does the OCR plugin accept (file path vs base64)? → Answer:
- [ ] Q2: Does the translation plugin report model download progress? → Answer:
- [ ] Q3: Which TTS language tag works for Tagalog on the test phone (`fil-PH`, `tl-PH`, none)? → Answer:
- [ ] Q4: Are all five plugins compatible with the installed Capacitor major version? → Answer:
- [ ] Q5: Do all six languages in `tech-stack.md` section 4 translate correctly with the plugin's `Language` enum? → Answer:

## Differences between docs and real plugin APIs
Record any place where a plugin's real API differs from `architecture.md` or `tech-stack.md`.
- `agents.md` section 5 says import Ionic components from `@ionic/angular/standalone`, but Ionic 9.0.10 has no `./standalone` export (verified in node_modules). The official starter and the `ionic-design` skill import from `@ionic/angular` instead — this is the path that compiles; use it.
- Capacitor 8: `npx cap add android` fails until `@capacitor/android` is installed via npm (done in task 1.1).
- `architecture.md` §5 says `capture(): Promise<Photo | null>` opens a camera/gallery "source prompt". The installed Camera plugin 8.2.6 removed `CameraSource.Prompt` and `getPhoto` (deprecated) — real API is `takePhoto()` / `chooseFromGallery()` (`MediaResult`, `uri?: string`). Implemented `capture(source: 'camera' | 'gallery'): Promise<MediaResult | null>`; cancel error codes return `null`.

## Notes for next session
- Skills installed at `.agents/skills/capacitor-plugins/` and `.agents/skills/ionic-angular/` (project scope, copied not symlinked). Security scan: Safe / 0 Socket alerts / Low Snyk risk. `capacitor-plugins` SKILL.md mentions optional Capawesome MCP servers and a licensed npm registry auth token — not needed for this project; ignore per `agents.md` section 9.
- `ionic-design` installed at `.agents/skills/ionic-design/` (from `cap-go/capacitor-skills`, project scope). Security scan clean; SKILL.md + all 3 references checked — no Tailwind/Konsta/Material pushes, no NgModules requirement, no secrets, only ionicframework.com/github.com links. Note: the skill claims Ionic 9 moved standalone imports from `@ionic/angular/standalone` to `@ionic/angular` — verify the installed Ionic major at task 1.2 before relying on either path. `frontend-design` (anthropics/skills) NOT installed — `install-skills.md` says only on explicit request.
- `ionic build` prints a non-fatal browserslist warning (starter's default `.browserslistrc` lists browsers older than Angular 22 supports). Harmless; build succeeds. Do not "fix" without asking.
- Gradle on this machine MUST run with `JAVA_HOME="C:\Program Files\Java\jdk-24"` (e.g. `export JAVA_HOME="C:\Program Files\Java\jdk-24" && ./gradlew assembleDebug` from `android/`). Android Studio's JBR is Java 25 — Gradle 8.14.3 rejects it. Toolchain JDK 21 is auto-provisioned by foojay into `~/.gradle/jdks`.
- `android/` is NOT yet tracked in git — teammates won't get the foojay fix or the platform until it's committed (await user's explicit request to commit). First Gradle build per machine downloads deps + a JDK 21 (~200 MB).
- APK is 117 MB — ML Kit bundles all five OCR script models plus native OCR/translate libs. Expected per `docs/text-recognition.md`; do not try to shrink.
