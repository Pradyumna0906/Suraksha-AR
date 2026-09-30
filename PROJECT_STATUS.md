# SurakshaAR — Project Status & Technical Dossier

> **Project:** AR-Based Vocational Training Simulator for Industrial Safety in Jharkhand's Mining & Manufacturing Sector  
> **Problem Statement:** SIH26041  
> **Current state:** Working web prototype and Android-ready Capacitor project; not yet a production or government certification system.  
> **Last reviewed:** 27 September 2026

## 1. Executive summary

SurakshaAR is an offline-first vocational safety-learning prototype for new workers in Jharkhand's mining, steel, and mica-processing sectors. It is designed around the practical problem in SIH26041: low-retention manual training, expensive/disruptive live drills, low accessibility of headset VR, language barriers, and the need to show measurable safety comprehension.

The learner uses an Android phone to view camera-backed 3D safety scenarios or a virtual 3D fallback. They practise a safety procedure, answer a competency assessment, receive a locally stored QR-enabled training record, and can be viewed from an offline dashboard.

### The current product promise

```
Phone-based practical safety learning
        ↓
Fire + Gas drill completion recorded offline
        ↓
Assessment unlocks and measures comprehension
        ↓
QR-enabled offline competency record
        ↓
Local supervisor/dashboard verification
```

This is a credible student demonstration of the required workflow. It must **not** be presented as an official DGMS certificate issuer, an emergency-dispatch system, or a deployed inspection platform.

## 2. Problem-statement alignment

| SIH26041 expectation | Current implementation | Status |
| --- | --- | --- |
| Mid-range Android device; no VR headset | Capacitor Android wrapper with WebGL/Three.js and a camera-backed or virtual 3D experience | Implemented; APK still needs device testing |
| At least two complete AR safety modules | Fire and Gas drills have action gating and completion tracking | Implemented |
| Fire/explosion safety | P.A.S.S. interaction, extinguisher choice, fire visuals, evacuation guidance | Implemented prototype |
| Gas/confined-space safety | Calibration, SCBA, cutoff and three-tug buddy action | Implemented prototype |
| Machinery safety | Danger zone, breaker isolation, LOTO lock and zero-energy verification | Implemented prototype |
| PPE / hazard awareness | 3D Gear Sandbox and Hazard Spotter routes | Present; should be expanded before final judging |
| Hindi and Santali localisation | English, Hindi and Santali/Ol Chiki UI; browser/device speech narration | Implemented, subject to device voice availability |
| Assessment | Four-question assessment, 75% pass threshold, locked until Fire and Gas drills are complete | Implemented |
| Certificate generation and verification | jsPDF record, QR code, and local offline record lookup | Demo implementation; not cross-device or cryptographically authoritative |
| Offline operation | Bundled Android assets, localStorage and Capacitor Preferences | Implemented for the APK/local record workflow |
| Web admin dashboard | Local roster, filtering, CSV/PDF export and QR/manual lookup | Demo implementation; no secure multi-user backend |

## 3. User journey

### Trainee flow

1. Select a language and worker profile.
2. Open **AR Training Modules**.
3. Complete the Fire sequence: Pull pin → Aim at base → Squeeze → Sweep.
4. Complete the Gas sequence: Calibrate → Don SCBA → Cut off source → Send three-tug buddy signal.
5. The assessment unlocks only when both required drills are stored as complete.
6. Pass the safety assessment with at least 75%.
7. Generate a PDF-based offline competency record with QR code.
8. Verify the record locally through the dashboard or QR verifier.

### Supervisor flow

1. Open **Offline Training Compliance Dashboard**.
2. Search/filter local worker records.
3. Inspect worker score, completed modules and certification state.
4. Verify a QR record manually or with the device camera when available.
5. Export a local CSV or PDF audit report.

## 4. Main capabilities

### 4.1 AR / 3D practical training

The main simulator has three scenario modes:

- **Fire & Explosion Response:** DCP/CO2 selection and the P.A.S.S. extinguisher procedure.
- **Gas Leak & Confined Space:** methane visualisation, SCBA, isolation and buddy-system response.
- **Machinery LOTO:** hazard perimeter, breaker isolation, personal lock/tag and zero-energy check.

It uses a phone camera feed when permission is granted. When camera/WebGL capability is missing, it presents a virtual 3D fallback so the training demo remains usable.

**Important limitation:** the current overlay is not spatially anchored to planes or recognised objects in the physical environment. It is camera-backed 3D simulation, not advanced SLAM/object-tracking AR.

### 4.2 Competency gate

Assessment is deliberately not an attendance-only quiz. The app now prevents a trainee from reaching the assessment until both Fire and Gas practical drills have been completed. The completion state is saved to the worker record on the device.

### 4.3 Accessibility and language

- English, Hindi and Santali/Ol Chiki user-interface text.
- Text-to-speech narration via the device/browser Web Speech API.
- High-contrast mode and large touch controls.
- Visual sequences designed to reduce dependence on long text instructions.

Santali narration uses the best available device voice; devices without a native Santali voice may use a Hindi speech fallback. This should be tested on the intended handset.

### 4.4 Supporting learning features

| Feature | Purpose |
| --- | --- |
| 3D Gear Sandbox | Inspect extinguisher, SCBA, detector and LOTO equipment |
| Hazard Spotter | Practise identifying unsafe conditions |
| Mine 3D Shaft Map | Visual safety/telemetry exploration |
| Gas Plume Simulator | Visualise ventilation and gas-seepage concepts |
| Pre-Shift Scanner | Demonstration of readiness/fatigue workflow |
| SurakshaMitra Assistant | Local rule-based/RAG-style safety information assistant |
| Worker Guide | Language-aware orientation and downloadable handbook |

### 4.5 Certificates and verification

The application can create a PDF record containing a worker identity, score, date and QR code. The QR verifier parses the local record ID and searches the roster stored on the same device.

This serves the hackathon requirement for an **offline prototype**. It is not a tamper-proof official certificate because it has no server-side signature, assessor identity, device-independent registry or revocation process.

### 4.6 Emergency reporting drill

The SOS screen is now correctly labelled as an **emergency reporting practice screen**. It helps a learner rehearse what information should be reported. It does not claim to dispatch a rescue team or notify DGMS.

## 5. Technology stack

### Application platform

| Layer | Technology | Role |
| --- | --- | --- |
| UI framework | React 19 | Component-based mobile/web interface |
| Build system | Vite 8 | Development server and production bundle |
| Styling | Tailwind CSS 4 | Responsive industrial UI and high-contrast styles |
| Native wrapper | Capacitor 8 | Packages web app into Android project |
| Android native project | Gradle / Android | Builds the Android APK |

### Learning and media

| Technology | Role |
| --- | --- |
| Three.js | WebGL 3D scenes, overlays, particles and equipment models |
| Web Media APIs | Camera feed through `getUserMedia` |
| DeviceOrientation API | Gyroscope-based interaction when available |
| Web Speech API | Voice prompts and spoken guidance |
| canvas-confetti | Assessment success feedback |
| Lucide React | Icons and accessible visual cues |

### Local data and documents

| Technology | Role |
| --- | --- |
| localStorage | Web/local roster and completion state |
| Capacitor Preferences | Persistent Android preference store |
| Capacitor Filesystem | Saves generated PDFs in native Android mode |
| jsPDF | Certificate, handbook and audit PDF generation |
| qrcode | QR generation for local training record lookup |

### Direct runtime dependencies

`@capacitor/android`, `@capacitor/camera`, `@capacitor/cli`, `@capacitor/core`, `@capacitor/filesystem`, `@capacitor/preferences`, `@capacitor/splash-screen`, `@capacitor/status-bar`, `@tailwindcss/vite`, `canvas-confetti`, `clsx`, `jspdf`, `lucide-react`, `qrcode`, `react`, `react-dom`, `tailwind-merge`, `tailwindcss`, and `three`.

Development dependencies are `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `oxlint`, and `vite`.

## 6. Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                 React application shell                  │
│ App.jsx: language, active learner, module progress, tabs │
└─────────────┬───────────────────────────────────────────┘
              │
 ┌────────────┼─────────────────────────────────────┐
 │            │                                     │
 ▼            ▼                                     ▼
AR simulator  Assessment                       Dashboard / Certificate
Three.js +    Requires Fire + Gas              local roster + QR lookup
camera        completion, then 75%             jsPDF + QR code
 │            │                                     │
 └────────────┴───────────────┬─────────────────────┘
                               ▼
              localStorage + Capacitor Preferences
                               ▼
                   Capacitor Android wrapper
```

## 7. Important files

| File | Responsibility |
| --- | --- |
| `src/main.jsx` | React root and application error boundary |
| `src/App.jsx` | Navigation, active worker, training completion and assessment gate |
| `src/components/ar/ARSimulatorContainer.jsx` | Fire, Gas and LOTO practical 3D/camera simulator |
| `src/components/assessment/AssessmentEngine.jsx` | Competency quiz and pass/fail flow |
| `src/components/certificate/CertificateView.jsx` | QR-enabled offline record and PDF export |
| `src/components/certificate/QRVerifierModal.jsx` | Local QR/manual record lookup |
| `src/components/admin/AdminDashboard.jsx` | Local compliance roster and exports |
| `src/components/ai/SurakshaAssistant.jsx` | Local safety assistant interface |
| `src/utils/ragEngine.js` | Bundled safety corpus and keyword retrieval |
| `src/utils/offlineStorage.js` | Worker roster, practical completion and assessment persistence |
| `src/components/guide/WorkerGuide.jsx` | Orientation pathway across safety domains |
| `android/` | Capacitor-generated native Android project |
| `capacitor.config.json` | Capacitor application and Android configuration |

## 8. Data model and offline behaviour

A worker record includes identity, language, sector, orientation period, score, certification state, module completion list, certificate record ID and issue date.

```js
{
  id: "JHK-MN-2026-081",
  name: "Budhan Manjhi",
  language: "sat",
  mineSector: "Jharia Coalfield, Dhanbad Cluster",
  modulesCompleted: ["Fire & Explosion Response", "Gas Leak & Confined Space"],
  score: 92,
  certified: true,
  certHash: "0x...",
  certDate: "2026-09-27"
}
```

The data is local to the browser/app installation. Clearing application storage will remove it. There is no server synchronisation in the current project.

## 9. Safety, legal and privacy position

The safety content is informed by the [Mines Act, 1952](https://www.indiacode.nic.in/bitstream/123456789/21434/1/mines-act-1952.pdf), the [Factories Act, 1948](https://labour.gov.in/sites/default/files/factories_act_1948.pdf), and the safety legislation listed by [DGMS](https://dgms.gov.in/UserView/index?mid=1654). These sources support the need for practical training, understandable safety communication, fire preparation and worker familiarity with emergency procedures.

However:

- Local records are not official certificates.
- No claim should be made that DGMS approves, operates or verifies this prototype.
- A mine-specific safety officer, authorised trainer and legal/regulatory review must validate all live training content.
- The app must not be used as an emergency-dispatch system.
- Real production deployment needs consent, access control, retention policy, encryption and a verified backend.

## 10. Android and security configuration

The project uses Capacitor for Android and declares camera/microphone-related capabilities necessary for learning features. The insecure custom WebView permission auto-grant was removed. Cleartext and mixed content are disabled in the current configuration.

### Current Android build status

| Check | Result |
| --- | --- |
| Web production bundle | Passed |
| Capacitor Android sync | Passed |
| Native APK compile | Not yet run on this machine; Java and Android SDK are missing |
| Android 10+ physical-device test | Pending |

## 11. Running the project

### Install packages

```powershell
npm ci
```

### Run web development mode

```powershell
npm run dev
```

If the project sits in a Windows path containing an apostrophe, npm script wrappers may misparse the path. Run Vite directly in that case:

```powershell
node .\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/`.

### Build and sync Android assets

```powershell
node .\node_modules\vite\bin\vite.js build
node .\node_modules\@capacitor\cli\bin\capacitor sync android
```

After installing Android Studio, a JDK and a compatible Android SDK:

```powershell
cd android
.\gradlew assembleDebug
```

The expected debug APK path is `android/app/build/outputs/apk/debug/app-debug.apk`.

## 12. Quality status

### Completed verification

- Dependency restore completed successfully.
- Production Vite bundle builds successfully.
- Capacitor Android asset/plugin sync succeeds.
- The running app loads successfully on localhost.
- The Fire drill's **Next Step** control is disabled until its required interaction is performed.
- The assessment is visibly locked before the two required practical drills are recorded.
- No browser console errors were observed in the verified learning-gate flow.

### Current quality warnings

The linter completes with non-blocking warnings, mainly unused imports/variables and React hook-dependency warnings in legacy components. These do not currently prevent a production build, but they should be addressed before final submission.

The production JavaScript bundle is approximately 1.44 MB before gzip compression. Route-level lazy loading for Three.js, PDF generation and dashboard code is a good performance improvement for lower-end phones.

## 13. Submission readiness checklist

### Required before SIH demonstration

- [ ] Install JDK, Android SDK and Android Studio.
- [ ] Compile the Android APK.
- [ ] Test the APK on at least one Android 10+ handset.
- [ ] Test camera permission, virtual fallback, audio, language switch and offline restart.
- [ ] Demonstrate both Fire and Gas drills end to end.
- [ ] Record a concise demo video: drill → assessment → QR record → dashboard verification.
- [ ] Push the final source to a public GitHub repository.

### Recommended improvements before deployment beyond a hackathon

- [ ] Add true spatial AR anchoring/plane or image-target detection.
- [ ] Add a secure backend and authenticated supervisor/assessor roles.
- [ ] Replace local record IDs with server-side digitally signed credentials.
- [ ] Add cross-device QR verification and revocation.
- [ ] Add managed offline sync/conflict handling.
- [ ] Validate each learning procedure with mine, steel and mica safety professionals.
- [ ] Run usability testing with Hindi and Santali-speaking trainees.
- [ ] Add formal automated tests and resolve lint warnings.

## 14. Final assessment

SurakshaAR is currently a **working, presentation-ready prototype** that demonstrates the main SIH26041 workflow: accessible practical training on a phone, measured comprehension, local records and supervisor visibility.

It becomes a complete contest submission after the Android APK is built/tested on a real device and the demo video/repository are prepared. It becomes a deployable industrial system only after secure backend verification, assessor governance, field validation and regulatory/site review are added.
