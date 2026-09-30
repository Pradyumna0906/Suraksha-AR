/**
 * Module 3: Conveyor Belt LOTO Protocol Drill (कन्वेयर बेल्ट तालाबंदी व टैगिंग)
 * DGMS Circular No. 02 & Factories Act 1948 Lockout/Tagout Standard
 */

class LOTODrillModule {
  constructor(arEngine, onComplete) {
    this.engine = arEngine;
    this.onComplete = onComplete;
    this.reset();
  }

  reset() {
    this.startTime = Date.now();
    this.step = 0; // 0: Start, 1: Switch Off, 2: Hasp, 3: Lock, 4: Tag, 5: Zero Energy Test
    this.criticalErrors = 0;
  }

  start() {
    this.reset();
    this.updateEngine();
    this.updateUI();

    this.engine.onObjectClick = (userData) => {
      if (userData.type === 'loto_switch' && this.step === 0) {
        this.advanceStep(1);
      } else if (userData.type === 'loto_test_btn' && this.step === 4) {
        this.advanceStep(5);
      }
    };
    this.engine.onObjectDrop = (userData, object, success) => {
      if (!success) return;
      const next = { loto_hasp: 2, loto_lock: 3, loto_tag: 4 }[userData.type];
      if (next && this.step === next - 1) this.advanceStep(next);
    };

    window.SurakshaSathi && window.SurakshaSathi.speak(
      "LOTO ड्रिल: कन्वेयर बेल्ट मेंटेनेंस से पहले 6-स्टेप तालाबंदी पूरी करें। पहले मुख्य पावर स्विच को बंद करें।",
      "LOTO ᱰᱨᱤᱞ: ᱠᱚᱱᱵᱷᱮᱭᱟᱨ ᱵᱮᱞᱴ ᱥᱟᱯᱷᱟ ᱞᱟᱦᱟᱨᱮ ᱥᱩᱭᱤᱪ ᱵᱚᱸᱫᱽ ᱠᱟᱛᱮ ᱛᱟᱞᱟ ᱞᱟᱜᱟᱣ ᱢᱮ᱾",
      "LOTO drill: before conveyor maintenance, complete all six lockout steps. Start by switching off and isolating the main power."
    );
  }

  updateEngine() {
    this.engine.loadLOTODrillModule({ step: this.step });
  }

  advanceStep(nextStep) {
    this.step = nextStep;
    this.engine.playSound('click');

    const prompts = {
      1: { hi: "स्विच बंद हुआ है। कन्वेयर कुछ पल जड़त्व से चलेगा; उसके पूरी तरह रुकने की पुष्टि करें। अब चमकता धातु हैस्प उठाकर आइसोलेटर के हैंडल पर लगाएं।", sat: "ᱥᱩᱭᱤᱪ ᱵᱚᱸᱫᱽ ᱮᱱᱟ। ᱵᱮᱞᱴ ᱛᱷᱤᱨ ᱦᱩᱭ ᱦᱟᱹᱵᱤᱡ ᱧᱮᱞ ᱢᱮ, ᱛᱤᱱ ᱦᱮᱥᱯ ᱞᱟᱜᱟᱣ ᱢᱮ।", en: "Power is isolated. The belt coasts to a stop; confirm it has stopped, then drag the bright metal hasp onto the isolator handle." },
      2: { hi: "क्लैंप लग गया है। अब अपनी व्यक्तिगत लाल पैडलॉक (Lock) लगाएं।", sat: "ᱱᱤᱛᱚᱜ ᱟᱢᱟᱜ ᱟᱨᱟᱜ ᱛᱟᱞᱟ (Lock) ᱞᱟᱜᱟᱣ ᱢᱮ᱾", en: "Hasp fitted. Apply your personal red lock." },
      3: { hi: "ताला लग गया है। अब डेंजर टैग (Danger Tag) लगाएं जिसमें आपका नाम व समय हो।", sat: "ᱛᱟᱞᱟ ᱞᱟᱜᱟᱣ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱰᱮᱸᱡᱚᱨ ᱴᱮᱜᱽ (Tag) ᱞᱟᱜᱟᱣ ᱢᱮ᱾", en: "Lock applied. Attach a danger tag showing your name and the time." },
      4: { hi: "टैग लग गया है। अब स्टार्ट बटन दबाकर ज़ीरो एनर्जी टेस्ट (Zero Energy Test) करें।", sat: "ᱴᱮᱜᱽ ᱞᱟᱜᱟᱣ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱴᱮᱥᱴ ᱵᱟᱴᱚᱱ ᱫᱟᱵᱟᱣ ᱢᱮ᱾", en: "Danger tag fitted. Press the start button to perform the zero-energy test." },
      5: { hi: "बहुत बढ़िया! कन्वेयर बेल्ट पूरी तरह निष्प्रभावी हो गई है। कार्य शुरू करना सुरक्षित है!", sat: "ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ! ᱠᱚᱱᱵᱷᱮᱭᱟᱨ ᱵᱮᱞᱴ ᱵᱚᱸᱫᱽ ᱮᱱᱟ᱾ ᱠᱟᱹᱢᱤ ᱮᱛᱚᱦᱚᱵ ᱢᱮ!", en: "Good. The conveyor passed the zero-energy test. It is safe to begin the planned maintenance." }
    };

    if (prompts[nextStep]) {
      window.SurakshaSathi && window.SurakshaSathi.speak(prompts[nextStep].hi, prompts[nextStep].sat, prompts[nextStep].en);
    }

    this.updateEngine();
    this.updateUI();
    this.checkCompletion();
  }

  updateUI() {
    const instructions = [
      "चरण 1: 3D मॉडल पर मुख्य आइसोलेटर स्विच (Isolator Switch) को OFF करें",
      "चरण 2: स्विच पर सेफ्टी हैस्प (Multi-Lock Hasp) लगाएं",
      "चरण 3: अपनी व्यक्तिगत लाल सुरक्षा पैडलॉक (Red Padlock) लगाएं",
      "चरण 4: नाम व तारीख अंकित डेंजर टैग (Danger Tag) लगाएं",
      "चरण 5: स्टार्ट बटन दबाकर 'ज़ीरो एनर्जी वेरिफिकेशन' (Zero Energy Test) करें",
      "ड्रिल पूर्ण: 6-Step LOTO Protocol Certified by DGMS!"
    ];

    if (window.updateDrillHUD) {
      window.updateDrillHUD({
        progress: Math.round((this.step / 5) * 100),
        hazardsFound: this.step < 5 ? "Residual Kinetic Energy Active" : "Zero Kinetic Energy Verified",
        boltsInstalled: `Step: ${this.step}/5 Complete`,
        instruction: instructions[this.step],
        instructionLocales: [
          { english: 'Step 1: Switch off and isolate the main power.', santhali: 'ᱫᱷᱟᱯ 1: ᱢᱩᱬ ᱠᱟᱨᱮᱱᱴ ᱵᱚᱸᱫᱽ ᱢᱮ।' },
          { english: 'Step 2: Attach the multi-lock safety hasp.', santhali: 'ᱫᱷᱟᱯ 2: ᱥᱩᱨᱠᱷᱟ ᱦᱮᱥᱯ ᱞᱟᱜᱟᱣ ᱢᱮ।' },
          { english: 'Step 3: Attach your personal red padlock.', santhali: 'ᱫᱷᱟᱯ 3: ᱟᱢᱟᱜ ᱟᱨᱟᱜ ᱛᱟᱞᱟ ᱞᱟᱜᱟᱣ ᱢᱮ।' },
          { english: 'Step 4: Attach a danger tag with your name and time.', santhali: 'ᱫᱷᱟᱯ 4: ᱧᱩᱛᱩᱢ ᱟᱨ ᱚᱠᱛᱚ ᱛᱮ ᱰᱮᱸᱡᱚᱨ ᱴᱮᱜᱽ ᱞᱟᱜᱟᱣ ᱢᱮ।' },
          { english: 'Step 5: Press start to verify zero energy.', santhali: 'ᱫᱷᱟᱯ 5: ᱵᱟᱴᱚᱱ ᱫᱟᱵᱟᱣ ᱠᱟᱛᱮ ᱥᱩᱱ ᱮᱱᱟᱨᱡᱤ ᱡᱟᱸᱪ ᱢᱮ।' },
          { english: 'LOTO drill complete. Zero energy is verified.', santhali: 'LOTO ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹᱣ। ᱥᱩᱱ ᱮᱱᱟᱨᱡᱤ ᱡᱟᱸᱪ ᱮᱱᱟ।' }
        ][this.step],
        interactionHint: ['3D कैबिनेट का हरा isolator switch टैप करें', '3D hasp को उठाकर switch पर drag करें', 'लाल padlock को hasp पर drag करें', 'DO NOT START tag को lock पर drag करें', 'लाल TEST बटन दबाएँ—बेल्ट restart नहीं होनी चाहिए', 'Zero energy verified'][this.step],
        interactionHintLocales: {
          hindi: ['3D कैबिनेट का हरा isolator switch टैप करें', '3D hasp को उठाकर switch पर drag करें', 'लाल padlock को hasp पर drag करें', 'DO NOT START tag को lock पर drag करें', 'लाल TEST बटन दबाएँ—बेल्ट restart नहीं होनी चाहिए', 'Zero energy verified'][this.step],
          english: ['Tap the green isolator switch in the 3D cabinet.', 'Drag the safety hasp onto the isolator.', 'Drag your red personal padlock onto the hasp.', 'Drag the DO NOT START tag onto the lockout point.', 'Press the red TEST button. The belt must stay stopped.', 'Zero energy verified.'][this.step],
          santhali: 'ᱥᱩᱭᱤᱪ ᱵᱚᱸᱫᱽ ᱢᱮ, ᱦᱮᱥᱯ ᱟᱨ ᱛᱟᱞᱟ ᱞᱟᱜᱟᱣ ᱢᱮ, ᱛᱟᱜᱤᱭᱟ ᱛᱮ ᱡᱟᱸᱪ ᱢᱮ।'
        },
        actions: []
      });
    }
  }

  getActionsForStep() {
    if (this.step === 0) {
      return [{ label: "🔌 Turn Isolator Switch OFF (स्विच बंद करें)", action: () => this.advanceStep(1), primary: true }];
    } else if (this.step === 1) {
      return [{ label: "🗜️ Attach Safety Hasp (सेफ्टी क्लैंप लगाएं)", action: () => this.advanceStep(2), primary: true }];
    } else if (this.step === 2) {
      return [{ label: "🔒 Lock Personal Red Padlock (लाल ताला लगाएं)", action: () => this.advanceStep(3), primary: true }];
    } else if (this.step === 3) {
      return [{ label: "🏷️ Affix Danger Tag (डेंजर टैग लगाएं)", action: () => this.advanceStep(4), primary: true }];
    } else if (this.step === 4) {
      return [{ label: "⚡ Perform Zero-Energy Start Test (ज़ीरो टेस्ट करें)", action: () => this.advanceStep(5), primary: true }];
    }
    return [];
  }

  checkCompletion() {
    if (this.step >= 5) {
      const reactionTime = Date.now() - this.startTime;
      setTimeout(() => {
        this.onComplete({
          moduleId: 'loto_drill',
          moduleName: 'Conveyor LOTO Protocol (तालाबंदी व टैगिंग)',
          score: 98,
          reactionTimeMs: reactionTime,
          hazardsSpotted: 4,
          totalHazards: 4,
          criticalErrors: this.criticalErrors,
          details: {
            isolation_performed: true,
            hasp_and_lock_applied: true,
            danger_tag_affixed: true,
            zero_energy_test_verified: true
          }
        });
      }, 1200);
    }
  }
}

window.LOTODrillModule = LOTODrillModule;
