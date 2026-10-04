import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Mic, MicOff, Volume2, Sparkles, Send, ShieldAlert, CheckCircle2, 
  HelpCircle, Trash2, Zap, AlertTriangle, Info, Flame, Wind, Cog, HardHat, RefreshCw, VolumeX, BookOpen, ArrowRight
} from 'lucide-react';
import { TRANSLATIONS } from '../../locales/translations';
import { speakInstruction, playAudioBeep } from '../../utils/audioEngine';
import { retrieveSafetyReference, SAFETY_REFERENCE_CARDS } from '../../utils/ragEngine';

export default function SurakshaAssistant({ currentLang }) {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(0.85); // 0.75, 0.85, 1.1
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCorpusOpen, setIsCorpusOpen] = useState(false);
  const chatEndRef = useRef(null);

  const initialBotMsg = {
    id: 0,
    sender: 'bot',
    category: 'general',
    ruleBadge: 'LOCAL TRAINING REFERENCE',
    severity: 'info',
    textEn: "Use these local training reference cards to review fire, gas, PPE, and LOTO topics. They are not live advice or an official rule source; validate actions with the site SOP and a qualified supervisor.",
    textHi: "ये स्थानीय प्रशिक्षण संदर्भ कार्ड आग, गैस, PPE और LOTO विषयों के अभ्यास के लिए हैं। यह लाइव सलाह या आधिकारिक नियम स्रोत नहीं है; साइट SOP और योग्य पर्यवेक्षक से कार्रवाई की पुष्टि करें।",
    textSat: "ᱱᱚᱣᱟ ᱞᱚᱠᱟᱞ ᱴᱨᱮᱱᱤᱝ ᱨᱮᱯᱷᱮᱨᱮᱱᱥ ᱠᱟᱨᱰ ᱫᱚ ᱥᱮᱸᱜᱮᱞ, ᱜᱮᱥ, PPE ᱟᱨ LOTO ᱵᱤᱥᱚᱭ ᱮᱢ ᱫᱟᱲᱮᱭᱟ। ᱱᱚᱣᱟ ᱞᱟᱭᱤᱵ ᱥᱟᱞᱟᱦ ᱵᱟᱝ ᱟᱨ ᱚᱯᱷᱤᱥᱤᱭᱟᱞ ᱱᱤᱭᱚᱢ ᱯᱟᱛᱷᱟᱢ ᱵᱟᱝ; ᱥᱟᱭᱤᱴ SOP ᱟᱨ ᱥᱩᱯᱚᱨᱵᱷᱟᱭᱡᱚᱨ ᱥᱟᱶ ᱯᱩᱥᱴᱟᱹᱣ ᱢᱮ।",
    followUps: ["Methane CH4 gas limits?", "Fire extinguisher P.A.S.S. drill?", "Conveyor LOTO procedure?"]
  };

  const [messages, setMessages] = useState([initialBotMsg]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (queryText) => {
    const text = (queryText || inputText).trim();
    if (!text) return;

    playAudioBeep('pass');

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      textEn: text,
      textHi: text,
      textSat: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Local keyword-reference lookup; no AI service or external source is contacted.
    const referenceResult = retrieveSafetyReference(text, currentLang, 2);

    let matched = null;
    if (referenceResult && referenceResult.success) {
      matched = {
        id: 'reference-' + Date.now(),
        isReference: true,
        category: referenceResult.category,
        ruleBadge: `📚 ${referenceResult.actCitation}`,
        title: referenceResult.title,
        severity: referenceResult.severity,
        textEn: referenceResult.synthesizedTextEn,
        textHi: referenceResult.synthesizedTextHi,
        textSat: referenceResult.synthesizedTextSat,
        followUps: [
          `More details on ${referenceResult.title}?`,
          "What emergency PPE is required?",
          "What should I confirm in the site SOP?"
        ]
      };
    } else {
      matched = {
        id: 'fallback',
        isReference: false,
        category: 'general',
        ruleBadge: 'LOCAL TRAINING REFERENCE',
        severity: 'info',
        textEn: "This prototype cannot guide a live emergency. Follow the site emergency procedure, alert the responsible supervisor or emergency service, and use only approved site equipment and routes.",
        textHi: "यह प्रोटोटाइप वास्तविक आपातस्थिति में मार्गदर्शन नहीं कर सकता। साइट आपातकालीन प्रक्रिया का पालन करें, जिम्मेदार पर्यवेक्षक या आपात सेवा को सूचित करें और केवल स्वीकृत साइट उपकरण व मार्ग का उपयोग करें।",
        textSat: "ᱱᱚᱣᱟ ᱯᱨᱚᱴᱚᱴᱟᱭᱯ ᱞᱟᱭᱤᱵ ᱮᱢᱟᱨᱡᱮᱱᱥᱤ ᱨᱮ ᱜᱟᱭᱰ ᱵᱟᱝ ᱫᱟᱲᱮᱭᱟ। ᱥᱟᱭᱤᱴ ᱮᱢᱟᱨᱡᱮᱱᱥᱤ ᱯᱨᱚᱥᱤᱰᱤᱭᱟᱨ ᱯᱟᱞᱚᱱ ᱢᱮ ᱟᱨ ᱥᱩᱯᱚᱨᱵᱷᱟᱭᱡᱚᱨ ᱥᱮ ᱮᱢᱟᱨᱡᱮᱱᱥᱤ ᱥᱚᱨᱵᱤᱥ ᱛᱮ ᱠᱟᱹᱱᱟᱹ ᱢᱮ।",
        followUps: ["Methane gas evacuation rules?", "Fire extinguisher PASS drill?", "SCBA oxygen tank pressure?"]
      };
    }

    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        ...matched
      };

      setMessages(prev => [...prev, botMsg]);
      playAudioBeep('success');

      // Speak answer in active language
      const speechText = currentLang === 'hi' ? matched.textHi : currentLang === 'sat' ? matched.textSat : matched.textEn;
      setIsSpeaking(true);
      speakInstruction(speechText, currentLang, () => setIsSpeaking(false));
    }, 450);
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice speech recognition requires Web Speech API support.");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'sat' ? 'hi-IN' : 'en-US';
      recognition.start();

      setIsListening(true);
      playAudioBeep('pass');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch (err) {
      setIsListening(false);
    }
  };

  const clearChat = () => {
    setMessages([initialBotMsg]);
    playAudioBeep('pass');
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_45px_rgba(245,158,11,0.18)] space-y-4 backdrop-blur-xl">
      {/* Local reference drawer and voice-speed controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-500/30">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <span>SurakshaMitra • Local Training Reference</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">Keyword-matched local cards — validate against the site SOP</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Speech Speed Toggle Pill */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
            <span className="text-slate-400 px-1 font-bold">Speed:</span>
            {[
              { label: '0.75x', rate: 0.70 },
              { label: '1.0x', rate: 0.90 },
              { label: '1.2x', rate: 1.15 }
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setSpeechSpeed(s.rate)}
                className={`px-2 py-0.5 rounded-lg font-mono font-bold transition-all ${
                  speechSpeed === s.rate ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCorpusOpen(true)}
            className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center space-x-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse training cards</span>
          </button>

          <button
            onClick={clearChat}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 text-xs"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Categorized Quick Topic Filter Tags */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 no-scrollbar">
        {[
          { id: 'all', label: 'All Topics', icon: Zap },
          { id: 'gas', label: '💨 Gas Limits', icon: Wind },
          { id: 'fire', label: '🔥 Fire P.A.S.S.', icon: Flame },
          { id: 'machinery', label: '⚙️ Machinery LOTO', icon: Cog },
          { id: 'ppe', label: '🦺 SCBA PPE', icon: HardHat },
          { id: 'blasting', label: '💥 Blasting Safety', icon: AlertTriangle },
          { id: 'rescue', label: '🚑 First Aid', icon: ShieldAlert }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chat log with local reference cards */}
      <div className="h-96 overflow-y-auto p-4 bg-slate-950/90 rounded-3xl border border-slate-800 space-y-4 no-scrollbar shadow-inner">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          const text = currentLang === 'hi' ? (msg.textHi || msg.textEn) : currentLang === 'sat' ? (msg.textSat || msg.textEn) : (msg.textEn);

          return (
            <div key={msg.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xl p-4 rounded-3xl text-xs leading-relaxed space-y-2.5 shadow-xl transition-all ${
                isBot 
                  ? 'bg-slate-900/90 border border-amber-500/35 text-slate-200' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'
              }`}>
                {isBot && (
                  <div className="flex flex-wrap items-center justify-between gap-1 pb-1.5 border-b border-amber-500/20 text-[10px]">
                    <div className="flex items-center space-x-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/40">
                        {msg.ruleBadge || 'LOCAL TRAINING REFERENCE'}
                      </span>
                    </div>
                    <span className={`font-mono font-bold uppercase ${
                      msg.severity === 'critical' ? 'text-red-400' : msg.severity === 'high' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      ● {msg.severity || 'info'}
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-line text-xs sm:text-sm">
                  {text}
                </div>

                {/* Interactive Dynamic Follow-up Suggestions */}
                {isBot && msg.followUps && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold block">Suggested follow-ups:</span>
                    <div className="flex flex-wrap gap-1">
                      {msg.followUps.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-xl text-[10px] font-semibold border border-slate-700 hover:border-amber-500/40 flex items-center space-x-1 transition-all"
                        >
                          <span>{q}</span>
                          <ArrowRight className="w-3 h-3 text-amber-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isBot && (
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setIsSpeaking(true);
                        speakInstruction(text, currentLang, () => setIsSpeaking(false));
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 border border-slate-700"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen Voice</span>
                    </button>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {currentLang === 'hi' ? 'हिन्दी' : currentLang === 'sat' ? ' Ol Chiki' : 'English'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 4. Input Bar with Tactile Mic & Send Button */}
      <div className="flex items-center space-x-2 pt-2">
        <button
          onClick={startVoiceInput}
          className={`min-h-[48px] min-w-[48px] p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center shadow-lg ${
            isListening
              ? 'bg-red-600 text-white ring-4 ring-red-400/50 animate-pulse'
              : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 hover:brightness-110 ring-2 ring-amber-400/40'
          }`}
          title="Voice Speech Input"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-slate-950" />}
        </button>

        <input
          type="text"
          placeholder="Search a local fire, gas, PPE, or LOTO training topic..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
          className="flex-1 px-4 py-3 min-h-[48px] bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
        />

        <button
          onClick={() => handleSend(inputText)}
          className="min-h-[48px] px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black rounded-2xl shadow-lg hover:brightness-110 flex items-center space-x-1 transition-all active:scale-95"
        >
          <Send className="w-5 h-5 text-slate-950" />
        </button>
      </div>

      {/* Local training-reference drawer */}
      {isCorpusOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <h3 className="text-base font-black text-white">Local training reference cards</h3>
              </div>
              <button
                onClick={() => setIsCorpusOpen(false)}
                className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 no-scrollbar">
              {SAFETY_REFERENCE_CARDS.map((item) => (
                <div key={item.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-mono text-[10px] font-bold">
                      {item.actCitation}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{item.category}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                    {item.contentEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
