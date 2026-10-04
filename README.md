# Suraksha-AR

This repository contains two **fully independent** industrial-safety training projects. Their source, dependencies, build outputs, and deployment roots are kept separate, so a change or deployment in one project does not affect the other.

| Project | Folder | Technology | Permanent local command |
| --- | --- | --- | --- |
| Khanan Suraksha Sathi | `desktop-web` | Python / FastAPI | `run-desktop.bat` |
| SurakshaAR mobile app | `mobile-app` | React / Vite / Capacitor | `run-mobile.bat` |

## Run locally

### 1. Khanan Suraksha Sathi (desktop-web)

Install Python 3.9+ and its dependencies once:

```powershell
cd desktop-web
pip install -r requirements.txt
```

From the repository root, start it any time with:

```powershell
.\run-desktop.bat
```

It opens at `http://127.0.0.1:8000` (or the next available local port).

### 2. SurakshaAR (mobile-app)

Install Node.js LTS once. From the repository root, start it any time with:

```powershell
.\run-mobile.bat
```

The launcher installs dependencies the first time, then starts the Vite development server. Use the local URL printed in the terminal.

For an Android build, work only inside `mobile-app`:

```powershell
cd mobile-app
npm run build
npx cap sync android
```

## Independent server deployment

Create two separate services/sites and set each service's deployment root exactly as below:

| Service | Deployment root | Install command | Start / publish command |
| --- | --- | --- | --- |
| Desktop API | `desktop-web` | `pip install -r requirements.txt` | `uvicorn backend.app:app --host 0.0.0.0 --port 8000` |
| Mobile web app | `mobile-app` | `npm ci` | `npm run build` — publish `mobile-app/dist` as a static site |

Do not deploy from the repository root: it intentionally contains two unrelated apps. Pointing the two server services to their respective folders keeps their dependencies and releases isolated.

## Structure

```text
Suraksha-AR/
├── desktop-web/       # Khanan Suraksha Sathi Python/FastAPI project
├── mobile-app/        # SurakshaAR React/Vite/Capacitor project
├── run-desktop.bat    # permanent desktop-web launcher
└── run-mobile.bat     # permanent mobile-app launcher
```
