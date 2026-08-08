# SyncED architecture

## Overview

SyncED is a React and Vite progressive web app packaged for iOS and Android through Capacitor. Lesson packages, progress, and pending synchronization activity are stored on the device. The current synchronization endpoint is a clearly separated local prototype service that can later be replaced by a production API.

## Main layers

- `src/pages/`: screen-level learning, rewards, support, family, settings, and exploration flows
- `src/components/`: reusable shell, UI, assignment, celebration, and completion QR components
- `src/services/`: IndexedDB, downloadable content, connectivity, storage awareness, prototype server, and synchronization queue boundaries
- `src/hooks/`: React adapters for connectivity, downloads, storage, persistence, and queue state
- `src/locales/`: Spanish, French, Hindi, and Arabic translations
- `src/utils/`: QR payload, date, and sound helpers
- `public/`: PWA manifest, service worker, and public icon
- `ios/` and `android/`: Capacitor native projects
- `scripts/`: translation auditing, offline persistence tests, and end-to-end browser QA

## Data model

Course content and fictional sample data are bundled in `src/data.js` and `src/expandedLessons.js`. Versioned downloadable lesson packages, student activities, and queue entries use IndexedDB stores owned by `src/services/db.js`. Lightweight interface preferences still use localStorage. The prototype sync service acknowledges device-local queue items and stores idempotency receipts; it does not transmit student work to a school or production backend.

Queue entries are removed only after acknowledgement. Failed submissions remain local and retry with bounded backoff. Background Sync is used when supported, with immediate and periodic in-app fallbacks.

## Native build flow

1. Vite creates the web bundle in `dist/`.
2. Capacitor copies the web bundle into the native projects.
3. Xcode or Android Studio compiles and signs the platform app.

Use `npm run native:sync` after changing the React app.

The production web build is published at `https://synced-pwa-mahantdevalla-1880s-projects.vercel.app/`.

## Trust boundaries

Completion QR codes are teacher-facing verification artifacts generated on the device. They are not cryptographically signed and should be treated as prototype evidence, not production-grade identity or assessment verification. A future production backend should sign completion records, validate timestamps, and enforce authorization.
