# FlyWithAarav app

This project packages the existing FlyWithAarav website into native iOS/Android projects with Capacitor and a Windows desktop installer with Electron. The original GitHub Pages website remains separate and unchanged by app builds.

## Requirements

- Node.js 22 or newer and npm
- Android: Android Studio and Android SDK
- iOS: a Mac with Xcode and CocoaPods
- Windows installer: Windows is the simplest environment for producing and testing the Windows NSIS installer

## Install dependencies

From this `app` folder:

```sh
npm install
npm run build:web
```

The copy script copies the site from the repository root into `app/www`. That output is generated and should not be edited by hand.

## Android

```sh
npm run cap:add:android
npm run cap:android
npx cap open android
```

In Android Studio, test on a real phone and build a signed Android App Bundle (AAB) for Play Console. Keep the upload/signing key backed up securely and never commit it to GitHub.

## iPhone / iPad

On a Mac with Xcode installed:

```sh
npm run cap:add:ios
npm run cap:ios
npx cap open ios
```

Set the Bundle Identifier to `com.flywithaarav.app`, select your Apple Developer team, test on real devices, then archive and upload through Xcode to App Store Connect. A Mac/Xcode environment and Apple signing credentials are required for the final iOS build.

## Windows desktop

```sh
npm run desktop
npm run dist:win
```

The installer will be written to `app/dist`. Test it on Windows before sharing. A code-signing certificate is optional for creating an installer but helps reduce Windows SmartScreen warnings.

## Before store submission

This is a starting app package, not a store-approved release. App stores can reject a basic website wrapper. Apple expects functionality beyond a repackaged website, and Google Play requires meaningful, stable app functionality. Add and test app-specific value, ensure every feature and login flow works inside native WebViews, and prepare a privacy policy, support contact, store screenshots, age/content declarations, and reviewer access to account features. The current site includes placeholder gallery/flight cards and browser-local tools; replace or clearly label placeholders before submission.

### Accounts and fees

- Apple App Store: Apple Developer Program membership is currently US$99/year (local price may vary). Enrollment has legal-age and identity requirements. If you are not old enough, ask a parent/guardian to handle the developer account and legal agreements; do not enter false details.
- Google Play: Play Console registration is currently US$25 once. Google requires the account holder to be at least 18 and new personal accounts may have testing/device verification requirements. A parent/guardian or eligible adult needs to handle account registration if you are under 18.
- Windows: Microsoft Store distribution requires a separate Partner Center publisher account; alternatively, the Windows installer can be distributed directly. Check current Microsoft registration terms and fees before choosing a route.

No store account, signing certificate, payment, or publication is created automatically by this repository change. Do not put passwords, signing keys, or API secrets in the repository.
