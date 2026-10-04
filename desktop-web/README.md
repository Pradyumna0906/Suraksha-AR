# ⛏️ खनन सुरक्षा साथी (Khanan Suraksha Sathi) v2.2
## SIH 26041: AR-Based Vocational Training Simulator for Industrial Safety in Jharkhand's Mining & Manufacturing Sector

**Theme**: Smart Automation | **Department**: Higher & Technical Education, Govt. of Jharkhand  
**Compliance Authority**: DGMS Dhanbad (HQ), Mines Act 1952 (Form B / Rule 29B), Coal Mines Regulations 2017 (Reg. 191)

---

## 📖 Overview

Jharkhand accounts for over 25% of India's mineral output, employing hundreds of thousands of workers—many of whom are young tribal recruits (Santhali, Munda, Ho, Oraon) and contract laborers with low literacy where static manuals yield $<20\%$ retention.

**Khanan Suraksha Sathi** is a mobile-first browser training application for practicing industrial safety drills. The current build has five interactive 3D drills, camera-assisted overlays, Hindi/Santhali interface support, a FastAPI/SQLite training service, and a service-worker shell for repeat visits offline.

> **Deployment and safety status:** This repository is a training demonstrator, not an approved DGMS certification or operational mine system. Camera mode composites 3D instruction over the live camera image; it does not perform world tracking, persistent surface anchoring, or spatial mapping. No signed Android APK or Unity/ARCore client is included. Backend telemetry is simulated. Do not use it as a substitute for site induction, approved procedures, competent supervision, or certified equipment.

---

## 🚀 Quick Start

### 1. Requirements
- Python 3.9+ installed
- Dependencies: `pip install fastapi uvicorn qrcode pillow pydantic`

### 2. Launch
Double click `run.bat` or run:
```bash
python start.py
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser. Camera permission is available on localhost; a phone accessing a hosted deployment needs HTTPS. Install the site from a supported mobile browser after its first online load. The app shell and successfully fetched libraries can then be cached for repeat offline use; API-backed worker accounts, dashboards, verification, and certificate issuance still require the server.

---

## 🎯 Key Features & Modules

1. **5 DGMS Vocational Hazard Drills**:
   - **Roof Strata & Sounding**: Acoustic testing, loose rock crack mapping, 3D roof bolt installation.
   - **Multi-Gas & Methane**: Roof/mid/floor sampling ($CH_4, CO, O_2, H_2S$), $1.25\%$ electrical power cutoff, brattice curtain airflow.
   - **Conveyor LOTO Protocol**: 6-step lockout/tagout sequence (switch, hasp, lock, danger tag, zero-energy test).
   - **100T Dumper Blind Spot**: 360° HEMM proximity visualizer & DGMS horn code verification (1=start, 2=forward, 3=reverse).
   - **SCSR 60s Escape Drill**: 60-second emergency escape drill under simulated smoke with heart-rate BPM and oxygen starter pin.
2. **Camera-assisted training view**:
   - Uses the rear camera where available, displays 3D training models over the live feed, and clearly labels that this is an overlay without world tracking. The 3D sandbox remains available when camera access is unavailable.
3. **Suraksha Sathi Multilingual Voice Assistant**:
   - Speech synthesis & voice recognition in **Hindi, Santhali, Mundari, Bengali, and English**.
   - One-click **"🔊 Listen / ऑडियो सुनें"** audio trigger on every training step.
4. **Training record and QR demo**:
   - Server-generated QR training records and a scanner workflow. Cryptographic hashes in this demo are not a government trust chain or independent certification authority.
5. **Pithead Gate Inspector Scanner**:
   - Live camera QR scanning with instant access decision:
     - ✅ Verified Competent
     - ⚠️ `<30 Days` High-Risk Protocol (Mandatory Buddy Miner)
     - ❌ Access Denied
6. **DGMS Dhanbad Command Center**:
   - Live simulated IoT SCADA gas telemetry grid and district readiness ranking.

### Offline use

After one successful online visit, the service worker caches the application shell and resources fetched by the browser. If the API is unavailable, the learner can complete local practice drills; those entries are stored on that browser only and are not official results or certificates. Reconnect to the backend to use registered worker accounts and server records.
