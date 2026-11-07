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
| 13 | Stop | Tap Stop while speaking | Speech stops | |
| 14 | No voice | Speak a language with no installed voice | Toast "No voice installed", no crash | |
| 15 | History save | Complete 3 translations | 3 entries appear in History, newest first | |
| 16 | History view | Tap an entry | Full original and translation shown | |
| 17 | History speak | Speak from History | Speech plays | |
| 18 | Delete one | Swipe delete an entry | Entry removed | |
| 19 | Clear all | Clear all with confirmation; also test Cancel | Cleared; Cancel keeps entries | |
| 20 | Persistence | Force-close and reopen the app | History still there | |
| 21 | Empty state | Clear history and open History | "No saved translations yet." | |
| 22 | Offline | Turn on airplane mode; repeat rows 1, 4, 9, 12, 15, 16, 20 (using already-downloaded models) | All work without internet | |
| 23 | Download offline | Airplane mode, translate with a never-downloaded language | Clear error message, app not stuck | |
| 24 | Permission | Deny camera permission, then try Take Photo | Clear message, no crash | |

## 2. Usability notes
Record confusing steps, slow moments, awkward screens.

## 3. Limitations identified (course requirement)
Fill in after testing. Expected candidates:
- Recognition accuracy depends on image quality, lighting, font, and layout.
- Text-to-speech depends on voices installed on the phone; some languages may have none.
- On-device translation quality is lower than large online services.
- The first use of each language needs internet to download a model (about 30 MB).
- Only Latin-script languages are supported.
- Android only; tested on one device.

## 4. Suggested improvement (course requirement)
Describe at least one. Candidates:
- Live camera translation (continuous OCR on a camera preview).
- Automatic source language detection.
- Support for non-Latin scripts (Japanese, Chinese, Korean).
- Highlight and translate only a selected part of the recognized text.
- Favorite or pin history entries.

## 5. Bugs found and fixed
Format: date, bug, fix.
