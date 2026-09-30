import React, { useState } from 'react';
import { Award as LucideAward, HardHat, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
const Award = LucideAward || ShieldCheck;
import { TRANSLATIONS } from '../../locales/translations';
import { playAudioBeep, speakInstruction } from '../../utils/audioEngine';
import { TEMPORARY_ASSESSMENT_POLICY } from '../../config/assessmentPolicy';
import confetti from 'canvas-confetti';

export default function AssessmentEngine({ currentLang, completedModules = [], practicalEvidence = {}, onReturnToTraining, onPassAssessment }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const practicalAttempts = Object.values(practicalEvidence);

  const questions = [
    {
      id: 1,
      questionEn: "What is the correct P.A.S.S. sequence when operating a fire extinguisher?",
      questionHi: "अग्निशामक (Fire Extinguisher) चलाते समय सही P.A.S.S. क्रम क्या है?",
      questionSat: "ᱥᱮᱸᱜᱮᱞ ᱤᱬᱤᱡᱽ ᱥᱤᱞᱤᱱᱰᱚᱨ ᱪᱟᱹᱞᱩ ᱚᱠᱛᱚ ᱥᱟᱹᱨᱤ P.A.S.S. ᱱᱤᱭᱚᱢ ᱫᱚ ᱚᱠᱟᱴᱟᱜ ᱠᱟᱱᱟ?",
      options: [
        { id: 'a', text: "1. Pull pin -> 2. Aim base -> 3. Squeeze lever -> 4. Sweep side-to-side" },
        { id: 'b', text: "1. Push nozzle -> 2. Aim top -> 3. Sweep pin -> 4. Stop" },
        { id: 'c', text: "1. Squeeze lever -> 2. Pull pin -> 3. Aim base -> 4. Run away" }
      ],
      correctAnswer: 'a'
    },
    {
      id: 2,
      questionEn: "At what concentration of Methane (CH4) gas must high-voltage electric power in a underground coal mine be immediately cut off?",
      questionHi: "भूमिगत कोयला खदान में मीथेन (CH4) गैस का सांद्रण कितने प्रतिशत होने पर बिजली तुरंत बंद कर देनी चाहिए?",
      questionSat: "ᱠᱷᱟᱫᱟᱱ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱢᱤᱛᱷᱮᱱ ᱜᱮᱥ (CH4) ᱛᱤᱱᱟᱹᱜ % ᱞᱮᱠᱷᱟᱱ ᱵᱤᱡᱽᱞᱤ ᱵᱚᱸᱫᱷ ᱞᱟᱹᱠᱛᱤᱭᱟ?",
      options: [
        { id: 'a', text: "0.50%" },
        { id: 'b', text: "1.25% (training reference — validate against the site SOP)" },
        { id: 'c', text: "5.00%" }
      ],
      correctAnswer: 'b'
    },
    {
      id: 3,
      questionEn: "Which PPE gear is essential before entering an unventilated confined shaft with suspected toxic fumes?",
      questionHi: "ज़हरीली गैसों वाले सीमित स्थान (Confined Space) में प्रवेश करने से पहले कौन सा PPE उपकरण अनिवार्य है?",
      questionSat: "ᱵᱤᱥᱟᱹᱠᱛᱚ ᱜᱮᱥ ᱴᱷᱟᱶ ᱵᱚᱞᱚᱱ ᱢᱟᱲᱟᱝ ᱚᱠᱟ ᱥᱩᱨᱚᱠᱥᱟ ᱥᱟᱢᱟᱱ (PPE) ᱞᱟᱹᱠᱛᱤᱭᱟ?",
      options: [
        { id: 'a', text: "Standard Cotton Dust Mask" },
        { id: 'b', text: "Self-Contained Breathing Apparatus (SCBA) & Oxygen Rescuer" },
        { id: 'c', text: "Leather Gloves only" }
      ],
      correctAnswer: 'b'
    },
    {
      id: 4,
      questionEn: "What is the purpose of Lockout/Tagout (LOTO) on mining conveyor belt machinery?",
      questionHi: "खनन कन्वेयर बेल्ट मशीनरी पर लॉकआउट/टैगआउट (LOTO) का प्राथमिक उद्देश्य क्या है?",
      questionSat: "Conveyor belt ᱢᱮᱥᱤᱱ ᱨᱮ LOTO ᱛᱟᱞᱟ ᱞᱟᱜᱟᱣ ᱨᱮᱱᱟᱜ ᱢᱩᱬᱩᱛ ᱠᱟᱹᱢᱤ ᱫᱚ ᱪᱮᱫ ᱠᱟᱱᱟ?",
      options: [
        { id: 'a', text: "To prevent accidental electrical startup during maintenance" },
        { id: 'b', text: "To increase belt running speed" },
        { id: 'c', text: "To clean coal dust from rollers" }
      ],
      correctAnswer: 'a'
    }
  ];

  const requiredModules = ['Fire & Explosion Response', 'Gas Leak & Confined Space'];
  const assessmentUnlocked = requiredModules.every(moduleName => completedModules.includes(moduleName));

  if (!assessmentUnlocked) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl text-center space-y-4">
        <HardHat className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-black text-white">Practical drills required before assessment</h2>
        <p className="text-sm text-slate-300">Complete both required camera/3D scenarios: Fire &amp; Explosion Response and Gas Leak &amp; Confined Space.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {requiredModules.map(moduleName => (
            <div key={moduleName} className={`p-3 rounded-xl border font-bold ${completedModules.includes(moduleName) ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
              {completedModules.includes(moduleName) ? '✓' : '○'} {moduleName}
            </div>
          ))}
        </div>
        <button onClick={onReturnToTraining} className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs">Return to practical training</button>
      </div>
    );
  }

  const handleSelectOption = (qId, optionId) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionId }));
    playAudioBeep('pass');
  };

  const calculateResults = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    setFinalScore(scorePct);
    setQuizSubmitted(true);

    if (scorePct >= TEMPORARY_ASSESSMENT_POLICY.minimumScore) {
      playAudioBeep('success');
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
    } else {
      playAudioBeep('alarm');
    }
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
      {/* Quiz Header */}
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30">
          <HardHat className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {t.quizTitle}
          </h2>
          <p className="text-xs text-slate-400">
            {t.quizSubtitle}
          </p>
        </div>
      </div>

      {!quizSubmitted ? (
        <div>
          {practicalAttempts.length > 0 && (
            <div className="mb-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-left text-xs text-slate-300">
              <p className="font-bold text-cyan-300 mb-1">Practical competency evidence (separate from this knowledge check)</p>
              {practicalAttempts.map(attempt => (
                <p key={`${attempt.scenarioId}-${attempt.attempt}`}>{attempt.scenarioId} v{attempt.scenarioVersion}: {attempt.competencies.filter(result => result.status === 'PASS').length}/{attempt.competencies.length} competency areas evidenced</p>
              ))}
            </div>
          )}
          {/* Question Stepper Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <span className="font-semibold text-amber-400">Question {currentQIndex + 1} of {questions.length}</span>
            <span>Temporary knowledge-check pass threshold: {TEMPORARY_ASSESSMENT_POLICY.minimumScore}%</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text with Voice Audio Narrator Button */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 mb-5 relative flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed mb-1">
                {currentLang === 'hi' ? currentQ.questionHi : currentLang === 'sat' ? currentQ.questionSat : currentQ.questionEn}
              </h3>
              {currentLang !== 'en' && (
                <p className="text-xs text-slate-500 italic mt-1">
                  {currentQ.questionEn}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                const speechText = currentLang === 'hi' ? currentQ.questionHi : currentLang === 'sat' ? currentQ.questionSat : currentQ.questionEn;
                speakInstruction(speechText, currentLang);
              }}
              className="p-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-xl border border-amber-500/30 flex items-center space-x-1 text-xs font-bold shrink-0"
              title="Listen Question Voice"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Listen</span>
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold shadow-lg'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{opt.text}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-700'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next / Submit Controls */}
          <div className="flex items-center justify-between">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => prev - 1)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold disabled:opacity-40"
            >
              {t.prevStep}
            </button>

            {currentQIndex < questions.length - 1 ? (
              <button
                disabled={!selectedAnswers[currentQ.id]}
                onClick={() => setCurrentQIndex(prev => prev + 1)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg disabled:opacity-50 flex items-center space-x-1"
              >
                <span>{t.nextStep}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={Object.keys(selectedAnswers).length < questions.length}
                onClick={calculateResults}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl text-xs shadow-lg disabled:opacity-50 flex items-center space-x-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit & View Evaluation</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div className="text-center py-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 border ${
            finalScore >= TEMPORARY_ASSESSMENT_POLICY.minimumScore
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-red-500/20 border-red-500 text-red-400'
          }`}>
            {finalScore >= TEMPORARY_ASSESSMENT_POLICY.minimumScore ? (
              <Award className="w-10 h-10" />
            ) : (
              <AlertTriangle className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-xl font-extrabold text-white mb-1">
            {finalScore >= TEMPORARY_ASSESSMENT_POLICY.minimumScore ? t.passedStatus : t.failedStatus}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {t.scoreLabel}: <span className="text-amber-400 font-bold text-base">{finalScore}%</span>
          </p>

          {finalScore >= TEMPORARY_ASSESSMENT_POLICY.minimumScore ? (
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300">
                You passed this temporary written knowledge check. Practical competency evidence is recorded separately and is not merged into a certification decision; this result is not statutory certification.
              </div>
              <button
                onClick={() => onPassAssessment(finalScore)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold rounded-2xl text-xs shadow-xl hover:brightness-110 flex items-center justify-center space-x-2"
              >
                <Award className="w-5 h-5" />
                <span>{t.generateCertBtn}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-xs text-red-300">
                Score below {TEMPORARY_ASSESSMENT_POLICY.minimumScore}%. Please review the training modules before retrying this temporary knowledge check.
              </div>
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setCurrentQIndex(0);
                  setSelectedAnswers({});
                }}
                className="w-full py-3 bg-slate-800 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.retryModule}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
