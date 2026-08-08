# SyncED Native App

SyncED is an installable, offline-first education Progressive Web App for students and families with unreliable internet access. Students can download complete lesson packages while connected, learn and submit work offline, close the app, return later, and synchronize saved activity when connectivity returns.

The app retains the original SyncED experience while separating lessons from quiz questions correctly: six subjects now contain six distinct lessons each (36 lessons total and 126 practice questions). It also includes assignments, rewards and Nova customization, digital skills, family activities, community hubs, English/Spanish/Hindi/Arabic/French support, Arabic RTL, high contrast, larger text, plain language, reduced motion, keyboard focus, and responsive navigation.

## Live production app

The current web production build is available at:

**[Open SyncED on Vercel](https://synced-pwa-mahantdevalla-1880s-projects.vercel.app/)**

This repository also retains the complete Capacitor projects in `android/` and `ios/`, so the same React application can be packaged for Android, iPhone, and iPad.

## Core offline architecture

SyncED separates the offline workflow into replaceable layers:

- `src/services/contentStorage.js` builds and stores versioned lesson packages in IndexedDB.
- `src/services/progressStorage.js` stores student activities and queues them atomically.
- `src/services/syncQueue.js` processes pending items sequentially, retries failures with exponential backoff, and registers Background Sync when supported.
- `src/services/mockApi.js` is the clearly separated **Prototype sync server**. It simulates acknowledgements and keeps idempotency receipts so duplicate activity IDs are not submitted twice.
- `src/services/connectivity.js` reads `navigator.onLine` and browser `online`/`offline` events.
- `src/services/storageManager.js` wraps the Storage Estimate and Persistent Storage APIs.
- `src/services/db.js` owns the versioned IndexedDB schema: `lessons`, `activities`, `syncQueue`, and `meta` stores.
- `src/hooks/` exposes downloads, connectivity, storage, and synchronization to the existing UI.
- `public/service-worker.js` maintains versioned shell, static, and runtime caches. It uses navigation fallback, does not permanently cache API failures, cleans old SyncED caches without touching IndexedDB, and asks an open client to process Background Sync.

The application still uses localStorage for lightweight device preferences such as language, theme, sidebar state, onboarding, and a UI snapshot. Lesson content, student activity, and the synchronization queue do not rely on localStorage. On startup the displayed progress is rebuilt from IndexedDB, so work survives a cleared UI snapshot.

## Install and run

Install [Node.js](https://nodejs.org/) 22.17 or newer. From this project directory:

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:4173` for this project. PWA features work on localhost. Use HTTPS outside localhost.

For a reproducible clean install:

```bash
npm ci
```

## Native Android and iOS builds

Build the web application and copy it into both Capacitor projects:

```bash
npm run native:sync
```

Open the Android project in Android Studio:

```bash
npm run native:android
```

On a Mac with Xcode, open the iOS project:

```bash
npm run native:ios
```

Create an Android debug APK with `npm run native:android:apk`. Native signing credentials and generated build artifacts are intentionally not committed.

## Development commands

```bash
npm run dev        # local Vite development server
npm run lint       # ESLint
npm run build      # production build in dist/
npm run preview    # preview the production build
npm run test       # build + required offline browser test
npm run qa:i18n    # translation data audit
npm run qa:visual  # existing full product/RTL/mobile visual journey
npm run qa         # translation, offline, and visual suites
```

## Production build and deployment

Production URL: **https://synced-pwa-mahantdevalla-1880s-projects.vercel.app/**

Create the production files:

```bash
npm ci
npm run build
```

Deploy the contents of `dist/` to any static host that supports HTTPS. Configure unknown navigation routes to return `index.html`, and serve `/service-worker.js` from the site root with JavaScript content type. Do not place SyncED under a path prefix without also updating Vite's base path, the manifest, and service-worker URLs.

Typical static-host settings:

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback: `/*` → `/index.html` with a 200 response
- HTTPS: required for service workers, Storage APIs, and installation outside localhost
- Cache policy: keep `service-worker.js` short-lived; hashed files under `dist/assets/` can be cached long-term

## Downloadable lessons

Each downloaded lesson package contains:

- Title, subject, description, and version
- Text lesson sections
- A structured, screen-reader-describable step diagram
- Quiz questions, answers, and explanations
- Printable worksheet data
- Catalog size estimate, actual serialized byte size, update timestamps, and source version

Selecting **Download** writes the package to IndexedDB and reports preparing/downloading progress. The UI reads IndexedDB after every startup, so the Downloaded state persists across refreshes and browser restarts. **Manage Downloads** lists real saved packages, actual local size, version, last update, Remove, Update, Open, and failure/retry states.

When offline, SyncED checks IndexedDB before opening a course. An undownloaded course is blocked with:

> Connect to the internet and download this lesson before using it offline.

The **Resilient Learning Pack** is a small bundle of Math, Science, and English lessons, worksheets, one quiz per subject, a reading resource, and disruption/help instructions. It is described for outages, severe weather, infrastructure disruptions, travel, or unreliable connectivity; it makes no environmental claim and does not replace official emergency guidance.

## Offline progress

Every quiz attempt, final completion, selected response, first-attempt accuracy, mastery score, assignment response, completion time, progress percentage, points, sync status, unique ID, timestamp, and related metadata are saved in the IndexedDB `activities` store. A wrong answer can be corrected and still completes the question, but it receives a reduced mastery score instead of 100%. Finishing a lesson quiz opens a simple result card with the score, first-try total, corrected total, and optional question details. Each activity and its queue entry are written in one transaction. Local work remains present after refresh, tab close, browser restart, connection loss, and installed-PWA reopen.

The Offline Test Mode can clear activity data independently from downloaded lesson content. Removing lesson packages never removes progress.

## Synchronization

Offline work enters the `syncQueue` store with **Waiting to sync** status. SyncED displays the pending count and last successful sync time. When the effective connection returns it:

1. Registers Background Sync when available.
2. Starts an immediate in-app fallback when Background Sync is unavailable.
3. Processes one queue entry at a time.
4. Sends the activity to the Prototype sync server.
5. Marks the activity synced and removes only that successful queue entry.
6. Retains failed activity and queue data, then retries with bounded exponential backoff.

Unique activity IDs and prototype server receipts provide idempotency. Replaying an acknowledged ID returns success without creating a second receipt.

## Real and demo connectivity

The main Online/Offline indicator is based on `navigator.onLine` plus `online` and `offline` window events. Syncing, Sync failed, All work synced, and Waiting to sync are separate text-and-icon states; color is not the only signal.

Settings → Offline & storage includes a clearly labeled **Offline Test Mode**. Its **Demo connectivity control** can simulate offline or slow behavior without pretending to change the browser's real network state. Testers can also add one forced failed sync, retry, inspect queue entries, clear cached lessons, and clear local activities.

## What is simulated

Server synchronization currently uses the **Prototype sync server** in `src/services/mockApi.js`. No assignment is transmitted to a school, teacher, Supabase, Firebase, or production API. Community locations, programs, profiles, school names, leaderboard entries, and support workflows are fictional prototype data.

Actual device-local behavior is not simulated: lesson packages, activity records, queue entries, retries, idempotency receipts, cache storage, persistence across restarts, browser connectivity events, and Storage API estimates use browser platform APIs.

## Known limitations

- The Prototype sync server runs on the device and does not provide cross-device accounts or real teacher delivery.
- Background Sync support varies. SyncED provides immediate and 30-second periodic retry fallbacks while the app is open.
- A closed browser cannot contact the local Prototype sync server; production background delivery requires a real HTTPS API endpoint.
- `navigator.onLine` reports network reachability, not guaranteed internet quality. A real API failure is still retained and retried.
- Storage estimates and persistence grants depend on browser policy and can be unavailable.
- Lesson packages are deliberately compact prototype content rather than full production media courses.
- The current bundle is larger than Vite's default 500 kB advisory threshold; the build is valid, but route-level code splitting is a future optimization.
- Production rollout requires authentication, reviewed student-data policies, authorization rules, encryption and retention decisions, verified school/community data, and operational monitoring.

## Future backend plan

Replace only `submitActivityToPrototypeServer()` with a Supabase, Firebase, or custom HTTPS adapter that accepts the same activity envelope and idempotency key. Keep the local activity and queue stores as the source of truth until the backend acknowledges success. A production adapter should add authentication, per-student authorization, server-side unique constraints on activity ID, conflict policy, telemetry, and a reconciliation endpoint. The React screens and queue UI do not need to be rewritten.

## Automated testing

`npm run test` runs the production build and `scripts/offline-qa.mjs`. It uses a persistent browser profile and verifies:

1. Downloaded lessons remain after refresh.
2. Undownloaded lessons cannot open offline.
3. IndexedDB progress remains after browser close/reopen even after the UI localStorage snapshot is removed.
4. Offline quiz attempts, corrected-answer scoring, simplified quiz results, expanded lesson packages, and assignment activity work and enter the queue.
5. Reconnection automatically synchronizes queued activity.
6. A forced failure retains local activity and the queue entry.
7. Replaying a successful activity ID does not create a duplicate server receipt.
8. Cache-version cleanup does not erase IndexedDB progress.
9. Arabic RTL has no horizontal overflow.
10. Mobile navigation remains visible and usable.

The suite also validates the complete lesson-package fields, service-worker control, and required activity fields. `npm run qa:visual` retains the broader product regression journey across lessons, assignments, rewards, hubs, themes, translations, RTL, mobile layout, offline reload, and console errors.

## Manual QA checklist

Use a fresh browser profile or clear site data before the completion journey.

- [ ] Open SyncED online and finish or skip the three-screen onboarding.
- [ ] Confirm the status indicator says Online and distinguishes sync status with text and an icon.
- [ ] Open My learning → Downloads.
- [ ] Download Algebra basics and watch the progress/state change to Downloaded.
- [ ] Refresh and confirm Algebra basics is still Downloaded.
- [ ] Disconnect the browser network (or use browser developer tools, not only the demo control).
- [ ] Refresh and confirm the app shell loads offline.
- [ ] Open the downloaded Algebra basics lesson.
- [ ] Try to open an undownloaded lesson and confirm the required connection/download message appears.
- [ ] Answer the first Algebra question incorrectly, then correct it and confirm it completes with a reduced mastery score.
- [ ] Complete all six Algebra questions and confirm the result card shows the mastery score, first-try count, corrected count, and expandable question details.
- [ ] Filter Explore by each subject and confirm it shows six distinct lesson cards with video, quiz, worksheet, and download actions.
- [ ] Submit the Practice: equations assignment.
- [ ] Open the sync queue and confirm both items say Waiting to sync.
- [ ] Close every SyncED tab and close the browser.
- [ ] Reopen SyncED while still offline.
- [ ] Confirm the downloaded lesson opens and the quiz/assignment progress remains visible.
- [ ] Reconnect and confirm status changes to Syncing automatically.
- [ ] Confirm entries leave the queue one at a time only after success.
- [ ] Confirm All work synced, pending count 0, and a last successful sync time.
- [ ] Confirm completed progress and points remain visible after sync.
- [ ] In Offline Test Mode, add a fake failed sync and confirm local activity remains after Sync failed.
- [ ] Retry and confirm the retained item succeeds.
- [ ] Remove one downloaded course and confirm its progress is not removed.
- [ ] Download the Resilient Learning Pack and review its subjects, size, time, date, reading resource, quizzes, worksheets, and help copy.
- [ ] Check Storage API used/available values and persistent-storage status, or the unsupported-browser fallback.
- [ ] Test keyboard navigation and visible focus on Home, Explore, Downloads, a lesson, an assignment modal, and Settings.
- [ ] Test larger text, plain language, high contrast, dark theme, and reduced motion.
- [ ] Switch to Arabic and confirm RTL layout, dialogs, downloads, lesson actions, and mobile navigation remain usable without horizontal scrolling.
- [ ] At 390 × 844, confirm the bottom navigation works and every Settings tab can be reached by horizontal scrolling.

## Team contribution

1. Create a focused branch and keep changes within the existing React/Vite architecture.
2. Do not put student activity or queue state back into localStorage.
3. Preserve activity IDs and the rule that local work is deleted only after acknowledgement.
4. Increment lesson versions when package content changes and test the Update available path.
5. Increment service-worker cache versions only when needed; never clear SyncED IndexedDB during a cache upgrade.
6. Add translation entries for user-facing strings and preserve Arabic RTL.
7. Run `npm run lint`, `npm run qa`, and the manual completion journey before review.
8. Document whether a change affects the Prototype sync server or a production adapter.

When connecting a real backend, be explicit in code and documentation about which paths are production and which remain simulated.
