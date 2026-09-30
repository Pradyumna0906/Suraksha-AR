# SurakshaAR Repository Audit — Phase 0

**Audit date:** 2026-09-27  
**Scope:** Phase 0 of `correction.md` only.  
**Method:** static repository inspection; no production feature edits, dependency installation, build, lint, test, APK build, or device test was run.  
**Phase 0 output:** this file.

## Executive finding

SurakshaAR is a useful React/Capacitor training **prototype shell**, with camera-backed Three.js scenes, guided Fire/Gas/LOTO interactions, local-language UI, local persistence, PDF/QR rendering, a local dashboard, and a deterministic answer-retrieval assistant.

It is **not currently a production-ready safety competency platform**. The most important advertised capabilities are either missing or falsely implied:

- The “AR” view is a WebRTC camera behind a Three.js scene; it has no ARCore session, plane detection, raycast, anchor, or tracking-loss implementation.
- Fire/Gas/LOTO are hard-coded UI action sequences. Fire completion sends a fixed score of `95`; the assessment is four MCQs.
- Credentials are device-local records with a custom 32-bit string hash, not cryptographic signatures or cross-device verification.
- The dashboard, hazard panels, thermal values, gas values, shaft telemetry, and several clearance claims contain seeded or mathematical demo data presented as live/operational data.
- Some previously improved wording is contradicted by translations, dashboard exports, assistant responses, and emergency-report internals.

The correct course is incremental: first remove false claims and label demonstrations, then introduce the scenario/competency domain model, then native Android ARCore, durable offline storage, and server-issued credentials. Do **not** rewrite the React product shell.

## 1. Repository snapshot

| Area | Current state |
| --- | --- |
| Web application | React 19 + Vite 8, JavaScript/JSX, Tailwind CSS 4. |
| Mobile wrapper | Capacitor Android 8. |
| 3D rendering | Three.js `0.186.0`. |
| Camera | Browser `getUserMedia`; Capacitor Camera permission request attempted from JSX. |
| Local persistence | Browser `localStorage` plus fire-and-forget Capacitor Preferences writes. |
| PDF / QR | `jspdf` and `qrcode`; no verifier backend. |
| API / database / authentication | Not present. No backend directory, REST client, database schema, login, tenant model, or sync queue. |
| Native ARCore | Not present. No ARCore/AR Foundation dependency, native AR package, Capacitor plugin, or Android AR session code. |
| Automated tests | No React/unit tests. Only generated Capacitor example tests remain under `android/app/src/{test,androidTest}/java/com/getcapacitor/myapp/`, which does not match the app namespace. |
| Scripts | `dev`, `build`, `lint`, and `preview`; no `test` script. |

### Exact Android identity and plugin state

- Android namespace and application ID: `in.gov.jharkhand.surakshaar` in [android/app/build.gradle](android/app/build.gradle:4) and [capacitor.config.json](capacitor.config.json:2).
- Main activity: [android/app/src/main/java/in/gov/jharkhand/surakshaar/MainActivity.java](android/app/src/main/java/in/gov/jharkhand/surakshaar/MainActivity.java:1). It is a plain `BridgeActivity`; there is no custom Capacitor plugin or `/ar/` native package.
- `android:usesCleartextTraffic="false"` and `allowMixedContent: false` are already positive security corrections in [AndroidManifest.xml](android/app/src/main/AndroidManifest.xml:12) and [capacitor.config.json](capacitor.config.json:9).
- The manifest still requests `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, `WAKE_LOCK`, and legacy external-storage permissions. Their necessity must be re-justified when features are corrected. See [AndroidManifest.xml](android/app/src/main/AndroidManifest.xml:41).
- No manifest AR requirement/optional capability declaration and no Gradle ARCore library are present.

### Working-tree note

The repository was already dirty before this audit. Existing changes include source, Android, and documentation changes from prior work; this Phase 0 task adds only `AUDIT.md` and does not alter production implementation files.

## 2. Responsibility map

| Responsibility | Current file(s) | Audit result |
| --- | --- | --- |
| Application orchestration, profiles, HUD | [src/App.jsx](src/App.jsx:1) | Main routing and demo-worker state; also contains misleading “AI/live telemetry” HUD. |
| Navigation / SOS entry point | [src/components/common/Header.jsx](src/components/common/Header.jsx:1) | Exposes many prototype features as production-like navigation. |
| Camera + 3D drill scenes | [src/components/ar/ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:1) | Camera-backed Three.js, not true spatial AR. |
| Written assessment | [src/components/assessment/AssessmentEngine.jsx](src/components/assessment/AssessmentEngine.jsx:1) | Four hard-coded MCQs and fixed threshold logic. |
| Worker roster / local progress / local verifier lookup | [src/utils/offlineStorage.js](src/utils/offlineStorage.js:1) | `localStorage` primary store, seeded users, simplistic certification state. |
| Claimed crypto helper | [src/utils/cryptoAudit.js](src/utils/cryptoAudit.js:1) | Non-cryptographic custom hash; unsafe authority assertions. |
| Credential PDF + QR generation | [src/components/certificate/CertificateView.jsx](src/components/certificate/CertificateView.jsx:1) | PDF and QR are functional, but verification is device-local and unsigned. |
| QR scanner / verifier UI | [src/components/certificate/QRVerifierModal.jsx](src/components/certificate/QRVerifierModal.jsx:1) | Uses BarcodeDetector when available; maps the scanned string to local roster data only. |
| Dashboard / exports | [src/components/admin/AdminDashboard.jsx](src/components/admin/AdminDashboard.jsx:1) | UI uses local roster plus hard-coded regional figures. |
| Safety assistant | [src/components/ai/SurakshaAssistant.jsx](src/components/ai/SurakshaAssistant.jsx:1), [src/utils/ragEngine.js](src/utils/ragEngine.js:1) | Bundled keyword retrieval, not vector RAG/LLM; some answers are unsafe/unverified. |
| Emergency drill | [src/components/emergency/EmergencySosModal.jsx](src/components/emergency/EmergencySosModal.jsx:1) | Mostly relabelled as a drill, but hidden text/audio still claim actual dispatch. |
| Simulated sensor/inspection features | `gas`, `telemetry`, `scanner`, and AR components | Must be either removed from demo path or prominently labelled simulation/demo. |
| Localization | [src/locales/translations.js](src/locales/translations.js:1) | English/Hindi/Santali keys exist; several strings still claim DGMS approval or official certificates. |

## 3. Detailed findings

Severity reflects user safety, truthfulness, or ability to satisfy the problem statement—not visual polish.

### P0 — false or high-risk product claims

| ID | Finding | Evidence | Why it matters | Phase 1 correction |
| --- | --- | --- | --- | --- |
| P0-AR-01 | The primary AR screen claims spatial tracking that it does not perform. | [ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:110) uses `getUserMedia`; the Three.js scene is created at [line 235](src/components/ar/ARSimulatorContainer.jsx:235). UI hard-codes `AR SPATIAL TARGET LOCKED`, `DIST: 1.4m`, and `COMPUTE CV TRACKER ONLINE` at [lines 1020–1038](src/components/ar/ARSimulatorContainer.jsx:1020). | A camera image behind WebGL has no evidence of real-world pose, plane, distance, target lock, computer vision, or stable placement. | Replace status with `CAMERA-BACKED 3D SIMULATION` until native ARCore is implemented. Remove fixed distance/CV/lock claims. |
| P0-AR-02 | Thermal, gas, and sensor displays are mathematical simulations but appear as measured data. | `getThermalData()` begins at [line 599](src/components/ar/ARSimulatorContainer.jsx:599); generated values are shown as FLIR data at [line 1109](src/components/ar/ARSimulatorContainer.jsx:1109). Gas starts at `1.85`, then is programmatically set to `0.42` at [line 525](src/components/ar/ARSimulatorContainer.jsx:525). | Users could mistake safety-training visuals for operational sensing. | Label every such value `SIMULATED`; eliminate FLIR brand/device, measured temperature, and distance claims unless sourced by real hardware. |
| P0-SCORE-01 | Practical module completion sends a fixed score of `95`. | [ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:583) and [line 594](src/components/ar/ARSimulatorContainer.jsx:594). | This invalidates competency claims; no event evidence, critical failure, timing, or rule evaluation exists. | Remove score parameter; replace with an event log only after Phase 2 engine exists. |
| P0-CRED-01 | Certificate identifiers are predictable custom hashes, not cryptography; a helper also falsely describes them as cryptographic. | `generateCertHash` in [offlineStorage.js](src/utils/offlineStorage.js:118); `sha256Simple` in [cryptoAudit.js](src/utils/cryptoAudit.js:3) is a 32-bit rolling hash despite its name. `verifyCertificateIntegrity` only checks `0x` and length at [line 43](src/utils/cryptoAudit.js:43). | A worker can forge/alter the identifier. No integrity, issuer, revocation, expiry, or cross-device proof exists. | Stop calling this hash/signature/integrity verification. Keep the record explicitly device-local until Phase 7 server signing. |
| P0-CRED-02 | QR verification is only a lookup in the same device’s local worker roster. | QR contains `?verify=${certHash}` at [CertificateView.jsx](src/components/certificate/CertificateView.jsx:29); scanner calls `verifyCertByHash` at [QRVerifierModal.jsx](src/components/certificate/QRVerifierModal.jsx:83). | The QR cannot authoritatively verify a credential on another device. | Label `Local demo record lookup`; remove “authenticity” claims; implement signed server credentials later. |
| P0-TELE-01 | The header/App imply a real AI monitoring system and live industrial telemetry. | [Header.jsx](src/components/common/Header.jsx:24) has a “DGMS ALERT” ticker and `LIVE TICKER`; [App.jsx](src/App.jsx:178) displays `AI HAZARD DETECTION & MONITORING PANEL` plus `LIVE TELEMETRY SYNCED`. Values such as CH4 1.85 are hard-coded. | There is no sensor, CV model, backend, or telemetry connection. | Hide these from the core demo or visibly badge the complete panel `DEMO SIMULATION — NO LIVE SENSOR DATA`. |
| P0-SOS-01 | The emergency screen is visibly a drill, but internal output still says a beacon was dispatched to DGMS and copies a “Control Room Notified” message. | [EmergencySosModal.jsx](src/components/emergency/EmergencySosModal.jsx:32) and [line 36](src/components/emergency/EmergencySosModal.jsx:36). | Contradicts the safe drill label; could be dangerous if users rely on it. | Replace all hidden/speech/copied text with drill-only wording; retain actual `tel:112` as a deliberately user-initiated call option. |
| P0-CLEAR-01 | Pre-shift scanner simulates PPE/fatigue and issues an “approved for shift” clearance card, with a claimed HMAC stamp. | Simulation/random behavior [PreShiftFatigueScanner.jsx](src/components/scanner/PreShiftFatigueScanner.jsx:87) and [lines 110–114](src/components/scanner/PreShiftFatigueScanner.jsx:110); approval at [line 143](src/components/scanner/PreShiftFatigueScanner.jsx:143); HMAC label at [line 379](src/components/scanner/PreShiftFatigueScanner.jsx:379). | This is outside the core scope and makes a safety/fitness decision without valid measurement. | Remove from primary navigation or label it an untrusted prototype exercise; never issue clearance. |

### P1 — core implementation gaps

| ID | Finding | Evidence | Required direction |
| --- | --- | --- | --- |
| P1-SCN-01 | Scenario logic is stateful button gating, not a reusable data model/state machine. | Fire/Gas/LOTO use component state and handlers in [ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:61), [line 510](src/components/ar/ARSimulatorContainer.jsx:510), and [line 535](src/components/ar/ARSimulatorContainer.jsx:535). | Add domain types, immutable scenario config, transition evaluator, event log, policies, competency definitions, and rule-based feedback in Phase 2. |
| P1-SCN-02 | Fire module can progress through interactions that do not correspond to its visible step, and route/hazard recognition are not truly assessed. | Buttons are always rendered for all Fire actions at [ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:1139); only `Next step` is gated. | Action rules must specify prerequisites/allowed state/unsafe state, then scenario code must reject or record invalid sequence. |
| P1-SCN-03 | Gas data is presented as live gas sensing and the drill changes it programmatically. | [ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:68), [line 525](src/components/ar/ARSimulatorContainer.jsx:525), [line 1047](src/components/ar/ARSimulatorContainer.jsx:1047). | Use `SIMULATED CH4` and a configuration-driven safe-response scenario; do not imply a detector or cutoff connection. |
| P1-ASM-01 | Assessment is only four static MCQs. | Questions at [AssessmentEngine.jsx](src/components/assessment/AssessmentEngine.jsx:16); result is `correctCount / questions.length` at [line 102](src/components/assessment/AssessmentEngine.jsx:102). | Treat MCQs as supporting knowledge evidence. Phase 2 must make action evidence and critical failures primary. |
| P1-ASM-02 | Passing threshold is inconsistent and hard-coded. | Assessment passes at 75% [AssessmentEngine.jsx](src/components/assessment/AssessmentEngine.jsx:106), while translation says minimum 80% [translations.js](src/locales/translations.js:24). | Put a versioned assessment policy in scenario content; use one rendered policy value. |
| P1-ASM-03 | “Practical score (88%) + Quiz score” is only a comment; no practical score enters the calculation. | [AssessmentEngine.jsx](src/components/assessment/AssessmentEngine.jsx:101). | Remove the misleading comment in Phase 1; replace with actual merged competency logic in Phase 2. |
| P1-OFF-01 | Offline persistence is not a durable structured training database. | Primary read/write is `localStorage` [offlineStorage.js](src/utils/offlineStorage.js:60); Capacitor Preferences writes are not awaited/read back [lines 62–63](src/utils/offlineStorage.js:62). | Phase 5: SQLite/native store or a suitable abstraction with sessions, events, results, content version, credential record, and sync queue. |
| P1-OFF-02 | No sync/API conflict or idempotency design exists. | No backend/network module in repository; package dependencies contain no HTTP/data layer. | Phase 6: backend, event IDs, outbox, acknowledgment, retry, and tenant authorization. |
| P1-DASH-01 | Dashboard regional telemetry is hard-coded but visually operational. | `mineClusters` starts [AdminDashboard.jsx](src/components/admin/AdminDashboard.jsx:33), including 420/450 workers at [line 34](src/components/admin/AdminDashboard.jsx:34). | Mark all seeded data `DEMO DATA` or remove it until it comes from an authenticated backend. |
| P1-AI-01 | “RAG/vector intelligence” is a local keyword scorer with invented confidence. | [ragEngine.js](src/utils/ragEngine.js:96) tokenizes keyword text; confidence is calculated from score at [line 130](src/utils/ragEngine.js:130). UI calls it “DGMS RAG Safety Intelligence” [SurakshaAssistant.jsx](src/components/ai/SurakshaAssistant.jsx:28). | Rename to `Verified Safety Knowledge Assistant (prototype)` only after source validation; return “no approved answer” on no confidence. Do not use it for operational advice. |
| P1-AI-02 | Assistant fallback directs workers to unverified emergency contact/process. | [SurakshaAssistant.jsx](src/components/ai/SurakshaAssistant.jsx:84) through [line 88](src/components/ai/SurakshaAssistant.jsx:88). | Remove fabricated contact number and generic emergency procedure; redirect to approved site plan/trainer. |
| P1-LOC-01 | Translations contradict corrected truthfulness language. | English strings claim “DGMS Compliant”, “official DGMS safety badge”, and “OFFICIAL SAFETY CERTIFICATE” at [translations.js](src/locales/translations.js:4), [line 60](src/locales/translations.js:60), [line 67](src/locales/translations.js:67); equivalent Hindi/Santali claims persist. | Phase 1 content pass across all languages, reviewed by a speaker for safety-critical narration/text. |
| P1-REG-01 | Code and exports repeatedly make regulator/legal claims that are not verified by the implementation. | Dashboard exports use “DGMS INDUSTRIAL SAFETY AUDIT REPORT” [AdminDashboard.jsx](src/components/admin/AdminDashboard.jsx:87); Certificate file name still begins `DGMS_Safety_Certificate` [CertificateView.jsx](src/components/certificate/CertificateView.jsx:110); app footer says historical acts “Aligned” [App.jsx](src/App.jsx:325). | Use “SurakshaAR prototype training record”; keep legal references in reviewed documentation with no approval claim. |

### P2 — design, lifecycle, and maintainability observations

| ID | Finding | Evidence / consequence | Follow-up |
| --- | --- | --- | --- |
| P2-AR-01 | `disposeThreeObject` is declared in the AR component but never used by the scene-creation effect. | [ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:14). The Three.js initialization effect has no scene/renderer disposal return. Reinitialization may retain resources. | On native-AR migration, explicitly dispose scene/material/renderer and stop camera/AR session on close/background. |
| P2-AR-02 | Camera permission is handled in two layers. | Capacitor Camera permission request plus Web `getUserMedia` in [ARSimulatorContainer.jsx](src/components/ar/ARSimulatorContainer.jsx:99). | Native ARCore plugin should own camera/AR permission and status. React receives structured capability/tracking events. |
| P2-UX-01 | Demo-worker switching is exposed in normal UI. | `Switch Miner` at [App.jsx](src/App.jsx:139). | Separate `DEMO MODE` from enrolled worker mode; never expose arbitrary profiles in production. |
| P2-UI-01 | Navigation exposes unrelated/fake-production utilities. | Header exposes `Mine 3D Shaft Map`, `Pre-Shift Scan`, `Gas Plume AR`, and `AI`/`RAG` badges at [Header.jsx](src/components/common/Header.jsx:19). | Keep only scope-aligned demo tools or label/segregate experimental simulations. |
| P2-DUP-01 | Several files are re-export aliases and are not routed directly. | `SurakshaMitraAI.jsx`, `GearSandbox.jsx`, and `HazardSpotter.jsx`. `SosBeaconModal.jsx` is not imported by the app. | Retain temporarily; document/clean them after Phase 1 rather than deleting working visual assets during audit. |
| P2-AUD-01 | No content approval/versioning model exists. | Text, thresholds, safety claims, and translations are compiled directly in JSX/JS. | Phase 2/15 governance: scenario/content package version, SOP reference, reviewer, effective dates, approval status. |
| P2-TEST-01 | Test coverage does not validate current business logic. | No web tests; Android example test packages remain `com.getcapacitor.myapp`. | Add targeted rules-engine tests first; defer full device tests until ARCore Phase 3. |

## 4. Positive assets to retain

These reduce delivery time and should be refactored, not discarded:

- React/Vite/Tailwind shell and responsive worker-oriented UI.
- Capacitor Android project with current application namespace and secure cleartext/mixed-content settings.
- Three.js visual assets, which remain useful for 3D fallback, equipment exploration, and AR-rendered objects.
- Module navigation and explicit Fire/Gas assessment gate.
- Existing Hindi, Santali/Ol Chiki, and English content structure (after truthfulness and language review).
- Camera and QR scanner UI patterns, after capability/error/warning correction.
- PDF layout and QR rendering as presentation layers for a future signed credential.
- Browser offline concept and existing roster UI as a temporary `DEMO DATA` fixture.
- Documentation already present: `PROJECT_STATUS.md`, `SOLUTION_ALIGNMENT.md`, `SIH26041_IMPLEMENTATION_BLUEPRINT.md`, and `FIRE_RESPONSE_STATE_MACHINE.md`.

## 5. Dependency and architecture gap assessment

### Existing relevant dependencies

| Dependency | Current use / suitability |
| --- | --- |
| `three` | Suitable for 3D visualization and fallback, but it does not supply native ARCore plane/anchor tracking. |
| `@capacitor/core` / `@capacitor/android` | Correct integration basis for a native Android plugin. |
| `@capacitor/camera` | Photo/camera permission support, not a substitute for an ARCore session. |
| `@capacitor/preferences` | Simple key-value preference storage, not a training event database or sync outbox. |
| `@capacitor/filesystem` | Suitable for PDF export/content cache support. |
| `jspdf`, `qrcode` | Suitable presentation utilities, not a credential-signing system. |

### Do not add yet

Phase 0 has not installed anything. Package additions should wait until their phase and decision record:

1. **Phase 2:** no library is required to define a JavaScript scenario engine and deterministic rules tests.
2. **Phase 3:** add the smallest supported native Android ARCore dependency and a Capacitor bridge; do not add a large AR framework merely to display models.
3. **Phase 5:** select a maintained Capacitor/native SQLite option only after the schema and migration needs are agreed.
4. **Phase 6/7:** backend-owned asymmetric signing; private keys must never enter the APK or web bundle.

## 6. Proposed incremental change order

### Phase 1 — truthfulness and safety wording

1. Replace false AR status, distances, CV, thermal, live telemetry, and sensor wording with truthful simulation/fallback states.
2. Remove remaining DGMS/government/statutory/official claims from English, Hindi, Santali, exports, filenames, and dashboard titles.
3. Remove false dispatch text from the SOS drill and remove fabricated assistant emergency content.
4. Mark seeded workers/dashboard/sensor values as `DEMO DATA`.
5. Remove the fixed 95 practical score and misleading scoring comment; do not yet introduce a replacement scoring model in UI.
6. Put every passing threshold in one temporary policy constant, rendered consistently, pending Phase 2 versioned policy.

**Targeted validation after Phase 1:** source search for forbidden claims plus a single browser smoke check of the touched screens. No Android build unless native files change.

### Phase 2 — domain model and engine

1. Add `src/domain/scenario/` for scenario types/config, action event, transition evaluator, competency result, and assessment policy.
2. Implement deterministic Fire event log and computed competency vector from the approved state graph.
3. Migrate Gas to the same engine; preserve visual assets and localization keys.
4. Add critical-failure rules, practice/assessment modes, scenario seed/version, and focused rules-engine tests.

**Targeted validation after Phase 2:** rules-engine tests covering correct path, unsafe action, critical failure, timeout, and deterministic replay; one React integration path for Fire.

### Later phases

- **Phase 3:** native Android ARCore/Capacitor bridge with capability, true/fallback status, plane/raycast/anchor, tracking loss, and one-device smoke test.
- **Phase 4:** remediation assignment from deterministic weak-competency rules and scenario variation.
- **Phase 5:** durable local database and outbox.
- **Phase 6/7:** authenticated backend, sync, signed cross-device credentials, revocation, and dashboard APIs.
- **Phase 8/9:** reviewed language/audio packs and security/privacy hardening.

## 7. Phase 0 exit-condition checklist

| Required question | Result |
| --- | --- |
| Which files implement AR? | `src/components/ar/ARSimulatorContainer.jsx`; no native AR implementation exists. |
| Which files implement scenarios? | Hard-coded inside `ARSimulatorContainer.jsx`; no reusable scenario model exists. |
| Which files implement assessment? | `src/components/assessment/AssessmentEngine.jsx`; MCQ-only scoring. |
| Which files implement storage? | `src/utils/offlineStorage.js`; `localStorage` plus Preferences mirror. |
| Which files implement certificates/QR? | `CertificateView.jsx`, `QRVerifierModal.jsx`, `offlineStorage.js`, and unused/misleading `cryptoAudit.js`. |
| Which files implement dashboard? | `src/components/admin/AdminDashboard.jsx`; local and seeded data. |
| Which files implement AI assistant? | `SurakshaAssistant.jsx` + `ragEngine.js`; keyword corpus retrieval. |
| Which file implements SOS? | `EmergencySosModal.jsx`; drill UI with remaining false dispatch strings. |
| What is the Android package namespace? | `in.gov.jharkhand.surakshaar`. |
| What Capacitor plugin structure exists? | Standard generated Capacitor setup only; no custom native plugin. |
| Where is permission/security code? | Android manifest, `MainActivity.java`, `capacitor.config.json`, and web camera calls in AR/QR/scanner components. |
| Where is hard-coded demo telemetry? | `App.jsx`, `Header.jsx`, `AdminDashboard.jsx`, `ARSimulatorContainer.jsx`, `Mine3DMapExplorer.jsx`, and `PreShiftFatigueScanner.jsx`. |

## 8. Completion statement

**Phase 0 is complete.** The repository has been inspected and the implementation map, false-claim inventory, dependency gaps, exact Android namespace, and phased correction path are documented above. No production feature changes, builds, or tests were performed during this phase.
