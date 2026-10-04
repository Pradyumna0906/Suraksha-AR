/**
 * Module 1: Roof Strata & Sounding Drill (छत सुरक्षा व साउंडिंग परीक्षण)
 * DGMS Circular No. 12 & Coal Mines Regulations 2017 Strata Control
 */

class RoofStrataModule {
  constructor(arEngine, onComplete) {
    this.engine = arEngine;
    this.onComplete = onComplete;
    this.reset();
  }

  reset() {
    this.startTime = Date.now();
    this.testedSpots = {};
    this.boltedSpots = [];
    this.score = 0;
    this.hazardsSpotted = 0;
    this.totalHazards = 3;
    this.criticalErrors = 0;
    this.isSoundingMode = true;
    this.selectedSpot = null;
  }

  start() {
    this.reset();
    this.updateEngine();
    // Show a stable acoustic reference trace before the learner taps a roof point.
    this.engine.drawAcousticWaveform(false);
    this.checkCompletion();

    this.engine.onObjectClick = (userData, mesh) => {
      if (userData.type === 'roof_spot') {
        this.handleSpotClick(userData.spotData, mesh);
      }
    };
    this.engine.onObjectDrop = (userData, object, success) => {
      if (userData.type !== 'roof_bolt_tool') return;
      if (!success) {
        window.SurakshaSathi && window.SurakshaSathi.speak('बोल्ट लाल ढीली परत के निशान पर छोड़ें।', 'ᱵᱳᱞᱴ ᱟᱨᱟᱜ ᱪᱤᱱᱦᱟᱹ ᱨᱮ ᱞᱟᱹᱜᱤᱫ ᱢᱮ।', 'Drop the bolt onto the red loose-rock marker.');
        return;
      }
      this.installRoofBolt(userData.spotId);
    };

    window.SurakshaSathi && window.SurakshaSathi.speak(
      "छत सुरक्षा परीक्षण: साउंडिंग रॉड से छत के सभी 6 बिंदुओं पर टैप करें। खनकदार आवाज़ सुरक्षित है, खोखली आवाज़ पर रूफ बोल्ट लगाएं।",
      "ᱪᱷᱟᱛ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱯᱚᱨᱠᱷᱟᱭ: ᱥᱟᱣᱩᱱᱰᱤᱝ ᱨᱚᱰ ᱛᱮ ᱪᱷᱟᱛ ᱨᱮ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ᱾ ᱞᱤᱦᱩᱲ ᱥᱟᱰᱮ ᱠᱷᱟᱱ ᱵᱳᱞᱴ ᱞᱟᱜᱟᱣ ᱢᱮ᱾",
      "Roof safety check: tap all six roof points with the sounding rod. A clear ring means solid strata; a dull hollow sound means danger and needs roof bolts."
    );
  }

  updateEngine() {
    this.engine.loadRoofStrataModule({
      testedSpots: this.testedSpots,
      boltedSpots: this.boltedSpots
    });
  }

  handleSpotClick(spot, mesh) {
    this.selectedSpot = spot;

    if (!this.testedSpots[spot.id]) {
      this.testedSpots[spot.id] = true;

      if (spot.loose) {
        this.engine.playSound('hollow_thud');
        this.engine.drawAcousticWaveform(true);
        this.hazardsSpotted++;
        window.SurakshaSathi && window.SurakshaSathi.speak(
          "खतरा! खोखली भारी आवाज़ मिली है। यह छत ढहने का गंभीर जोखिम है। तुरंत रूफ बोल्ट लगाएं!",
          "ᱦᱩᱥᱤᱭᱟᱹᱨ! ᱞᱤᱦᱩᱲ ᱥᱟᱰᱮ ᱧᱟᱢ ᱮᱱᱟ᱾ ᱱᱚᱣᱟ ᱫᱚ ᱵᱚᱛᱚᱨ ᱜᱮᱭᱟ, ᱵᱳᱞᱴ ᱞᱟᱜᱟᱣ ᱢᱮ!",
          "Hazard! A dull hollow sound indicates loose roof rock and a serious fall risk. Move clear and install roof bolts immediately."
        );
      } else {
        this.engine.playSound('metallic_ring');
        this.engine.drawAcousticWaveform(false);
        window.SurakshaSathi && window.SurakshaSathi.speak(
          "सुरक्षित! ठोस खनकदार धात्विक आवाज़ है। छत स्थिर है।",
          "ᱨᱩᱠᱷᱤᱭᱟᱹ! ᱠᱷᱟᱹᱱᱠᱟᱹᱣ ᱥᱟᱰᱮ ᱢᱮᱱᱟᱜ-ᱟ᱾",
          "Safe. The clear metallic ring indicates solid, stable roof strata."
        );
      }
    } else if (spot.loose && !this.boltedSpots.includes(spot.id)) {
      this.installRoofBolt(spot.id);
      return;
    }

    this.updateEngine();
    this.checkCompletion();
  }

  installRoofBolt(spotId) {
    if (!this.boltedSpots.includes(spotId)) {
      this.boltedSpots.push(spotId);
      this.engine.playSound('lock');
      window.SurakshaSathi && window.SurakshaSathi.speak(
        "उत्कृष्ट! DGMS मानक रूफ बोल्ट स्थापित कर दिया गया है। छत अब सुरक्षित है।",
        "ᱟᱹᱰᱤ ᱵᱮᱥ! ᱨᱩᱯᱷ ᱵᱳᱞᱴ ᱞᱟᱜᱟᱣ ᱮᱱᱟ᱾ ᱱᱤᱛᱚᱜ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱜᱮᱭᱟ᱾",
        "Well done. The DGMS standard roof bolt is installed and this roof location is secured."
      );
      this.updateEngine();
      this.checkCompletion();
    }
  }

  checkCompletion() {
    const testedCount = Object.keys(this.testedSpots).length;
    const allLooseBolted = this.boltedSpots.length >= 3;

    if (window.updateDrillHUD) {
      window.updateDrillHUD({
        progress: Math.round(((testedCount + this.boltedSpots.length) / 9) * 100),
        hazardsFound: `${this.hazardsSpotted}/3 Loose Strata Hazards Detected`,
        boltsInstalled: `${this.boltedSpots.length}/3 Roof Bolts Installed`,
        instruction: testedCount < 6
          ? "3D खदान छत पर साउंडिंग रॉड से टैप करें (6 में से " + (6 - testedCount) + " बिंदु शेष)"
      : (!allLooseBolted ? "चमकता रूफ बोल्ट और प्लेट लाल ढीली चट्टान के निशान पर खींचकर छोड़ें" : "ड्रिल पूर्ण: DGMS Strata Control Competency Verified!"),
        instructionLocales: {
          english: testedCount < 6 ? `Tap the remaining ${6 - testedCount} marked roof points with the sounding rod.` : (!allLooseBolted ? 'Drag the highlighted roof bolt and bearing plate onto each red loose-rock point.' : 'Drill complete. DGMS strata-control competency verified.'),
          santhali: testedCount < 6 ? `ᱥᱟᱣᱩᱱᱰᱤᱝ ᱨᱚᱰ ᱛᱮ ᱪᱷᱟᱛ ᱨᱮ ᱵᱟᱹᱠᱤ ${6 - testedCount} ᱴᱷᱟᱶ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ᱾` : (!allLooseBolted ? 'ᱟᱨᱟᱜ ᱵᱚᱛᱚᱨ ᱴᱷᱟᱶ ᱨᱮ ᱨᱩᱯᱷ ᱵᱳᱞᱴ ᱞᱟᱜᱟᱣ ᱢᱮ᱾' : 'ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹᱣ। DGMS ᱪᱷᱟᱛ ᱥᱩᱨᱠᱷᱟ ᱯᱚᱨᱠᱷᱟ ᱯᱟᱥ।')
        },
        showOscilloscope: true,
        interactionHint: this.selectedSpot && this.selectedSpot.loose && !this.boltedSpots.includes(this.selectedSpot.id)
          ? 'अब चमकते रूफ बोल्ट और प्लेट को नीचे से लाल ढीली चट्टान पर खींचकर छोड़ें।'
          : 'छह चमकते छत बिंदुओं को साउंडिंग रॉड से जाँचें; लाल ढीली परत पर बोल्ट खींचकर लगाएँ।',
        interactionHintLocales: {
          hindi: this.selectedSpot && this.selectedSpot.loose && !this.boltedSpots.includes(this.selectedSpot.id) ? 'अब चमकते रूफ बोल्ट और प्लेट को नीचे से लाल ढीली चट्टान पर खींचकर छोड़ें।' : 'छह चमकते छत बिंदुओं को साउंडिंग रॉड से जाँचें; लाल ढीली परत पर बोल्ट खींचकर लगाएँ।',
          english: this.selectedSpot && this.selectedSpot.loose && !this.boltedSpots.includes(this.selectedSpot.id) ? 'Drag the highlighted roof bolt and bearing plate onto the red loose-rock point.' : 'Sound all six marked roof points; drag a bolt onto each red loose-rock point.',
          santhali: 'ᱪᱷᱟᱛ ᱨᱮ ᱪᱷᱚ ᱴᱷᱟᱶ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ। ᱟᱨᱟᱜ ᱴᱷᱟᱶ ᱫᱚ ᱫᱚᱦᱲᱟ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱠᱟᱛᱮ ᱵᱳᱞᱴ ᱞᱟᱜᱟᱣ ᱢᱮ।'
        },
        actions: []
      });
    }

    if (testedCount >= 6 && allLooseBolted) {
      const reactionTime = Date.now() - this.startTime;
      this.score = 96;
      setTimeout(() => {
        this.onComplete({
          moduleId: 'roof_strata',
          moduleName: 'Roof Strata & Sounding Drill (छत सुरक्षा)',
          score: this.score,
          reactionTimeMs: reactionTime,
          hazardsSpotted: this.hazardsSpotted,
          totalHazards: this.totalHazards,
          criticalErrors: this.criticalErrors,
          details: {
            tested_spots: testedCount,
            bolts_installed: this.boltedSpots.length,
            strata_competency: "Verified - DGMS Standard"
          }
        });
      }, 1200);
    }
  }
}

window.RoofStrataModule = RoofStrataModule;
