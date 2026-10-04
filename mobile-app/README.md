# SurakshaAR

SurakshaAR is a camera-backed 3D industrial-safety training prototype for mid-range Android phones and modern browsers. It supports practice scenarios for fire response, gas and confined-space awareness, and machinery lockout/tagout concepts.

## What this prototype currently does

- Shows Three.js 3D training scenes over an optional phone-camera feed.
- Provides local, browser-based practice flows and a temporary written knowledge check.
- Stores demonstration training records only on the current device using local storage and Capacitor Preferences.
- Produces a QR code that looks up a local demo record on the same device.
- Offers Hindi, English, and Santali interface text. Browser speech depends on device voice support; native Santali speech is not guaranteed.
- Includes demonstration-only site views, gas-plume visuals, a pre-shift practice demo, and a local keyword-matched training reference.

## Important limitations

- This is **not ARCore or spatial AR**. It does not recognise rooms, surfaces, PPE, workers, hazards, machinery, or gases.
- Every gas, thermal, ventilation, fatigue, map, and site value shown in the prototype is simulated.
- It has no backend, no shared database, no cross-device verification, no cryptographic signing, and no live telemetry connection.
- A training record is **not** a statutory certificate, government credential, compliance result, medical assessment, work-clearance decision, or emergency dispatch.
- The SOS and reference-card screens are practice aids only. In a real emergency, follow the current site procedure and contact authorised emergency services or a qualified supervisor.

## Stack

- React + Vite + Tailwind CSS
- Three.js for camera-backed 3D scenes
- Capacitor for Android packaging and local preferences
- jsPDF and `qrcode` for prototype exports and local demo-record QR codes

## Run locally

```bash
npm install
npm run dev
```

Open the local address printed by Vite. Camera access is optional; if it is unavailable, the 3D fallback scene remains usable.

## Android packaging

The repository includes a Capacitor Android project. It has not been verified as a production APK in this Phase 1 prototype cleanup. Before any deployment, validate permissions, device behaviour, site procedures, language quality, accessibility, and all operational safeguards with the appropriate experts.

## Next scope

Phase 2 should introduce a reviewed Scenario/Competency Engine. It must define measurable scenario criteria, evidence capture, assessor review, retry policy, and a deliberately designed record model before any certification or compliance claim is considered.
