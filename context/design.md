# design.md — Linguo UI rules

Rules for all UI work. Follow them exactly. Goal: a clean, native-feeling Android app built only from Ionic components. No custom design system. If a design skill suggests something that conflicts with this file, this file wins.

## 1. Principles
- Use **Ionic components** and Ionic's default adaptive styling. Do not restyle them heavily.
- **One accent color.** Everything else uses Ionic defaults (neutral backgrounds, default text colors).
- Simple and calm: few elements per screen, generous spacing, clear hierarchy.
- Mobile only: portrait, one column, thumb-reachable primary actions.

## 2. Allowed and forbidden
Allowed: Ionic components from `@ionic/angular/standalone`, Ionicons via `addIcons`, Ionic CSS utility classes (`ion-padding`, `ion-margin`, etc.), small component-level SCSS.
Forbidden: Tailwind, Bootstrap, Konsta UI, Angular Material, custom web fonts, animation libraries, gradients, background images, custom CSS frameworks, `position: fixed` hacks for headers or footers (use `ion-header` / `ion-footer`).

## 3. Theme
- Define the accent color by overriding the `--ion-color-primary` variable family (`--ion-color-primary`, `-rgb`, `-contrast`, `-contrast-rgb`, `-shade`, `-tint`) in the theme variables file the Ionic starter provides (usually `src/theme/variables.scss`; check where the starter defines them).
- Accent color: teal `#0D9488`. Derive shade (about 12% darker) and tint (about 10% lighter) following Ionic's color-variable convention. Contrast color: white.
- Support dark mode with Ionic's built-in dark palette that follows the system setting (see the Ionic theming docs for the palette import). Do not hand-write a dark theme.
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
1. Language row: two `ion-select` controls (source, target) with a swap `ion-button` (icon only, `fill="clear"`, `aria-label="Swap languages"`) between them.
2. Two buttons side by side or stacked: **Take Photo** (primary, camera icon) and **Choose from Gallery** (outline, image icon).
3. `ion-textarea` for the recognized text: label "Text", at least 4 rows, auto-grow allowed, placeholder "Take a photo or type text here".
4. **Translate** button: `expand="block"`, primary color. Disabled while empty, busy, or when both languages are the same (show a small hint under the language row).
5. Result `ion-card`: translated text at a slightly larger font size (about 1.1 rem), then **Speak** (primary) and **Stop** (outline) buttons. Hide the card until a translation exists.
6. Header: title "Linguo" and an icon button (clock/history icon, `aria-label="History"`) that opens History.

### History page
- Header with back button, title "History", and a "Clear all" text button (hidden when empty).
- `ion-list` of `ion-item-sliding` rows: two text lines (source, translated), each truncated to one line, plus a small secondary line with the language pair and date.
- Swipe reveals a red **Delete** option (`color="danger"`).
- Tap opens an `ion-modal` with full source text, full translated text, and a **Speak** button.
- Empty state: centered icon, one line "No saved translations yet."

## 6. States and feedback
- Busy: show `ion-spinner` with a short label ("Reading text…", "Downloading language model…", "Translating…") and disable the buttons.
- Errors and confirmations: `ion-toast` at the bottom, 3000 ms, short plain sentence. Use `color="danger"` for errors only.
- Destructive actions (Clear all): `ion-alert` with Cancel and a red confirm button.
- Never leave the screen blank or frozen; every async action has a visible busy state that always ends.

## 7. Accessibility
- Every icon-only button has an `aria-label`.
- Do not rely on color alone to show errors or disabled state.
- Keep text at Ionic default sizes or larger; never smaller than 14 px.

## 8. Do not
- Do not invent new screens, onboarding, splash animations, settings, or themes.
- Do not add decorative images or illustrations.
- Do not change the app's navigation structure (two pages: translate, history).

## 9. Check before finishing a UI task
- Looks correct in light and dark mode.
- All buttons reachable with a thumb and at least 44 px tall.
- Empty, busy, and error states all exist.
- Ask the user to confirm the result on the phone (you cannot see it).
