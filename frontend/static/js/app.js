/**
 * Main Application Controller v2.2 for Khanan Suraksha Sathi
 * Connects Frontend UI, 3D WebAR Simulator, Live Simulated IoT Gas Telemetry,
 * Vernacular Voice Narration Triggers, Dynamic QR Digital Passport, and Pithead Gate Scanner.
 */

let appState = {
  currentTab: 'training',
  currentWorker: null,
  workersList: [],
  selectedModule: 'roof_strata',
  isCameraAR: false,
  isAudioMuted: false,
  language: 'hindi',
  arEngine: null,
  activeDrillInstance: null,
  stats: null,
  advisories: [],
  currentStepInstruction: "",
  liveGasTelemetry: null,
  html5QrScanner: null
};
window.appState = appState;

// Multilingual i18n Dictionary
const i18n = {
  hindi: {
    appTitle: "खनन सुरक्षा साथी",
    subTitle: "झारखंड खदान व विनिर्माण क्षेत्र हेतु AR आधारित व्यावसायिक सुरक्षा सिम्युलेटर",
    tabTraining: "AR सुरक्षा प्रशिक्षण",
    tabMentor: "AI सुरक्षा साथी",
    tabPassport: "DGMS डिजिटल पासपोर्ट",
    tabGate: "गेट इंस्पेक्टर स्कैनर",
    tabAdmin: "DGMS धनबाद कमांड",
    switchCameraAR: "📸 कैमरा अभ्यास",
    switch3DSandbox: "🎮 3D सैंडबॉक्स मोड",
    recruitHighRiskBadge: "⚠️ उच्च जोखिम नवागंतुक (<30 दिन)",
    startDrill: "प्रशिक्षण शुरू करें",
    nextStep: "अगला चरण",
    viewPassport: "डिजिटल पासपोर्ट देखें",
    listenBtn: "🔊 ऑडियो सुनें"
  },
  santhali: {
    appTitle: "ᱠᱷᱟᱫᱟᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱜᱟᱛᱮ",
    subTitle: "ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱠᱷᱟᱫᱟᱱ ᱞᱟᱹᱜᱤᱫ AR ᱵᱷᱳᱠᱮᱥᱱᱟᱞ ᱴᱨᱮᱱᱤᱝ",
    tabTraining: "AR ᱨᱩᱠᱷᱤᱭᱟᱹ ᱴᱨᱮᱱᱤᱝ",
    tabMentor: "AI ᱨᱩᱠᱷᱤᱭᱟᱹ ᱜᱟᱛᱮ",
    tabPassport: "DGMS ᱰᱤᱡᱤᱴᱟᱞ ᱯᱟᱥᱯᱳᱨᱴ",
    tabGate: "ᱜᱮᱴ ᱤᱱᱥᱯᱮᱠᱴᱚᱨ",
    tabAdmin: "DGMS ᱫᱷᱟᱱᱵᱟᱫᱽ ᱠᱚᱢᱟᱱᱰ",
    switchCameraAR: "📸 ᱠᱮᱢᱨᱟ ᱴᱨᱮᱱᱤᱝ",
    switch3DSandbox: "🎮 3D ᱥᱮᱱᱰᱵᱚᱠᱥ",
    recruitHighRiskBadge: "⚠️ ᱱᱟᱣᱟ ᱠᱟᱹᱢᱤᱭᱟᱹ (<30 ᱢᱟᱦᱟᱸ)",
    startDrill: "ᱴᱨᱮᱱᱤᱝ ᱮᱛᱚᱦᱚᱵ ᱢᱮ",
    nextStep: "ᱞᱟᱦᱟ ᱥᱮᱫ",
    viewPassport: "ᱯᱟᱥᱯᱳᱨᱴ ᱧᱮᱞ ᱢᱮ",
    listenBtn: "🔊 ᱟᱸᱡᱚᱢ ᱢᱮ"
  },
  mundari: {
    appTitle: "खदान सुरक्षा संगी",
    subTitle: "झारखंड खान को लागी AR वोकेशनल सेफ्टी ट्रेनिंग",
    tabTraining: "AR सुरक्षा ट्रेनिंग",
    tabMentor: "AI सुरक्षा संगी",
    tabPassport: "DGMS डिजिटल पासपोर्ट",
    tabGate: "गेट इंस्पेक्टर",
    tabAdmin: "DGMS कमान्ड",
    switchCameraAR: "📸 कैमरा अभ्यास",
    switch3DSandbox: "🎮 3D सैंडबॉक्स",
    recruitHighRiskBadge: "⚠️ नवा खनिक (<30 दिन)",
    startDrill: "ट्रेनिंग शुरू करी",
    nextStep: "लाहा सेन",
    viewPassport: "पासपोर्ट नेल करी",
    listenBtn: "🔊 ऑडियो आजोम"
  },
  bengali: {
    appTitle: "খনন সুরক্ষা সাথী",
    subTitle: "ঝাড়খণ্ড খনি ও উৎপাদন শিল্পের জন্য এআর ভোকেশনাল নিরাপত্তা প্রশিক্ষক",
    tabTraining: "এআর নিরাপত্তা প্রশিক্ষণ",
    tabMentor: "এআই সুরক্ষা সাথী",
    tabPassport: "ডিজিএমএস ডিজিটাল পাসপোর্ট",
    tabGate: "গেট পরিদর্শক স্ক্যানার",
    tabAdmin: "ডিজিএমএস ধানবাদ কমান্ড",
    switchCameraAR: "📸 ক্যামেরা অনুশীলন",
    switch3DSandbox: "🎮 3D স্যান্ডবক্স মোড",
    recruitHighRiskBadge: "⚠️ উচ্চ ঝুঁকিপূর্ণ নতুন কর্মী (<৩০ দিন)",
    startDrill: "প্রশিক্ষণ শুরু করুন",
    nextStep: "পরবর্তী পদক্ষেপ",
    viewPassport: "ডিজিটাল পাসপোর্ট দেখুন",
    listenBtn: "🔊 অডিও শুনুন"
  },
  english: {
    appTitle: "Khanan Suraksha Sathi",
    subTitle: "AR-Based Vocational Training Simulator for Jharkhand Mining & Manufacturing",
    tabTraining: "AR Safety Training",
    tabMentor: "AI Voice Mentor",
    tabPassport: "DGMS Digital Passport",
    tabGate: "Pithead Gate Scanner",
    tabAdmin: "DGMS Dhanbad Command",
    switchCameraAR: "📸 Camera overlay practice",
    switch3DSandbox: "🎮 3D Sandbox Mode",
    recruitHighRiskBadge: "⚠️ High-Risk Recruit (<30 Days)",
    startDrill: "Start Drill",
    nextStep: "Next Step",
    viewPassport: "View Digital Passport",
    listenBtn: "🔊 Listen Audio"
  }
};

// Application Bootstrap
document.addEventListener('DOMContentLoaded', async () => {
  appState.arEngine = new AREngine('arCanvas', 'cameraVideo');

  await loadWorkers();
  await loadDashboardStats();
  await loadAdvisories();

  setupNavigation();
  setupFieldConsoleHero();
  setupLanguageSelector();
  setupDrillModules();
  setupVisionModeControls();
  setupVoiceMentorUI();
  setupGateInspectorUI();
  setupSnapshotButton();

  // Start Live IoT Gas Telemetry Polling Loop
  startLiveGasTelemetryLoop();

  // Start Default Vocational Drill
  startSelectedModule('roof_strata');
});

function setupFieldConsoleHero() {
  const trainingCta = document.getElementById('heroStartTraining');
  const cameraStatus = document.getElementById('cameraSupportStatus');
  const trainingStage = document.querySelector('.training-stage');
  if (trainingCta && trainingStage) trainingCta.addEventListener('click', () => trainingStage.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  if (!cameraStatus) return;
  if (location.protocol === 'file:') {
    cameraStatus.textContent = 'OPEN THROUGH start.py FOR CAMERA & LIVE DATA';
    cameraStatus.title = 'Direct file preview can show the interface, but camera permissions and the training API require the app server.';
  } else if (!window.isSecureContext) {
    cameraStatus.textContent = 'HTTPS REQUIRED FOR PHONE CAMERA';
    cameraStatus.title = 'Camera access is blocked on insecure network addresses. Open this app through HTTPS.';
  } else if (!navigator.mediaDevices?.getUserMedia) {
    cameraStatus.textContent = 'CAMERA API NOT AVAILABLE';
  } else {
    cameraStatus.textContent = 'CAMERA READY · TAP TO ENABLE';
  }
}

// ==========================================
// 1. LIVE SIMULATED IoT GAS TELEMETRY STREAM
// ==========================================
function startLiveGasTelemetryLoop() {
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry/live-gas');
      const data = await res.json();
      appState.liveGasTelemetry = data;
      renderGasTelemetryBanner(data);
      if (appState.currentTab === 'admin') {
        renderCommandCenterGasCards(data);
      }
    } catch (e) {
      console.warn("Gas telemetry fetch error", e);
    }
  };

  fetchTelemetry();
  setInterval(fetchTelemetry, 3000);
}

function renderGasTelemetryBanner(data) {
  const ticker = document.getElementById('safetyAdvisoryTicker');
  if (!ticker) return;

  const moonidih = data.mines.find(m => m.mine_id === 'M-DHN-01') || data.mines[0];
  const isCritical = moonidih.ch4_pct >= 1.25;
  const isWarning = moonidih.ch4_pct >= 0.8;

  ticker.innerHTML = `
    <div class="flex items-center gap-2.5 text-xs">
      <span class="flex h-2.5 w-2.5 relative">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${isCritical ? 'bg-red-500' : (isWarning ? 'bg-amber-500' : 'bg-emerald-500')} opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${isCritical ? 'bg-red-600' : (isWarning ? 'bg-amber-600' : 'bg-emerald-600')}"></span>
      </span>
      <span class="px-2 py-0.5 rounded-full font-extrabold text-[10px] font-tech ${
        isCritical ? 'bg-red-600 text-white animate-pulse' : (isWarning ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white')
      }">
        ${isCritical ? 'DGMS CRITICAL' : (isWarning ? 'CAUTION' : 'LIVE SCADA')}
      </span>
      <span class="font-bold text-slate-800 truncate">
        ${moonidih.name}: <strong class="${isCritical ? 'text-red-700' : (isWarning ? 'text-amber-700' : 'text-emerald-700')} font-tech">CH₄ ${moonidih.ch4_pct}%</strong> | CO ${moonidih.co_ppm} ppm | O₂ ${moonidih.o2_pct}%
      </span>
      <span class="text-[9px] text-slate-500 font-tech hidden xl:inline">(Simulated DGMS SCADA Gas Feed: CMR 2017 Reg. 191)</span>
    </div>
  `;
}

function renderCommandCenterGasCards(data) {
  const container = document.getElementById('commandCenterGasTelemetry');
  if (!container || !data.mines) return;

  container.innerHTML = `
    <div class="glass-panel p-5 space-y-3 col-span-full border border-slate-200">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div class="flex items-center gap-2">
          <i data-lucide="radio" class="w-4 h-4 text-emerald-600 animate-pulse"></i>
          <h4 class="text-xs font-extrabold text-slate-900 uppercase font-tech tracking-wider">
            Live Simulated DGMS Mine Telemetry Stream (CMR 2017 Reg. 191)
          </h4>
        </div>
        <span class="text-[10px] text-slate-500 font-tech font-bold">UPDATED: ${data.timestamp}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        ${data.mines.map(m => `
          <div class="p-3.5 rounded-xl border ${
            m.status === 'CRITICAL' ? 'bg-red-50 border-red-300' : (m.status === 'WARNING' ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200')
          } space-y-1.5 shadow-sm">
            <div class="flex justify-between items-start">
              <div class="text-xs font-bold text-slate-900">${m.name}</div>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold font-tech ${
                m.status === 'CRITICAL' ? 'bg-red-600 text-white' : (m.status === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white')
              }">${m.status}</span>
            </div>
            <div class="grid grid-cols-3 gap-1 pt-1 text-center">
              <div class="bg-white p-1.5 rounded-lg border border-slate-200">
                <div class="text-[9px] text-slate-500 font-tech">CH₄</div>
                <div class="font-extrabold text-xs font-tech ${m.ch4_pct >= 1.25 ? 'text-red-700' : 'text-slate-900'}">${m.ch4_pct}%</div>
              </div>
              <div class="bg-white p-1.5 rounded-lg border border-slate-200">
                <div class="text-[9px] text-slate-500 font-tech">CO</div>
                <div class="font-extrabold text-xs font-tech">${m.co_ppm} ppm</div>
              </div>
              <div class="bg-white p-1.5 rounded-lg border border-slate-200">
                <div class="text-[9px] text-slate-500 font-tech">O₂</div>
                <div class="font-extrabold text-xs font-tech text-emerald-700">${m.o2_pct}%</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}

// ==========================================
// 2. WORKERS & PERSONA SYSTEM
// ==========================================
async function loadWorkers() {
  try {
    const res = await fetch('/api/workers');
    if (!res.ok) throw new Error('Worker service unavailable');
    const data = await res.json();
    appState.workersList = data.workers || [];
    
    if (appState.workersList.length > 0) {
      appState.currentWorker = appState.workersList[0];
      renderWorkerSelector();
      renderWorkerProfileHeader();
    }
  } catch (e) {
    console.error("Failed to load workers", e);
    const worker = JSON.parse(localStorage.getItem('suraksha-offline-worker') || 'null') || {
      id: 'offline-trainee', name: 'ऑफलाइन प्रशिक्षु', worker_code: 'LOCAL-TRAINEE', mine_unit: 'स्थानीय अभ्यास',
      mine_district: 'Jharkhand', mine_type: 'Training', role: 'Trainee', language: appState.language,
      joined_date: new Date().toISOString().slice(0, 10), experience_days: 0, is_high_risk: 1,
      safety_rating: 0, total_drills_completed: 0, offline: true
    };
    appState.currentWorker = worker;
    appState.workersList = [worker];
    renderWorkerSelector();
    renderWorkerProfileHeader();
  }
}

function renderWorkerSelector() {
  const select = document.getElementById('workerSelect');
  if (!select) return;

  select.innerHTML = appState.workersList.map(w => `
    <option value="${w.id}" ${w.id === appState.currentWorker.id ? 'selected' : ''}>
      ${w.name} (${w.role} — ${w.mine_district}) ${w.is_high_risk ? '⚠ New recruit · under 30 days' : '✓ DGMS certified'}
    </option>
  `).join('');

  select.onchange = async (e) => {
    const w = appState.workersList.find(item => item.id === e.target.value);
    if (w) {
      appState.currentWorker = w;
      renderWorkerProfileHeader();
      if (appState.currentTab === 'passport') {
        loadWorkerPassport(w.id);
      }
    }
  };
}

function renderWorkerProfileHeader() {
  const header = document.getElementById('workerProfileHeader');
  if (!header || !appState.currentWorker) return;

  const w = appState.currentWorker;
  header.innerHTML = `
    <div class="glass-panel p-4 flex flex-wrap items-center justify-between gap-3 bg-white/90 border border-slate-200/80 shadow-sm">
      <div class="flex items-center gap-3.5">
        <div class="relative">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
            <div class="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-700 font-extrabold text-base font-tech">
              ${w.name.charAt(0)}
            </div>
          </div>
          ${w.is_high_risk ? '<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span></span>' : ''}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold text-slate-900">${w.name}</span>
            <span class="text-xs font-tech text-amber-700 font-bold">#${w.worker_code}</span>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              w.is_high_risk ? 'bg-red-50 text-red-700 border border-red-300 animate-pulse' : 'bg-emerald-50 text-emerald-700 border border-emerald-300'
            }">
              ${w.is_high_risk ? '⚠️ <30 Days (Mandatory Buddy Miner)' : '✅ DGMS Certified'}
            </span>
          </div>
          <div class="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5 font-medium">
            <span class="text-slate-700 font-semibold">${w.role}</span>
            <span class="text-slate-300">•</span>
            <span class="text-slate-600">${w.mine_unit} (${w.mine_district})</span>
            <span class="text-slate-300">•</span>
            <span>Tenure: <strong class="text-slate-800 font-tech font-bold">${w.experience_days} Days</strong></span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="text-right hidden sm:block">
          <div class="text-[10px] text-slate-500 font-tech uppercase font-bold tracking-wider">Safety Competency Score</div>
          <div class="text-lg font-extrabold text-amber-700 font-tech">${w.safety_rating}%</div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-inner">
          ${w.safety_rating >= 90 ? '🏆' : (w.safety_rating >= 75 ? '⭐' : '🛡️')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 3. NAVIGATION & VIEWPORT CONTROLS
// ==========================================
function setupNavigation() {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('bg-amber-500', 'text-white', 'shadow-md', 'shadow-amber-500/25', 'font-bold');
        t.classList.add('text-slate-600', 'hover:text-slate-900', 'bg-white/80', 'border-slate-200', 'font-semibold');
      });
      tab.classList.remove('text-slate-600', 'hover:text-slate-900', 'bg-white/80', 'border-slate-200');
      tab.classList.add('bg-amber-500', 'text-white', 'shadow-md', 'shadow-amber-500/25', 'font-bold');

      const target = tab.getAttribute('data-tab');
      appState.currentTab = target;

      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      const activeContent = document.getElementById(`tabContent-${target}`);
      if (activeContent) activeContent.classList.remove('hidden');

      if (target === 'passport' && appState.currentWorker) {
        loadWorkerPassport(appState.currentWorker.id);
      } else if (target === 'admin') {
        loadDashboardStats();
        if (appState.liveGasTelemetry) renderCommandCenterGasCards(appState.liveGasTelemetry);
      }
    });
  });

  const btnToggleAR = document.getElementById('btnToggleAR');
  if (btnToggleAR) {
    btnToggleAR.addEventListener('click', async () => {
      const requestedMode = !appState.arEngine.isCameraAR;
      btnToggleAR.disabled = true;
      btnToggleAR.setAttribute('aria-busy', 'true');
      if (requestedMode) btnToggleAR.innerHTML = '<span class="camera-spinner"></span> Requesting camera…';
      await appState.arEngine.toggleCameraAR(requestedMode);
      appState.isCameraAR = appState.arEngine.isCameraAR;
      btnToggleAR.disabled = false;
      btnToggleAR.removeAttribute('aria-busy');
      const support = document.getElementById('cameraSupportStatus');
      if (support) support.textContent = appState.isCameraAR ? 'CAMERA LIVE · TRAINING OVERLAY' : (appState.arEngine.cameraFailureReason ? 'CAMERA BLOCKED · CHECK HTTPS / PERMISSION' : (window.isSecureContext ? 'CAMERA READY · TAP TO ENABLE' : 'HTTPS REQUIRED FOR PHONE CAMERA'));
      btnToggleAR.innerHTML = appState.isCameraAR
        ? `<i data-lucide="video-off" class="w-4 h-4 mr-1.5"></i> Exit Camera AR`
        : `<i data-lucide="camera" class="w-4 h-4 mr-1.5"></i> Camera overlay practice`;
      btnToggleAR.className = appState.isCameraAR
        ? 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white flex items-center shadow-md'
        : 'px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white flex items-center hover:bg-amber-600 transition-all shadow-md';
      lucide.createIcons();
    });
  }
}

function setupVisionModeControls() {
  const visionBtns = document.querySelectorAll('[data-vision-mode]');
  visionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      visionBtns.forEach(b => {
        b.classList.remove('bg-amber-500/30', 'text-amber-300', 'border-amber-500/50');
        b.classList.add('bg-slate-800', 'text-slate-300', 'border-slate-700');
      });
      btn.classList.remove('bg-slate-800', 'text-slate-300', 'border-slate-700');
      btn.classList.add('bg-amber-500/30', 'text-amber-300', 'border-amber-500/50');

      const mode = btn.getAttribute('data-vision-mode');
      appState.arEngine.setVisionMode(mode);
    });
  });
}

function setupSnapshotButton() {
  const btnSnap = document.getElementById('btnTakeSnapshot');
  if (btnSnap) {
    btnSnap.addEventListener('click', () => {
      const success = appState.arEngine.takeSnapshot();
      if (success) {
        window.SurakshaSathi && window.SurakshaSathi.speak({ hindi: "प्रशिक्षण साक्ष्य स्नैपशॉट सफलतापूर्वक सहेजा गया।", english: "Training evidence snapshot saved successfully.", bengali: "প্রশিক্ষণের প্রমাণচিত্র সফলভাবে সংরক্ষিত হয়েছে।", santhali: "ᱴᱨᱮᱱᱤᱝ ᱯᱷᱳᱴᱳ ᱥᱮᱵᱽ ᱮᱱᱟ᱾", mundari: "ᱴᱨᱮᱱᱤᱝ ᱯᱷᱚᱴᱚ ᱥᱟᱵᱽ ᱜᱮᱞᱟ।" });
      }
    });
  }
}

function setupLanguageSelector() {
  const langSelect = document.getElementById('langSelector');
  if (!langSelect) return;

  const setVisibleLanguageChoice = (lang) => {
    document.querySelectorAll('[data-language-choice]').forEach(button => {
      const active = button.dataset.languageChoice === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  document.querySelectorAll('[data-language-choice]').forEach(button => {
    button.addEventListener('click', () => {
      langSelect.value = button.dataset.languageChoice;
      langSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  langSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    appState.language = lang;
    setVisibleLanguageChoice(lang);
    window.SurakshaSathi && window.SurakshaSathi.setLanguage(lang);

    const dict = i18n[lang] || i18n.hindi;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });

    window.SurakshaSathi && window.SurakshaSathi.speak({ hindi: "सुरक्षा साथी में आपका स्वागत है।", english: "Welcome to Khanan Suraksha Sathi.", bengali: "খনন সুরক্ষা সাথীতে আপনাকে স্বাগত।", santhali: "ᱠᱷᱟᱫᱟᱱ ᱥᱩᱨᱠᱷᱟ ᱥᱟᱛᱷᱤ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ।", mundari: "ᱠᱷᱟᱫᱟᱱ ᱥᱩᱨᱠᱷᱟ ᱥᱟᱛᱷᱤ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ।" });
    const status = document.getElementById('speechLanguageStatus');
    if (status && window.SurakshaSathi) {
      const names = { hindi: 'Hindi', english: 'English', bengali: 'Bengali', santhali: 'Santali', mundari: 'Mundari' };
      const mentor = window.SurakshaSathi;
      status.textContent = mentor.voiceAvailable
        ? `${names[lang]} voice found on this device.`
        : (mentor.voiceFallback
          ? `${names[lang]} laptop narration is active through the training voice service.`
          : `${names[lang]} laptop narration is active through the training voice service.`);
      status.classList.remove('hidden');
    }

    const audioMode = document.getElementById('languageAudioMode');
    if (audioMode && window.SurakshaSathi) {
      audioMode.textContent = window.SurakshaSathi.voiceAvailable
        ? 'NATIVE VOICE ACTIVE'
        : 'LAPTOP VOICE ACTIVE';
    }
  });

  setVisibleLanguageChoice(appState.language);
}

function setupDrillModules() {
  const moduleBtns = document.querySelectorAll('[data-module]');
  moduleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moduleBtns.forEach(b => {
        b.classList.remove('border-amber-500', 'bg-amber-50/80', 'text-amber-800', 'shadow-md');
        b.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
      });
      btn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
      btn.classList.add('border-amber-500', 'bg-amber-50/80', 'text-amber-800', 'shadow-md');

      const modKey = btn.getAttribute('data-module');
      startSelectedModule(modKey);
    });
  });
}

function startSelectedModule(moduleKey) {
  if (appState.activeDrillInstance && appState.activeDrillInstance.stop) appState.activeDrillInstance.stop();
  appState.selectedModule = moduleKey;

  const onDrillComplete = async (result) => {
    await handleDrillCompletion(result);
  };

  if (moduleKey === 'roof_strata') {
    appState.activeDrillInstance = new RoofStrataModule(appState.arEngine, onDrillComplete);
  } else if (moduleKey === 'gas_detector') {
    appState.activeDrillInstance = new GasDetectorModule(appState.arEngine, onDrillComplete);
  } else if (moduleKey === 'loto_drill') {
    appState.activeDrillInstance = new LOTODrillModule(appState.arEngine, onDrillComplete);
  } else if (moduleKey === 'dumper_blindspot') {
    appState.activeDrillInstance = new DumperBlindSpotModule(appState.arEngine, onDrillComplete);
  } else if (moduleKey === 'scsr_donning') {
    appState.activeDrillInstance = new SCSRDonningModule(appState.arEngine, onDrillComplete);
  }

  if (appState.activeDrillInstance) {
    appState.activeDrillInstance.start();
  }
}

// Global HUD updater with Voice Narration Button for Low-Literacy Users
window.updateDrillHUD = function(hudData) {
  const progressBar = document.getElementById('drillProgressBar');
  const progressText = document.getElementById('drillProgressText');
  const instructionBox = document.getElementById('drillInstructionText');
  const actionContainer = document.getElementById('drillActionsContainer');
  const quizContainer = document.getElementById('drillQuizContainer');
  const oscContainer = document.getElementById('oscilloscopeContainer');
  const btnListenStep = document.getElementById('btnListenStepAudio');
  const interactionHint = document.getElementById('drillInteractionHint');

  appState.currentStepInstruction = hudData.instruction || "";

  if (progressBar) progressBar.style.width = `${hudData.progress}%`;
  if (progressText) progressText.textContent = `${hudData.progress}% Complete`;
  if (instructionBox) instructionBox.textContent = hudData.instruction;
  if (interactionHint) {
    const selectedHint = hudData.interactionHintLocales && hudData.interactionHintLocales[appState.language];
    interactionHint.textContent = selectedHint || hudData.interactionHint || '';
    interactionHint.classList.toggle('hidden', !hudData.interactionHint);
  }

  if (btnListenStep) {
    btnListenStep.onclick = () => {
      window.SurakshaSathi && window.SurakshaSathi.speak(hudData.instructionLocales || { hindi: appState.currentStepInstruction });
    };
  }

  if (oscContainer) {
    if (hudData.showOscilloscope) oscContainer.classList.remove('hidden');
    else oscContainer.classList.add('hidden');
  }

  if (actionContainer) {
    // These controls are rebuilt with innerHTML on every drill step. Delegate clicks
    // from the stable container so actions keep working after any DOM replacement.
    actionContainer.__drillActions = hudData.actions || [];
    window.__surakshaDrillActions = hudData.actions || [];
    window.__surakshaRunDrillAction = index => {
      const action = window.__surakshaDrillActions && window.__surakshaDrillActions[index];
      if (action && typeof action.action === 'function' && !action.disabled) action.action();
    };
    if (!actionContainer.__drillActionHandlerBound) {
      actionContainer.addEventListener('click', event => {
        const button = event.target.closest('button[id^="drillActionBtn_"]');
        if (!button || !actionContainer.contains(button)) return;
        const index = Number(button.id.slice('drillActionBtn_'.length));
        const action = actionContainer.__drillActions && actionContainer.__drillActions[index];
        if (action && typeof action.action === 'function' && !action.disabled) action.action();
      });
      actionContainer.__drillActionHandlerBound = true;
    }
    if (hudData.actions && hudData.actions.length > 0) {
      actionContainer.innerHTML = hudData.actions.map((act, idx) => `
        <button id="drillActionBtn_${idx}" onclick="window.__surakshaRunDrillAction(${idx})" class="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          act.primary
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 font-extrabold shadow-md shadow-amber-500/25 btn-shimmer'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
        } ${act.disabled ? 'opacity-40 pointer-events-none' : ''}">
          ${act.label}
        </button>
      `).join('');

      hudData.actions.forEach((act, idx) => {
        const btn = document.getElementById(`drillActionBtn_${idx}`);
        if (btn) btn.onclick = act.action;
      });
      actionContainer.classList.remove('hidden');
    } else {
      actionContainer.classList.add('hidden');
    }
  }

  if (quizContainer) {
    if (hudData.quiz) {
      quizContainer.innerHTML = `
        <div class="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-2.5">
          <div class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <i data-lucide="help-circle" class="w-4 h-4 text-amber-700"></i> ${hudData.quiz.question}
          </div>
          <div class="flex flex-wrap gap-2">
            ${hudData.quiz.options.map((opt, idx) => `
              <button id="quizOptBtn_${idx}" class="px-3.5 py-2 rounded-xl text-xs bg-white hover:bg-amber-500 hover:text-white text-slate-800 border border-slate-300 transition-all font-semibold shadow-sm">
                ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
      `;
      hudData.quiz.options.forEach((opt, idx) => {
        const b = document.getElementById(`quizOptBtn_${idx}`);
        if (b) b.onclick = () => hudData.quiz.onSelect(opt.value);
      });
      quizContainer.classList.remove('hidden');
      lucide.createIcons();
    } else {
      quizContainer.classList.add('hidden');
    }
  }
};

async function handleDrillCompletion(result) {
  const modal = document.getElementById('drillSuccessModal');
  const modalScore = document.getElementById('drillModalScore');
  const modalReaction = document.getElementById('drillModalReaction');
  const modalCompIndex = document.getElementById('drillModalCompIndex');
  const modalTitle = document.getElementById('drillModalTitle');

  if (modalTitle) modalTitle.textContent = result.moduleName;
  if (modalScore) modalScore.textContent = `${result.score}%`;
  if (modalReaction) modalReaction.textContent = `${(result.reactionTimeMs / 1000).toFixed(1)}s`;

  if (!appState.currentWorker || appState.currentWorker.offline) {
    const queue = JSON.parse(localStorage.getItem('suraksha-drill-queue') || '[]');
    queue.push({ module_id: result.moduleId, module_name: result.moduleName, score: result.score,
      reaction_time_ms: result.reactionTimeMs, hazards_spotted: result.hazardsSpotted,
      total_hazards: result.totalHazards, critical_errors: result.criticalErrors,
      details: result.details, recorded_at: new Date().toISOString(), local_only: true });
    localStorage.setItem('suraksha-drill-queue', JSON.stringify(queue));
    if (modalCompIndex) modalCompIndex.textContent = `${result.score}% • offline practice`;
    if (modal) modal.classList.remove('hidden');
    return;
  }

  try {
    const payload = {
      worker_id: appState.currentWorker.id,
      module_id: result.moduleId,
      module_name: result.moduleName,
      score: result.score,
      reaction_time_ms: result.reactionTimeMs,
      hazards_spotted: result.hazardsSpotted,
      total_hazards: result.totalHazards,
      critical_errors: result.criticalErrors,
      details: result.details
    };

    const res = await fetch('/api/drills/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (modalCompIndex) modalCompIndex.textContent = `${data.comprehension_index}%`;
    await loadWorkers();
  } catch (e) {
    console.error("Failed to submit drill", e);
    const queue = JSON.parse(localStorage.getItem('suraksha-drill-queue') || '[]');
    queue.push({ worker_id: appState.currentWorker.id, module_id: result.moduleId, module_name: result.moduleName,
      score: result.score, reaction_time_ms: result.reactionTimeMs, hazards_spotted: result.hazardsSpotted,
      total_hazards: result.totalHazards, critical_errors: result.criticalErrors, details: result.details,
      recorded_at: new Date().toISOString() });
    localStorage.setItem('suraksha-drill-queue', JSON.stringify(queue));
    if (modalCompIndex) modalCompIndex.textContent = `${result.score}% • saved on device`;
  }

  if (modal) modal.classList.remove('hidden');
  window.SurakshaSathi && window.SurakshaSathi.speak({ hindi: "बधाई हो! आपने यह व्यावसायिक सुरक्षा ड्रिल सफलतापूर्वक उत्तीर्ण कर ली है।", english: "Congratulations! You have successfully completed this workplace safety drill.", bengali: "অভিনন্দন! আপনি এই কর্মক্ষেত্রের নিরাপত্তা অনুশীলন সফলভাবে সম্পন্ন করেছেন।", santhali: "ᱥᱟᱨᱦᱟᱣ! ᱟᱢ ᱱᱚᱣᱟ ᱴᱨᱮᱱᱤᱝ ᱯᱟᱥ ᱠᱮᱫ-ᱟᱢ᱾", mundari: "ᱵᱟᱹᱨᱤ ᱵᱷᱟᱞ! ᱟᱢ ᱥᱩᱨᱠᱷᱟ ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹ ᱠᱮᱫᱟᱢ।" });
}

function closeDrillSuccessModal() {
  const modal = document.getElementById('drillSuccessModal');
  if (modal) modal.classList.add('hidden');
}
window.closeDrillSuccessModal = closeDrillSuccessModal;

// ==========================================
// 4. VOICE MENTOR INTERACTIONS
// ==========================================
function setupVoiceMentorUI() {
  const btnMic = document.getElementById('btnVoiceMentorMic');
  const askInput = document.getElementById('voiceMentorInput');
  const btnSend = document.getElementById('btnVoiceMentorSend');

  if (btnMic) {
    btnMic.addEventListener('click', () => {
      if (window.SurakshaSathi.isListening) {
        window.SurakshaSathi.stopListening();
      } else {
        window.SurakshaSathi.startListening();
      }
    });
  }

  const sendQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;
    renderChatMessage('user', queryText);

    try {
      const res = await fetch('/api/voice-mentor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          language: ({ hindi: 'hi', english: 'en', santhali: 'sat', mundari: 'unr', bengali: 'bn' })[appState.language] || 'hi',
          context_module: appState.selectedModule
        })
      });
      const data = await res.json();
      renderChatMessage('mentor', data.answer);
      window.SurakshaSathi && window.SurakshaSathi.speak({ [appState.language]: data.answer });
    } catch (e) {
      renderChatMessage('mentor', "नेटवर्क त्रुटि: कृपया पुनः प्रयास करें।");
    }
  };

  if (btnSend && askInput) {
    btnSend.addEventListener('click', () => {
      sendQuery(askInput.value);
      askInput.value = '';
    });
    askInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendQuery(askInput.value);
        askInput.value = '';
      }
    });
  }

  document.querySelectorAll('[data-prompt-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt-chip');
      sendQuery(prompt);
    });
  });
}

window.handleUserSpokenQuery = function(transcript) {
  const askInput = document.getElementById('voiceMentorInput');
  if (askInput) askInput.value = transcript;
  const btnSend = document.getElementById('btnVoiceMentorSend');
  if (btnSend) btnSend.click();
};

window.updateMicStatus = function(isListening) {
  const btnMic = document.getElementById('btnVoiceMentorMic');
  if (btnMic) {
    btnMic.className = isListening
      ? 'p-3.5 rounded-2xl bg-red-600 text-white animate-pulse shadow-md shadow-red-500/40'
      : 'p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white hover:from-amber-600 hover:to-amber-500 shadow-md shadow-amber-500/25';
  }
};

window.updateAvatarSpeaking = function(isSpeaking, text) {
  const wave = document.getElementById('mentorVoiceWave');
  const speechBubble = document.getElementById('mentorLiveBubble');
  if (wave) {
    if (isSpeaking) wave.classList.remove('hidden');
    else wave.classList.add('hidden');
  }
  if (speechBubble) {
    if (isSpeaking && text) {
      speechBubble.querySelector('div:nth-child(2)').textContent = text;
      speechBubble.classList.remove('hidden');
    } else {
      speechBubble.classList.add('hidden');
    }
  }
};

function renderChatMessage(sender, text) {
  const chatBox = document.getElementById('mentorChatMessages');
  if (!chatBox) return;

  const isUser = sender === 'user';
  const msgHtml = `
    <div class="flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300">
      ${!isUser ? '<div class="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">साथी</div>' : ''}
      <div class="max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
        isUser
          ? 'bg-amber-500 text-white font-bold rounded-tr-none shadow-sm'
          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm font-medium'
      }">
        ${text}
      </div>
      ${isUser ? '<div class="w-8 h-8 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">आप</div>' : ''}
    </div>
  `;
  chatBox.insertAdjacentHTML('beforeend', msgHtml);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ==========================================
// 5. DGMS DIGITAL SAFETY PASSPORT
// ==========================================
async function loadWorkerPassport(workerId) {
  const container = document.getElementById('passportCardContainer');
  if (!container) return;

  try {
    const res = await fetch(`/api/certifications/${workerId}`);
    const data = await res.json();

    if (!data.has_cert) {
      container.innerHTML = `
        <div class="text-center py-14 p-8 glass-panel border border-slate-200 max-w-xl mx-auto bg-white">
          <div class="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-3xl mx-auto mb-4">
            ⚠️
          </div>
          <h3 class="text-lg font-extrabold text-slate-900">DGMS सुरक्षा पासपोर्ट लंबित (Pending Certification)</h3>
          <p class="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed font-medium">
            इस कार्यकर्ता ने DGMS द्वारा अनिवार्य सभी AR सुरक्षा ड्रिल उत्तीर्ण नहीं की हैं। कम से कम 3 मॉड्यूल पूरे करने पर आधिकारिक डिजिटल पासपोर्ट जारी किया जाएगा।
          </p>
          <button onclick="issuePassportForWorker('${workerId}')" class="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 btn-shimmer">
            🎓 DGMS प्रमाणन जारी करें (Issue Pass)
          </button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    const c = data.certificate;
    const qrPayloadString = JSON.stringify(data.qr_data);

    container.innerHTML = `
      <div class="passport-container space-y-5">
        <div class="passport-card-3d p-6 sm:p-8 relative overflow-hidden guilloche-bg">
          
          <div class="hologram-ribbon absolute top-0 right-0 w-48 h-48 rounded-bl-full pointer-events-none opacity-60"></div>

          <!-- Header -->
          <div class="flex flex-wrap justify-between items-start border-b border-amber-300 pb-5 mb-5 gap-3">
            <div class="flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-300 flex items-center justify-center text-3xl shadow-inner">
                ⛏️
              </div>
              <div>
                <div class="text-[11px] font-extrabold text-amber-800 tracking-widest font-tech uppercase">GOVERNMENT OF JHARKHAND</div>
                <div class="text-lg sm:text-xl font-heading font-extrabold text-slate-900 tracking-tight">DGMS Verifiable Mine Safety Passport</div>
                <div class="text-[10px] text-slate-500 font-tech font-bold">MINES ACT 1952 (FORM B) / DGMS DHANBAD RULE 29B</div>
              </div>
            </div>
            <div class="text-right">
              <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-extrabold font-tech flex items-center gap-1.5 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span> VERIFIED COMPETENT
              </span>
              <div class="text-[11px] text-slate-600 mt-1 font-tech">PASS ID: <span class="text-amber-800 font-bold">${c.cert_number}</span></div>
            </div>
          </div>

          <!-- Body -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div class="md:col-span-2 space-y-4">
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div><span class="text-slate-500 font-semibold">Worker Full Name:</span> <div class="font-extrabold text-slate-900 text-sm mt-0.5">${c.name}</div></div>
                <div><span class="text-slate-500 font-semibold">Worker Code:</span> <div class="font-bold text-amber-800 font-tech text-sm mt-0.5">${c.worker_code}</div></div>
                <div><span class="text-slate-500 font-semibold">Mine Unit / Colliery:</span> <div class="font-semibold text-slate-800 mt-0.5">${c.mine_unit}</div></div>
                <div><span class="text-slate-500 font-semibold">District:</span> <div class="font-semibold text-slate-800 mt-0.5">${c.mine_district}</div></div>
                <div><span class="text-slate-500 font-semibold">Role / Trade:</span> <div class="font-semibold text-slate-800 mt-0.5">${c.role}</div></div>
                <div><span class="text-slate-500 font-semibold">DGMS Safety Score:</span> <div class="font-extrabold text-emerald-700 text-base font-tech mt-0.5">${c.overall_competency_score}%</div></div>
                <div><span class="text-slate-500 font-semibold">Date Issued:</span> <div class="font-tech text-slate-700 font-bold mt-0.5">${c.issue_date}</div></div>
                <div><span class="text-slate-500 font-semibold">Valid Until:</span> <div class="font-tech text-amber-800 font-bold mt-0.5">${c.expiry_date}</div></div>
              </div>

              <!-- Signatory & Hash Box -->
              <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 shadow-inner">
                <div><span class="text-amber-800 font-bold">DGMS Dhanbad Authority:</span> ${c.dgms_officer}</div>
                <div class="font-tech text-[10px] text-slate-500 truncate font-semibold">SHA-256 HASH: ${c.signature_hash}</div>
              </div>
            </div>

            <!-- Right QR & Quick Test Actions -->
            <div class="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-md border-2 border-amber-300 space-y-2">
              <img src="data:image/png;base64,${data.qr_base64}" alt="DGMS Dynamic QR" class="w-36 h-36 object-contain" />
              <div class="text-[10px] text-slate-900 font-extrabold font-tech text-center tracking-wider uppercase">PITHEAD GATE QR</div>
              <button onclick="testQuickGateScan('${encodeURIComponent(qrPayloadString)}')" class="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm">
                <i data-lucide="scan-line" class="w-3.5 h-3.5"></i> Test Gate Scan
              </button>
            </div>

          </div>

          <!-- Bottom Actions -->
          <div class="mt-6 pt-4 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-600 font-medium">
            <div class="flex items-center gap-2">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
              <span>Spatial Reflex & Procedural Comprehension Tested (Form B Compliant)</span>
            </div>
            <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 font-bold transition-all no-print shadow-sm">
              <i data-lucide="printer" class="w-4 h-4 text-amber-400"></i> Print Official Passport
            </button>
          </div>

        </div>

        <!-- Verified Drill History Log -->
        ${data.attempts && data.attempts.length > 0 ? `
          <div class="glass-panel p-5 space-y-3 bg-white border border-slate-200">
            <h4 class="text-xs font-bold text-slate-900 uppercase font-tech tracking-wider flex items-center gap-2">
              <i data-lucide="history" class="w-4 h-4 text-amber-600"></i>
              Verified Vocational Training Audit Trail (Mines Act 1952 Record)
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 text-slate-600 font-tech">
                  <tr>
                    <th class="py-2.5 px-3">Module Name</th>
                    <th class="py-2.5 px-3">Score</th>
                    <th class="py-2.5 px-3">Reaction Time</th>
                    <th class="py-2.5 px-3">Comprehension Index</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3">Completed At</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${data.attempts.map(a => `
                    <tr>
                      <td class="py-2 px-3 font-semibold text-slate-900">${a.module_name}</td>
                      <td class="py-2 px-3 font-tech font-bold text-amber-800">${a.score}%</td>
                      <td class="py-2 px-3 font-tech">${(a.reaction_time_ms / 1000).toFixed(1)}s</td>
                      <td class="py-2 px-3 font-tech text-emerald-700 font-bold">${a.comprehension_index}%</td>
                      <td class="py-2 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">${a.passed ? 'PASSED' : 'RETRY'}</span></td>
                      <td class="py-2 px-3 font-tech text-slate-500">${a.completed_at}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

      </div>
    `;
    lucide.createIcons();
  } catch (e) {
    console.error("Failed to load passport", e);
  }
}

function testQuickGateScan(encodedPayload) {
  const decoded = decodeURIComponent(encodedPayload);
  const gateTab = document.querySelector('[data-tab="gate"]');
  if (gateTab) gateTab.click();
  const inputCode = document.getElementById('gateInputCode');
  if (inputCode) inputCode.value = decoded;
  const btnVerify = document.getElementById('btnGateVerify');
  if (btnVerify) btnVerify.click();
}

async function issuePassportForWorker(workerId) {
  try {
    const res = await fetch('/api/certifications/issue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: workerId })
    });
    if (res.ok) {
      await loadWorkerPassport(workerId);
    } else {
      const err = await res.json();
      alert(err.detail || "Could not issue passport");
    }
  } catch (e) {
    console.error("Issue passport failed", e);
  }
}

// ==========================================
// 6. PITHEAD GATE INSPECTOR & CAMERA QR SCANNER
// ==========================================
function setupGateInspectorUI() {
  const btnScan = document.getElementById('btnGateVerify');
  const inputCode = document.getElementById('gateInputCode');
  const btnStartCameraQR = document.getElementById('btnStartCameraQR');
  const cameraScannerContainer = document.getElementById('cameraQrScannerContainer');

  const verifyCode = async (code) => {
    if (!code || !code.trim()) return;
    try {
      const res = await fetch('/api/gate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_payload_or_code: code,
          gate_name: "Pithead Incline Gate #2 (Moonidih Colliery)",
          inspector_name: "Sub-Inspector P.K. Tiwari (DGMS Certified)"
        })
      });
      const data = await res.json();
      renderGateScanResult(data);

      if (data.access_granted) {
        appState.arEngine.playSound('metallic_ring');
      } else {
        appState.arEngine.playSound('gas_alarm');
      }
    } catch (e) {
      console.error("Gate verification failed", e);
    }
  };

  if (btnScan && inputCode) {
    btnScan.addEventListener('click', () => verifyCode(inputCode.value));
  }

  // Camera QR Scanner Toggle
  if (btnStartCameraQR) {
    btnStartCameraQR.addEventListener('click', async () => {
      if (appState.html5QrScanner) {
        appState.html5QrScanner.stop().then(() => {
          appState.html5QrScanner = null;
          cameraScannerContainer.classList.add('hidden');
          btnStartCameraQR.innerHTML = `<i data-lucide="camera" class="w-4 h-4 mr-1.5"></i> Start Camera QR Scan`;
          lucide.createIcons();
        });
        return;
      }

      cameraScannerContainer.classList.remove('hidden');
      btnStartCameraQR.innerHTML = `<i data-lucide="video-off" class="w-4 h-4 mr-1.5"></i> Stop Camera Scanner`;
      lucide.createIcons();

      if (window.Html5Qrcode) {
        try {
          appState.html5QrScanner = new Html5Qrcode("qrReaderVideo");
          await appState.html5QrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              inputCode.value = decodedText;
              verifyCode(decodedText);
              appState.html5QrScanner.stop();
              appState.html5QrScanner = null;
              cameraScannerContainer.classList.add('hidden');
              btnStartCameraQR.innerHTML = `<i data-lucide="camera" class="w-4 h-4 mr-1.5"></i> Start Camera QR Scan`;
              lucide.createIcons();
            },
            (err) => {}
          );
        } catch (err) {
          console.warn("Camera QR Scanner start failed", err);
        }
      }
    });
  }

  document.querySelectorAll('[data-gate-code]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-gate-code');
      if (inputCode) inputCode.value = code;
      verifyCode(code);
    });
  });
}

function renderGateScanResult(res) {
  const resultDiv = document.getElementById('gateScanResult');
  if (!resultDiv) return;

  const isApproved = res.access_granted;
  const isHighRisk = res.is_high_risk;

  resultDiv.innerHTML = `
    <div class="p-6 rounded-2xl border ${
      isApproved
        ? (isHighRisk ? 'bg-amber-50 border-amber-400 shadow-md' : 'bg-emerald-50 border-emerald-400 shadow-md')
        : 'bg-red-50 border-red-400 shadow-md'
    } space-y-4 animate-in fade-in zoom-in-95 duration-300">
      
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
            isApproved ? (isHighRisk ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900') : 'bg-red-200 text-red-900'
          }">
            ${isApproved ? (isHighRisk ? '⚠️' : '✅') : '🚫'}
          </div>
          <div>
            <div class="text-lg font-heading font-extrabold ${isApproved ? (isHighRisk ? 'text-amber-900' : 'text-emerald-900') : 'text-red-900'}">
              ${isApproved ? (isHighRisk ? 'PITHEAD ACCESS GRANTED (HIGH-RISK PROTOCOL)' : 'PITHEAD ACCESS GRANTED (सुरक्षित प्रवेश स्वीकृत)') : 'ACCESS DENIED (प्रवेश वर्जित)'}
            </div>
            <div class="text-xs text-slate-700 font-medium mt-0.5">${res.reason}</div>
          </div>
        </div>
        <span class="text-xs font-tech text-slate-500 font-bold">${res.scan_time}</span>
      </div>

      ${res.worker ? `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white rounded-xl text-xs border border-slate-200 shadow-sm">
          <div><span class="text-slate-500 font-semibold">Worker:</span> <div class="font-bold text-slate-900 text-sm mt-0.5">${res.worker.name}</div></div>
          <div><span class="text-slate-500 font-semibold">Code:</span> <div class="font-tech text-amber-700 font-bold text-sm mt-0.5">${res.worker.worker_code}</div></div>
          <div><span class="text-slate-500 font-semibold">Colliery:</span> <div class="text-slate-700 font-semibold mt-0.5">${res.worker.mine_unit}</div></div>
          <div><span class="text-slate-500 font-semibold">Safety Index:</span> <div class="font-extrabold text-emerald-700 font-tech text-base mt-0.5">${res.worker.safety_rating}%</div></div>
        </div>
      ` : ''}

      ${isHighRisk ? `
        <div class="p-3.5 bg-amber-100/90 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center gap-2.5 font-medium">
          <i data-lucide="alert-triangle" class="w-5 h-5 flex-shrink-0 text-amber-700"></i>
          <span><strong>DGMS Mandatory Regulation:</strong> यह नवागंतुक खनिक है (<30 दिन)। खदान में प्रवेश से पहले सीनियर बडी माइनर (Buddy Miner) के साथ टैग करना अनिवार्य है।</span>
        </div>
      ` : ''}
    </div>
  `;
  lucide.createIcons();
}

// ==========================================
// 7. DGMS DHANBAD COMPLIANCE COMMAND CENTER
// ==========================================
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const data = await res.json();
    appState.stats = data;

    const mTotal = document.getElementById('statTotalWorkers');
    const mHighRisk = document.getElementById('statHighRisk');
    const mCertified = document.getElementById('statCertified');
    const mIndex = document.getElementById('statSafetyIndex');

    if (mTotal) mTotal.textContent = data.summary.total_workers;
    if (mHighRisk) mHighRisk.textContent = data.summary.high_risk_recruits;
    if (mCertified) mCertified.textContent = data.summary.certified_workers;
    if (mIndex) mIndex.textContent = `${data.summary.avg_safety_index}%`;

    const districtTable = document.getElementById('districtStatsTable');
    if (districtTable && data.districts) {
      districtTable.innerHTML = data.districts.map(d => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition-all">
          <td class="py-3.5 px-4 font-bold text-slate-900">${d.mine_district}</td>
          <td class="py-3.5 px-4 text-slate-700 font-tech font-semibold">${d.count}</td>
          <td class="py-3.5 px-4 text-red-700 font-extrabold font-tech">${d.high_risk_recruits}</td>
          <td class="py-3.5 px-4 text-emerald-700 font-extrabold font-tech">${d.avg_rating}%</td>
          <td class="py-3.5 px-4">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase font-tech ${
              d.avg_rating >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }">
              ${d.avg_rating >= 90 ? 'DGMS Gold Tier' : 'Standard Tier'}
            </span>
          </td>
        </tr>
      `).join('');
    }

    const highRiskList = document.getElementById('highRiskRecruitsList');
    if (highRiskList && data.high_risk_recruits) {
      highRiskList.innerHTML = data.high_risk_recruits.map(w => `
        <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-400 transition-all shadow-sm">
          <div>
            <div class="font-bold text-slate-900 text-xs">${w.name} <span class="text-amber-700 font-tech">(${w.worker_code})</span></div>
            <div class="text-[11px] text-slate-500 mt-0.5 font-medium">${w.mine_unit} • ${w.role}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-red-700 font-bold font-tech">${w.experience_days}d on Site</div>
            <button onclick="selectWorkerForDrill('${w.id}')" class="text-[10px] text-amber-700 hover:underline font-bold">
              Assign Drill &rarr;
            </button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error("Dashboard stats failed", e);
  }
}

function selectWorkerForDrill(workerId) {
  const w = appState.workersList.find(i => i.id === workerId);
  if (w) {
    appState.currentWorker = w;
    renderWorkerSelector();
    renderWorkerProfileHeader();
    const trainingTab = document.querySelector('[data-tab="training"]');
    if (trainingTab) trainingTab.click();
  }
}

async function loadAdvisories() {
  try {
    const res = await fetch('/api/advisories');
    const data = await res.json();
    appState.advisories = data.advisories || [];
    renderAdvisories();
  } catch (e) {
    console.error("Failed to load advisories", e);
  }
}

function renderAdvisories() {
  const ticker = document.getElementById('safetyAdvisoryTicker');
  if (!ticker || appState.advisories.length === 0) return;

  const adv = appState.advisories[0];
  ticker.innerHTML = `
    <div class="flex items-center gap-2 text-xs text-amber-900">
      <span class="px-2 py-0.5 bg-red-600 text-white rounded-full font-bold text-[10px] animate-pulse font-tech">DGMS ALERT</span>
      <span class="font-medium"><strong>${adv.district} (${adv.mine_unit}):</strong> ${adv.title_hi}</span>
    </div>
  `;
}
