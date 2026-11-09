# design.md — Linguo UI rules

Rules for all UI work. Follow them exactly. Goal: a clean, native-feeling Android app built only from Ionic components. No custom design system. If a design skill suggests something that conflicts with this file, this file wins.

## 1. Principles
- Use **Ionic components** and Ionic's default adaptive styling. Do not restyle them heavily.
- **One accent color.** Everything else uses Ionic defaults (neutral backgrounds, default text colors).
- Simple and calm: few elements per screen, generous spacing, clear hierarchy.
- Mobile only: portrait, one column, thumb-reachable primary actions.

## 2. Allowed and forbidden
Allowed: Ionic components from `@ionic/angular` (not `@ionic/angular/standalone` — no such export in Ionic 9), Ionicons via `addIcons`, Ionic CSS utility classes (`ion-padding`, `ion-margin`, etc.), small component-level SCSS.
Forbidden: Tailwind, Bootstrap, Konsta UI, Angular Material, custom web fonts, animation libraries, gradients, background images, custom CSS frameworks, `position: fixed` hacks for headers or footers (use `ion-header` / `ion-footer`).

## 3. Theme
- Define the accent color by overriding the `--ion-color-primary` variable family (`--ion-color-primary`, `-rgb`, `-contrast`, `-contrast-rgb`, `-shade`, `-tint`) in the theme variables file the Ionic starter provides (usually `src/theme/variables.scss`; check where the starter defines them).
- Accent color: royal blue `#3362FB` from the logo (user decision 2026-11-09, replacing the original teal `#0D9488`). Shade `#2d56dc`, tint `#4672fc`, contrast white. Secondary sky blue `#478AFF`, tertiary/amber `#FCB52A`, ink navy `#131844`, pale blue `#B1BFFB` — all sampled from `src/assets/icon/linguo-secondary.png` and `favicon.png`.
- **Light mode only** (user decision 2026-11-09): no Ionic dark palette import and no `prefers-color-scheme: dark` override — the light theme always applies. Page background is a soft pale-blue wash `#e9eeff` / header `#dee7ff`, tinted from the logo's pale blue `#B1BFFB`; cards stay `#ffffff`, borders `#dbe3fb`.
- Fonts: Ionic/system defaults only.

## 4. Layout rules
- Every page: `ion-header` > `ion-toolbar` > `ion-title`, then `ion-content` with `class="ion-padding"`.
- Group content with `ion-card` or `ion-list` / `ion-item`. Do not nest cards inside cards.
- Primary actions use `ion-button` with `expand="block"`. Secondary actions use `fill="outline"` or `fill="clear"`.
- Minimum tap target **44 x 44 px**. Do not shrink Ionic buttons below default size.
- Vertical spacing between sections: use Ionic padding/margin classes, not magic numbers.
- Let Ionic handle safe areas (status bar, notch, gesture bar) through `ion-header` and `ion-content`. Do not add manual safe-area CSS unless content is visibly clipped on the test phone.

## 5. Screen guidance

### Translate page
Strict top-to-bottom order (user decision 2026-11-08, third round):
1. **Image placeholder — always visible, page top.** Empty state: dashed-border box (~110px), `image-outline` icon, caption "Photo will appear here". With an image: plain `img`, max-height ~160px, rounded border, light background. Cleared on Retake, on **Translate new**, and when a history entry without an image is loaded.
2. **Take Photo** (primary, `expand="block"`) and **Choose from Gallery** (outline, `expand="block"`), stacked.
3. **Text** `ion-textarea` (label "Text", ≥4 rows, placeholder "Take a photo or type text here") with an optional "Detected: X" caption below it when auto-detect resolved the source language. **Text comes before the language row** (user decision 2026-11-08, third round).
4. **Language row:** two `ion-select` controls (source, target) with a swap `ion-button` (icon only, `fill="clear"`, `aria-label="Swap languages"`) between them. Source has an "Auto-detect" option (default). Same-language hint appears under the row.
5. **Button row:** **Translate** (primary) + **Speak original** (outline) side by side, equal widths (`display:flex` row).
6. **Translation** `ion-textarea` (label "Translation", ≥4 rows).
7. Spinner + status line while busy.
8. **Button row:** **Speak** (primary) + **Save to History** (outline) side by side, equal widths. Save is enabled only when both texts exist.
- Two-way speak: while audio plays, the button that started speaking becomes **Stop speaking** (`color="danger"`) and the other speaks button is disabled. No separate Stop button exists (user decision 2026-11-08).
- **Loaded-from-history is read-only** (user decision 2026-11-08, third round): after a History tap fills the form, every editing control is disabled — Text, Translation, both language selects, swap, Take Photo, Choose from Gallery, and Translate — so a saved entry can never be silently modified. Speak buttons stay active. The action button reads **Translate new** instead of "Save to History"; pressing it clears text, translation, Detected caption, and the image (keeps the From/To languages) and re-enables all controls for a fresh translation.
- Header: title "Linguo" preceded by the mascot mark (`linguo-mark.png`, height 34 px, width auto) inside a light-DOM `.lockup` div — `display: flex; align-items: center; gap: 14px` (user decision 2026-11-09: spacing between logo and name only, no extra edge padding; logo and text vertically centered with each other). The flex styles MUST live on `.lockup`, not on `ion-title`: `ion-title`'s host-level flex never reaches its shadow-DOM `.toolbar-title` wrapper, so the slotted img/span would baseline-align and the text sits ~12 px low. Plus an icon button (clock/history icon, `aria-label="History"`) that opens History.

### History page
- **Normal mode header:** back button + title "History". **No logo** next to the title (user decision 2026-11-09); the title uses `padding-inline-start: 8px` (page-scoped) so it sits ~8 px right of the back arrow instead of the MD default 20 px. There is **no "Clear all"** button (user decision 2026-11-08, third round).
- `ion-list` of `ion-item-sliding` rows: two text lines (source, translated), each truncated, plus a small secondary line with the language pair and date.
- Swipe reveals a red **Delete** option (`color="danger"`). Deleting an entry also deletes its stored image file.
- Tap loads both texts, both languages, and the entry's image (into the Translate placeholder) and navigates back (user decision 2026-11-08 — replaces the former ion-modal detail view; the loaded Translate form then acts read-only with **Translate new**).
- **Selection mode** (user decision 2026-11-08, third round): press-and-hold a row (~500 ms, must not scroll) opens selection mode with that row checked; the checkbox appears for every row and a tap toggles it. Header becomes: cancel icon (exits, also used to deselect) + "N selected" title + **Select all / Deselect** toggle + trash icon. Trash shows an `ion-alert` ("Delete N entries?", Cancel + red Delete) → deletes the selected entries and their images in one operation → success toast → exits selection mode. Unchecking the last selected row exits selection mode automatically. Swipe Delete and tap-to-load are unavailable while selecting.
- Entries saved from a photo carry their image (copied to `Directory.Data/linguo-history/`, user decision 2026-11-08); typed-only entries have none.
- Empty state: centered text "No saved translations yet." plus one hint line.

## 6. States and feedback
- Busy: show `ion-spinner` with a short label ("Reading text…", "Downloading language model…", "Translating…") and disable the buttons.
- Errors and confirmations: `ion-toast` at the bottom, 3000 ms, short plain sentence. Use `color="danger"` for errors only.
- Destructive actions (multi-select Delete, future deletes): `ion-alert` with Cancel and a red confirm button. Single swipe-delete acts immediately with a success toast (existing behavior).
- Never leave the screen blank or frozen; every async action has a visible busy state that always ends.

## 7. Accessibility
- Every icon-only button has an `aria-label`.
- Do not rely on color alone to show errors or disabled state.
- Keep text at Ionic default sizes or larger; never smaller than 14 px.

## 8. Do not
- Do not invent new screens, onboarding, splash animations, settings, or themes. (The static system splash + launcher icon are fixed user-specified assets — regenerate only via `scripts/generate-brand-assets.mjs` + `npx capacitor-assets generate --android`, see `collaboration.md` §5 — never restyle them ad hoc.)
- Do not add decorative images or illustrations.
- Do not change the app's navigation structure (two pages: translate, history).

## 9. Check before finishing a UI task
- Looks correct in light mode (the only theme — dark mode was removed 2026-11-09).
- All buttons reachable with a thumb and at least 44 px tall.
- Empty, busy, and error states all exist.
- Ask the user to confirm the result on the phone (you cannot see it).
