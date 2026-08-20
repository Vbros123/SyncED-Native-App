# Contributing to SyncED

## Local setup

Use Node.js 22.17 or newer.

```bash
npm ci
npm run dev
```

## Before committing

```bash
npm run lint
npm run build
npm run qa:i18n
```

Run the full browser journey when changing user flows, accessibility, translations, responsive layouts, QR verification, sounds, or offline behavior:

```bash
npm run qa
```

## Pull requests

Keep each pull request focused. Explain what changed, why it changed, the platforms affected, and the checks performed. Never include generated `dist/` files, dependency folders, native signing files, secrets, or real student data.
