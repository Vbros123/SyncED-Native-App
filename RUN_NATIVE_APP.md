# Run SyncED as a phone app

SyncED does not need a backend. The Android and iOS projects already bundle the complete offline app.

## Android

1. Install Node.js and Android Studio.
2. Open Terminal in this project folder.
3. Run:

```bash
npm install
npm run native:android
```

4. In Android Studio, choose an emulator or connected Android phone.
5. Press the green Run button.

Create an installable debug APK with:

```bash
npm run native:android:apk
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## iPhone or iPad

1. Use a Mac and install Xcode plus Node.js.
2. Open Terminal in this project folder.
3. Run:

```bash
npm install
npm run native:ios
```

4. In Xcode, choose an iPhone simulator or connected iPhone.
5. Press the Run triangle.

For a physical iPhone, select your Apple developer team under Signing & Capabilities when Xcode asks. This is Apple app signing, not a SyncED backend.

## After changing the app

Copy a fresh web build into both native projects:

```bash
npm run native:sync
```

The animated welcome, graduation-cap celebrations, correct-answer sounds, Nova customization, translations, and local progress are all kept in the native build.
