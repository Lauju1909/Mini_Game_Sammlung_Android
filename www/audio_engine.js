// MOBILE AUDIO ENGINE V2.2 - 3D STEREO PANNER, WEB AUDIO SYNTH, BILINGUAL TTS & CAPACITOR HAPTICS
class MobileAudioEngine {
  constructor() {
    this.ctx = null;
    this.effectsVolume = 0.8;
    this.ttsVolume = 0.9;
    this.speechRate = 1.1;
    this.vibrationEnabled = true;
    this.lang = 'de';
    this.isTTSActive = true;
    this.audioCache = {};
    this.loops = {};
    this.loadSettings();

    // Synthesized Sound Profile Map (Sound Name -> Synthetic Audio generator)
    this.soundProfiles = {
      bump: (pan, vol) => this.playTone(160, 0.12, pan, 'sine', vol * 0.7),
      select: (pan, vol) => this.playTone(520, 0.06, pan, 'sine', vol * 0.5),
      confirm: (pan, vol) => {
        this.playTone(580, 0.08, pan, 'sine', vol * 0.6);
        setTimeout(() => this.playTone(880, 0.12, pan, 'sine', vol * 0.7), 70);
      },
      success: (pan, vol) => {
        this.playTone(523, 0.1, pan, 'triangle', vol * 0.6);
        setTimeout(() => this.playTone(659, 0.1, pan, 'triangle', vol * 0.6), 80);
        setTimeout(() => this.playTone(784, 0.18, pan, 'triangle', vol * 0.8), 160);
      },
      error: (pan, vol) => {
        this.playTone(220, 0.15, pan, 'sawtooth', vol * 0.6);
        setTimeout(() => this.playTone(170, 0.22, pan, 'sawtooth', vol * 0.7), 100);
      },
      warn: (pan, vol) => this.playTone(380, 0.18, pan, 'triangle', vol * 0.7),
      click: (pan, vol) => this.playTone(950, 0.03, pan, 'square', vol * 0.3),
      tick_001: (pan, vol) => this.playTone(720, 0.04, pan, 'triangle', vol * 0.4),
      knifeSlice: (pan, vol) => {
        this.playTone(880, 0.06, pan, 'sawtooth', vol * 0.5);
        setTimeout(() => this.playTone(440, 0.08, pan, 'sawtooth', vol * 0.5), 40);
      },
      blip: (pan, vol) => this.playTone(800, 0.05, pan, 'sine', vol * 0.5),
      radar: (pan, vol) => this.playTone(920, 0.08, pan, 'sine', vol * 0.6),
      metalClick: (pan, vol) => this.playTone(1100, 0.04, pan, 'square', vol * 0.5),
      switch_001: (pan, vol) => this.playTone(480, 0.05, pan, 'sine', vol * 0.4)
    };
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('mg_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.effectsVolume !== undefined) this.effectsVolume = parsed.effectsVolume;
        if (parsed.ttsVolume !== undefined) this.ttsVolume = parsed.ttsVolume;
        if (parsed.speechRate !== undefined) this.speechRate = parsed.speechRate;
        if (parsed.vibrationEnabled !== undefined) this.vibrationEnabled = parsed.vibrationEnabled;
        if (parsed.lang !== undefined) this.lang = parsed.lang;
      }
    } catch (e) {
      console.warn('Settings load error:', e);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('mg_settings', JSON.stringify({
        effectsVolume: this.effectsVolume,
        ttsVolume: this.ttsVolume,
        speechRate: this.speechRate,
        vibrationEnabled: this.vibrationEnabled,
        lang: this.lang
      }));
    } catch (e) {
      console.warn('Settings save error:', e);
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Erzeugt 3D-Stereo Panned Töne (-1.0 voll links bis 1.0 voll rechts)
  playTone(freq = 440, duration = 0.2, pan = 0.0, type = 'sine', gainVal = 0.5) {
    this.init();
    if (!this.ctx) return null;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(40, Math.min(10000, freq)), now);

      const actualGain = Math.max(0, Math.min(1, gainVal * this.effectsVolume));
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, actualGain), now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      let panner = null;
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1.0, Math.min(1.0, pan)), now);
      }

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + duration + 0.05);
      return osc;
    } catch (e) {
      console.error('playTone error:', e);
      return null;
    }
  }

  // Startet einen endlos wiederholenden Ton
  createToneLoop(id, freq = 440, pan = 0.0, vol = 0.4) {
    this.stopToneLoop(id);
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = vol * this.effectsVolume;

      let panner = null;
      if (this.ctx.createStereoPanner) {
        panner = this.ctx.createStereoPanner();
        panner.pan.value = Math.max(-1.0, Math.min(1.0, pan));
      }

      if (panner) {
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start();
      this.loops[id] = { osc, gain, panner };
    } catch (e) {
      console.error('createToneLoop error:', e);
    }
  }

  stopToneLoop(id) {
    if (this.loops[id]) {
      try {
        this.loops[id].osc.stop();
        this.loops[id].osc.disconnect();
      } catch (e) {}
      delete this.loops[id];
    }
  }

  // Sounddatei mit Stereo-Panning & Synthesizer-Fallback
  playSound(name, pan = 0.0, vol = 1.0) {
    this.init();
    pan = Math.max(-1.0, Math.min(1.0, pan));
    const normalizedVol = Math.max(0, Math.min(1, vol * this.effectsVolume));

    // Synthetischer Fallback-Check
    const synthFn = this.soundProfiles[name];

    // Versuche HTML5 Audio
    try {
      const audio = new Audio(`assets/${name}.ogg`);
      audio.volume = normalizedVol;
      audio.play().catch(() => {
        // Falls .ogg fehlschlägt, versuche .mp3
        const audioMp3 = new Audio(`assets/${name}.mp3`);
        audioMp3.volume = normalizedVol;
        audioMp3.play().catch(() => {
          // Synthetischer Fallback
          if (synthFn) {
            synthFn(pan, vol);
          } else {
            const tone = name.includes('error') ? 220 : (name.includes('confirm') || name.includes('success') ? 880 : 440);
            this.playTone(tone, 0.12, pan, 'sine', vol * 0.5);
          }
        });
      });
    } catch (e) {
      if (synthFn) synthFn(pan, vol);
    }
  }

  // Barrierefreie Sprachausgabe (TalkBack ARIA Live + Web Speech)
  speak(text, interrupt = false) {
    if (!text) return;

    // 1. ARIA Live für Android TalkBack & Screenreader aktualisieren
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => { announcer.textContent = text; }, 25);
    }

    // 2. HUD Statuszeile für visuelle Barrierefreiheit
    const hudStatus = document.getElementById('hud-status');
    if (hudStatus) {
      hudStatus.textContent = text;
    }

    if (!this.isTTSActive || !window.speechSynthesis) return;

    if (interrupt) {
      window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = (this.lang === 'en') ? 'en-US' : 'de-DE';
    utter.rate = this.speechRate;
    utter.volume = this.ttsVolume;
    window.speechSynthesis.speak(utter);
  }

  // Taktiles Feedback (Capacitor Haptics oder Navigator Vibrate)
  vibrate(ms = 25) {
    if (!this.vibrationEnabled) return;

    // Capacitor Haptics Plugin Check
    if (window.Capacitor && window.Capacitor.isPluginAvailable && window.Capacitor.isPluginAvailable('Haptics')) {
      try {
        const { Haptics } = window.Capacitor.Plugins;
        if (ms <= 30) {
          Haptics.impact({ style: 'LIGHT' }).catch(() => {});
        } else if (ms <= 70) {
          Haptics.impact({ style: 'MEDIUM' }).catch(() => {});
        } else {
          Haptics.vibrate({ duration: ms }).catch(() => {});
        }
        return;
      } catch (e) {}
    }

    // Standard HTML5 Vibration
    if (window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(ms);
      } catch (e) {}
    }
  }
}

const AudioEngine = new MobileAudioEngine();
