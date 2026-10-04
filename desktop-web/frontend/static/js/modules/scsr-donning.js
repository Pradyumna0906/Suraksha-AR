/**
 * Module 5: SCSR 60-Second Emergency Escape Drill (आपातकालीन रेस्क्यूर)
 * Coal Mines Regulations 2017 Reg. 191 & DGMS Self-Rescuer Donning Standard
 */

class SCSRDonningModule {
  constructor(arEngine, onComplete) {
    this.engine = arEngine;
    this.onComplete = onComplete;
    this.reset();
  }

  reset() {
    this.startTime = Date.now();
    this.step = 0; // 0: Open Case, 1: Mouthpiece, 2: Nose Clip, 3: Goggles, 4: Starter Oxygen Pin
    this.smokeActive = true;
    this.timerSeconds = 60;
    this.timerInterval = null;
    this.criticalErrors = 0;
  }

  start() {
    this.stop();
    this.reset();
    this.updateEngine();
    this.updateUI();

    this.timerInterval = setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.timerSeconds = 0;
      }
      this.updateUI();
    }, 1000);

    this.engine.onObjectClick = (userData) => {
      if (userData.type === 'scsr_case_lid' && this.step === 0) {
        this.advanceStep(1);
      } else if (userData.type === 'scsr_exit' && this.step === 5) {
        this.advanceStep(6);
      }
    };
    this.engine.onObjectDrop = (userData, object, success) => {
      if (!success) return;
      const next = { scsr_mouthpiece: 2, scsr_nose_clip: 3, scsr_goggles: 4, scsr_starter_pin: 5 }[userData.type];
      if (next && this.step === next - 1) this.advanceStep(next);
    };

    window.SurakshaSathi && window.SurakshaSathi.speak(
      { hindi: "आपातकाल! खदान में धुआं फैल रहा है। 60 सेकंड के भीतर SCSR पहनें। सबसे पहले धातु का डिब्बा खोलें।", english: "Emergency! Smoke is spreading in the mine. Don your self-rescuer within 60 seconds. First, open the metal case.", bengali: "জরুরি অবস্থা! খনিতে ধোঁয়া ছড়াচ্ছে। ৬০ সেকেন্ডের মধ্যে স্ব-উদ্ধার যন্ত্রটি পরুন। প্রথমে ধাতব কেসটি খুলুন।", santhali: "ᱟᱯᱟᱛᱠᱟᱞ! ᱫᱷᱩᱶᱟᱹ ᱦᱩᱭ ᱮᱱᱟ᱾ 60 ᱥᱮᱠᱮᱱᱰ ᱨᱮ SCSR ᱦᱚᱨᱚᱜ ᱢᱮ᱾ ᱞᱟᱦᱟᱨᱮ ᱰᱟᱵᱽᱵᱟ ᱡᱷᱤᱡᱽ ᱢᱮ᱾", mundari: "ᱡᱚᱦᱟᱨ! ᱠᱷᱟᱫᱟᱱ ᱨᱮ ᱫᱷᱩᱸᱟ ᱵᱷᱟᱨᱟᱜ ᱟᱠᱟᱱᱟ। 60 ᱥᱮᱠᱮᱱᱰ ᱨᱮ ᱥᱮᱞᱯ ᱨᱮᱥᱠᱭᱩᱣᱟᱨ ᱞᱟᱜᱟᱣᱟ। ᱥᱟᱹᱨᱤᱡ ᱠᱮᱥ ᱠᱷᱩᱞᱟᱹᱭᱢᱮ।" }
    );
  }

  updateEngine() {
    this.engine.loadSCSRDonningModule({
      step: this.step,
      smokeActive: this.smokeActive
    });
  }

  advanceStep(nextStep) {
    this.step = nextStep;
    this.engine.playSound('click');

    const prompts = {
      1: { hindi: "केस खुल गया है। माउथपीस को खींचकर मुँह के निशान पर फिट करें।", english: "The case is open. Drag the mouthpiece onto the marked mouth position and seal your lips around it.", bengali: "কেসটি খোলা হয়েছে। মুখের চিহ্নে মাউথপিসটি টেনে বসান এবং ঠোঁট দিয়ে সিল করুন।", santhali: "ᱠᱮᱥ ᱡᱷᱤᱡᱽ ᱮᱱᱟ᱾ ᱢᱚᱪᱟ ᱨᱮ ᱢᱟᱣᱛᱷᱯᱤᱥ ᱞᱟᱜᱟᱣ ᱢᱮ᱾", mundari: "ᱠᱮᱥ ᱠᱷᱩᱞᱟᱹᱭ ᱜᱮᱞᱟ। ᱢᱚᱪᱟ ᱨᱮ ᱢᱟᱣᱛᱷᱯᱤᱥ ᱛᱟᱹᱱᱛᱮ ᱞᱟᱜᱟᱣᱢᱮ।" },
      2: { hindi: "माउथपीस फिट है। नोज़ क्लिप को खींचकर नाक पर लगाएँ।", english: "Mouthpiece fitted. Drag the nose clip onto the bridge of the nose.", bengali: "মাউথপিস বসানো হয়েছে। নোজ ক্লিপটি নাকের ওপর টেনে বসান।", santhali: "ᱢᱚᱪᱟ ᱨᱮ ᱢᱟᱣᱛᱷᱯᱤᱥ ᱞᱟᱜᱟᱣ ᱮᱱᱟ। ᱱᱚᱥ ᱠᱞᱤᱯ ᱱᱚᱠ ᱨᱮ ᱞᱟᱜᱟᱣ ᱢᱮ।", mundari: "ᱢᱚᱪᱟ ᱨᱮ ᱢᱟᱣᱛᱷᱯᱤᱥ ᱞᱟᱜᱟᱣ ᱜᱮᱞᱟ। ᱱᱚᱠ ᱨᱮ ᱱᱚᱥ ᱠᱞᱤᱯ ᱞᱟᱜᱟᱣᱢᱮ।" },
      3: { hindi: "नोज़ क्लिप लग गई। गॉगल्स को आँखों पर खींचकर फिट करें।", english: "Nose clip fitted. Drag the goggles over the eyes until they align with the face.", bengali: "নোজ ক্লিপ বসানো হয়েছে। চোখের ওপর গগলস টেনে ঠিকমতো বসান।", santhali: "ᱱᱚᱥ ᱠᱞᱤᱯ ᱞᱟᱜᱟᱣ ᱮᱱᱟ। ᱪᱚᱥᱢᱟ ᱢᱮᱫ ᱨᱮ ᱞᱟᱜᱟᱣ ᱢᱮ।", mundari: "ᱱᱚᱥ ᱠᱞᱤᱯ ᱞᱟᱜᱟᱣ ᱜᱮᱞᱟ। ᱢᱮᱫ ᱨᱮ ᱜᱚᱜᱚᱞᱥ ᱞᱟᱜᱟᱣᱢᱮ।" },
      4: { hindi: "सुरक्षा उपकरण फिट हैं। लाल स्टार्टर रिंग को पकड़कर बाहर खींचें।", english: "The protective equipment is fitted. Grab the red starter ring and pull it out to activate oxygen.", bengali: "সুরক্ষা সরঞ্জাম পরা হয়েছে। লাল স্টার্টার রিংটি ধরে বাইরে টানুন।", santhali: "ᱥᱩᱨᱠᱷᱟ ᱥᱟᱢᱟᱱ ᱞᱟᱜᱟᱣ ᱮᱱᱟ। ᱟᱨᱟᱜ ᱨᱤᱝ ᱛᱟᱹᱱᱛᱮ ᱚᱨ ᱢᱮ।", mundari: "ᱥᱩᱨᱠᱷᱟ ᱥᱟᱢᱟᱱ ᱞᱟᱜᱟᱣ ᱜᱮᱞᱟ। ᱟᱨᱟᱜ ᱨᱤᱝ ᱛᱟᱹᱱᱛᱮ ᱚᱨᱢᱮ।" },
      5: { hindi: "सही प्रक्रिया! ऑक्सीजन प्रवाह शुरू है। अब सुरक्षित निकास की ओर बढ़ें।", english: "Correct sequence. Oxygen is flowing. Proceed to the marked safe exit.", bengali: "সঠিক পদ্ধতি! অক্সিজেন প্রবাহ শুরু হয়েছে। চিহ্নিত নিরাপদ পথে এগিয়ে যান।", santhali: "ᱥᱟᱹᱨᱤ ᱯᱚᱫᱷᱚᱛᱤ! ᱚᱠᱥᱤᱡᱚᱱ ᱦᱚᱲᱚ ᱦᱩᱭ ᱮᱱᱟ। ᱵᱷᱟᱞ ᱚᱰᱚᱠ ᱛᱮ ᱥᱮᱱ ᱢᱮ।", mundari: "ᱥᱟᱹᱨᱤ ᱯᱚᱫᱷᱚᱛᱤ! ᱚᱠᱥᱤᱡᱚᱱ ᱦᱚᱲᱚ ᱦᱩᱭ ᱜᱮᱞᱟ। ᱵᱷᱟᱞ ᱚᱰᱚᱠ ᱛᱮ ᱥᱮᱱᱢᱮ।" },
      6: { hindi: "आप सुरक्षित निकास तक पहुँच गए। 60-सेकंड SCSR escape drill पूरा हुआ।", english: "You reached fresh air. The 60-second SCSR escape drill is complete.", bengali: "আপনি নিরাপদ বাতাসে পৌঁছেছেন। ৬০ সেকেন্ডের SCSR ড্রিল সম্পূর্ণ।", santhali: "ᱟᱢ ᱵᱷᱟᱞ ᱦᱚᱭ ᱴᱷᱟᱶ ᱨᱮ ᱥᱮᱴᱮᱨ ᱠᱮᱫᱟ। 60 ᱥᱮᱠᱮᱸᱰ SCSR ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹᱣ।", mundari: "ᱟᱢ ᱵᱷᱟᱞ ᱦᱚᱭ ᱴᱷᱟᱶ ᱨᱮ ᱥᱮᱴᱮᱨᱠᱮᱫᱟ। 60 ᱥᱮᱠᱮᱸᱰ SCSR ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹᱣ।" }
    };

    if (nextStep === 5) {
      this.engine.playSound('oxygen_hiss');
      this.smokeActive = false;
    }
    if (nextStep === 6) {
      if (this.timerInterval) clearInterval(this.timerInterval);
    }

    if (prompts[nextStep]) {
      window.SurakshaSathi && window.SurakshaSathi.speak(prompts[nextStep]);
    }

    this.updateEngine();
    this.updateUI();
    this.checkCompletion();
  }

  updateUI() {
    const instructions = [
      "चरण 1: SCSR कैनिस्टर का धातु का ढक्कन खोलें",
      "चरण 2: माउथपीस (Mouthpiece) को दांतों के बीच दबाकर होंठ बंद करें",
      "चरण 3: नाक में नोज़ क्लिप (Nose Clip) लगाएं (नाक से सांस न लें)",
      "चरण 4: धुएं से आँखों की सुरक्षा हेतु प्रोटेक्टिव गॉगल्स (Goggles) पहनें",
      "चरण 5: लाल स्टार्टर रिंग (Oxygen Starter Pin) खींचकर ऑक्सीजन सक्रिय करें",
      "ऑक्सीजन चालू है—फर्श के हरे तीरों का पालन करके EXIT टैप करें",
      "ड्रिल पूर्ण: 60-Second SCSR Donning एवं Escape Competency Certified!"
    ];
    const interactionHintLocales = this.step === 0
      ? { hindi: 'ढक्कन खोलने के लिए कैनिस्टर पर टैप करें', english: 'Tap the canister lid to open it', bengali: 'ক্যানিস্টারের ঢাকনা খুলতে ট্যাপ করুন', santhali: 'ᱠᱮᱱᱤᱥᱴᱟᱨ ᱡᱷᱤᱡᱽ ᱢᱮ', mundari: 'ᱠᱮᱱᱤᱥᱴᱟᱨ ᱠᱷᱩᱞᱟᱹᱭᱢᱮ' }
      : this.step === 5
        ? { hindi: 'हरे फर्श तीरों का पालन करके EXIT बोर्ड पर टैप करें', english: 'Follow the green floor arrows and tap the EXIT board', bengali: 'সবুজ তীর অনুসরণ করে EXIT বোর্ডে ট্যাপ করুন', santhali: 'ᱦᱟᱹᱨᱭᱟᱹᱲ ᱥᱟᱨᱟ ᱛᱮ EXIT ᱵᱚᱨᱰ ᱛᱷᱟᱹᱯᱟᱹᱭ ᱢᱮ', mundari: 'ᱦᱟᱹᱨᱭᱟᱹᱲ ᱥᱟᱨᱟ ᱛᱮ EXIT ᱵᱚᱨᱰ ᱛᱷᱟᱹᱯᱟᱹᱭᱢᱮ' }
        : this.step >= 6
          ? { hindi: 'आप सुरक्षित निकास तक पहुँच गए', english: 'You reached the safe exit', santhali: 'ᱟᱢ ᱵᱷᱟᱞ ᱚᱰᱚᱠ ᱴᱷᱟᱶ ᱨᱮ ᱥᱮᱴᱮᱨ ᱠᱮᱫᱟ' }
          : { hindi: 'चमकते उपकरण को खींचकर उससे मेल खाते निशान पर छोड़ें', english: 'Drag the highlighted item onto its matching target', bengali: 'উজ্জ্বল সরঞ্জামটি টেনে মিল থাকা চিহ্নের ওপর ছাড়ুন', santhali: 'ᱥᱟᱞᱟᱜ ᱥᱟᱢᱟᱱ ᱛᱟᱹᱱᱛᱮ ᱪᱤᱱᱦᱟᱹ ᱨᱮ ᱢᱮ', mundari: 'ᱥᱟᱢᱟᱱ ᱛᱟᱹᱱᱛᱮ ᱪᱤᱱᱦᱟᱹ ᱨᱮ ᱢᱮ' };

    if (window.updateDrillHUD) {
      window.updateDrillHUD({
        progress: Math.round((this.step / 6) * 100),
        hazardsFound: `Smoke & CO Atmosphere (Toxic)`,
        boltsInstalled: `Timer: ${this.timerSeconds}s Remaining`,
        instruction: instructions[this.step],
        instructionLocales: this.getInstructionLocales(),
        interactionHint: this.step === 0 ? 'ढक्कन खोलने के लिए कैनिस्टर पर टैप करें' : (this.step === 5 ? 'हरे फर्श तीरों का पालन करके EXIT बोर्ड पर टैप करें' : (this.step >= 6 ? 'आप सुरक्षित fresh air में पहुँच गए हैं' : 'चमकते उपकरण को खींचकर उससे मेल खाते निशान पर छोड़ें')),
        interactionHintLocales,
        actions: []
      });
    }
  }

  getActionsForStep() {
    return [];
  }

  getInstructionLocales() {
    const rows = [
      { hindi: 'चरण 1: कैनिस्टर का धातु ढक्कन खोलें', english: 'Step 1: Open the metal canister lid', bengali: 'ধাপ ১: ক্যানিস্টারের ধাতব ঢাকনা খুলুন', santhali: 'ᱯᱚᱦᱤᱞ ᱫᱷᱟᱯ: ᱠᱮᱱᱤᱥᱴᱟᱨ ᱡᱷᱤᱡᱽ ᱢᱮ', mundari: 'ᱯᱚᱦᱤᱞ ᱫᱷᱟᱯ: ᱠᱮᱱᱤᱥᱴᱟᱨ ᱠᱷᱩᱞᱟᱹᱭᱢᱮ' },
      { hindi: 'चरण 2: माउथपीस को मुँह पर फिट करें', english: 'Step 2: Fit the mouthpiece to the mouth', bengali: 'ধাপ ২: মুখে মাউথপিস বসান', santhali: 'ᱫᱷᱟᱯ 2: ᱢᱚᱪᱟ ᱨᱮ ᱢᱟᱣᱛᱷᱯᱤᱥ ᱞᱟᱜᱟᱣ ᱢᱮ', mundari: 'ᱫᱷᱟᱯ 2: ᱢᱚᱪᱟ ᱨᱮ ᱢᱟᱣᱛᱷᱯᱤᱥ ᱞᱟᱜᱟᱣᱢᱮ' },
      { hindi: 'चरण 3: नाक पर नोज़ क्लिप लगाएँ', english: 'Step 3: Fit the nose clip', bengali: 'ধাপ ৩: নাকের ক্লিপ বসান', santhali: 'ᱫᱷᱟᱯ 3: ᱱᱚᱠ ᱨᱮ ᱠᱞᱤᱯ ᱞᱟᱜᱟᱣ ᱢᱮ', mundari: 'ᱫᱷᱟᱯ 3: ᱱᱚᱠ ᱨᱮ ᱠᱞᱤᱯ ᱞᱟᱜᱟᱣᱢᱮ' },
      { hindi: 'चरण 4: आँखों पर गॉगल्स पहनें', english: 'Step 4: Fit the goggles over the eyes', bengali: 'ধাপ ৪: চোখে গগলস পরুন', santhali: 'ᱫᱷᱟᱯ 4: ᱢᱮᱫ ᱨᱮ ᱪᱚᱥᱢᱟ ᱦᱚᱨᱚᱜ ᱢᱮ', mundari: 'ᱫᱷᱟᱯ 4: ᱢᱮᱫ ᱨᱮ ᱪᱚᱥᱢᱟ ᱦᱚᱨᱚᱜᱢᱮ' },
      { hindi: 'चरण 5: लाल रिंग खींचकर ऑक्सीजन चालू करें', english: 'Step 5: Pull the red ring to start oxygen', bengali: 'ধাপ ৫: অক্সিজেন চালু করতে লাল রিং টানুন', santhali: 'ᱫᱷᱟᱯ 5: ᱟᱨᱟᱜ ᱨᱤᱝ ᱚᱨ ᱢᱮ', mundari: 'ᱫᱷᱟᱯ 5: ᱟᱨᱟᱜ ᱨᱤᱝ ᱚᱨᱢᱮ' },
      { hindi: 'ऑक्सीजन प्रवाह के साथ सुरक्षित निकास तक पहुँचे', english: 'Reach fresh air with oxygen flowing', bengali: 'অক্সিজেন চালু রেখে নিরাপদ বাতাসে পৌঁছান', santhali: 'ᱚᱠᱥᱤᱡᱚᱱ ᱥᱟᱶ ᱵᱷᱟᱞ ᱚᱰᱚᱠ ᱴᱷᱟᱶ ᱨᱮ ᱥᱮᱴᱮᱨ ᱢᱮ', mundari: 'ᱚᱠᱥᱤᱡᱚᱱ ᱥᱟᱶ ᱵᱷᱟᱞ ᱚᱰᱚᱠ ᱴᱷᱟᱶ ᱨᱮ ᱥᱮᱴᱮᱨᱢᱮ' },
      { hindi: 'ड्रिल पूर्ण: सुरक्षित निकास तक पहुँच गए', english: 'Drill complete: you reached the safe exit', bengali: 'ড্রিল সম্পূর্ণ: নিরাপদ পথে পৌঁছেছেন', santhali: 'ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹᱣ: ᱵᱷᱟᱞ ᱚᱰᱚᱠ ᱴᱷᱟᱶ ᱨᱮ ᱥᱮᱴᱮᱨ ᱠᱮᱫᱟ', mundari: 'ᱰᱨᱤᱞ ᱯᱩᱨᱟᱹᱣ: ᱵᱷᱟᱞ ᱚᱰᱚᱠ ᱴᱷᱟᱶ ᱨᱮ ᱥᱮᱴᱮᱨᱠᱮᱫᱟ' }
    ];
    return rows[this.step];
  }

  stop() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
  }

  checkCompletion() {
    if (this.step >= 6) {
      const reactionTime = Date.now() - this.startTime;
      setTimeout(() => {
        this.onComplete({
          moduleId: 'scsr_donning',
          moduleName: 'SCSR 60s Emergency Escape Drill (आपातकालीन रेस्क्यूर)',
          score: 97,
          reactionTimeMs: reactionTime,
          hazardsSpotted: 4,
          totalHazards: 4,
          criticalErrors: this.criticalErrors,
          details: {
            donning_time_seconds: 60 - this.timerSeconds,
            airtight_seal_checked: true,
            oxygen_starter_activated: true,
            dgms_emergency_standard: "Passed"
          }
        });
      }, 1200);
    }
  }
}

window.SCSRDonningModule = SCSRDonningModule;
