# RAKSHA 360 — Android Mobile Run Guide

यह project React/Vite web app को Capacitor के जरिए Android application में package करता है। नीचे के steps से इसे Android Studio और physical Android phone पर चलाया जा सकता है।

## Prerequisites

- Node.js LTS और npm
- Android Studio, Android SDK Platform 36 और Build Tools
- JDK 17
- Android 7.0 (API 24) या नया phone; camera/AR tests के लिए physical device recommended
- USB cable और phone में **Developer options → USB debugging** enabled

## पहली बार चलाने के steps

PowerShell से project root में जाएँ:

```powershell
cd SurakshaAR-mobile
npm ci
npm run build
npx cap sync android
```

फिर Android Studio में `SurakshaAR-mobile/android` folder खोलें। Gradle sync पूरा होने के बाद device selector में अपना USB-debugging enabled phone चुनें और **Run ▶** दबाएँ।

## हर UI/code change के बाद

`src/` में बदलाव Android app में automatically नहीं आता। यह चलाकर Android Studio से फिर Run करें:

```powershell
npm run build
npx cap sync android
```

यदि Windows में current folder name के apostrophe की वजह से `npm run build` path error दे, यह equivalent command चलाएँ:

```powershell
node .\node_modules\vite\bin\vite.js build
npx cap sync android
```

## Quick verification checklist

- [ ] Vite production build सफल हो।
- [ ] Capacitor sync Android plugins को detect करे।
- [ ] Android Studio Gradle sync और debug install सफल हो।
- [ ] Camera allow/deny दोनों स्थितियों में app usable रहे।
- [ ] Fire और Gas drill के बाद assessment unlock हो।
- [ ] 80% pass पर local QR training record/PDF export बने।
- [ ] Record उसी device पर QR/manual lookup से verify हो।
- [ ] Offline mode में core drills और local records काम करें।

## Release APK

Android Studio में **Build → Generate Signed Bundle / APK** चुनें और अपनी release keystore use करें। `.jks`, `.keystore`, environment files और `google-services.json` को Git में commit न करें—root `.gitignore` इन्हें exclude करता है।

> यह training prototype है: local records cross-device signed certificates नहीं हैं और hazard reports किसी live server या emergency service को नहीं भेजते। असली emergency में site SOP और authorised process follow करें।
