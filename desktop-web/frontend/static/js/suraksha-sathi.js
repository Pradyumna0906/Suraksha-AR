/** Offline voice mentor. Speech uses authored text and the selected device voice/locale. */
class SurakshaSathi {
  constructor() {
    this.currentLanguage = 'hindi';
    this.isListening = false;
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.locales = { hindi: 'hi-IN', english: 'en-IN', bengali: 'bn-IN', santhali: 'sat-IN', mundari: 'unr-IN' };
    this.voices = [];
    this.refreshVoices();
    if (this.synthesis) this.synthesis.addEventListener('voiceschanged', () => this.refreshVoices());
    this.initRecognition();
  }

  refreshVoices() {
    this.voices = this.synthesis ? this.synthesis.getVoices() : [];
    const requested = this.locales[this.currentLanguage].toLowerCase();
    const prefix = requested.slice(0, 2);
    const matching = this.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
    // Android/Chrome commonly ships without a sat-IN voice. Keep Santhali text
    // audible by falling back to the installed Indian voice instead of silently
    // refusing to speak. An exact Santhali voice is always preferred when present.
    const fallback = ['santhali', 'mundari'].includes(this.currentLanguage)
      ? this.voices.find(v => /^hi[-_]/i.test(v.lang)) || this.voices.find(v => /^en[-_]/i.test(v.lang))
      : null;
    this.selectedVoice = matching.find(v => v.lang.toLowerCase() === requested)
      || matching[0]
      || fallback
      || this.voices[0]
      || null;
    this.voiceAvailable = matching.length > 0;
    this.voiceFallback = !this.voiceAvailable && !!fallback;
    window.dispatchEvent(new CustomEvent('safetyvoicechange', {
      detail: { language: this.currentLanguage, available: this.voiceAvailable, fallback: this.voiceFallback }
    }));
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.locales[this.currentLanguage];
      this.recognition.onstart = () => { this.isListening = true; };
      this.recognition.onend = () => { this.isListening = false; };
      this.recognition.onerror = (event) => {
        this.isListening = false;
        window.dispatchEvent(new CustomEvent('safetyvoiceerror', { detail: { code: event.error, language: this.currentLanguage } }));
      };
    } catch (e) { console.warn('Speech recognition initialization failed:', e); }
  }

  setLanguage(language) {
    if (!this.locales[language]) return false;
    if (this.recognition && this.isListening) this.recognition.stop();
    this.currentLanguage = language;
    if (this.recognition) this.recognition.lang = this.locales[language];
    this.refreshVoices();
    return true;
  }

  startListening() {
    if (!this.recognition || this.isListening) return false;
    try { this.recognition.lang = this.locales[this.currentLanguage]; this.recognition.start(); return true; }
    catch (e) { return false; }
  }

  stopListening() { if (this.recognition && this.isListening) this.recognition.stop(); }

  stopCloudAudio() {
    if (!this.cloudAudio) return;
    this.cloudAudio.pause();
    if (this.cloudAudio.src.startsWith('blob:')) URL.revokeObjectURL(this.cloudAudio.src);
    this.cloudAudio = null;
  }

  async playLaptopVoice(text, language, fallbackText) {
    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, fallback_text: fallbackText || null })
      });
      if (!response.ok) throw new Error(`Voice service returned ${response.status}`);
      const audioUrl = URL.createObjectURL(await response.blob());
      this.stopCloudAudio();
      const audio = new Audio(audioUrl);
      this.cloudAudio = audio;
      audio.onplay = () => { if (window.updateAvatarSpeaking) window.updateAvatarSpeaking(true, String(text)); };
      audio.onended = () => {
        if (window.updateAvatarSpeaking) window.updateAvatarSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (this.cloudAudio === audio) this.cloudAudio = null;
      };
      audio.onerror = () => {
        if (window.updateAvatarSpeaking) window.updateAvatarSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (this.cloudAudio === audio) this.cloudAudio = null;
      };
      await audio.play();
      return true;
    } catch (error) {
      console.warn('Laptop voice fallback unavailable:', error);
      return false;
    }
  }

  speak(content, textSat, textEn) {
    if (!this.synthesis) return false;
    let localized;
    if (content && typeof content === 'object') localized = content;
    else localized = { hindi: content, santhali: textSat, english: textEn };
    const text = localized[this.currentLanguage];
    if (!text || !String(text).trim()) {
      window.dispatchEvent(new CustomEvent('safetyvoicemissing', { detail: { language: this.currentLanguage } }));
      return false;
    }
    const requestedLocale = this.locales[this.currentLanguage];
    const prefix = requestedLocale.slice(0, 2).toLowerCase();
    const exactVoice = this.voices.find(v => v.lang && v.lang.toLowerCase() === requestedLocale.toLowerCase());
    const regionalVoice = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
    const fallbackVoice = this.currentLanguage === 'santhali'
      ? (this.voices.find(v => v.lang && /^hi[-_]/i.test(v.lang)) || this.voices.find(v => v.lang && /^en[-_]/i.test(v.lang)))
      : null;

    this.synthesis.cancel();
    this.stopCloudAudio();
    const needsLaptopVoice = !exactVoice && ['hindi', 'bengali', 'santhali', 'mundari'].includes(this.currentLanguage);
    if (needsLaptopVoice) {
      const fallbackText = localized.hindi || localized.english || String(text);
      this.playLaptopVoice(String(text), this.currentLanguage, fallbackText).then(played => {
        if (!played) this.speakWithBrowser(text, requestedLocale, exactVoice || regionalVoice || fallbackVoice || this.selectedVoice);
      });
      return true;
    }

    return this.speakWithBrowser(text, requestedLocale, exactVoice || regionalVoice || fallbackVoice || this.selectedVoice);
  }

  speakWithBrowser(text, requestedLocale, selectedVoice) {
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.voice = selectedVoice || null;
    // If sat-IN is unavailable, speak the authored Santhali text through the
    // installed Indian voice. This is audible on stock Android/Chrome and is
    // replaced automatically by a native Santhali voice when one is installed.
    if (utterance.voice) utterance.lang = utterance.voice.lang || requestedLocale;
    else utterance.lang = requestedLocale;
    if (!utterance.voice && !this.voices.length) {
      // Some browsers populate voices only after the first speak call.
      window.dispatchEvent(new CustomEvent('safetyvoicechange', { detail: { language: this.currentLanguage, available: false, fallback: false } }));
    }
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => { if (window.updateAvatarSpeaking) window.updateAvatarSpeaking(true, String(text)); };
    utterance.onend = () => { if (window.updateAvatarSpeaking) window.updateAvatarSpeaking(false); };
    utterance.onerror = () => { if (window.updateAvatarSpeaking) window.updateAvatarSpeaking(false); };
    this.synthesis.speak(utterance);
    return true;
  }
}
window.SurakshaSathi = new SurakshaSathi();
