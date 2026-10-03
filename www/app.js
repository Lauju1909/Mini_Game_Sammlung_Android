let activeGame = null;
let currentGameInstance = null;
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderGameList();
  setupTouchControls();
  loadSettings();

  // Android Back-Button Integration
  document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    if (activeGame) {
      leaveGame();
    } else {
      const modal = document.getElementById('modal-settings');
      if (modal.style.display !== 'none') {
        closeSettings();
      }
    }
  });
});

function renderGameList() {
  const container = document.getElementById('game-list');
  container.innerHTML = '';

  const filtered = MINI_GAMES.filter(g => currentCategory === 'all' || g.cat === currentCategory);

  filtered.forEach(game => {
    const high = localStorage.getItem(`high_${game.id}`) || 0;
    const card = document.createElement('div');
    card.className = 'game-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${game.title}. ${game.desc}. Rekord: ${high} Punkte.`);
    card.onclick = () => startGame(game.id);
    card.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') startGame(game.id); };

    card.innerHTML = `
      <div class="game-info">
        <h3>${game.title}</h3>
        <p>${game.desc}</p>
      </div>
      <div class="game-high">🏆 ${high}</div>
    `;
    container.appendChild(card);
  });
}

function selectCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  AudioEngine.playSound('select');
  AudioEngine.vibrate(20);
  renderGameList();
}

function startGame(id) {
  const gameDef = MINI_GAMES.find(g => g.id === id);
  if (!gameDef) return;

  activeGame = gameDef;
  document.getElementById('view-menu').style.display = 'none';
  document.getElementById('view-game').style.display = 'flex';
  document.getElementById('game-hud-title').textContent = gameDef.title;

  AudioEngine.init();
  AudioEngine.playSound('confirm');
  AudioEngine.vibrate(35);
  AudioEngine.speak(gameDef.tutorial);

  currentGameInstance = {
    score: 0,
    updateScore(s) {
      document.getElementById('game-hud-score').textContent = `Punkte: ${s}`;
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
    activeGame.destroy(currentGameInstance);
  }
  activeGame = null;
  currentGameInstance = null;
  document.getElementById('view-game').style.display = 'none';
  document.getElementById('view-menu').style.display = 'flex';
  AudioEngine.playSound('switch_001');
  AudioEngine.vibrate(25);
  AudioEngine.speak('Zurück im Hauptmenü.');
  renderGameList();
}

function repeatTutorial() {
  if (activeGame && activeGame.tutorial) {
    AudioEngine.speak(activeGame.tutorial, true);
  }
}

function setupTouchControls() {
  const trigger = (type) => {
    if (!activeGame || !currentGameInstance) return;
    AudioEngine.vibrate(20);
    activeGame.onAction(currentGameInstance, type);
  };

  document.getElementById('btn-touch-left').addEventListener('pointerdown', (e) => { e.preventDefault(); trigger('left'); });
  document.getElementById('btn-touch-right').addEventListener('pointerdown', (e) => { e.preventDefault(); trigger('right'); });
  document.getElementById('btn-touch-action').addEventListener('pointerdown', (e) => { e.preventDefault(); trigger('action'); });

  // Tastatursteuerung für Bluetooth-Tastaturen / PC-Testing
  window.addEventListener('keydown', (e) => {
    if (!activeGame) return;
    if (e.key === 'ArrowLeft') trigger('left');
    else if (e.key === 'ArrowRight') trigger('right');
    else if (e.key === 'Enter' || e.key === ' ') trigger('action');
    else if (e.key === 'Escape') leaveGame();
  });
}

function toggleTTS() {
  AudioEngine.isTTSActive = !AudioEngine.isTTSActive;
  const icon = document.getElementById('btn-toggle-tts');
  icon.textContent = AudioEngine.isTTSActive ? '🔊' : '🔇';
  AudioEngine.vibrate(20);
  AudioEngine.speak(AudioEngine.isTTSActive ? 'Sprachausgabe eingeschaltet.' : 'Sprachausgabe stummgeschaltet.', true);
}

function openSettings() {
  document.getElementById('modal-settings').style.display = 'flex';
  AudioEngine.speak('Einstellungen geöffnet.');
}

function closeSettings() {
  document.getElementById('modal-settings').style.display = 'none';
  AudioEngine.speak('Einstellungen gespeichert.');
}

function updateAudioSettings() {
  AudioEngine.effectsVolume = parseInt(document.getElementById('set-volume-effects').value, 10) / 100;
  AudioEngine.ttsVolume = parseInt(document.getElementById('set-volume-tts').value, 10) / 100;
  AudioEngine.speechRate = parseInt(document.getElementById('set-speech-rate').value, 10) / 10;
  AudioEngine.vibrationEnabled = document.getElementById('set-vibrate').checked;
}

function loadSettings() {
  // Standard-Initialisierung
}