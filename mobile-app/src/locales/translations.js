export const TRANSLATIONS = {
  en: {
    appTitle: "RAKSHA 360 - Industrial Safety Practice",
    appSubtitle: "Camera-backed 3D safety-training prototype for mining and manufacturing",
    miningSector: "Jharkhand Coal & Steel Sector",
    language: "Language",
    
    // Navigation
    navArModules: "AR Training Modules",
    navAssessment: "Safety Assessment",
    navCertificates: "Training Records",
    navAdmin: "Supervisor Dashboard",
    navGuide: "Worker Orientation Guide",

    // AR HUD & General
    arActive: "CAMERA-BACKED 3D SIMULATION",
    arGuideText: "Point camera at floor or flat surface in your surroundings",
    startModule: "Launch AR Module",
    nextStep: "Next Step",
    prevStep: "Previous Step",
    completeModule: "Complete Safety Module",
    audioNarrate: "Listen Voice Guide",
    retryModule: "Retry Scenario Drill",
    passScoreRequired: "Temporary knowledge-check threshold: current policy",
    
    // Module 1: Fire & Explosion
    m1Title: "Fire & Explosion Emergency Response",
    m1Desc: "Exit route identification, CO2/DCP extinguisher selection, and P.A.S.S. protocol overlaid on your surroundings via camera.",
    m1Step1: "Step 1: Emergency Alarm & Exit Vector",
    m1Step1Detail: "Locate green AR directional vectors indicating the nearest explosive gas evacuation tunnel.",
    m1Step2: "Step 2: Extinguisher Type Selection",
    m1Step2Detail: "Identify fire class (Electrical / Methane Gas / Coal Fines). Select DCP or CO2 canister.",
    m1Step3: "Step 3: P.A.S.S. Fire Fighting Drill",
    m1Step3Detail: "1. Pull Safety Pin -> 2. Aim Base -> 3. Squeeze Trigger -> 4. Sweep Side to Side.",
    m1Step4: "Step 4: Evacuation Countdown",
    m1Step4Detail: "Proceed along AR floor arrows to safe underground refuge chamber within 45 seconds.",

    // Module 2: Gas Leak & Confined Space
    m2Title: "Gas Leak & Confined Space Protocol",
    m2Desc: "Toxic gas plume recognition (Methane CH4 / Carbon Monoxide CO), SCBA PPE selection, and buddy safety system drill.",
    m2Step1: "Step 1: Gas Detector & Alarm Verification",
    m2Step1Detail: "Calibrate Multi-Gas Detector. Methane >1.25% triggers immediate power cutoff.",
    m2Step2: "Step 2: SCBA & Toxic PPE Selection",
    m2Step2Detail: "Equip Self-Contained Breathing Apparatus (SCBA), safety harness, and oxygen self-rescuer mask.",
    m2Step3: "Step 3: Hazard Zone Plume Mapping",
    m2Step3Detail: "Inspect camera overlay for invisible toxic gas accumulation in shaft ceiling.",
    m2Step4: "Step 4: Buddy System Extraction",
    m2Step4Detail: "Attach safety tug line to buddy worker and signal 3 tugs for emergency hoist retrieval.",

    // Module 3: Machinery Safety
    m3Title: "Heavy Machinery & Conveyor LOTO Safety",
    m3Desc: "Lockout/Tagout (LOTO) protocol on mining belt conveyors and high-voltage crusher units.",
    m3Step1: "Step 1: Danger Zone Boundary Identification",
    m3Step1Detail: "Identify red AR stay-clear zone around moving conveyor rollers.",
    m3Step2: "Step 2: Lockout / Tagout (LOTO) Isolation",
    m3Step2Detail: "Apply padlock & danger tag to primary circuit breaker before maintenance.",

    // Assessment
    quizTitle: "Practical Safety Assessment & Quiz",
    quizSubtitle: "Complete a temporary knowledge check. This prototype does not issue statutory certification.",
    scoreLabel: "Your Assessment Score",
    passedStatus: "KNOWLEDGE CHECK COMPLETED",
    failedStatus: "RE-TRAINING REQUIRED",
    generateCertBtn: "Open Local Training Record",

    // Certificate
    certTitle: "SURAKSHAAR DIGITAL TRAINING & COMPETENCY RECORD",
    certAuthority: "Local training record — not a statutory certificate",
    certIssuedTo: "Issued To",
    certSector: "Mining / Manufacturing Unit",
    certID: "Local Demo Record ID",
    certDate: "Date of Evaluation",
    verifyQRHint: "QR code performs a local device-only demo-record lookup; it does not verify identity or authenticity.",
    downloadPDF: "Download Local Training Record",

    // Admin Dashboard
    adminTitle: "RAKSHA 360 Training Dashboard",
    adminSubtitle: "Local demonstration records and simulated site cards — no live telemetry or compliance monitoring",
    totalWorkers: "Total Workers Trained",
    passRate: "Temporary Knowledge-Record Rate",
    highRiskAlerts: "High Risk Incident Hotspots",
    orientationUnder30: "Workers <30 Days Orientation",
    verifyModalTitle: "Local Demo Record Lookup",
    scanCameraBtn: "Scan QR via Camera",
    enterHashBtn: "Enter Demo ID Manually",
    exportReportBtn: "Export Local Report (PDF/CSV)",
  },
  
  hi: {
    appTitle: "सुरक्षा-AR - औद्योगिक सुरक्षा सिम्युलेटर",
    appSubtitle: "खनन और विनिर्माण के लिए कैमरा-आधारित 3D सुरक्षा प्रशिक्षण प्रोटोटाइप",
    miningSector: "झारखंड कोयला एवं इस्पात क्षेत्र",
    language: "भाषा (Language)",
    
    // Navigation
    navArModules: "AR प्रशिक्षण मॉड्यूल",
    navAssessment: "सुरक्षा मूल्यांकन",
    navCertificates: "प्रशिक्षण रिकॉर्ड",
    navAdmin: "प्रोटोटाइप डैशबोर्ड",
    navGuide: "श्रमिक अभिविन्यास निर्देश",

    // AR HUD & General
    arActive: "कैमरा-आधारित 3D सिमुलेशन",
    arGuideText: "फ़ोन का कैमरा ज़मीन या आसपास की सतह की ओर करें",
    startModule: "AR मॉड्यूल शुरू करें",
    nextStep: "अगला चरण",
    prevStep: "पिछला चरण",
    completeModule: "मॉड्यूल पूरा करें",
    audioNarrate: "आवाज़ सुनें (Voice Guide)",
    retryModule: "पुनः अभ्यास करें",
    passScoreRequired: "अस्थायी ज्ञान-परीक्षण सीमा: वर्तमान नीति",
    
    // Module 1: Fire & Explosion
    m1Title: "अग्नि एवं विस्फोट आपातकालीन प्रतिक्रिया",
    m1Desc: "कैमरा के माध्यम से आपातकालीन निकास दिशा-निर्देश, अग्निशामक (DCP/CO2) का चयन और P.A.S.S. तकनीक का लाइव अभ्यास।",
    m1Step1: "चरण 1: अलार्म और निकास मार्ग की पहचान",
    m1Step1Detail: "सुरक्षित निकास दिशा दर्शाने वाले हरे AR एरो (Arrows) का पालन करें।",
    m1Step2: "चरण 2: सही अग्निशामक सिलेंडर चुनें",
    m1Step2Detail: "आग के प्रकार (बिजली / मीथेन गैस / कोयला धूल) के आधार पर DCP या CO2 सिलेंडर चुनें।",
    m1Step3: "चरण 3: P.A.S.S. अग्निशमन ड्रिल",
    m1Step3Detail: "1. पिन खींचें (Pull) -> 2. आग के आधार पर निशाना साधें (Aim) -> 3. ट्रिगर दबाएं (Squeeze) -> 4. दाएं-बाएं घुमाएं (Sweep)।",
    m1Step4: "चरण 4: सुरक्षित निकासी",
    m1Step4Detail: "45 सेकंड में AR संकेतों का अनुसरण करते हुए सुरक्षित भूमिगत कक्ष तक पहुंचें।",

    // Module 2: Gas Leak & Confined Space
    m2Title: "गैस रिसाव एवं सीमित स्थान सुरक्षा (Gas Protocol)",
    m2Desc: "मीथेन (CH4) व कार्बन मोनोऑक्साइड (CO) ज़हरीली गैसों की पहचान, SCBA मास्क और बडी-सिस्टम (Buddy Rope) अभ्यास।",
    m2Step1: "चरण 1: गैस डिटैक्टर कैलिब्रेशन",
    m2Step1Detail: "मल्टी-गैस डिटैक्टर जांचें। मीथेन 1.25% से अधिक होने पर तुरंत पावर सप्लाई बंद करें।",
    m2Step2: "चरण 2: SCBA एवं सुरक्षा उपकरण चयन",
    m2Step2Detail: "ऑक्सीजन SCBA मास्क, सुरक्षा बेल्ट और टॉक्सिक गैस रेस्पिरेटर पहनें।",
    m2Step3: "चरण 3: गैस क्लाउड AR मैपिंग",
    m2Step3Detail: "कैमरा स्क्रीन पर खदान छत के पास जमा अदृश्य गैस क्लाउड ज़ोन देखें।",
    m2Step4: "चरण 4: बडी-सिस्टम आपातकालीन रेस्क्यू",
    m2Step4Detail: "साथी श्रमिक से सुरक्षा रस्सी बांधें और आपातकालीन 3-झटके (Tugs) सिग्नल दें।",

    // Module 3: Machinery Safety
    m3Title: "भारी मशीनरी एवं कन्वेयर बेल्ट LOTO सुरक्षा",
    m3Desc: "खनन कन्वेयर बेल्ट और हाई-वोल्टेज क्रशर मशीन पर लॉकआउट/टैगआउट (LOTO) प्रक्रिया।",
    m3Step1: "चरण 1: डेंजर ज़ोन पहचान",
    m3Step1Detail: "चलती मशीन के आसपास लाल AR सुरक्षा रेखा का ध्यान रखें।",
    m3Step2: "चरण 2: LOTO लॉक लगाएं",
    m3Step2Detail: "रखरखाव से पहले मुख्य सर्किट ब्रेकर पर पैडलॉक और डेंजर टैग लगाएं।",

    // Assessment
    quizTitle: "व्यावहारिक सुरक्षा मूल्यांकन एवं क्विज़",
    quizSubtitle: "अस्थायी ज्ञान-परीक्षण पूरा करें। यह प्रोटोटाइप वैधानिक प्रमाणपत्र जारी नहीं करता।",
    scoreLabel: "आपका मूल्यांकन स्कोर",
    passedStatus: "ज्ञान-परीक्षण पूर्ण",
    failedStatus: "पुनः प्रशिक्षण आवश्यक (FAILED)",
    generateCertBtn: "प्रोटोटाइप प्रशिक्षण रिकॉर्ड खोलें",

    // Certificate
    certTitle: "सुरक्षा-AR डिजिटल प्रशिक्षण और दक्षता रिकॉर्ड",
    certAuthority: "प्रोटोटाइप प्रशिक्षण रिकॉर्ड — वैधानिक प्रमाणपत्र नहीं",
    certIssuedTo: "श्रमिक का नाम",
    certSector: "खदान / संयंत्र इकाई",
    certID: "स्थानीय डेमो रिकॉर्ड ID",
    certDate: "मूल्यांकन तिथि",
    verifyQRHint: "QR कोड केवल इसी डिवाइस पर स्थानीय डेमो रिकॉर्ड ढूँढता है; यह पहचान या प्रामाणिकता सत्यापित नहीं करता।",
    downloadPDF: "प्रोटोटाइप प्रशिक्षण रिकॉर्ड PDF डाउनलोड करें",

    // Admin Dashboard
    adminTitle: "सुरक्षा-AR प्रोटोटाइप प्रशिक्षण डैशबोर्ड",
    adminSubtitle: "स्थानीय डेमो रिकॉर्ड और सिम्युलेटेड साइट कार्ड — कोई लाइव टेलीमेट्री नहीं",
    totalWorkers: "कुल प्रशिक्षित श्रमिक",
    passRate: "अस्थायी ज्ञान-रिकॉर्ड दर",
    highRiskAlerts: "उच्च जोखिम क्षेत्र घटनाएं",
    orientationUnder30: "30 दिन से कम ओरिएंटेशन वाले श्रमिक",
    verifyModalTitle: "स्थानीय डेमो रिकॉर्ड खोजें",
    scanCameraBtn: "कैमरा से QR स्कैन करें",
    enterHashBtn: "डेमो ID दर्ज करें",
    exportReportBtn: "प्रोटोटाइप रिपोर्ट डाउनलोड (PDF/CSV)",
  },

  sat: {
    appTitle: "ᱥᱩᱨᱚᱠᱥᱟ-AR - ᱠᱷᱟᱫᱟᱱ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱤᱢᱩᱞᱮᱴᱚᱨ",
    appSubtitle: "ᱠᱮᱢᱨᱟ-ᱵᱮᱥᱰ 3D ᱥᱩᱨᱚᱠᱥᱟ ᱴᱨᱮᱱᱤᱝ ᱯᱨᱚᱴᱚᱴᱟᱭᱯ",
    miningSector: "ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱠᱚᱭᱞᱟ ᱟᱨ ᱢᱮᱬᱦᱮᱫ ᱴᱚᱴᱷᱟ",
    language: "ᱯᱟᱹᱨᱥᱤ (Language)",
    
    // Navigation
    navArModules: "AR ᱴᱨᱮᱱᱤᱝ ᱢᱚᱰᱩᱞ (AR Modules)",
    navAssessment: "ᱥᱩᱨᱚᱠᱥᱟ ᱡᱟᱸᱪ (Assessment)",
    navCertificates: "ᱴᱨᱮᱱᱤᱝ ᱨᱮᱠᱚᱨᱰ (Records)",
    navAdmin: "ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱰᱮᱥᱵᱚᱨᱰ",
    navGuide: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱫᱤᱥᱟᱹ-ᱩᱫᱩᱜ (Guide)",

    // AR HUD & General
    arActive: "ᱠᱮᱢᱨᱟ-ᱵᱮᱥᱰ 3D ᱥᱤᱢᱩᱞᱮᱥᱚᱱ",
    arGuideText: "ᱯᱷᱚᱱ ᱠᱮᱢᱨᱟ ᱚᱛ ᱥᱮᱫ ᱟᱹᱪᱩᱨ ᱢᱮ",
    startModule: "AR ᱢᱚᱰᱩᱞ ᱮᱦᱚᱵᱽ ᱢᱮ",
    nextStep: "ᱞᱟᱦᱟ ᱞᱟᱯᱷᱟᱝ (Next)",
    prevStep: "ᱛᱟᱭᱚᱢ (Back)",
    completeModule: "ᱢᱚᱰᱩᱞ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ",
    audioNarrate: "ᱟᱲᱟᱝ ᱟᱸᱡᱚᱢ ᱢᱮ (Voice)",
    retryModule: "ᱟᱨᱦᱚᱸ ᱪᱮᱥᱴᱟᱭ ᱢᱮ (Retry)",
    passScoreRequired: "ᱴᱮᱢᱯᱚᱨᱟᱨᱤ ᱡᱟᱱᱟᱢ ᱡᱟᱸᱪ ᱥᱤᱢᱟ: ᱱᱤᱛᱚᱜ ᱱᱤᱭᱚᱢ",
    
    // Module 1: Fire & Explosion
    m1Title: "ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱵᱚᱢ ᱫᱷᱟᱢᱟᱠᱟ ᱵᱟᱧᱪᱟᱣ",
    m1Desc: "ᱠᱮᱢᱨᱟ ᱛᱮ ᱚᱰᱚᱠᱚᱜ ᱦᱚᱨ, ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡᱽ ᱥᱤᱞᱤᱱᱰᱚᱨ (DCP/CO2) ᱟᱨ P.A.S.S. ᱠᱟᱹᱢᱤ ᱪᱮᱫᱚᱜ ᱢᱮ।",
    m1Step1: "ᱦᱟᱹᱴᱤᱧ ᱑: ᱟᱞᱟᱨᱟᱢ ᱟᱨ ᱚᱰᱚᱠᱚᱜ ᱦᱚᱨ",
    m1Step1Detail: "ᱦᱟᱹᱨᱤᱭᱟᱹᱲ AR ᱪᱤᱱᱦᱟᱹ (Green Arrows) ᱯᱟᱸᱡᱟ ᱠᱟᱛᱮ ᱵᱟᱧᱪᱟᱣ ᱦᱚᱨ ᱥᱮᱫ ᱥᱮᱱᱚᱜ ᱢᱮ।",
    m1Step2: "ᱦᱟᱹᱴᱤᱧ ᱒: ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡᱽ ᱥᱤᱞᱤᱱᱰᱚᱨ ᱪᱩᱱᱟᱹᱣ",
    m1Step2Detail: "ᱥᱮᱸᱜᱮᱞ ᱞᱮᱠᱟᱛᱮ DCP ᱟᱨᱵᱟᱝ CO2 ᱥᱤᱞᱤᱱᱰᱚᱨ ᱵᱟᱪᱷᱟᱣ ᱢᱮ।",
    m1Step3: "ᱦᱟᱹᱴᱤᱧ ᱓: P.A.S.S. ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡᱽ ᱠᱟᱹᱢᱤ",
    m1Step3Detail: "᱑. ᱯᱤᱱ ᱚᱨ ᱢᱮ -> ᱒. ᱥᱮᱸᱜᱮᱞ ᱵᱩᱴᱟᱹ ᱥᱮᱫ ᱥᱟᱵᱽ ᱢᱮ -> ᱓. ᱴᱨᱤᱜᱚᱨ ᱞᱤᱱ ᱢᱮ -> ᱔. ᱮᱴᱮᱫ-ᱠᱚᱱᱮᱫ ᱟᱹᱪᱩᱨ ᱢᱮ।",
    m1Step4: "ᱦᱟᱹᱴᱤᱧ ᱔: ᱵᱟᱧᱪᱟᱣ ᱚᱰᱚᱠᱚᱜ ᱚᱠᱛᱚ",
    m1Step4Detail: "᱔᱕ ᱥᱮᱠᱮᱱᱰ ᱵᱷᱤᱛᱨᱤ ᱨᱮ AR ᱪᱤᱱᱦᱟᱹ ᱯᱟᱸᱡᱟ ᱠᱟᱛᱮ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱴᱷᱟᱶ ᱥᱮᱴᱮᱨᱚᱜ ᱢᱮ।",

    // Module 2: Gas Leak & Confined Space
    m2Title: "ᱵᱤᱥᱟᱹᱠᱛᱚ ᱜᱮᱥ ᱟᱨ ᱠᱷᱟᱫᱟᱱ ᱵᱷᱤᱛᱨᱤ ᱨᱩᱠᱷᱤᱭᱟᱹ",
    m2Desc: "ᱢᱤᱛᱷᱮᱱ (CH4) ᱟᱨ Carbon Monoxide (CO) ᱜᱮᱥ, SCBA ᱢᱟᱥᱠ ᱟᱨ Buddy System ᱪᱮᱫᱚᱜ ᱢᱮ।",
    m2Step1: "ᱦᱟᱹᱴᱤᱧ ᱑: ᱜᱮᱥ ᱡᱟᱸᱪ (Detector)",
    m2Step1Detail: "ᱜᱮᱥ ᱡᱟᱸᱪ ᱢᱮᱥᱤᱱ ᱪᱮᱠ ᱢᱮ। ᱢᱤᱛᱷᱮᱱ ᱑.᱒᱕% ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ ᱞᱮᱠᱷᱟᱱ ᱵᱤᱡᱽᱞᱤ ᱵᱚᱸᱫᱷ ᱢᱮ।",
    m2Step2: "ᱦᱟᱹᱴᱤᱧ ᱒: SCBA ᱟᱨ ᱥᱩᱨᱚᱠᱥᱟ ᱥᱟᱢᱟᱱ",
    m2Step2Detail: "SCBA ᱚᱠᱥᱤᱡᱚᱱ ᱢᱟᱥᱠ ᱟᱨ ᱥᱩᱨᱚᱠᱥᱟ ᱵᱮᱞᱴ ᱦᱚᱨᱚᱜ ᱢᱮ।",
    m2Step3: "ᱦᱟᱹᱴᱤᱧ ᱓: ᱜᱮᱥ Cloud ᱡᱟᱸᱪ",
    m2Step3Detail: "ᱠᱮᱢᱨᱟ ᱥᱠᱨᱤᱱ ᱨᱮ ᱠᱷᱟᱫᱟᱱ ᱪᱮᱛᱟᱱ ᱨᱮ ᱚᱠᱟ ᱜᱮᱥ ᱢᱮᱱᱟᱜ-ᱟ ᱧᱮᱞ ᱢᱮ।",
    m2Step4: "ᱦᱟᱹᱴᱤᱧ ᱔: ᱜᱟᱛᱮ ᱠᱟᱹᱢᱤᱭᱟᱹ (Buddy) ᱵᱟᱧᱪᱟᱣ",
    m2Step4Detail: "ᱜᱟᱛᱮ ᱥᱟᱶ ᱥᱩᱨᱚᱠᱥᱟ ᱵᱟᱵᱮᱨ ᱛᱚᱞ ᱠᱟᱛᱮ ᱓ ᱫᱷᱟᱣ ᱚᱨ (Tugs) ᱥᱤᱜᱽᱱᱟᱞ ᱮᱢ ᱢᱮ।",

    // Module 3: Machinery Safety
    m3Title: "ᱢᱮᱥᱤᱱ ᱟᱨ Conveyor Belt LOTO ᱥᱩᱨᱚᱠᱥᱟ",
    m3Desc: "ᱠᱷᱟᱫᱟᱱ Conveyor belt ᱟᱨ Crusher ᱢᱮᱥᱤᱱ ᱨᱮ LOTO ᱛᱟᱞᱟ ᱞᱟᱜᱟᱣ ᱠᱟᱹᱢᱤ।",
    m3Step1: "ᱦᱟᱹᱴᱤᱧ ᱑: ᱵᱚᱛᱚᱨᱟᱱ ᱴᱷᱟᱶ (Danger Zone)",
    m3Step1Detail: "ᱪᱟᱹᱞᱩᱜ ᱠᱟᱱ ᱢᱮᱥᱤᱱ ᱡᱟᱯᱟᱜ ᱟᱨᱟᱜ AR ᱜᱟ platform ᱧᱮᱞ ᱢᱮ।",
    m3Step2: "ᱦᱟᱹᱴᱤᱧ ᱒: LOTO ᱛᱟᱞᱟ (Lock) ᱞᱟᱜᱟᱣ",
    m3Step2Detail: "ᱠᱟᱹᱢᱤ ᱮᱦᱚᱵᱽ ᱢᱟᱲᱟᱝ ᱵᱤᱡᱽᱞᱤ ᱥᱩᱭᱤᱪ ᱨᱮ ᱛᱟᱞᱟ ᱟᱨ Danger Tag ᱞᱟᱜᱟᱣ ᱢᱮ।",

    // Assessment
    quizTitle: "ᱥᱩᱨᱚᱠᱥᱟ ᱡᱟᱸᱪ ᱟᱨ Quiz",
    quizSubtitle: "ᱴᱮᱢᱯᱚᱨᱟᱨᱤ ᱡᱟᱱᱟᱢ ᱡᱟᱸᱪ ᱯᱩᱨᱟᱹᱣ ᱢᱮ; ᱱᱚᱣᱟ ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱥᱴᱮᱴᱭᱩᱴᱚᱨᱤ ᱥᱟᱠᱟᱢ ᱵᱟᱝ ᱮᱢᱟᱭᱟ।",
    scoreLabel: "ᱟᱢᱟᱜ ᱱᱚᱢᱵᱚᱨ (Score)",
    passedStatus: "ᱯᱟᱥ ᱮᱱᱟᱢ (PASSED)",
    failedStatus: "ᱟᱨᱦᱚᱸ ᱴᱨᱮᱱᱤᱝ ᱞᱟᱹᱠᱛᱤ (FAILED)",
    generateCertBtn: "ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱴᱨᱮᱱᱤᱝ ᱨᱮᱠᱚᱨᱰ ᱧᱮᱞ ᱢᱮ",

    // Certificate
    certTitle: "ᱥᱩᱨᱚᱠᱥᱟAR ᱰᱤᱡᱤᱴᱟᱞ ᱴᱨᱮᱱᱤᱝ ᱟᱨ ᱠᱚᱢᱯᱮᱴᱮᱱᱥᱤ ᱨᱮᱠᱚᱨᱰ",
    certAuthority: "ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱴᱨᱮᱱᱤᱝ ᱨᱮᱠᱚᱨᱰ — ᱥᱴᱮᱴᱭᱩᱴᱚᱨᱤ ᱥᱟᱠᱟᱢ ᱵᱟᱝ",
    certIssuedTo: "ᱠᱟᱹᱢᱤᱭᱟᱹ ᱧᱩᱛᱩᱢ",
    certSector: "ᱠᱷᱟᱫᱟᱱ / ᱠᱟᱹᱨᱜᱟᱹᱲ ᱴᱷᱟᱶ",
    certID: "ᱞᱚᱠᱟᱞ ᱰᱮᱢᱚ ᱨᱮᱠᱚᱨᱰ ID",
    certDate: "ᱡᱟᱸᱪ ᱢᱟᱦᱟᱸ",
    verifyQRHint: "QR ᱫᱚ ᱮᱠᱮᱱ ᱱᱚᱣᱟ ᱰᱤᱵᱷᱟᱭᱥ ᱨᱮ ᱞᱚᱠᱟᱞ ᱰᱮᱢᱚ ᱨᱮᱠᱚᱨᱰ ᱧᱟᱢᱟ; ᱤᱰᱮᱱᱴᱤᱴᱤ ᱥᱮ ᱚᱛᱮᱱᱴᱤᱥᱤᱴᱤ ᱵᱟᱝ ᱡᱟᱸᱪᱟ।",
    downloadPDF: "ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱴᱨᱮᱱᱤᱝ ᱨᱮᱠᱚᱨᱰ PDF ᱰᱟᱣᱩᱱᱞᱚᱰ ᱢᱮ",

    // Admin Dashboard
    adminTitle: "ᱥᱩᱨᱚᱠᱥᱟAR ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱴᱨᱮᱱᱤᱝ ᱰᱮᱥᱵᱚᱨᱰ",
    adminSubtitle: "ᱞᱚᱠᱟᱞ ᱰᱮᱢᱚ ᱨᱮᱠᱚᱨᱰ ᱟᱨ ᱥᱤᱢᱩᱞᱮᱴᱮᱰ ᱥᱟᱭᱤᱴ ᱠᱟᱨᱰ — ᱞᱟᱭᱤᱵ ᱴᱮᱞᱤᱢᱮᱴᱨᱤ ᱵᱟᱝ",
    totalWorkers: "ᱡᱚᱛᱚ ᱴᱨᱮᱱᱤᱝ ᱠᱟᱹᱢᱤᱭᱟᱹ",
    passRate: "ᱴᱮᱢᱯᱚᱨᱟᱨᱤ ᱡᱟᱱᱟᱢ-ᱨᱮᱠᱚᱨᱰ ᱨᱮᱴ",
    highRiskAlerts: "ᱵᱚᱛᱚᱨᱟᱱ ᱴᱷᱟᱶ ᱜᱷᱚᱴᱱᱟ",
    orientationUnder30: "᱓᱐ ᱢᱟᱦᱟᱸ ᱠᱷᱚᱱ ᱠᱚᱢ ᱠᱟᱹᱢᱤᱭᱟᱹ",
    verifyModalTitle: "QR Code ᱡᱟᱸᱪ ᱢᱮ",
    scanCameraBtn: "ᱠᱮᱢᱨᱟ ᱛᱮ QR ᱥᱠᱮᱱ ᱢᱮ",
    enterHashBtn: "ᱰᱮᱢᱚ ID ᱚᱞ ᱢᱮ",
    exportReportBtn: "ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱨᱤᱯᱚᱨᱴ (PDF/CSV) ᱰᱟᱣᱩᱱᱞᱚᱰ ᱢᱮ",
  }
};
