/**
 * Module 2: Multi-Gas & Methane Hazard Drill (मल्टी-गैस व मीथेन परीक्षण)
 * DGMS Coal Mines Regulations 2017 & Mines Act 1952 Gas Safety
 */

class GasDetectorModule {
  constructor(arEngine, onComplete) {
    this.engine = arEngine;
    this.onComplete = onComplete;
    this.reset();
  }

  reset() {
    this.startTime = Date.now();
    this.currentZone = 'zone_mid';
    this.ch4Level = 0.40;
    this.testedZones = new Set();
    this.powerCutOff = false;
    this.bratticeAdjusted = false;
    this.alarmTriggered = false;
    this.criticalErrors = 0;
  }

  start() {
    this.reset();
    this.updateEngine();
    this.updateUI();

    this.engine.onObjectClick = (userData) => {
      if (userData.type === 'gas_zone') {
        this.selectZone(userData.zoneData);
      } else if (userData.type === 'gas_power_switch') {
        if (this.ch4Level >= 1.25 && !this.powerCutOff) this.actionCutPower();
      } else if (userData.type === 'gas_brattice') {
        if (this.powerCutOff && !this.bratticeAdjusted) this.actionAdjustVentilation();
      }
    };

    window.SurakshaSathi && window.SurakshaSathi.speak(
      "मल्टी-गैस परीक्षण: छत, श्वास और फर्श स्तर पर गैस डिटेक्टर से जांचें। मीथेन 1.25% से अधिक होने पर तुरंत बिजली काटें।",
      "ᱢᱟᱞᱴᱤ-ᱜᱮᱥ ᱯᱚᱨᱠᱷᱟᱭ: ᱪᱷᱟᱛ, ᱥᱟᱦᱮᱫ ᱟᱨ ᱞᱟᱛᱟᱨ ᱨᱮ ᱜᱮᱥ ᱡᱟᱸᱪ ᱢᱮ᱾",
      "Multi-gas check: sample roof, breathing and floor levels with the detector. If methane reaches 1.25 percent, isolate power immediately."
    );
  }

  updateEngine() {
    this.engine.loadGasDetectorModule({
      currentZone: this.currentZone,
      ch4Level: this.ch4Level,
      alarmTriggered: this.alarmTriggered,
      powerCutOff: this.powerCutOff,
      bratticeAdjusted: this.bratticeAdjusted
    });
  }

  selectZone(zoneData) {
    this.currentZone = zoneData.id;
    this.testedZones.add(zoneData.id);
    this.ch4Level = zoneData.ch4;

    this.engine.playSound('click');

    if (this.ch4Level >= 1.25 && !this.powerCutOff) {
      this.alarmTriggered = true;
      this.engine.playSound('gas_alarm');
      window.SurakshaSathi && window.SurakshaSathi.speak(
        "खतरा! छत पर मीथेन 1.45% है, जो 1.25% की सीमा से अधिक है! DGMS नियम के तहत तुरंत बिजली काटें और वेंटिलेशन पर्दा ठीक करें!",
        "ᱦᱩᱥᱤᱭᱟᱹᱨ! ᱪᱷᱟᱛ ᱨᱮ ᱢᱤᱛᱷᱮᱱ 1.45% ᱢᱮᱱᱟᱜ-ᱟ! ᱛᱩᱨᱚᱸᱛ ᱠᱟᱨᱮᱱᱴ ᱵᱚᱸᱫᱽ ᱢᱮ ᱟᱨ ᱵᱷᱮᱱᱴᱤᱞᱮᱥᱚᱱ ᱯᱚᱨᱫᱟ ᱴᱷᱤᱠ ᱢᱮ!",
        "Danger! Roof methane is 1.45 percent, above the 1.25 percent limit. Isolate power and restore ventilation immediately."
      );
    } else {
      this.alarmTriggered = false;
      window.SurakshaSathi && window.SurakshaSathi.speak(
        `गैस रीडिंग: मीथेन ${this.ch4Level}%, ऑक्सीजन ${zoneData.o2}%, कार्बन मोनोऑक्साइड ${zoneData.co} PPM`,
        `ᱜᱮᱥ ᱞᱮᱠᱷᱟ: ᱢᱤᱛᱷᱮᱱ ${this.ch4Level}%, ᱚᱠᱥᱤᱡᱚᱱ ${zoneData.o2}%`,
        `Gas reading: methane ${this.ch4Level} percent, oxygen ${zoneData.o2} percent, carbon monoxide ${zoneData.co} parts per million.`
      );
    }

    this.updateEngine();
    this.updateUI();
  }

  actionCutPower() {
    this.powerCutOff = true;
    this.engine.playSound('click');
    window.SurakshaSathi && window.SurakshaSathi.speak(
      "बहुत बढ़िया! बिजली बंद कर दी गई है। अब चिंगारी से विस्फोट का खतरा टल गया है।",
      "ᱟᱹᱰᱤ ᱵᱮᱥ! ᱠᱟᱨᱮᱱᱴ ᱵᱚᱸᱫᱽ ᱮᱱᱟ᱾ ᱵᱤᱥᱯᱷᱳᱴ ᱠᱷᱚᱛᱨᱟ ᱴᱟᱲᱟᱣ ᱮᱱᱟ᱾",
      "Good. Power is isolated, removing the ignition source and reducing explosion risk."
    );
    this.updateEngine();
    this.updateUI();
    this.checkCompletion();
  }

  actionAdjustVentilation() {
    this.bratticeAdjusted = true;
    this.ch4Level = 0.35;
    this.alarmTriggered = false;
    this.engine.playSound('oxygen_hiss');
    window.SurakshaSathi && window.SurakshaSathi.speak(
      "वेंटिलेशन पर्दा ठीक हो गया है। ताजा हवा से मीथेन घटकर 0.35% (सुरक्षित) हो गई है।",
      "ᱵᱷᱮᱱᱴᱤᱞᱮᱥᱚᱱ ᱴᱷᱤᱠ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱜᱮᱥ 0.35% (ᱨᱩᱠᱷᱤᱭᱟᱹ) ᱦᱩᱭ ᱮᱱᱟ᱾",
      "Ventilation has been restored. Fresh airflow has reduced methane to 0.35 percent, within the training safe range."
    );
    this.updateEngine();
    this.updateUI();
    this.checkCompletion();
  }

  updateUI() {
    if (window.updateDrillHUD) {
      window.updateDrillHUD({
        progress: Math.round(((this.testedZones.size + (this.powerCutOff ? 1 : 0) + (this.bratticeAdjusted ? 1 : 0)) / 5) * 100),
        hazardsFound: this.ch4Level >= 1.25 ? "Methane Exceeded 1.25% (छत पर ज्वलनशील गैस)" : "Gas Levels Normal",
        boltsInstalled: `Zones Sampled: ${this.testedZones.size}/3`,
        instruction: !this.powerCutOff && this.ch4Level >= 1.25
          ? "मीटर पर खतरा देखकर 3D कंट्रोल पैनल का लाल POWER ISOLATOR टैप करें"
          : (!this.bratticeAdjusted && this.powerCutOff ? "अब 3D खदान के दाईं ओर वेंटिलेशन पर्दे को टैप करके खोलें" : "3D मीटर से छत, श्वास और फर्श तीनों स्तरों की गैस जांच करें"),
        instructionLocales: {
          english: !this.powerCutOff && this.ch4Level >= 1.25 ? 'Immediate action: isolate the electrical supply, then restore ventilation.' : (!this.bratticeAdjusted && this.powerCutOff ? 'Adjust the ventilation curtain to restore fresh airflow.' : 'Sample gas at roof, breathing height, and floor level.'),
          santhali: !this.powerCutOff && this.ch4Level >= 1.25 ? 'ᱛᱩᱨᱚᱸᱛ ᱠᱟᱨᱮᱱᱴ ᱵᱚᱸᱫᱽ ᱢᱮ, ᱟᱨ ᱵᱷᱮᱱᱴᱤᱞᱮᱥᱚᱱ ᱴᱷᱤᱠ ᱢᱮ᱾' : (!this.bratticeAdjusted && this.powerCutOff ? 'ᱵᱷᱮᱱᱴᱤᱞᱮᱥᱚᱱ ᱯᱚᱨᱫᱟ ᱴᱷᱤᱠ ᱠᱟᱛᱮ ᱵᱟᱨ ᱦᱚᱭ ᱟᱹᱜᱩ ᱢᱮ᱾' : 'ᱪᱷᱟᱛ, ᱥᱟᱦᱮᱫ ᱟᱨ ᱞᱟᱛᱟᱨ ᱨᱮ ᱜᱮᱥ ᱡᱟᱸᱪ ᱢᱮ᱾')
        },
        interactionHint: !this.powerCutOff && this.ch4Level >= 1.25 ? '3D पैनल के लाल पावर स्विच को टैप करें' : (!this.bratticeAdjusted && this.powerCutOff ? 'दाईं ओर के वेंटिलेशन पर्दे को टैप करके हवा का रास्ता खोलें' : 'गैस स्तर चुनने के लिए छत, श्वास और फर्श के रंगीन क्षेत्र टैप करें'),
        interactionHintLocales: { english: !this.powerCutOff && this.ch4Level >= 1.25 ? 'Tap the red power isolator on the 3D panel.' : (!this.bratticeAdjusted && this.powerCutOff ? 'Tap the ventilation curtain on the right to restore airflow.' : 'Tap the colored roof, breathing-height, and floor zones to sample gas.'), santhali: 'ᱜᱮᱥ ᱡᱟᱸᱪ ᱞᱟᱹᱜᱤᱫ ᱪᱷᱟᱛ, ᱥᱟᱦᱮᱫ ᱟᱨ ᱞᱟᱛᱟᱨ ᱴᱷᱟᱶ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ।' },
        actions: []
      });
    }
  }

  checkCompletion() {
    if (this.testedZones.size >= 3 && this.powerCutOff && this.bratticeAdjusted) {
      const reactionTime = Date.now() - this.startTime;
      setTimeout(() => {
        this.onComplete({
          moduleId: 'gas_detector',
          moduleName: 'Multi-Gas & Methane Hazard Drill (मल्टी-गैस व मीथेन)',
          score: 94,
          reactionTimeMs: reactionTime,
          hazardsSpotted: 3,
          totalHazards: 3,
          criticalErrors: this.criticalErrors,
          details: {
            sampling_levels_checked: 3,
            power_cutoff_adherence: "Correct & Immediate",
            ventilation_restored: true
          }
        });
      }, 1200);
    }
  }
}

window.GasDetectorModule = GasDetectorModule;
