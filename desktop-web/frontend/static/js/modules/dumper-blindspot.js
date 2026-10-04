/**
 * Module 4: 100T Dumper Blind Spot & DGMS Horn Code Drill (100 टन डंपर अंधा क्षेत्र)
 * DGMS Circular No. 06 on Heavy Earth Moving Machinery (HEMM) Safety
 */

class DumperBlindSpotModule {
  constructor(arEngine, onComplete) {
    this.engine = arEngine;
    this.onComplete = onComplete;
    this.reset();
  }

  reset() {
    this.startTime = Date.now();
    this.blindSpotsIdentified = new Set();
    this.safeZoneIdentified = false;
    this.hornQuizPassed = false;
    this.selectedHornAnswer = null;
    this.criticalErrors = 0;
  }

  start() {
    this.reset();
    this.updateEngine();
    this.updateUI();

    this.engine.onObjectClick = (userData) => {
      if (userData.type === 'blind_zone_fatal') {
        this.selectFatalZone();
      } else if (userData.type === 'safe_zone') {
        this.selectSafeZone();
      } else if (userData.type === 'dumper_horn_answer') {
        this.handleHornAnswer(userData.answer);
      }
    };

    window.SurakshaSathi && window.SurakshaSathi.speak(
      "100-टन डंपर सुरक्षा: 3D स्पेस में लाल अंधा क्षेत्र और हरा सुरक्षित क्षेत्र पहचानें। डंपर से 10 मीटर की दूरी रखें।",
      "ᱰᱟᱢᱯᱟᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ: ᱟᱨᱟᱜ ᱵᱚᱛᱚᱨ ᱴᱷᱟᱶ ᱟᱨ ᱦᱟᱹᱨᱭᱟᱹᱲ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱴᱷᱟᱶ ᱧᱮᱞ ᱢᱮ᱾",
      "100-ton dumper safety: identify the red blind zone and green safe zone. Stay at least 10 metres from the dumper."
    );
  }

  updateEngine() {
    this.engine.loadDumperBlindSpotModule({
      blindSpots: this.blindSpotsIdentified,
      safeZone: this.safeZoneIdentified,
      selectedHornAnswer: this.selectedHornAnswer
    });
  }

  selectFatalZone() {
    this.blindSpotsIdentified.add('fatal_ring');
    this.engine.playSound('gas_alarm');
    window.SurakshaSathi && window.SurakshaSathi.speak(
      "सावधान! यह डंपर का गंभीर अंधा क्षेत्र (Blind Spot) है। चालक आपको बिल्कुल नहीं देख सकता। तुरंत 10 मीटर दूर सुरक्षित क्षेत्र में जाएं।",
      "ᱦᱩᱥᱤᱭᱟᱹᱨ! ᱱᱚᱣᱟ ᱫᱚ ᱵᱞᱟᱭᱤᱱᱰ ᱥᱯᱳᱴ ᱠᱟᱱᱟ᱾ ᱰᱨᱟᱭᱵᱷᱟᱨ ᱵᱟᱭ ᱧᱮᱞ ᱫᱟᱲᱮᱭᱟᱢᱟ᱾ 10 ᱢᱤᱴᱟᱨ ᱥᱟᱺᱜᱤᱧ ᱪᱟᱞᱟᱜ ᱢᱮ᱾",
      "Warning! This red zone is the dumper's fatal blind spot. The driver cannot see you. Move to the safe zone and keep 10 metres away."
    );
    this.updateEngine();
    this.updateUI();
    this.checkCompletion();
  }

  selectSafeZone() {
    this.safeZoneIdentified = true;
    this.engine.playSound('metallic_ring');
    window.SurakshaSathi && window.SurakshaSathi.speak(
      "शाबाश! यह सुरक्षित प्रत्यक्ष दृश्य क्षेत्र (Safe Visibility Zone) है, जहाँ चालक के दोनों साइड-मिरर आपको देख सकते हैं।",
      "ᱟᱹᱰᱤ ᱵᱮᱥ! ᱱᱚᱣᱟ ᱫᱚ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱴᱷᱟᱶ ᱠᱟᱱᱟ᱾",
      "Correct. This is the driver's safe visibility zone. Make eye contact before approaching."
    );
    this.updateEngine();
    this.updateUI();
    this.checkCompletion();
  }

  playHornBlast(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.engine.playSound('horn');
      }, i * 650);
    }
  }

  handleHornAnswer(selectedBlasts) {
    this.selectedHornAnswer = selectedBlasts;
    this.playHornBlast(selectedBlasts);
    if (selectedBlasts === 3) {
      this.hornQuizPassed = true;
      this.engine.playSound('metallic_ring');
      window.SurakshaSathi && window.SurakshaSathi.speak(
        "बिल्कुल सही! DGMS नियम के अनुसार डंपर को पीछे (Reverse) करने से पहले चालक 3 हॉर्न बजाता है।",
        "ᱥᱟᱹᱨᱤ ᱜᱮᱭᱟ! ᱰᱟᱢᱯᱟᱨ ᱯᱟᱹᱪᱷᱞᱟᱹ ᱞᱟᱹᱜᱤᱫ 3 ᱫᱷᱟᱣ ᱦᱚᱨᱱ ᱵᱟᱡᱟᱜ-ᱟ᱾",
        "Correct. Give three horn blasts before reversing, according to the training code."
      );
    } else {
      this.criticalErrors++;
      this.engine.playSound('gas_alarm');
      window.SurakshaSathi && window.SurakshaSathi.speak(
        "गलत! DGMS कोड: 1 हॉर्न = स्टार्ट, 2 हॉर्न = आगे, 3 हॉर्न = रिवर्स (पीछे)।",
        "ᱵᱷᱩᱞ ᱜᱮᱭᱟ! 1=ᱮᱛᱚᱦᱚᱵ, 2=ᱞᱟᱦᱟ, 3=ᱯᱟᱹᱪᱷᱞᱟᱹ᱾",
        "Not correct. The training horn code is one blast to start, two to move forward, and three before reversing."
      );
    }
    this.updateEngine();
    this.updateUI();
    this.checkCompletion();
  }

  updateUI() {
    const progress = (this.blindSpotsIdentified.size > 0 ? 35 : 0) + (this.safeZoneIdentified ? 35 : 0) + (this.hornQuizPassed ? 30 : 0);
    const complete = this.blindSpotsIdentified.size > 0 && this.safeZoneIdentified && this.hornQuizPassed;

    if (window.updateDrillHUD) {
      window.updateDrillHUD({
        progress: progress,
        hazardsFound: this.blindSpotsIdentified.size > 0 ? "360° HEMM Fatal Zone Mapped" : "Identify Red Fatal Ring",
        boltsInstalled: this.hornQuizPassed ? "Horn Code: 3 Blasts (Reverse)" : "DGMS Horn Code Quiz Pending",
        instruction: complete ? "ड्रिल पूर्ण: लाल blind-zone, हरा safe-zone और reverse से पहले 3 हॉर्न—तीनों सत्यापित।"
          : (!this.blindSpotsIdentified.size
          ? "3D मॉडल में डंपर के चारों ओर लाल घातक अंधा क्षेत्र (Fatal Blind Spot) पर टैप करें"
          : (!this.safeZoneIdentified ? "डंपर के आगे हरे सुरक्षित क्षेत्र (Safe Eye-Line Zone) पर टैप करें" : "DGMS हॉर्न कोड ऑडियो परीक्षण का सही उत्तर चुनें")),
        instructionLocales: complete
          ? { english: 'Drill complete: blind zone, safe standing zone, and the three-blast reverse warning are verified.', santhali: 'ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹᱣ। ᱵᱞᱟᱭᱤᱱᱰ ᱴᱷᱟᱶ, ᱨᱩᱠᱷᱤᱭᱟᱹ ᱴᱷᱟᱶ ᱟᱨ 3 ᱦᱚᱨᱱ ᱠᱚᱰ ᱧᱟᱢ ᱮᱱᱟ।' }
          : (!this.blindSpotsIdentified.size
          ? { english: 'Tap the red fatal blind-zone ring around the dumper.', santhali: 'ᱰᱟᱢᱯᱟᱨ ᱟᱨᱟᱜ ᱵᱚᱛᱚᱨ ᱴᱷᱟᱶ ᱨᱮ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ।' }
          : (!this.safeZoneIdentified ? { english: 'Tap the green safe visibility zone in front of the dumper.', santhali: 'ᱰᱟᱢᱯᱟᱨ ᱞᱟᱦᱟᱨᱮ ᱦᱟᱹᱨᱭᱟᱹᱲ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱴᱷᱟᱶ ᱨᱮ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ।' } : { english: 'Choose the correct answer in the DGMS horn-code check.', santhali: 'DGMS ᱦᱚᱨᱱ ᱠᱳᱰ ᱨᱮ ᱥᱟᱹᱨᱤ ᱡᱚᱵᱟᱵ ᱵᱟᱪᱷᱟᱣ ᱢᱮ।' })),
        interactionHint: complete ? 'ड्रिल पूर्ण—अगले प्रशिक्षण क्षेत्र पर जाएँ।' : (this.hornQuizPassed ? 'तीन हॉर्न सही: अब डंपर के आगे हरे safe-zone में खड़े हों।' : 'डंपर के आसपास लाल blind-zone और हरा safe-zone पहचानें; फिर 3D कंट्रोल पर सही horn code टैप करें।'),
        interactionHintLocales: { english: complete ? 'Drill complete. Continue to the next training domain.' : (this.hornQuizPassed ? 'Three blasts are correct. Stand in the green safe zone.' : 'Identify the red blind zone and green safe zone, then tap the correct horn code on the 3D control.'), santhali: 'ᱟᱨᱟᱜ ᱵᱚᱛᱚᱨ ᱴᱷᱟᱶ ᱟᱨ ᱦᱟᱹᱨᱭᱟᱹᱲ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱴᱷᱟᱶ ᱧᱮᱞ ᱢᱮ, ᱛᱤᱱ 3D ᱦᱚᱨᱱ ᱠᱳᱰ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ।' },
        actions: [],
        quiz: null
      });
    }
  }

  checkCompletion() {
    if (this.blindSpotsIdentified.size > 0 && this.safeZoneIdentified && this.hornQuizPassed) {
      const reactionTime = Date.now() - this.startTime;
      setTimeout(() => {
        this.onComplete({
          moduleId: 'dumper_blindspot',
          moduleName: '100T Dumper Blind Spot & Horn Code (डंपर अंधा क्षेत्र)',
          score: 95,
          reactionTimeMs: reactionTime,
          hazardsSpotted: 3,
          totalHazards: 3,
          criticalErrors: this.criticalErrors,
          details: {
            blind_spot_identified: true,
            safe_distance_10m_verified: true,
            dgms_horn_code_verified: "3 Blasts (Reverse)"
          }
        });
      }, 1200);
    }
  }
}

window.DumperBlindSpotModule = DumperBlindSpotModule;
