# SyncED Native App

SyncED is an offline-first education app for Android, iPhone, iPad, and the web. The repository includes complete Capacitor projects in `android/` and `ios/`. Lessons, progress, rewards, downloads, animations, and sounds are bundled with the app and stored on the device.


## Repository structure

- `src/` contains the React application, lessons, translations, and local-first state.
- `public/` contains the PWA manifest and service worker.
- `ios/` and `android/` contain the Capacitor native projects.
- `scripts/` contains automated translation and browser-flow checks.
- `docs/ARCHITECTURE.md` explains the application boundaries and native build flow.

Generated `dist/` files, dependencies, signing credentials, and machine-specific native files are intentionally excluded from Git.

## No backend

This version intentionally has no backend, database server, login server, API key, or cloud dependency. Progress and settings use on-device browser storage. The visible sync queue and connection controls are an offline-learning demonstration and do not send data to a server. Simulating sync keeps all local records unchanged and never marks work as received by a school. Support forms use a fixed fictional contact address and save samples locally; no partner receives them and no reply is sent.

## Assignment demo dates and drafts

Assignment drafts are saved separately by assignment ID, including when a dialog is closed or the app is reloaded. Saved submissions reopen with their original response.

The sample assignments have fixed UTC deadlines from September 21 to 24, 2026, and closing times from September 22 to 26, 2026, defined in `src/data.js` as `dueAt` and `closesAt`. They become late and then close as time passes; reopening the app does not move the dates. For a later demonstration, deliberately update those sample timestamps before building. Existing submitted work remains viewable after closing.

## Run it on a Mac or PC

Install Node.js 22.17 or newer first. In Terminal, change into the folder containing this README and run:

```bash
npm install
npm run dev
```

Open the local address printed in Terminal. Usually it is `http://localhost:5173`.

To run the downloaded ZIP as a website on a Mac:

```bash
cd ~/Downloads
unzip -o SyncED-Native-App.zip -d SyncED-Native-App
cd SyncED-Native-App
npm install
npm run dev
```

## Run the Android app

Install Node.js and Android Studio. Then run these commands from the extracted project folder:

```bash
npm install
npm run native:android
```

Android Studio opens the included native project. Select a connected Android phone or emulator and press the green Run button.

To create a debug APK from Terminal:

```bash
npm run native:android:apk
```

The APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Run the iPhone or iPad app

This requires a Mac with Xcode. From the extracted project folder, run:

```bash
npm install
npm run native:ios
```

Xcode opens the included iOS project. Select an iPhone simulator or connected iPhone and press Run. A physical iPhone requires selecting your Apple developer team in Xcode's Signing & Capabilities screen; the app itself still uses no backend.

Whenever the React app is changed, update both native projects with:

```bash
npm run native:sync
```

## Working features

- Optional on-device AI hints in every lesson. Open a lesson and select **Download / use AI hint**. The first model download is large and requires internet; allow it to finish. WebGPU support and enough device memory are required, including inside native WebViews. If unsupported, loading fails, or a generated hint fails validation, the learning tip remains available. AI hints may be inaccurate. No API key or AI server is used; model files are fetched from the model provider and cached by the browser. Cache eviction may require downloading again. Use `#debug-ai` to inspect device capability.

- Complete English, Spanish, Hindi, Arabic, and French interfaces, lessons, worksheets, and instructions; Arabic switches the layout to right-to-left
- Upgraded animated welcome sequence with auroras, learning icons, students, and rising/falling graduation caps
- Offline correct-answer chimes generated in the browser; full graduation-cap celebrations are reserved for completed lessons
- Six subjects with three interactive lessons each: algebra, science, reading, history, computing, and money skills
- Answer checking, previous/next navigation, animated mini-videos, save-for-later, printable worksheet downloads, and offline course downloads
- Clickable assignment list and calendar with due, late, completed, and closed states; submissions require a response and late work is labeled
- Offline app shell, local progress, a visible sync queue, simulated connection controls, and automatic reload while offline
- Nova companion with separately fitted headwear and accessories, four face colors, four body colors, three moods, points, unlockable gear, achievements, and a privacy-controlled simulated class leaderboard
- Searchable course explorer, digital-skills lessons, family learning, and shared goals
- Searchable community hub directory with service filters, optional browser location, directions, eligibility notes, and sample device-support requests with fictional contact details
- Light, dark, high-contrast, four accent colors, larger text, plain-language mode, and collapsible desktop navigation
- Helpdesk flow, nonprofit and partnership explanation, sourced impact evidence, and a plain-language privacy/data plan
- Responsive desktop, tablet, and mobile layouts with keyboard focus states and reduced-motion support

All people, schools, locations, leaderboard entries, support programs, and account data are fictional sample data. Progress stays on the current device. Cross-device accounts and real school syncing are not included because this build intentionally has no backend.


## Publish to a private GitHub repository

After installing and signing in to the GitHub CLI, run:

```bash
./scripts/publish-private.sh
```


Vercel Link:https://sync-ed-native-app.vercel.app/


The script creates or updates `Vbros123/SyncED-Native-App`, pushes `main`, and verifies that the repository visibility is private.

## Production build and QA

```bash
npm run build
npm run native:sync
npm run qa
```

The QA journey checks the launch animation, correct-answer sound triggers, lesson-completion celebrations, assignment submission, calendars, all six subjects, downloads, lesson controls, Nova customization and fitted gear, location search, device requests, themes, every translated screen, Arabic/RTL rendering, privacy sources, collapsed navigation, mobile overflow, console errors, service-worker control, and an offline reload.

Browser QA uses Microsoft Edge on Windows, Chrome on macOS, and bundled Chromium on Linux. Set `SYNCED_BROWSER_PATH` to use a different installed Chromium browser. QA fixes its clock to September 20, 2026 so deadline tests remain repeatable.
