# SyncED architecture

## Overview

SyncED is a React and Vite progressive web app packaged for iOS and Android through Capacitor. The current build is intentionally backend-free. App content ships with the client, while progress and preferences remain on the device.

## Main layers

- `src/pages/`: screen-level learning, rewards, support, family, settings, and exploration flows
- `src/components/`: reusable shell, UI, assignment, celebration, and completion QR components
- `src/locales/`: Spanish, French, Hindi, and Arabic translations
- `src/utils/`: QR payload, date, and sound helpers
- `public/`: PWA manifest, service worker, and public icon
- `ios/` and `android/`: Capacitor native projects
- `scripts/`: translation auditing and end-to-end browser QA

## Data model

Course content and fictional sample data are bundled in `src/data.js`. User progress, settings, rewards, saved lessons, and the simulated sync queue use local browser storage. No data is transmitted to a SyncED server in this version.

## Native build flow

1. Vite creates the web bundle in `dist/`.
2. Capacitor copies the web bundle into the native projects.
3. Xcode or Android Studio compiles and signs the platform app.

Use `npm run native:sync` after changing the React app.

## Trust boundaries

Completion QR codes are teacher-facing verification artifacts generated on the device. They are not cryptographically signed and should be treated as prototype evidence, not production-grade identity or assessment verification. A future production backend should sign completion records, validate timestamps, and enforce authorization.
