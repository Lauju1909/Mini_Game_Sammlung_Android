let activeGame = null;
let currentGameInstance = null;
let currentCategory = 'all';
let searchQuery = '';
let visualizerAnimId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  renderGameList();
  setupTouchControls();
  setupSwipeControls();
  startVisualizer();

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
    card.setAttribute('aria-label', `${title}. ${desc}. Rekord: ${high} Punkte.`);
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
  AudioEngine.speak(AudioEngine.lang === 'en' ? 'English language selected.' : 'Deutsche Sprache ausgewählt.', true);
  renderGameList();
}

function updateLanguageUI() {
  const btn = document.getElementById('btn-lang');
  if (btn) btn.textContent = (AudioEngine.lang === 'en') ? '🇬🇧' : '🇩🇪';

  const sel = document.getElementById('set-language-select');
  if (sel) sel.value = AudioEngine.lang;

  const searchInput = document.getElementById('game-search');
  if (searchInput) {
    searchInput.placeholder = (AudioEngine.lang === 'en') ? '🔍 Search game...' : '🔍 Spiel suchen...';
  }
}

function onLanguageSelect(val) {
  AudioEngine.lang = val;
  AudioEngine.saveSettings();
  updateLanguageUI();
  renderGameList();
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
    if (!activeGame) return;
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
  AudioEngine.speak(AudioEngine.isTTSActive ? 'Sprachausgabe eingeschaltet.' : 'Sprachausgabe stummgeschaltet.', true);
}

function openSettings() {
  const modal = document.getElementById('modal-settings');
  if (modal) modal.style.display = 'flex';
  AudioEngine.speak('Einstellungen geöffnet.');
}

function closeSettings() {
  const modal = document.getElementById('modal-settings');
  if (modal) modal.style.display = 'none';
  AudioEngine.speak('Einstellungen gespeichert.');
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
