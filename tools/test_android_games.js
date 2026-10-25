const fs = require('fs');
const path = require('path');

// Mock browser objects
global.AudioEngine = {
  lang: 'de',
  playTone() {},
  playSound() {},
  speak() {},
  vibrate() {},
  createToneLoop() {},
  stopToneLoop() {}
};

global.localStorage = {
  getItem() { return '0'; },
  setItem() {}
};

global.document = {
  getElementById() {
    return { textContent: '', style: {} };
  }
};

const gamesPath = path.join(__dirname, '..', 'www', 'games.js');
const gamesCode = fs.readFileSync(gamesPath, 'utf8');

// Evaluate games.js in global context
eval(gamesCode.replace('const MINI_GAMES =', 'global.MINI_GAMES ='));

console.log('MINI_GAMES total count:', MINI_GAMES.length);

let errors = 0;
const seenIds = new Set();
const categories = { action: 0, logic: 0, nav: 0, speech: 0, sim: 0 };

MINI_GAMES.forEach((game, idx) => {
  if (!game.id) {
    console.error(`Game at index ${idx} missing id`);
    errors++;
  }
  if (seenIds.has(game.id)) {
    console.error(`Duplicate game id: ${game.id}`);
    errors++;
  }
  seenIds.add(game.id);

  if (!game.title) { console.error(`Game ${game.id} missing title`); errors++; }
  if (!game.cat) { console.error(`Game ${game.id} missing cat`); errors++; }
  if (categories[game.cat] !== undefined) {
    categories[game.cat]++;
  } else {
    console.warn(`Game ${game.id} has unexpected cat: ${game.cat}`);
  }
  if (!game.init) { console.error(`Game ${game.id} missing init()`); errors++; }
  if (!game.onAction) { console.error(`Game ${game.id} missing onAction()`); errors++; }

  // Test simulation of game
  try {
    const mockInst = {
      score: 0,
      updateScore(s) { this.score = s; }
    };
    game.init(mockInst);
    game.onAction(mockInst, 'action');
    game.onAction(mockInst, 'left');
    game.onAction(mockInst, 'right');
    game.onAction(mockInst, 'up');
    game.onAction(mockInst, 'down');
    game.onAction(mockInst, '1');
    if (game.destroy) game.destroy(mockInst);
  } catch (err) {
    console.error(`Error simulating game ${game.id}:`, err);
    errors++;
  }
});

console.log('Category breakdown:', categories);
if (errors === 0 && MINI_GAMES.length === 75) {
  console.log('SUCCESS: All 75 Android games initialized, passed action simulation, and verified cleanly!');
  process.exit(0);
} else {
  console.error(`FAILED with ${errors} errors.`);
  process.exit(1);
}
