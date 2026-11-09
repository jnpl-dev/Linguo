# testing.md — Linguo

Manual test checklist. All native features must be tested on a **real Android phone**. The AI cannot run these; ask the user to run them and report results, then record them here.

Device: ________  Android version: ________  Date: ________

## 1. Main flow checklist
Mark each row Pass or Fail and add notes.

| # | Area | Test | Expected result | Result / Notes |
| --- | --- | --- | --- | --- |
| 1 | Capture | Tap Take Photo, take a photo of printed English text | Photo is captured | |
| 2 | Gallery | Choose an existing photo instead | Photo is accepted | |
| 3 | Cancel | Open the camera and back out | Returns to the screen, no error | |
| 4 | OCR | Photo of clear printed text | Readable text appears in the textarea | |
| 5 | No text | Photo of a blank wall | Toast "No text found"; textarea stays empty | |
| 6 | Edit | Change a word in the textarea, then translate | Translation uses the edited text | |
| 7 | Manual input | Type text without a photo, then translate | Translation works | |
| 8 | Model download | First translation for a new language with internet on | Download indicator, then translation | |
| 9 | Translate | English to Tagalog, then English to Spanish | Reasonable translations appear | |
| 10 | Same language | Set source and target the same | Translate disabled with a hint | |
| 11 | Swap | Tap swap after translating | Languages and texts swap | |
| 12 | Speak | Tap Speak on an English or Spanish result | Speech plays | |
| 13 | Stop | While speech plays, tap the red **Stop speaking** button (the one that started) | Speech stops; button returns to Speak | |
| 14 | No voice | Speak a language with no installed voice | Toast "No voice installed", no crash | |
| 15 | History save | Complete 3 translations, tapping **Save to History** after each | 3 entries appear in History, newest first | |
| 16 | History view | Tap an entry | Translate page shows both texts, languages, and image read-only (inputs disabled); button reads **Translate new** | |
| 17 | Translate new | On a loaded entry, tap **Translate new** | Text/translation/image cleared, inputs re-enabled, languages kept, Save flow available again | |
| 18 | History speak | Load an entry, then tap **Speak** | Speech plays | |
| 19 | Delete one | Swipe delete an entry | Entry removed | |
| 20 | Multi-select | Press-and-hold a row until a checkbox appears; tap more rows; tap **Select all**; tap trash and confirm; also test Cancel | Selected rows deleted in one operation; Cancel keeps them | |
| 21 | Selection exit | Uncheck the last selected row, and cancel via the X button | Selection mode exits; list returns to normal | |
| 22 | Persistence | Force-close and reopen the app | History still there | |
| 23 | Empty state | Delete every entry (swipe or multi-select) and look at History | "No saved translations yet." | |
| 24 | Offline | Turn on airplane mode; repeat rows 1, 4, 9, 12, 15, 16, 22 (using already-downloaded models) | All work without internet | |
| 25 | Download offline | Airplane mode, translate with a never-downloaded language | Clear error message, app not stuck | |
| 26 | Permission | Deny camera permission, then try Take Photo | Clear message, no crash | |
| 27 | No Clear all | Check the History header in normal mode | No "Clear all" button is present | |
| 28 | Splash | Force-close the app, launch from the drawer, watch the first ~2 s | Pale-blue (`#e9eeff`) splash with the mascot shows ~1.5 s, fades, then the translate page — no white/black flash | Pass (2026-11-09: screencap frames show splash through ~1.5 s, app UI by next frame) |
| 29 | Launcher icon | Look at the app icon in the launcher/app drawer | Mascot on pale-blue background; no transparent ring, no clipped wordmark | Pass (2026-11-09: home-screen screenshot) |
| 30 | Translate header | Look at the Translate page header | Mascot mark and "Linguo" are vertically centered with each other, ~14 px apart | Pass (2026-11-09: screenshot, text aligned with logo) |
| 31 | History header | Open History from the clock button | No logo beside the title; "History" sits ~8 px right of the back arrow | Pass (2026-11-09: screenshot) |
| 32 | Empty start text | Launch the app fresh (or tap **Translate new**) | Text field shows only the placeholder "Take a photo or type text here"; Translate is disabled until text exists | Pass (2026-11-09: placeholder visible, Translate dimmed) |
| 33 | Release APK | Install `app-release.apk` (uninstall the debug build first — different signature), repeat rows 7, 9, 15, 16, 22, 28 | Same behavior as debug; release smoke already passed 2026-11-09 (translate round-trip + history nav) | Partial (2026-11-09: rows 7+9+28 passed on release; 15/16/22 not yet re-run on release) |

## 2. Usability notes
Record confusing steps, slow moments, awkward screens.

## 3. Limitations identified (course requirement)
Fill in after testing. Expected candidates:
- Recognition accuracy depends on image quality, lighting, font, and layout.
- Text-to-speech depends on voices installed on the phone; some languages may have none.
- On-device translation quality is lower than large online services.
- The first use of each language needs internet to download a model (about 30 MB).
- Japanese, Chinese, and Korean are supported; other non-Latin scripts are not.
- Android only; tested on one device.
- History images are stored at full resolution (a few MB each); at most 50 entries are kept.

## 4. Suggested improvement (course requirement)
Describe at least one. Candidates:
- Live camera translation (continuous OCR on a camera preview).
- Highlight and translate only a selected part of the recognized text.
- Favorite or pin history entries.
- Resize images before saving them to history to save space.
- iOS support.

## 5. Bugs found and fixed
Format: date, bug, fix.
