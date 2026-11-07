# PROJECT CONCEPT PLAN
# Linguo — Basic Camera Translator Mobile Application

**App name:** Linguo
**Suggested app ID:** `com.yourname.linguo` (set once at project creation; do not change later)

## 1. Project Overview

### 1.1 Project Description

Linguo is a lightweight mobile translation application developed using Ionic Angular and Capacitor. It helps users understand printed text in another language by taking a photo of it with their smartphone camera, recognizing the text, translating it, and reading the translation aloud.

The application will use the Capacitor Camera plugin to capture images, Google ML Kit Text Recognition to extract text from the image, Google ML Kit Translation to translate the text on the device, and a Capacitor text-to-speech plugin to speak the result.

Translated results are saved to a local history on the device so users can look them up again later.

The application will prioritize on-device processing. It will not require user accounts, backend servers, cloud storage, or an internet connection for its primary operations after the required translation language models have been downloaded.

### 1.2 Problem and Solution

**Problem:** People often meet text they cannot read, such as signs, labels, menus, notices, and study materials in another language. Typing the text into a translator is slow, and online translators need a connection that is not always available.

**Solution:** A simple app where the user points the camera at the text, and the app recognizes it, translates it, shows the result, and reads it aloud. Once the language models are downloaded, this works without internet.

### 1.3 Project Objectives

The application aims to:

1. Capture photos of printed text using the smartphone camera.
2. Extract text from the captured image.
3. Translate the extracted text between supported languages.
4. Display the original and translated text clearly.
5. Read the translated text aloud using text-to-speech.
6. Save translations locally for future reference.
7. Allow users to view and delete saved translations.
8. Provide the core functionality without requiring internet connectivity after initial setup.

### 1.4 Target Users

The application is intended for:

- Students who need to understand foreign-language materials.
- Travelers who encounter signs, menus, and labels in other languages.
- Individuals who need quick translations of printed text.
- Users who want to hear how a translated phrase sounds.
- General smartphone users who need a simple translator.

---

## 2. Core Features and Functionalities

The application will focus on four essential features.

### 2.1 Image Capture

Users capture the text they want to translate using the Capacitor Camera plugin.

Functionalities:

- Take a photo with the device camera.
- Optionally choose an existing photo from the gallery.
- Show a loading state while the image is processed.
- Handle cancelled capture and denied camera permission.

### 2.2 Text Recognition (OCR)

The application extracts text from the captured image using ML Kit Text Recognition.

Functionalities:

- Recognize text in the image.
- Display the recognized text in an editable field so the user can correct recognition errors.
- Show a clear message when no text is found.
- Allow the user to type text manually as a fallback.

### 2.3 Translation and Text-to-Speech

The application translates the recognized text on the device and can read the result aloud.

Functionalities:

- Select source and target languages from a short supported list.
- Swap source and target languages.
- Download required language models, with progress feedback.
- Translate the text using ML Kit Translation.
- Display the translated text.
- Speak the translated text with text-to-speech, with a stop control.
- Check whether the target language voice is available and show a clear message if it is not.

### 2.4 Local Translation History

The application saves translations locally so users can revisit them.

Functionalities:

- Automatically save each successful translation.
- Display a list of saved translations (newest first).
- Open a saved translation to view the full original and translated text.
- Speak a saved translation again.
- Delete a single saved translation.
- Clear all history.

No backend database or cloud storage will be required.

---

## 3. Application Screens

The application will have two primary screens.

### 3.1 Translate Screen (Home)

Purpose: Capture, recognize, translate, and speak text.

Components:

- Application name and logo.
- Source language and target language selectors with a swap button.
- Take Photo button (with gallery option).
- Editable recognized-text field.
- Translate button.
- Translated text display.
- Speak and Stop buttons.
- Link to History.
- Empty state, loading states, and error messages.

### 3.2 History Screen

Purpose: Display and manage previously saved translations.

Components:

- List of saved translations showing a preview of the original text, translated text, language pair, and date.
- Tap an item to expand or view full details.
- Speak action.
- Delete action.
- Clear All action with confirmation.
- Empty state when no translations are saved.

---

## 4. Technology Stack

| Technology | Purpose |
| --- | --- |
| Ionic Framework | Mobile application interface |
| Angular (standalone components, signals) | Frontend framework |
| TypeScript | Application programming language |
| Capacitor | Native mobile integration |
| Capacitor Camera (`@capacitor/camera`) | Capturing photos |
| ML Kit Text Recognition (`@capacitor-mlkit/text-recognition`) | Extracting text from images |
| ML Kit Translation (`@capacitor-mlkit/translation`) | On-device translation and language model management |
| Capacitor Text to Speech (`@capacitor-community/text-to-speech`) | Speaking translated text |
| Capacitor Preferences (`@capacitor/preferences`) | Local translation history storage |

### 4.1 Frontend

**Ionic Angular**

Responsible for:

- Application screens and navigation.
- User interface components.
- Application state using Angular signals.
- User interactions and feedback (toasts, loading indicators, alerts).

Conventions:

- Standalone components only (no NgModules).
- Signals for state; `async/await` for Capacitor calls.
- Ionic components imported from `@ionic/angular/standalone`.

### 4.2 Image Capture

**Capacitor Camera**

Responsible for:

- Opening the camera or gallery.
- Returning the captured image for text recognition.
- Handling camera permissions.

### 4.3 Text Recognition and Translation

**Google ML Kit (via Capacitor plugins)**

Responsible for:

- Extracting text from images on the device.
- Translating text between supported languages on the device.
- Downloading, listing, and deleting translation language models.

The application will communicate with ML Kit through the Capacitor plugins listed above.

### 4.4 Text-to-Speech

**Capacitor Text to Speech**

Responsible for:

- Speaking the translated text.
- Stopping playback.
- Checking whether the target language is supported on the device.

### 4.5 Local Data Management

**Capacitor Preferences**

The application will store a lightweight JSON list of translation history items:

- Item ID.
- Original text.
- Translated text.
- Source language and target language.
- Creation date.

History will be limited to a fixed number of recent items (for example, 50) to keep storage small. Captured images will not be stored.

A separate database such as SQLite will not be necessary for this initial version.

---

## 5. System Architecture

The application will use a simple local architecture without a backend server.

### 5.1 Architecture Overview

**Ionic Angular Application**

↓

**Angular Services**

- OCR Service
- Translation Service
- Speech Service
- History Service

↓

**Capacitor Native Integration**

- Camera
- ML Kit Text Recognition
- ML Kit Translation
- Text to Speech
- Preferences

↓

**Mobile Device Storage**

- Translation history (JSON)
- Downloaded language models (managed by ML Kit)

### 5.2 Translation Workflow

1. The user opens the application.
2. The user selects the source and target languages.
3. The user taps Take Photo.
4. The application captures the image with the Capacitor Camera.
5. The application extracts text with ML Kit Text Recognition.
6. The recognized text is shown in an editable field.
7. The user reviews or corrects the text and taps Translate.
8. The application checks the language models and downloads them if needed.
9. The application translates the text with ML Kit Translation.
10. The translated text is displayed and saved to local history.
11. The user taps Speak to hear the translation.

---

## 6. Offline Functionality

On-device processing is a primary characteristic of the application.

### 6.1 Offline Capabilities

The following operations should work without an internet connection after the required language models have been downloaded:

- Opening the application.
- Capturing photos.
- Recognizing text in images.
- Translating text for downloaded language pairs.
- Speaking translations (if a voice for the target language is installed on the device).
- Viewing, speaking, and deleting saved history.

### 6.2 Internet Requirements

An internet connection is required to download translation language models the first time a language is used. Each model is roughly 30 MB. ML Kit components may also be downloaded through Google Play services on first use.

Once the required models and components are on the device, the primary functionality should operate offline.

### 6.3 Data Persistence

All translation history will be stored locally on the user's device.

The application will not require:

- Backend servers.
- Remote databases.
- Cloud storage.
- User authentication.
- Online translation services.

History may be lost if the application is uninstalled or its data is cleared.

---

## 7. Scope and Limitations

### 7.1 Included Features

The initial application will include:

1. Photo capture (camera and gallery).
2. Text recognition from images.
3. Editable recognized text.
4. On-device translation for a short list of languages.
5. Language model download with progress feedback.
6. Text-to-speech of translated text.
7. Local translation history (create, read, delete).

### 7.2 Supported Languages

The initial version will support a small set of languages that use the Latin script, for example: English, Tagalog, Spanish, French, German, and Indonesian. The exact list will be confirmed against plugin support during development.

### 7.3 Excluded Features

To maintain a minimal development scope, the following will not be included:

- Live camera (real-time) translation.
- Handwriting recognition.
- Automatic source language detection.
- Languages that use non-Latin scripts.
- Saving captured images.
- Cloud synchronization.
- User registration and authentication.
- Online translation services or HttpClient requests.
- Conversation or voice-input translation.
- Subscription or premium features.

These features may be considered for future development but are not required for the initial version.

### 7.4 Known Limitations

- Recognition accuracy depends on image quality, lighting, font, and text layout.
- Text-to-speech depends on voices installed on the device; some languages may have no voice.
- Translation quality is that of on-device models and may be less accurate than online services.
- The first use of each language requires an internet connection.
- ML Kit features should be tested on a real device.

### 7.5 Platform Note

The initial implementation will target Android and be tested on a real device. The plugins used also support iOS, but iOS is not tested in this version.

---

## 8. Development Approach

The application will be developed incrementally using OpenCode with the MiMo V4 coding model. The project is planned to be small enough to build in about one day.

### Phase 1: Project Setup (about 1–2 hours)

- Create the Ionic Angular project with standalone components.
- Configure Capacitor and add the Android platform.
- Install the Camera, ML Kit Text Recognition, ML Kit Translation, Text to Speech, and Preferences plugins.
- Run the blank app on a real Android device.

### Phase 2: Core Pipeline (about 2–3 hours)

- Capture an image with the Camera.
- Recognize text from the image.
- Download a language model and translate text.
- Speak the translated text.
- Verify each step on the device before building the interface.

### Phase 3: Application Interface (about 2 hours)

- Build the Translate screen with language selectors and the swap button.
- Add loading, empty, and error states.
- Add Speak and Stop controls.

### Phase 4: Local History (about 1–2 hours)

- Implement History Service using Capacitor Preferences.
- Save translations automatically.
- Build the History screen with view, speak, delete, and clear actions.

### Phase 5: Testing and Refinement (about 1–2 hours)

- Test the main user flow on a real device.
- Test offline behavior.
- Record limitations and usability issues.
- Propose at least one improvement.
- Fix errors and polish the interface.

---

## 9. Testing Requirements

| Testing Area | Expected Result |
| --- | --- |
| Image Capture | Captures a photo and handles cancel or denied permission |
| Gallery Selection | Allows choosing an existing photo |
| Text Recognition | Extracts readable text from clear printed text |
| No Text Found | Shows a clear message |
| Manual Edit | Recognized text can be corrected before translating |
| Model Download | Downloads a language model with feedback |
| Translation | Produces a translation for supported language pairs |
| Language Swap | Swaps source and target languages |
| Text-to-Speech | Speaks the translation; shows a message if no voice is available |
| History Save | Saves each translation automatically |
| History Persistence | History remains after closing and reopening the app |
| History Delete | Deletes one item and clears all items |
| Offline Functionality | Works without internet after models are downloaded |

---

## 10. Course Requirement Mapping

| Course Requirement | How the Project Meets It |
| --- | --- |
| Problem and solution | Section 1.2 describes the problem, the users, and the solution |
| Working mobile application | Focused prototype with a small set of working features |
| Mobile capability | Camera (taught in class), plus relevant community plugins: ML Kit Text Recognition, ML Kit Translation, and Text to Speech |
| Data operation | Local data management with Capacitor Preferences: create, read, and delete translation history |
| Testing and improvement | Section 9 testing; limitations in Section 7.4; at least one improvement documented (for example live camera translation or automatic language detection) |

---

## 11. Project Success Criteria

The application will be considered successful when:

1. Users can capture a photo of printed text with their smartphone camera.
2. The application can recognize text in the photo and let users correct it.
3. The application can translate the text between supported languages.
4. The translated text can be read aloud.
5. Translations are saved locally and remain available after closing and reopening the application.
6. Users can view, speak again, and delete saved translations.
7. The primary functionality remains available without an internet connection after initial model downloads.

---

## 12. Final Project Direction

Linguo is a basic camera translator designed to help users understand printed text in another language quickly and conveniently.

By using Ionic Angular, Capacitor, the Camera plugin, and Google ML Kit, the application will provide recognition, translation, and speech without the development of complex machine learning models or backend infrastructure.

Translation history is stored directly on the user's device using lightweight local storage.

The application will focus on simplicity, functionality, and offline accessibility rather than replicating the extensive features of commercial translation platforms.

**Core Application Workflow:**

## Capture → Recognize Text → Translate → Speak → Save to History
