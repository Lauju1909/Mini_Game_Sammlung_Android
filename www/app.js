let activeGame = null;
let currentGameInstance = null;
let currentCategory = 'all';
let searchQuery = '';
let visualizerAnimId = null;
let gamepadConnected = false;
let focusedGameIndex = 0;
let lastGamepadButtons = {};

const UI_STRINGS = {
  de: {
    appVersion: 'v2.2 • 75 Spiele',
    searchPlaceholder: '🔍 Spiel suchen...',
    tabAll: 'Alle (75)',
    tabAction: 'Action (30)',
    tabLogic: 'Logik (17)',
    tabNav: 'Navigation (12)',
    tabSpeech: 'Wissen (10)',
    tabSim: 'Simulation (6)',
    btnMenu: '◀ Menü',
    btnHelp: '❓ Hilfe',
    touchUp: 'OBEN',
    touchDown: 'UNTEN',
    touchLeft: 'LINKS',
    touchRight: 'RECHTS',
    touchAction: 'AKTION',
    hudStatus: 'Kopfhörer empfohlen für 3D-Stereo-Sound!',
    scoreLabel: 'Punkte:',
    settingsTitle: '⚙️ Einstellungen & Barrierefreiheit',
    langSelectLabel: 'Sprache / Language:',
    volEffectsLabel: 'Lautstärke Soundeffekte (Stereo):',
    volTtsLabel: 'Lautstärke Sprachassistent:',
    rateLabel: 'Sprechgeschwindigkeit:',
    vibrateLabel: 'Haptisches Vibrations-Feedback bei Aktionen',
    resetHighscores: '🗑️ Rekorde zurücksetzen',
    saveSettings: 'Fertig & Speichern',
    settingsOpened: 'Einstellungen geöffnet.',
    settingsClosed: 'Einstellungen gespeichert.',
    ttsOn: 'Sprachausgabe eingeschaltet.',
    ttsOff: 'Sprachausgabe stummgeschaltet.',
    noGames: 'Keine Spiele gefunden.',
    backMenu: 'Zurück im Hauptmenü.',
    langChanged: 'Deutsche Sprache ausgewählt.',
    highScorePrefix: 'Rekord',
    points: 'Punkte',
    btnRandomAria: 'Zufälliges Spiel starten',
    btnTtsAria: 'Sprachausgabe umschalten',
    btnFeedbackAria: 'Feedback oder Idee senden',
    btnSettingsAria: 'Einstellungen öffnen',
    feedbackTitle: '💬 Feedback & Ideen senden',
    feedbackDesc: 'Dein Feedback landet direkt bei Entwickler Lauju in der Feedback-Zentrale.',
    fbSenderLabel: 'Dein Name / Alias (optional):',
    fbSenderPlaceholder: 'z. B. Alex oder Anonym',
    fbTextLabel: 'Deine Nachricht / Fehlerbericht / Spiel-Idee:',
    fbTextPlaceholder: 'Was gefällt dir? Was können wir verbessern?',
    fbSubmit: '📤 Absenden',
    fbCancel: 'Abbrechen',
    feedbackOpened: 'Feedback-Dialog geöffnet.',
    feedbackClosed: 'Feedback geschlossen.'
  },
  en: {
    appVersion: 'v2.2 • 75 Games',
    searchPlaceholder: '🔍 Search game...',
    tabAll: 'All (75)',
    tabAction: 'Action (30)',
    tabLogic: 'Logic (17)',
    tabNav: 'Navigation (12)',
    tabSpeech: 'Trivia (10)',
    tabSim: 'Simulation (6)',
    btnMenu: '◀ Menu',
    btnHelp: '❓ Help',
    touchUp: 'UP',
    touchDown: 'DOWN',
    touchLeft: 'LEFT',
    touchRight: 'RIGHT',
    touchAction: 'ACTION',
    hudStatus: 'Headphones recommended for 3D stereo sound!',
    scoreLabel: 'Score:',
    settingsTitle: '⚙️ Settings & Accessibility',
    langSelectLabel: 'Language / Sprache:',
    volEffectsLabel: 'Sound Effects Volume (Stereo):',
    volTtsLabel: 'Voice Assistant Volume:',
    rateLabel: 'Speech Rate:',
    vibrateLabel: 'Haptic Vibration Feedback for actions',
    resetHighscores: '🗑️ Reset All Highscores',
    saveSettings: 'Done & Save',
    settingsOpened: 'Settings opened.',
    settingsClosed: 'Settings saved.',
    ttsOn: 'Voice output enabled.',
    ttsOff: 'Voice output muted.',
    noGames: 'No games found.',
    backMenu: 'Back to main menu.',
    langChanged: 'English language selected.',
    highScorePrefix: 'High score',
    points: 'points',
    btnRandomAria: 'Start random game',
    btnTtsAria: 'Toggle voice assistant',
    btnFeedbackAria: 'Send feedback or game idea',
    btnSettingsAria: 'Open settings',
    feedbackTitle: '💬 Send Feedback & Ideas',
    feedbackDesc: 'Your feedback goes directly to developer Lauju.',
    fbSenderLabel: 'Your Name / Alias (optional):',
    fbSenderPlaceholder: 'e.g. Alex or Anonymous',
    fbTextLabel: 'Your message / bug report / game idea:',
    fbTextPlaceholder: 'What do you like? What can we improve?',
    fbSubmit: '📤 Submit',
    fbCancel: 'Cancel',
    feedbackOpened: 'Feedback dialog opened.',
    feedbackClosed: 'Feedback closed.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  renderGameList();
  setupTouchControls();
  setupSwipeControls();
  startVisualizer();
  initGamepadSupport();

  // Android Back-Button Integration (Capacitor / Cordova)
  document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    if (activeGame) {
      leaveGame();
    } else {
      const modal = document.getElementById('modal-settings');
      if (modal && modal.style.display !== 'none') {
        closeSettings();
      }
    }
  });
});

function getGameTitle(game) {
  if (AudioEngine.lang === 'en' && game.title_en) return game.title_en;
  return game.title;
}

function getGameDesc(game) {
  if (AudioEngine.lang === 'en' && game.desc_en) return game.desc_en;
  return game.desc;
}

function getGameTutorial(game) {
  if (AudioEngine.lang === 'en' && game.tutorial_en) return game.tutorial_en;
  return game.tutorial;
}

function renderGameList() {
  const container = document.getElementById('game-list');
  if (!container) return;
  container.innerHTML = '';

  const q = searchQuery.toLowerCase().trim();
  const filtered = MINI_GAMES.filter(g => {
    const matchCat = (currentCategory === 'all' || g.cat === currentCategory);
    const title = getGameTitle(g).toLowerCase();
    const desc = getGameDesc(g).toLowerCase();
    const matchSearch = !q || title.includes(q) || desc.includes(q) || g.id.includes(q);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'status-msg';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.marginTop = '40px';
    emptyMsg.textContent = AudioEngine.lang === 'en' ? 'No games found.' : 'Keine Spiele gefunden.';
    container.appendChild(emptyMsg);
    return;
  }

  filtered.forEach(game => {
    const high = localStorage.getItem(`high_${game.id}`) || 0;
    const title = getGameTitle(game);
    const desc = getGameDesc(game);

    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    const str = UI_STRINGS[AudioEngine.lang] || UI_STRINGS.de;
    card.setAttribute('aria-label', `${title}. ${desc}. ${str.highScorePrefix}: ${high} ${str.points}.`);
    card.onclick = () => startGame(game.id);
    card.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startGame(game.id);
      }
    };

    card.innerHTML = `
      <div class="game-info">
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
      <div class="game-high">🏆 ${high}</div>
    `;
    container.appendChild(card);
  });
}

function onSearchInput(val) {
  searchQuery = val || '';
  renderGameList();
}

function selectCategory(cat, el) {
  currentCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });

  const activeTab = el || document.getElementById(`tab-${cat}`);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
  }

  AudioEngine.playSound('select');
  AudioEngine.vibrate(20);
  renderGameList();
}

function toggleLanguage() {
  AudioEngine.lang = (AudioEngine.lang === 'de') ? 'en' : 'de';
  AudioEngine.saveSettings();
  updateLanguageUI();
  AudioEngine.vibrate(25);
  const str = UI_STRINGS[AudioEngine.lang] || UI_STRINGS.de;
  AudioEngine.speak(str.langChanged, true);
  renderGameList();
}

function updateLanguageUI() {
  const lang = AudioEngine.lang === 'en' ? 'en' : 'de';
  const str = UI_STRINGS[lang];

  // Flaggen-Button
  const btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = (lang === 'en') ? '🇬🇧' : '🇩🇪';

  // Versions-Badge & Suchleiste
  const verEl = document.getElementById('app-version');
  if (verEl) verEl.textContent = str.appVersion;

  const searchInput = document.getElementById('game-search');
  if (searchInput) searchInput.placeholder = str.searchPlaceholder;

  // Kategorien-Reiter
  const tabAll = document.getElementById('tab-all');
  if (tabAll) tabAll.textContent = str.tabAll;
  const tabAction = document.getElementById('tab-action');
  if (tabAction) tabAction.textContent = str.tabAction;
  const tabLogic = document.getElementById('tab-logic');
  if (tabLogic) tabLogic.textContent = str.tabLogic;
  const tabNav = document.getElementById('tab-nav');
  if (tabNav) tabNav.textContent = str.tabNav;
  const tabSpeech = document.getElementById('tab-speech');
  if (tabSpeech) tabSpeech.textContent = str.tabSpeech;
  const tabSim = document.getElementById('tab-sim');
  if (tabSim) tabSim.textContent = str.tabSim;

  // Spiel HUD
  const btnHudMenu = document.getElementById('btn-hud-menu');
  if (btnHudMenu) btnHudMenu.textContent = str.btnMenu;
  const btnHudHelp = document.getElementById('btn-hud-help');
  if (btnHudHelp) btnHudHelp.textContent = str.btnHelp;
  const hudStatus = document.getElementById('hud-status');
  if (hudStatus && (!activeGame || hudStatus.textContent.includes('Kopfhörer') || hudStatus.textContent.includes('Headphones'))) {
    hudStatus.textContent = str.hudStatus;
  }

  // Touch-Tasten Labels
  const tlUp = document.getElementById('touch-label-up');
  if (tlUp) tlUp.textContent = str.touchUp;
  const tlDown = document.getElementById('touch-label-down');
  if (tlDown) tlDown.textContent = str.touchDown;
  const tlLeft = document.getElementById('touch-label-left');
  if (tlLeft) tlLeft.textContent = str.touchLeft;
  const tlRight = document.getElementById('touch-label-right');
  if (tlRight) tlRight.textContent = str.touchRight;
  const tlAction = document.getElementById('touch-label-action');
  if (tlAction) tlAction.textContent = str.touchAction;

  // Header Aktions-Buttons
  const btnRand = document.getElementById('btn-random');
  if (btnRand) btnRand.setAttribute('aria-label', str.btnRandomAria);
  const btnTts = document.getElementById('btn-toggle-tts');
  if (btnTts) btnTts.setAttribute('aria-label', str.btnTtsAria);
  const btnFb = document.getElementById('btn-feedback');
  if (btnFb) btnFb.setAttribute('aria-label', str.btnFeedbackAria);
  const btnSet = document.getElementById('btn-open-settings');
  if (btnSet) btnSet.setAttribute('aria-label', str.btnSettingsAria);

  // Einstellungen Modal
  const sel = document.getElementById('set-language-select');
  if (sel) sel.value = lang;
  const setTitle = document.getElementById('settings-title');
  if (setTitle) setTitle.textContent = str.settingsTitle;
  const lblLang = document.getElementById('label-language-select');
  if (lblLang) lblLang.textContent = str.langSelectLabel;
  const lblVolEff = document.getElementById('label-vol-effects');
  if (lblVolEff) lblVolEff.textContent = str.volEffectsLabel;
  const lblVolTts = document.getElementById('label-vol-tts');
  if (lblVolTts) lblVolTts.textContent = str.volTtsLabel;
  const lblRate = document.getElementById('label-speech-rate');
  if (lblRate) lblRate.textContent = str.rateLabel;
  const lblVibText = document.getElementById('label-vibrate-text');
  if (lblVibText) lblVibText.textContent = str.vibrateLabel;
  const btnReset = document.getElementById('btn-reset-highscores');
  if (btnReset) btnReset.textContent = str.resetHighscores;
  const btnSave = document.getElementById('btn-save-settings');
  if (btnSave) btnSave.textContent = str.saveSettings;

  // Feedback Modal
  const fbTitle = document.getElementById('feedback-title');
  if (fbTitle) fbTitle.textContent = str.feedbackTitle;
  const fbDesc = document.getElementById('feedback-desc');
  if (fbDesc) fbDesc.textContent = str.feedbackDesc;
  const lblFbSender = document.getElementById('label-fb-sender');
  if (lblFbSender) lblFbSender.textContent = str.fbSenderLabel;
  const fbSender = document.getElementById('fb-sender');
  if (fbSender) fbSender.placeholder = str.fbSenderPlaceholder;
  const lblFbText = document.getElementById('label-fb-text');
  if (lblFbText) lblFbText.textContent = str.fbTextLabel;
  const fbText = document.getElementById('fb-text');
  if (fbText) fbText.placeholder = str.fbTextPlaceholder;
  const btnFbSub = document.getElementById('btn-fb-submit');
  if (btnFbSub) btnFbSub.textContent = str.fbSubmit;
  const btnFbCan = document.getElementById('btn-fb-cancel');
  if (btnFbCan) btnFbCan.textContent = str.fbCancel;
}

function onLanguageSelect(val) {
  AudioEngine.lang = (val === 'en') ? 'en' : 'de';
  AudioEngine.saveSettings();
  updateLanguageUI();
  renderGameList();
  const str = UI_STRINGS[AudioEngine.lang] || UI_STRINGS.de;
  AudioEngine.speak(str.langChanged, true);
}

function startRandomGame() {
  if (MINI_GAMES.length === 0) return;
  const rand = MINI_GAMES[Math.floor(Math.random() * MINI_GAMES.length)];
  AudioEngine.playSound('confirm');
  startGame(rand.id);
}

function startGame(id) {
  const gameDef = MINI_GAMES.find(g => g.id === id);
  if (!gameDef) return;

  activeGame = gameDef;
  document.getElementById('view-menu').style.display = 'none';
  document.getElementById('view-game').style.display = 'flex';

  const title = getGameTitle(gameDef);
  document.getElementById('game-hud-title').textContent = title;

  // Nummern-Tastenleiste einblenden falls Spiel Ziffern benötigt
  const needsNumbers = ['capital_hunter', 'sound_quiz', 'letter_salad', 'audio_alchemy', 'audio_birdwatcher'].includes(id);
  const numBar = document.getElementById('number-key-bar');
  if (numBar) numBar.style.display = needsNumbers ? 'flex' : 'none';

  AudioEngine.init();
  AudioEngine.playSound('confirm');
  AudioEngine.vibrate(35);

  const tut = getGameTutorial(gameDef);
  AudioEngine.speak(tut);

  currentGameInstance = {
    score: 0,
    updateScore(s) {
      this.score = s;
      document.getElementById('game-hud-score').textContent = (AudioEngine.lang === 'en') ? `Score: ${s}` : `Punkte: ${s}`;
      const prevHigh = parseInt(localStorage.getItem(`high_${gameDef.id}`) || '0', 10);
      if (s > prevHigh) {
        localStorage.setItem(`high_${gameDef.id}`, s.toString());
      }
    }
  };

  gameDef.init(currentGameInstance);
}

function leaveGame() {
  if (activeGame && activeGame.destroy) {
    try { activeGame.destroy(currentGameInstance); } catch (e) {}
  }
  activeGame = null;
  currentGameInstance = null;

  document.getElementById('view-game').style.display = 'none';
  document.getElementById('view-menu').style.display = 'flex';

  AudioEngine.playSound('switch_001');
  AudioEngine.vibrate(25);
  AudioEngine.speak((AudioEngine.lang === 'en') ? 'Back to main menu.' : 'Zurück im Hauptmenü.', true);
  renderGameList();
}

function repeatTutorial() {
  if (activeGame) {
    const tut = getGameTutorial(activeGame);
    AudioEngine.speak(tut, true);
  }
}

function triggerAction(type) {
  if (!activeGame || !currentGameInstance) return;
  AudioEngine.vibrate(20);
  if (activeGame.onAction) {
    activeGame.onAction(currentGameInstance, type);
  }
}

function setupTouchControls() {
  const bindTouch = (id, actionType) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerAction(actionType);
    });
  };

  bindTouch('btn-touch-up', 'up');
  bindTouch('btn-touch-down', 'down');
  bindTouch('btn-touch-left', 'left');
  bindTouch('btn-touch-right', 'right');
  bindTouch('btn-touch-action', 'action');

  // Tastatursteuerung für Bluetooth-Tastaturen / PC Testing
  window.addEventListener('keydown', (e) => {
    if (activeGame) {
      if (e.key === 'ArrowUp') triggerAction('up');
      else if (e.key === 'ArrowDown') triggerAction('down');
      else if (e.key === 'ArrowLeft') triggerAction('left');
      else if (e.key === 'ArrowRight') triggerAction('right');
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerAction('action');
      }
      else if (['1', '2', '3', '4'].includes(e.key)) triggerAction(e.key);
      else if (e.key === 'Escape') leaveGame();
    } else {
      const cards = Array.from(document.querySelectorAll('.game-card'));
      if (cards.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        if (e.key === 'ArrowDown') focusedGameIndex = (focusedGameIndex + 1) % cards.length;
        else if (e.key === 'ArrowUp') focusedGameIndex = (focusedGameIndex - 1 + cards.length) % cards.length;
        cards.forEach((c, i) => {
          if (i === focusedGameIndex) {
            c.classList.add('gamepad-focused');
            c.focus();
            c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            const title = (c.querySelector('h3') || {}).textContent || '';
            const high = (c.querySelector('.game-high') || {}).textContent || '';
            AudioEngine.playSound('select');
            AudioEngine.speak(`${title}. ${high}.`, true);
          } else {
            c.classList.remove('gamepad-focused');
          }
        });
      }
    }
  });
}

function setupSwipeControls() {
  let touchStartX = 0;
  let touchStartY = 0;
  const gameView = document.getElementById('view-game');
  if (!gameView) return;

  gameView.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  gameView.addEventListener('touchend', (e) => {
    if (!activeGame) return;
    if (e.changedTouches.length === 0) return;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 40) {
      if (absX > absY) {
        triggerAction(dx > 0 ? 'right' : 'left');
      } else {
        triggerAction(dy > 0 ? 'down' : 'up');
      }
    }
  }, { passive: true });
}

// --- NATIVE GAMEPAD & CONTROLLER SUPPORT ---
function initGamepadSupport() {
  window.addEventListener('gamepadconnected', (e) => {
    gamepadConnected = true;
    const badge = document.getElementById('gamepad-badge');
    if (badge) badge.style.display = 'inline-block';
    AudioEngine.playSound('confirm');
    AudioEngine.vibrate(60);
    const rawName = e.gamepad.id ? e.gamepad.id.split('(')[0].trim() : 'Gamepad';
    const msg = (AudioEngine.lang === 'en')
      ? `Controller connected: ${rawName}`
      : `Controller verbunden: ${rawName}`;
    AudioEngine.speak(msg, true);
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const anyActive = Array.from(gamepads).some(gp => gp && gp.connected);
    if (!anyActive) {
      gamepadConnected = false;
      const badge = document.getElementById('gamepad-badge');
      if (badge) badge.style.display = 'none';
      const msg = (AudioEngine.lang === 'en') ? 'Controller disconnected.' : 'Controller getrennt.';
      AudioEngine.speak(msg, true);
    }
  });

  // Gamepad Polling Loop (läuft parallel via requestAnimationFrame)
  function pollLoop() {
    pollGamepad();
    requestAnimationFrame(pollLoop);
  }
  requestAnimationFrame(pollLoop);
}

function pollGamepad() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i] && gamepads[i].connected) {
      gp = gamepads[i];
      break;
    }
  }
  if (!gp) return;

  const isDown = (btnIdx) => {
    const b = gp.buttons[btnIdx];
    return b ? (b.pressed || b.value > 0.5) : false;
  };
  const wasDown = (btnIdx) => !!lastGamepadButtons[btnIdx];
  const justPressed = (btnIdx) => isDown(btnIdx) && !wasDown(btnIdx);

  const axisX = gp.axes && gp.axes[0] !== undefined ? gp.axes[0] : 0;
  const axisY = gp.axes && gp.axes[1] !== undefined ? gp.axes[1] : 0;

  // D-Pad + Analog-Stick Richtungen (mit Deadzone)
  const up = isDown(12) || axisY < -0.55;
  const down = isDown(13) || axisY > 0.55;
  const left = isDown(14) || axisX < -0.55;
  const right = isDown(15) || axisX > 0.55;

  const prevUp = !!lastGamepadButtons['up'];
  const prevDown = !!lastGamepadButtons['down'];
  const prevLeft = !!lastGamepadButtons['left'];
  const prevRight = !!lastGamepadButtons['right'];

  const justUp = up && !prevUp;
  const justDown = down && !prevDown;
  const justLeft = left && !prevLeft;
  const justRight = right && !prevRight;

  // Standard Button Mapping:
  // Button 0 = A / Cross
  // Button 1 = B / Circle
  // Button 2 = X / Square
  // Button 3 = Y / Triangle
  // Button 4 = L1, Button 5 = R1
  // Button 8 = Select / Back / Share
  // Button 9 = Start / Options / Menu
  const btnA = justPressed(0);
  const btnB = justPressed(1);
  const btnX = justPressed(2);
  const btnY = justPressed(3);
  const btnL1 = justPressed(4);
  const btnR1 = justPressed(5);
  const btnSelect = justPressed(8);
  const btnStart = justPressed(9);

  if (activeGame) {
    // --- STEUERUNG IM AKTIVEN SPIEL ---
    if (justUp) triggerAction('up');
    if (justDown) triggerAction('down');
    if (justLeft) triggerAction('left');
    if (justRight) triggerAction('right');

    if (btnA) triggerAction('action');
    if (btnX) triggerAction('1');
    if (btnL1) triggerAction('1');
    if (btnR1) triggerAction('2');

    if (btnY) repeatTutorial();
    if (btnB || btnSelect || btnStart) leaveGame();
  } else {
    // --- NAVIGATION IM MENÜ ---
    const modalSettings = document.getElementById('modal-settings');
    const modalFeedback = document.getElementById('modal-feedback');
    const isModalOpen = (modalSettings && modalSettings.style.display !== 'none') ||
                        (modalFeedback && modalFeedback.style.display !== 'none');

    if (isModalOpen) {
      if (btnB || btnSelect) {
        if (modalSettings) closeSettings();
        if (modalFeedback) closeFeedbackModal();
      }
    } else {
      const cards = Array.from(document.querySelectorAll('.game-card'));
      if (cards.length > 0) {
        let changed = false;
        if (justDown) {
          focusedGameIndex = (focusedGameIndex + 1) % cards.length;
          changed = true;
        } else if (justUp) {
          focusedGameIndex = (focusedGameIndex - 1 + cards.length) % cards.length;
          changed = true;
        }

        if (changed) {
          cards.forEach((c, i) => {
            if (i === focusedGameIndex) {
              c.classList.add('gamepad-focused');
              c.focus();
              c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

              const titleEl = c.querySelector('h3');
              const highEl = c.querySelector('.game-high');
              const title = titleEl ? titleEl.textContent : '';
              const high = highEl ? highEl.textContent : '';
              AudioEngine.playSound('select');
              AudioEngine.vibrate(20);
              AudioEngine.speak(`${title}. ${high}.`, true);
            } else {
              c.classList.remove('gamepad-focused');
            }
          });
        }

        // A-Taste startet das fokussierte Spiel
        if (btnA) {
          const focusedCard = cards[focusedGameIndex];
          if (focusedCard) {
            focusedCard.click();
          }
        }

        // D-Pad Links / Rechts oder Schultertasten wechseln die Kategorie
        const categories = ['all', 'action', 'logic', 'nav', 'speech', 'sim'];
        if (btnL1 || justLeft) {
          let currIdx = categories.indexOf(currentCategory);
          currIdx = (currIdx - 1 + categories.length) % categories.length;
          selectCategory(categories[currIdx]);
          focusedGameIndex = 0;
        } else if (btnR1 || justRight) {
          let currIdx = categories.indexOf(currentCategory);
          currIdx = (currIdx + 1) % categories.length;
          selectCategory(categories[currIdx]);
          focusedGameIndex = 0;
        }

        // Y-Taste startet ein Zufallsspiel
        if (btnY) {
          startRandomGame();
        }

        // Start-Taste öffnet Einstellungen
        if (btnStart) {
          openSettings();
        }
      }
    }
  }

  // Tasten-Zustände für nächsten Frame speichern
  for (let b = 0; b < gp.buttons.length; b++) {
    lastGamepadButtons[b] = isDown(b);
  }
  lastGamepadButtons['up'] = up;
  lastGamepadButtons['down'] = down;
  lastGamepadButtons['left'] = left;
  lastGamepadButtons['right'] = right;
}

function startVisualizer() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let phase = 0;
  function render() {
    phase += 0.04;
    ctx.fillStyle = '#090d13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (activeGame) {
      // Wellenform zeichnen
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#22d3ee';

      const cy = canvas.height / 2;
      for (let x = 0; x < canvas.width; x += 4) {
        const y = cy + Math.sin(phase * 2 + x * 0.03) * 25 * Math.sin(phase + x * 0.01);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Pulsierender Audio-Kreis
      const r = 24 + Math.sin(phase * 4) * 8;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 204, 0, 0.35)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffcc00';
      ctx.stroke();
    } else {
      // Standby Visuals
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    visualizerAnimId = requestAnimationFrame(render);
  }

  render();
}

function toggleTTS() {
  AudioEngine.isTTSActive = !AudioEngine.isTTSActive;
  const icon = document.getElementById('btn-toggle-tts');
  if (icon) icon.textContent = AudioEngine.isTTSActive ? '🔊' : '🔇';
  AudioEngine.vibrate(20);
  const str = UI_STRINGS[AudioEngine.lang] || UI_STRINGS.de;
  AudioEngine.speak(AudioEngine.isTTSActive ? str.ttsOn : str.ttsOff, true);
}

function openSettings() {
  const modal = document.getElementById('modal-settings');
  if (modal) modal.style.display = 'flex';
  const str = UI_STRINGS[AudioEngine.lang] || UI_STRINGS.de;
  AudioEngine.speak(str.settingsOpened);
}

function closeSettings() {
  const modal = document.getElementById('modal-settings');
  if (modal) modal.style.display = 'none';
  const str = UI_STRINGS[AudioEngine.lang] || UI_STRINGS.de;
  AudioEngine.speak(str.settingsClosed);
}

function updateAudioSettings() {
  AudioEngine.effectsVolume = parseInt(document.getElementById('set-volume-effects').value, 10) / 100;
  AudioEngine.ttsVolume = parseInt(document.getElementById('set-volume-tts').value, 10) / 100;
  AudioEngine.speechRate = parseInt(document.getElementById('set-speech-rate').value, 10) / 10;
  AudioEngine.vibrationEnabled = document.getElementById('set-vibrate').checked;
  AudioEngine.saveSettings();
}

function resetAllHighscores() {
  if (confirm(AudioEngine.lang === 'en' ? 'Reset all highscores?' : 'Wirklich alle Rekorde zurücksetzen?')) {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('high_')) localStorage.removeItem(k);
    });
    AudioEngine.playSound('error');
    AudioEngine.speak(AudioEngine.lang === 'en' ? 'All highscores reset.' : 'Alle Rekorde wurden gelöscht.', true);
    renderGameList();
  }
}

function loadSettings() {
  AudioEngine.loadSettings();
  updateLanguageUI();

  const setEff = document.getElementById('set-volume-effects');
  if (setEff) setEff.value = Math.round(AudioEngine.effectsVolume * 100);

  const setTts = document.getElementById('set-volume-tts');
  if (setTts) setTts.value = Math.round(AudioEngine.ttsVolume * 100);

  const setRate = document.getElementById('set-speech-rate');
  if (setRate) setRate.value = Math.round(AudioEngine.speechRate * 10);

  const setVib = document.getElementById('set-vibrate');
  if (setVib) setVib.checked = AudioEngine.vibrationEnabled;
}

// --- FEEDBACK SYSTEM ---
function openFeedbackModal() {
  const modal = document.getElementById('modal-feedback');
  if (modal) modal.style.display = 'flex';
  const sender = document.getElementById('fb-sender');
  if (sender) sender.focus();
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.speak(AudioEngine.lang === 'en' ? 'Feedback dialog opened.' : 'Feedback-Dialog geöffnet.');
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById('modal-feedback');
  if (modal) modal.style.display = 'none';
  const statusEl = document.getElementById('fb-status');
  if (statusEl) statusEl.textContent = '';
  if (typeof AudioEngine !== 'undefined') {
    AudioEngine.speak(AudioEngine.lang === 'en' ? 'Feedback closed.' : 'Feedback geschlossen.');
  }
}

async function sendFeedback() {
  const senderInput = document.getElementById('fb-sender');
  const textInput = document.getElementById('fb-text');
  const statusEl = document.getElementById('fb-status');

  const sender = (senderInput && senderInput.value.trim()) || 'Anonym';
  const text = (textInput && textInput.value.trim()) || '';

  if (!text) {
    const msg = (typeof AudioEngine !== 'undefined' && AudioEngine.lang === 'en') ? 'Please enter a message!' : 'Bitte gib eine Nachricht ein!';
    if (statusEl) {
      statusEl.style.color = '#ef4444';
      statusEl.textContent = msg;
    }
    if (typeof AudioEngine !== 'undefined') AudioEngine.speak(msg, true);
    return;
  }

  if (statusEl) {
    statusEl.style.color = '#eab308';
    statusEl.textContent = (typeof AudioEngine !== 'undefined' && AudioEngine.lang === 'en') ? 'Sending...' : 'Wird gesendet...';
  }

  const payload = `App: minigames\nVersion: 2.2\nAbsender: ${sender}\nDatum: ${new Date().toISOString()}\nNachricht:\n${text}`;

  try {
    const res = await fetch('https://ntfy.sh/lauju_app_feedback', {
      method: 'POST',
      body: payload,
      headers: {
        'Title': `🎮 Minispiele Feedback von ${sender}`,
        'Tags': 'video_game,speech_balloon,minigames',
        'Priority': 'default'
      }
    });

    if (res.ok) {
      const succ = (typeof AudioEngine !== 'undefined' && AudioEngine.lang === 'en') ? 'Thank you! Feedback sent successfully.' : 'Vielen Dank! Dein Feedback wurde erfolgreich gesendet.';
      if (statusEl) {
        statusEl.style.color = '#22c55e';
        statusEl.textContent = succ;
      }
      if (textInput) textInput.value = '';
      if (typeof AudioEngine !== 'undefined') {
        AudioEngine.playSound('success');
        AudioEngine.speak(succ, true);
      }
      setTimeout(closeFeedbackModal, 2000);
    } else {
      throw new Error('Server responded with ' + res.status);
    }
  } catch (err) {
    console.error('Feedback error:', err);
    const errMsg = (typeof AudioEngine !== 'undefined' && AudioEngine.lang === 'en') ? 'Error sending feedback. Please check your connection.' : 'Fehler beim Senden. Bitte Verbindung prüfen.';
    if (statusEl) {
      statusEl.style.color = '#ef4444';
      statusEl.textContent = errMsg;
    }
    if (typeof AudioEngine !== 'undefined') {
      AudioEngine.playSound('error');
      AudioEngine.speak(errMsg, true);
    }
  }
}
