// AUDIO ENGINE MIT 3D STEREO-PANNER & TALKBACK SPRACHAUSGABE
class MobileAudioEngine {
  constructor() {
    this.ctx = null;
    this.effectsVolume = 0.8;
    this.ttsVolume = 0.9;
    this.speechRate = 1.1;
    this.vibrationEnabled = true;
    this.audioCache = {};
    this.isTTSActive = true;
    this.speechQueue = [];
    this.isSpeaking = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 3D Stereo Ton generieren (pan: -1.0 voll links, 0.0 mitte, +1.0 voll rechts)
  playTone(freq = 440, duration = 0.2, pan = 0.0, type = 'sine', gainVal = 0.5) {
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      let panner = null;

      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, pan));
      }

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const actualGain = gainVal * this.effectsVolume;
      gain.gain.setValueAtTime(actualGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.error('Audio Tone Error:', e);
    }
  }

  // Sounddatei aus assets abspielen
  playSound(name, pan = 0.0, vol = 1.0) {
    this.init();
    try {
      const audio = new Audio(`assets/${name}.ogg`);
      audio.volume = Math.max(0, Math.min(1, vol * this.effectsVolume));
      audio.play().catch(() => {
        // Fallback falls Datei noch nicht gepuffert
        const fallbackTone = (name.includes('error') ? 220 : (name.includes('confirm') || name.includes('success') ? 880 : 440));
        this.playTone(fallbackTone, 0.15, pan);
      });
    } catch(e) {}
  }

  // Barrierefreie Sprachausgabe (TalkBack + Web Speech)
  speak(text, interrupt = false) {
    // 1. ARIA Live Region aktualisieren für TalkBack
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => { announcer.textContent = text; }, 30);
    }

    // 2. Visuellen Statusbalken setzen
    const hudStatus = document.getElementById('hud-status');
    if (hudStatus) hudStatus.textContent = text;

    if (!this.isTTSActive || !window.speechSynthesis) return;

    if (interrupt) {
      window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'de-DE';
    utter.rate = this.speechRate;
    utter.volume = this.ttsVolume;
    window.speechSynthesis.speak(utter);
  }

  vibrate(ms = 25) {
    if (this.vibrationEnabled && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(ms); } catch(e) {}
    }
  }
}

const AudioEngine = new MobileAudioEngine();