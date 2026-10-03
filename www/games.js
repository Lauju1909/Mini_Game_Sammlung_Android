// =============================================================================
// VOLLSTÄNDIGE MINI-GAME SAMMLUNG (ALLE 68 ORIGINAL-SPIELE)
// 100% Barrierefrei für TalkBack & Blinde • 3D-Stereo-Audio • Touch- & Tastatur
// =============================================================================

const MINI_GAMES = [
  {
    id: 'beat_reaktor',
    title: 'Beat-Reaktor',
    cat: 'action',
    desc: 'Reaktionsspiel: Reagiere blitzschnell auf den Stereo-Beat links oder rechts!',
    tutorial: 'Beat-Reaktor: Achte auf den Beat! Hörst du den Beat links, tippe sofort links. Hörst du ihn rechts, tippe rechts!',
    init(game) {
      game.score = 0; game.currentSide = null; game.waiting = false;
      game.next = () => {
        game.currentSide = Math.random() < 0.5 ? 'left' : 'right';
        AudioEngine.playTone(700, 0.12, game.currentSide === 'left' ? -0.85 : 0.85, 'triangle');
        game.t = Date.now(); game.waiting = true;
      };
      game.timer = setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if (!game.waiting) return;
      if (type === game.currentSide) {
        const pts = Math.max(10, 1000 - (Date.now() - game.t));
        game.score += pts; game.waiting = false;
        AudioEngine.playSound('confirm', type === 'left' ? -0.5 : 0.5);
        AudioEngine.vibrate(30); AudioEngine.speak(`Treffer! ${pts} Punkte.`);
        game.timer = setTimeout(game.next, Math.max(700, 1800 - (game.score / 5)));
      } else if (type === 'left' || type === 'right') {
        game.waiting = false; AudioEngine.playSound('error');
        AudioEngine.vibrate([40, 40]); AudioEngine.speak('Falsche Seite!');
        game.timer = setTimeout(game.next, 1400);
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      if (game.timer) clearTimeout(game.timer);
    }
  },
  {
    id: 'stereo_catch',
    title: 'Stereo-Münzfang',
    cat: 'action',
    desc: 'Höre Münzen von links oder rechts herabfallen und fange sie im perfekten Moment!',
    tutorial: 'Stereo-Münzfang: Münzen fallen mit fallender Tonhöhe herab. Drücke die Taste auf der richtigen Seite, genau wenn die Münze unten ankommt!',
    init(game) {
      game.score = 0; game.coinLanded = false;
      game.drop = () => {
        game.side = Math.random() < 0.5 ? 'left' : 'right';
        let f = 850; const pan = game.side === 'left' ? -0.85 : 0.85;
        const iv = setInterval(() => {
          AudioEngine.playTone(f, 0.08, pan, 'sine', 0.4); f -= 110;
          if (f <= 300) {
            clearInterval(iv); game.coinLanded = true;
            setTimeout(() => { if (game.coinLanded) { game.coinLanded = false; AudioEngine.playSound('drop_001', pan, 0.5); setTimeout(game.drop, 1200); } }, 650);
          }
        }, 140);
      };
      setTimeout(game.drop, 1000);
    },
    onAction(game, type) {
      if (game.coinLanded && type === game.side) {
        game.coinLanded = false; game.score += 150;
        AudioEngine.playSound('cash'); AudioEngine.vibrate(40);
        AudioEngine.speak('Gefangen! 150 Punkte.'); game.updateScore(game.score);
        setTimeout(game.drop, 1100);
      }
    },
    destroy(game) {
      game.coinLanded = false;
    }
  },
  {
    id: 'sound_catch',
    title: 'Ton-Jäger',
    cat: 'action',
    desc: 'Ein Ton wandert im Stereo-Panorama hin und her. Fange ihn exakt in der Mitte!',
    tutorial: 'Ton-Jäger: Höre, wie der Ton von links nach rechts wandert. Drücke Aktion genau in dem Moment, in dem der Ton mittig zwischen beiden Ohren erklingt!',
    init(game) {
      game.score = 0; game.pan = -1.0; game.dir = 0.2;
      game.iv = setInterval(() => {
        AudioEngine.playTone(520, 0.1, game.pan, 'sine', 0.5);
        game.pan += game.dir;
        if (game.pan >= 1.0) game.dir = -0.2;
        if (game.pan <= -1.0) game.dir = 0.2;
      }, 150);
    },
    onAction(game, type) {
      if (type === 'action') {
        const diff = Math.abs(game.pan);
        if (diff < 0.25) {
          const pts = Math.round((0.25 - diff) * 800) + 50;
          game.score += pts; AudioEngine.playSound('success'); AudioEngine.vibrate(50);
          AudioEngine.speak(`Volltreffer Mitte! ${pts} Punkte.`);
        } else {
          AudioEngine.playSound('error'); AudioEngine.vibrate(30);
          AudioEngine.speak(game.pan < 0 ? 'Zu weit links!' : 'Zu weit rechts!');
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'bomb_defuser',
    title: 'Bomben-Entschärfer',
    cat: 'action',
    desc: 'Finde den richtigen Draht der tickenden Bombe und schneide ihn durch!',
    tutorial: 'Bomben-Entschärfer: Die Zeit läuft! Taste mit Links und Rechts die 4 Drähte ab. Der sauberste, höchste Ton ist der richtige Draht – drücke Aktion zum Schneiden!',
    init(game) {
      game.score = 0; game.correct = Math.floor(Math.random() * 4); game.curr = 0;
      game.wires = [330, 440, 554, 659]; game.names = ['Rot', 'Blau', 'Gelb', 'Grün'];
      AudioEngine.speak(`Draht 1: ${game.names[0]}.`);
      AudioEngine.playTone(game.wires[0], 0.25, 0);
      game.tick = setInterval(() => AudioEngine.playSound('tick_001', 0, 0.25), 900);
    },
    onAction(game, type) {
      if (type === 'left') {
        game.curr = (game.curr - 1 + 4) % 4;
        AudioEngine.speak(game.names[game.curr]); AudioEngine.playTone(game.wires[game.curr], 0.2, -0.4);
      } else if (type === 'right') {
        game.curr = (game.curr + 1) % 4;
        AudioEngine.speak(game.names[game.curr]); AudioEngine.playTone(game.wires[game.curr], 0.2, 0.4);
      } else if (type === 'action') {
        if (game.curr === game.correct) {
          game.score += 500; AudioEngine.playSound('success'); AudioEngine.vibrate([40, 40, 80]);
          AudioEngine.speak('Bombe entschärft! Perfekt.'); game.correct = Math.floor(Math.random() * 4);
        } else {
          AudioEngine.playSound('error'); AudioEngine.vibrate(120);
          AudioEngine.speak('Bumm! Falscher Draht. Nächster Versuch.');
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.tick);
    }
  },
  {
    id: 'key_storm',
    title: 'Tasten-Gewitter',
    cat: 'action',
    desc: 'Drücke so schnell wie möglich die angesagte Taste: Links, Rechts oder Aktion!',
    tutorial: 'Tasten-Gewitter: Höre auf die Ansage! Drücke sofort die angesagte Taste: Links, Rechts oder Aktion!',
    init(game) {
      game.score = 0; game.target = null;
      game.btns = ['left', 'right', 'action']; game.labels = { left: 'Links!', right: 'Rechts!', action: 'Aktion!' };
      game.next = () => {
        game.target = game.btns[Math.floor(Math.random() * 3)];
        AudioEngine.speak(game.labels[game.target], true);
        const pan = game.target === 'left' ? -0.8 : (game.target === 'right' ? 0.8 : 0);
        AudioEngine.playTone(600, 0.1, pan); game.t = Date.now();
      };
      game.timer = setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if (!game.target) return;
      if (type === game.target) {
        const ms = Date.now() - game.t; const pts = Math.max(10, 800 - ms);
        game.score += pts; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25);
        game.target = null; game.timer = setTimeout(game.next, Math.max(600, 1500 - game.score/5));
      } else {
        AudioEngine.playSound('error'); AudioEngine.vibrate([40, 40]);
        game.target = null; game.timer = setTimeout(game.next, 1200);
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'speed_dial',
    title: 'Schnellwähler',
    cat: 'action',
    desc: 'Reagiere auf akustische Telefon-Wähltöne und treffe die richtige Richtung!',
    tutorial: 'Schnellwähler: Hoher Ton bedeutet Rechts, tiefer Ton bedeutet Links, Doppelton bedeutet Aktion. Reagiere so schnell wie möglich!',
    init(game) {
      game.score = 0; game.target = null;
      game.next = () => {
        const r = Math.random();
        if (r < 0.4) { game.target = 'left'; AudioEngine.playTone(350, 0.15, -0.7); }
        else if (r < 0.8) { game.target = 'right'; AudioEngine.playTone(850, 0.15, 0.7); }
        else { game.target = 'action'; AudioEngine.playTone(550, 0.08, 0); setTimeout(() => AudioEngine.playTone(550, 0.08, 0), 100); }
        game.t = Date.now();
      };
      game.timer = setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if (!game.target) return;
      if (type === game.target) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
        game.target = null; game.timer = setTimeout(game.next, 800);
      } else {
        AudioEngine.playSound('error'); AudioEngine.vibrate(60);
        game.target = null; game.timer = setTimeout(game.next, 1200);
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'mole_master',
    title: 'Maulwurf-Meister',
    cat: 'action',
    desc: 'Höre, wo der Maulwurf gräbt, und erwische ihn blitzschnell mit Links oder Rechts!',
    tutorial: 'Maulwurf-Meister: Hörst du das Schaufelgeräusch links, tippe sofort links. Hörst du es rechts, tippe rechts!',
    init(game) {
      game.score = 0; game.side = null;
      game.next = () => {
        game.side = Math.random() < 0.5 ? 'left' : 'right';
        const pan = game.side === 'left' ? -0.9 : 0.9;
        AudioEngine.playTone(280, 0.15, pan, 'sawtooth');
        game.t = Date.now();
      };
      game.timer = setTimeout(game.next, 1200);
    },
    onAction(game, type) {
      if (!game.side) return;
      if (type === game.side) {
        game.score += 200; AudioEngine.playSound('success'); AudioEngine.vibrate([30, 30]);
        AudioEngine.speak('Erwischt! +200'); game.side = null;
        game.timer = setTimeout(game.next, 1000);
      } else if (type === 'left' || type === 'right') {
        AudioEngine.playSound('error'); AudioEngine.vibrate(50);
        game.side = null; game.timer = setTimeout(game.next, 1400);
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'rhythm_master',
    title: 'Rhythmus-König',
    cat: 'action',
    desc: 'Drücke die Aktionstaste exakt auf den 4. Beat des Metronoms!',
    tutorial: 'Rhythmus-König: Du hörst drei Takt-Schläge: Eins, Zwei, Drei. Drücke auf den vierten Schlag genau im Takt Aktion!',
    init(game) {
      game.score = 0; game.beat = 0;
      game.loop = () => {
        game.beat = 1; AudioEngine.playTone(400, 0.08, 0);
        setTimeout(() => { game.beat = 2; AudioEngine.playTone(400, 0.08, 0); }, 500);
        setTimeout(() => { game.beat = 3; AudioEngine.playTone(400, 0.08, 0); }, 1000);
        setTimeout(() => { game.targetTime = Date.now(); game.beat = 4; }, 1500);
        setTimeout(() => { if (game.beat === 4) { AudioEngine.speak('Verpasst!'); game.loop(); } }, 2000);
      };
      game.timer = setTimeout(game.loop, 1000);
    },
    onAction(game, type) {
      if (type === 'action' && game.beat === 4) {
        const diff = Math.abs(Date.now() - game.targetTime);
        if (diff < 180) {
          game.score += 250; AudioEngine.playSound('success'); AudioEngine.vibrate(40);
          AudioEngine.speak('Perfekt im Takt!');
        } else {
          AudioEngine.playSound('bump'); AudioEngine.speak('Knapp daneben!');
        }
        game.beat = 0; game.updateScore(game.score);
        setTimeout(game.loop, 1200);
      }
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'reaction_blitz',
    title: 'Reaktions-Blitz',
    cat: 'action',
    desc: 'Warte auf den Startgong und drücke blitzschnell Aktion!',
    tutorial: 'Reaktions-Blitz: Konzentriere dich. Nach einer zufälligen Pause ertönt ein heller Gong. Drücke sofort Aktion!',
    init(game) {
      game.score = 0; game.ready = false;
      game.schedule = () => {
        AudioEngine.speak('Achtung...');
        const delay = 1500 + Math.random() * 2500;
        game.timer = setTimeout(() => {
          AudioEngine.playTone(880, 0.25, 0, 'sine', 0.8);
          game.startTime = Date.now(); game.ready = true;
        }, delay);
      };
      game.schedule();
    },
    onAction(game, type) {
      if (type === 'action') {
        if (game.ready) {
          const ms = Date.now() - game.startTime; game.ready = false;
          const pts = Math.max(50, 1000 - ms * 2); game.score += pts;
          AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
          AudioEngine.speak(`${ms} Millisekunden! ${pts} Punkte.`);
          game.updateScore(game.score); setTimeout(game.schedule, 2000);
        } else {
          clearTimeout(game.timer); AudioEngine.playSound('error'); AudioEngine.vibrate(80);
          AudioEngine.speak('Zu früh gedrückt!'); setTimeout(game.schedule, 1800);
        }
      }
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'audio_archery',
    title: 'Audio-Bogenschießen',
    cat: 'action',
    desc: 'Ziele per Tonhöhe und treffe die Mitte der Zielscheibe!',
    tutorial: 'Audio-Bogenschießen: Die Tonhöhe schwingt auf und ab. Je höher der Ton, desto näher bist du dem Bullseye. Drücke Aktion, wenn der Ton am höchsten ist!',
    init(game) {
      game.score = 0; game.pitch = 300; game.dir = 25;
      game.iv = setInterval(() => {
        AudioEngine.playTone(game.pitch, 0.08, 0); game.pitch += game.dir;
        if (game.pitch >= 900) game.dir = -25;
        if (game.pitch <= 300) game.dir = 25;
      }, 80);
    },
    onAction(game, type) {
      if (type === 'action') {
        const pts = Math.round(game.pitch / 10); game.score += pts;
        if (game.pitch >= 850) {
          AudioEngine.playSound('success'); AudioEngine.vibrate([40, 40, 60]);
          AudioEngine.speak(`Volltreffer ins Gold! ${pts} Punkte.`);
        } else {
          AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
          AudioEngine.speak(`Treffer: ${pts} Punkte.`);
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_ping_pong',
    title: 'Audio-Ping-Pong',
    cat: 'action',
    desc: 'Schlage den heranfliegenden Tischtennisball im richtigen Moment zurück!',
    tutorial: 'Audio-Ping-Pong: Höre den Ball auf dich zukommen. Wird der Ton lauter und höher, schlage mit Links oder Rechts im perfekten Moment zurück!',
    init(game) {
      game.score = 0; game.dist = 100; game.side = 'left';
      game.serve = () => {
        game.side = Math.random() < 0.5 ? 'left' : 'right'; game.dist = 100;
        const pan = game.side === 'left' ? -0.8 : 0.8;
        game.iv = setInterval(() => {
          game.dist -= 10;
          AudioEngine.playTone(400 + (100 - game.dist) * 4, 0.06, pan, 'sine', 0.6);
          if (game.dist <= 0) {
            clearInterval(game.iv); AudioEngine.playSound('error'); AudioEngine.vibrate(60);
            AudioEngine.speak('Verfehlt!'); setTimeout(game.serve, 1500);
          }
        }, 120);
      };
      setTimeout(game.serve, 1000);
    },
    onAction(game, type) {
      if (game.dist > 0 && game.dist <= 30 && type === game.side) {
        clearInterval(game.iv); game.score += 200;
        AudioEngine.playSound('confirm'); AudioEngine.vibrate(40);
        AudioEngine.speak('Schmetterball! +200'); game.updateScore(game.score);
        setTimeout(game.serve, 1200);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_mosquito',
    title: 'Audio-Mückenjagd',
    cat: 'action',
    desc: 'Lokalisiere das Summen der Mücke im Stereo-Raum und klatsche sie ab!',
    tutorial: 'Audio-Mückenjagd: Die Mücke schwirrt um deinen Kopf herum. Höre genau hin: Ist sie links, drücke Links. Ist sie rechts, drücke Rechts. Ist sie genau vor dir, drücke Aktion!',
    init(game) {
      game.score = 0; game.pos = 'center';
      game.buzz = () => {
        const r = Math.random();
        game.pos = r < 0.33 ? 'left' : (r < 0.66 ? 'right' : 'center');
        const pan = game.pos === 'left' ? -0.85 : (game.pos === 'right' ? 0.85 : 0);
        AudioEngine.playTone(950 + Math.random()*100, 0.18, pan, 'sawtooth', 0.35);
      };
      game.iv = setInterval(game.buzz, 500);
    },
    onAction(game, type) {
      if (type === game.pos) {
        game.score += 150; AudioEngine.playSound('cash'); AudioEngine.vibrate(50);
        AudioEngine.speak('Klatsch! Mücke erwischt.'); game.updateScore(game.score);
      } else {
        AudioEngine.playSound('error'); AudioEngine.vibrate(25);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_racer',
    title: 'Audio-Rennfahrer',
    cat: 'action',
    desc: 'Weiche Gegenverkehr auf der linken oder rechten Spur blitzschnell aus!',
    tutorial: 'Audio-Rennfahrer: Du fährst mit hoher Geschwindigkeit. Hörst du ein Motorengeräusch links, weiche nach rechts aus. Hörst du es rechts, weiche nach links aus!',
    init(game) {
      game.score = 0; game.lane = 'center'; game.threat = null;
      game.spawn = () => {
        game.threat = Math.random() < 0.5 ? 'left' : 'right';
        const pan = game.threat === 'left' ? -0.9 : 0.9;
        AudioEngine.playTone(220, 0.3, pan, 'sawtooth', 0.6);
        game.dangerTimer = setTimeout(() => {
          if (game.lane === game.threat) {
            AudioEngine.playSound('error'); AudioEngine.vibrate(100);
            AudioEngine.speak('Crash! Kollision.');
          } else {
            game.score += 100; AudioEngine.playSound('success'); AudioEngine.vibrate(25);
            game.updateScore(game.score);
          }
          game.lane = 'center'; setTimeout(game.spawn, 1200);
        }, 800);
      };
      setTimeout(game.spawn, 1000);
    },
    onAction(game, type) {
      if (type === 'left') { game.lane = 'left'; AudioEngine.playTone(400, 0.08, -0.6); }
      else if (type === 'right') { game.lane = 'right'; AudioEngine.playTone(400, 0.08, 0.6); }
    },
    destroy(game) {
      clearTimeout(game.dangerTimer);
    }
  },
  {
    id: 'audio_frogger',
    title: 'Audio-Frosch',
    cat: 'action',
    desc: 'Überquere die Straße: Lausche den Autolücken und hüpfe mit Aktion vorwärts!',
    tutorial: 'Audio-Frosch: Autos brausen vorbei. Wenn es still wird, drücke Aktion, um sicher über die Fahrbahn zu hüpfen!',
    init(game) {
      game.score = 0; game.carActive = false;
      game.drive = () => {
        game.carActive = true; AudioEngine.playTone(180, 0.4, -0.8, 'sawtooth');
        setTimeout(() => AudioEngine.playTone(180, 0.4, 0.8, 'sawtooth'), 300);
        setTimeout(() => { game.carActive = false; setTimeout(game.drive, 1200 + Math.random()*1500); }, 800);
      };
      setTimeout(game.drive, 1000);
    },
    onAction(game, type) {
      if (type === 'action') {
        if (game.carActive) {
          AudioEngine.playSound('error'); AudioEngine.vibrate(80);
          AudioEngine.speak('Vorsicht! Auto erwischt.');
        } else {
          game.score += 200; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
          AudioEngine.speak('Sicher gehüpft! +200'); game.updateScore(game.score);
        }
      }
    },
    destroy(game) {
      game.carActive = false;
    }
  },
  {
    id: 'audio_darts',
    title: 'Audio-Dart',
    cat: 'action',
    desc: 'Ziele mit dem Pfeil genau ins akustische Bullseye in der Mitte!',
    tutorial: 'Audio-Dart: Der Zielkreis wandert von links nach rechts und wieder zurück. Drücke Aktion genau im Zentrum!',
    init(game) {
      game.score = 0; game.pan = -1.0; game.dir = 0.15;
      game.iv = setInterval(() => {
        AudioEngine.playTone(650, 0.06, game.pan, 'triangle');
        game.pan += game.dir;
        if (game.pan >= 1.0) game.dir = -0.15;
        if (game.pan <= -1.0) game.dir = 0.15;
      }, 100);
    },
    onAction(game, type) {
      if (type === 'action') {
        const diff = Math.abs(game.pan);
        if (diff < 0.2) {
          game.score += 501; AudioEngine.playSound('success'); AudioEngine.vibrate([30, 30, 60]);
          AudioEngine.speak('Bullseye! 501 Punkte!');
        } else {
          const pts = Math.max(10, Math.round((1 - diff) * 200));
          game.score += pts; AudioEngine.playSound('confirm'); AudioEngine.vibrate(20);
          AudioEngine.speak(`Treffer: ${pts} Punkte.`);
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'beat_matcher',
    title: 'Beat-Matcher',
    cat: 'action',
    desc: 'Passe den Takt an: Drücke Aktion exakt im Rhythmus des DJ-Beats!',
    tutorial: 'Beat-Matcher: Höre den Beat. Halte den Rhythmus und tippe regelmäßig auf Aktion, um deine Treffsicherheit zu steigern!',
    init(game) {
      game.score = 0; game.bpm = 120; game.interval = 500;
      game.playBeat = () => { AudioEngine.playTone(150, 0.08, 0, 'sine', 0.8); game.lastBeat = Date.now(); };
      game.iv = setInterval(game.playBeat, game.interval);
    },
    onAction(game, type) {
      if (type === 'action') {
        const diff = Math.abs(Date.now() - game.lastBeat);
        if (diff < 90) {
          game.score += 100; AudioEngine.playSound('success'); AudioEngine.vibrate(25);
        } else {
          AudioEngine.playTone(300, 0.05, 0);
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_defense',
    title: 'Audio-Verteidigung',
    cat: 'action',
    desc: 'Feindliche Roboter greifen von links oder rechts an. Schieße rechtzeitig!',
    tutorial: 'Audio-Verteidigung: Hörst du Marschschritte links, schieße mit Links. Hörst du sie rechts, schieße mit Rechts!',
    init(game) {
      game.score = 0; game.enemySide = null;
      game.spawn = () => {
        game.enemySide = Math.random() < 0.5 ? 'left' : 'right';
        const pan = game.enemySide === 'left' ? -0.85 : 0.85;
        AudioEngine.playTone(200, 0.2, pan, 'sawtooth');
      };
      game.iv = setInterval(game.spawn, 1400);
    },
    onAction(game, type) {
      if (type === game.enemySide) {
        game.score += 150; AudioEngine.playSound('confirm'); AudioEngine.vibrate(35);
        AudioEngine.speak('Feind abgewehrt!'); game.enemySide = null; game.updateScore(game.score);
      } else if (type === 'left' || type === 'right') {
        AudioEngine.playSound('error'); AudioEngine.vibrate(60);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_balance',
    title: 'Audio-Balance',
    cat: 'action',
    desc: 'Balanciere auf dem Seil: Steuere nach links oder rechts gegen das Schwanken!',
    tutorial: 'Audio-Balance: Wandert der Ton nach links, tippe Rechts zum Ausgleichen. Wandert er nach rechts, tippe Links!',
    init(game) {
      game.score = 0; game.pos = 0;
      game.iv = setInterval(() => {
        game.pos += (Math.random() - 0.5) * 0.3;
        AudioEngine.playTone(440, 0.1, game.pos, 'sine');
        if (Math.abs(game.pos) > 0.9) {
          AudioEngine.playSound('error'); AudioEngine.speak('Heruntergefallen!');
          game.pos = 0;
        } else {
          game.score += 10; game.updateScore(game.score);
        }
      }, 250);
    },
    onAction(game, type) {
      if (type === 'left') game.pos -= 0.25;
      else if (type === 'right') game.pos += 0.25;
      AudioEngine.vibrate(20);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_runner',
    title: 'Audio-Hürdenlauf',
    cat: 'action',
    desc: 'Renne endlos: Weiche Hindernissen aus mit Links/Rechts und springe mit Aktion!',
    tutorial: 'Audio-Hürdenlauf: Tiefer Brummton = Weiche mit Links oder Rechts aus! Hoher Pfeifton = Springe mit Aktion!',
    init(game) {
      game.score = 0; game.obstacle = null;
      game.spawn = () => {
        const r = Math.random();
        if (r < 0.4) { game.obstacle = 'jump'; AudioEngine.playTone(900, 0.15, 0); }
        else if (r < 0.7) { game.obstacle = 'left'; AudioEngine.playTone(250, 0.15, -0.8); }
        else { game.obstacle = 'right'; AudioEngine.playTone(250, 0.15, 0.8); }
      };
      game.iv = setInterval(game.spawn, 1500);
    },
    onAction(game, type) {
      if (type === 'action' && game.obstacle === 'jump') {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25); game.obstacle = null;
      } else if (type === 'right' && game.obstacle === 'left') {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25); game.obstacle = null;
      } else if (type === 'left' && game.obstacle === 'right') {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25); game.obstacle = null;
      } else {
        AudioEngine.playSound('error'); AudioEngine.vibrate(60);
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_factory',
    title: 'Qualitätskontrolle',
    cat: 'action',
    desc: 'Prüfe Teile am Fließband: Sortiere fehlerhafte Teile mit Links und fehlerfreie mit Rechts aus!',
    tutorial: 'Qualitätskontrolle: Sauberer hoher Ton = Gutes Teil (Rechts drücken)! Kratziger tiefer Ton = Ausschuss (Links drücken)!',
    init(game) {
      game.score = 0; game.isGood = true;
      game.next = () => {
        game.isGood = Math.random() < 0.6;
        if (game.isGood) AudioEngine.playTone(660, 0.15, 0, 'sine');
        else AudioEngine.playTone(220, 0.15, 0, 'sawtooth');
      };
      game.timer = setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if ((type === 'right' && game.isGood) || (type === 'left' && !game.isGood)) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25);
      } else {
        AudioEngine.playSound('error'); AudioEngine.vibrate(50);
      }
      game.updateScore(game.score); game.timer = setTimeout(game.next, 900);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'audio_juggler',
    title: 'Audio Juggler',
    cat: 'action',
    desc: 'Halte drei Bälle in der Luft: Fange den linken Ball mit Links, den rechten mit Rechts!',
    tutorial: 'Audio Juggler: Bälle fliegen im Rhythmus links und rechts. Drücke die entsprechende Taste rechtzeitig vor dem Bodenkontakt!',
    init(game) {
      game.score = 0; game.side = 'left';
      game.iv = setInterval(() => {
        game.side = Math.random() < 0.5 ? 'left' : 'right';
        AudioEngine.playTone(550, 0.1, game.side === 'left' ? -0.8 : 0.8);
      }, 700);
    },
    onAction(game, type) {
      if (type === game.side) {
        game.score += 80; AudioEngine.playSound('confirm'); AudioEngine.vibrate(20);
      } else {
        AudioEngine.playSound('error');
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_sniper',
    title: 'Audio Sniper',
    cat: 'action',
    desc: 'Visiere das Ziel im Raum an, lausche dem Herzschlag und schieße mit Aktion!',
    tutorial: 'Audio Sniper: Drehe das Visier mit Links und Rechts. Wenn der Ton genau zentriert ist und dein Herzschlag ruhig schlägt, feuere mit Aktion!',
    init(game) {
      game.score = 0; game.target = (Math.random() - 0.5) * 1.6;
      game.iv = setInterval(() => {
        AudioEngine.playTone(480, 0.1, game.target, 'sine', 0.4);
      }, 450);
    },
    onAction(game, type) {
      if (type === 'left') game.target += 0.2;
      else if (type === 'right') game.target -= 0.2;
      else if (type === 'action') {
        if (Math.abs(game.target) < 0.2) {
          game.score += 500; AudioEngine.playSound('success'); AudioEngine.vibrate([50, 50]);
          AudioEngine.speak('Ziel eliminiert! +500'); game.target = (Math.random() - 0.5) * 1.6;
        } else {
          AudioEngine.playSound('error'); AudioEngine.speak('Daneben!');
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_fencer',
    title: 'Audio Fechter',
    cat: 'action',
    desc: 'Reagiere im Fechtduell: Pariere feindliche Klingenstöße mit Links und greife mit Rechts an!',
    tutorial: 'Audio Fechter: Klirrt der Degen, pariere sofort mit Links. Ist der Gegner offen, setze den Gegenstoß mit Rechts!',
    init(game) {
      game.score = 0; game.state = 'parry';
      game.next = () => {
        game.state = Math.random() < 0.5 ? 'parry' : 'strike';
        AudioEngine.speak(game.state === 'parry' ? 'Parade!' : 'Stoß!');
        AudioEngine.playTone(game.state === 'parry' ? 350 : 750, 0.12, 0);
      };
      game.timer = setTimeout(game.next, 1200);
    },
    onAction(game, type) {
      if ((type === 'left' && game.state === 'parry') || (type === 'right' && game.state === 'strike')) {
        game.score += 150; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else {
        AudioEngine.playSound('error'); AudioEngine.vibrate(60);
      }
      game.updateScore(game.score); game.timer = setTimeout(game.next, 1000);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'audio_lumberjack',
    title: 'Audio Holzfäller',
    cat: 'action',
    desc: 'Hacke den Baumstamm: Drücke Aktion zum Schlagen und weiche fallenden Ästen mit Links/Rechts aus!',
    tutorial: 'Audio Holzfäller: Hacke mit Aktion. Knackt ein Ast links, weiche nach rechts aus. Knackt er rechts, weiche nach links aus!',
    init(game) {
      game.score = 0; game.branch = null;
      game.spawn = () => {
        if (Math.random() < 0.4) {
          game.branch = Math.random() < 0.5 ? 'left' : 'right';
          AudioEngine.playTone(300, 0.15, game.branch === 'left' ? -0.8 : 0.8, 'sawtooth');
        } else { game.branch = null; }
      };
    },
    onAction(game, type) {
      if (type === 'action') {
        if (game.branch) {
          AudioEngine.playSound('error'); AudioEngine.vibrate(80); AudioEngine.speak('Vom Ast getroffen!');
        } else {
          game.score += 50; AudioEngine.playTone(440, 0.08, 0); AudioEngine.vibrate(20);
        }
        game.spawn();
      } else if (type === 'left' || type === 'right') {
        game.branch = null; AudioEngine.playSound('confirm');
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'rhythm_blacksmith',
    title: 'Audio-Schmiede',
    cat: 'action',
    desc: 'Schmiede Klingen im perfekten Hammertakt!',
    tutorial: 'Audio-Schmiede: Höre den Takt des Blasebalgs. Schlage den Hammer mit Aktion genau auf den Amboss!',
    init(game) {
      game.score = 0; game.beat = false;
      game.iv = setInterval(() => {
        AudioEngine.playTone(280, 0.1, 0, 'sine', 0.5);
        setTimeout(() => { game.beat = true; AudioEngine.playTone(700, 0.08, 0, 'triangle', 0.8); }, 400);
        setTimeout(() => { game.beat = false; }, 600);
      }, 900);
    },
    onAction(game, type) {
      if (type === 'action' && game.beat) {
        game.score += 120; AudioEngine.playSound('confirm'); AudioEngine.vibrate(35);
      } else if (type === 'action') {
        AudioEngine.playSound('error');
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_battleship',
    title: 'Audio-Schiffeversenken',
    cat: 'action',
    desc: 'Scanne das Radar nach feindlichen Schiffen und feuere Torpedos ab!',
    tutorial: 'Audio-Schiffeversenken: Bewege das Periskop mit Links und Rechts. Wenn das Pingsignal am stärksten zentriert ist, drücke Aktion!',
    init(game) {
      game.score = 0; game.targetPan = (Math.random() - 0.5) * 1.8;
      game.iv = setInterval(() => {
        AudioEngine.playTone(500, 0.1, game.targetPan, 'sine');
      }, 500);
    },
    onAction(game, type) {
      if (type === 'left') game.targetPan += 0.2;
      else if (type === 'right') game.targetPan -= 0.2;
      else if (type === 'action') {
        if (Math.abs(game.targetPan) < 0.25) {
          game.score += 300; AudioEngine.playSound('success'); AudioEngine.vibrate([40, 40, 60]);
          AudioEngine.speak('Schiff versenkt! +300'); game.targetPan = (Math.random() - 0.5) * 1.8;
        } else {
          AudioEngine.playSound('error'); AudioEngine.speak('Wasserfontäne! Daneben.');
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_waiter',
    title: 'Audio-Kellner',
    cat: 'action',
    desc: 'Bediente durstige Gäste auf Zuruf: Bringe Getränke nach Links, Rechts oder Mitte!',
    tutorial: 'Audio-Kellner: Höre die Rufe der Gäste aus den verschiedenen Ecken des Saals. Bringe die Bestellung mit Links, Rechts oder Aktion zur Mitte!',
    init(game) {
      game.score = 0; game.target = 'center';
      game.order = () => {
        const r = Math.random();
        game.target = r < 0.33 ? 'left' : (r < 0.66 ? 'right' : 'action');
        const pan = game.target === 'left' ? -0.8 : (game.target === 'right' ? 0.8 : 0);
        AudioEngine.speak('Herr Ober!'); AudioEngine.playTone(450, 0.1, pan);
      };
      game.timer = setTimeout(game.order, 1000);
    },
    onAction(game, type) {
      if (type === game.target) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25);
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score); game.timer = setTimeout(game.order, 1200);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'audio_bouncer',
    title: 'Audio-Türsteher',
    cat: 'action',
    desc: 'Prüfe Gäste an der Clubtür: Einlass gewähren mit Rechts, abweisen mit Links!',
    tutorial: 'Audio-Türsteher: Gäste nennen ihr Codewort. Passt die Tonharmonie, lasse sie mit Rechts rein. Klingt es schief, schicke sie mit Links weg!',
    init(game) {
      game.score = 0; game.isVIP = true;
      game.next = () => {
        game.isVIP = Math.random() < 0.5;
        if (game.isVIP) { AudioEngine.playTone(523.25, 0.15, 0); setTimeout(() => AudioEngine.playTone(659.25, 0.15, 0), 100); }
        else { AudioEngine.playTone(523.25, 0.15, 0); setTimeout(() => AudioEngine.playTone(554.37, 0.15, 0), 100); }
      };
      game.timer = setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if ((type === 'right' && game.isVIP) || (type === 'left' && !game.isVIP)) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else { AudioEngine.playSound('error'); AudioEngine.vibrate(60); }
      game.updateScore(game.score); game.timer = setTimeout(game.next, 1100);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'sound_memo',
    title: 'Sound-Memo (Klang-Memory)',
    cat: 'logic',
    desc: 'Merke dir die Tonfolge und wiederhole sie fehlerfrei!',
    tutorial: 'Sound-Memo: Der Computer spielt eine Tonfolge vor. Wiederhole sie danach mit Links und Rechts!',
    init(game) {
      game.score = 0; game.seq = []; game.idx = 0; game.state = 'cpu';
      game.add = () => {
        game.seq.push(Math.random() < 0.5 ? 'left' : 'right');
        game.playSeq();
      };
      game.playSeq = async () => {
        game.state = 'cpu'; AudioEngine.speak(`Runde ${game.seq.length}. Höre zu.`);
        await new Promise(r => setTimeout(r, 1200));
        for (const s of game.seq) {
          AudioEngine.playTone(s === 'left' ? 440 : 660, 0.25, s === 'left' ? -0.8 : 0.8);
          await new Promise(r => setTimeout(r, 500));
        }
        game.state = 'player'; game.idx = 0; AudioEngine.speak('Du bist dran!');
      };
      setTimeout(game.add, 1000);
    },
    onAction(game, type) {
      if (game.state !== 'player') return;
      if (type !== 'left' && type !== 'right') return;
      AudioEngine.playTone(type === 'left' ? 440 : 660, 0.2, type === 'left' ? -0.8 : 0.8);
      if (type === game.seq[game.idx]) {
        game.idx++;
        if (game.idx >= game.seq.length) {
          game.score += game.seq.length * 100; game.updateScore(game.score);
          AudioEngine.playSound('success'); AudioEngine.vibrate(40);
          setTimeout(game.add, 1400);
        }
      } else {
        AudioEngine.playSound('error'); AudioEngine.speak('Falsch! Von vorn.');
        game.seq = []; setTimeout(game.add, 2000);
      }
    },
    destroy(game) {
      
    }
  },
  {
    id: 'simon_says',
    title: 'Simon Says (Senso)',
    cat: 'logic',
    desc: 'Wiederhole 3-Wege-Tonmuster: Links, Aktion oder Rechts!',
    tutorial: 'Simon Says: Achte auf die Töne! Tief = Links, Mittel = Aktion, Hoch = Rechts. Wiederhole die Sequenz exakt!',
    init(game) {
      game.score = 0; game.seq = []; game.idx = 0; game.state = 'cpu';
      game.tones = { left: 350, action: 550, right: 850 };
      game.add = async () => {
        const keys = ['left', 'action', 'right'];
        game.seq.push(keys[Math.floor(Math.random() * 3)]);
        game.state = 'cpu'; AudioEngine.speak(`Stufe ${game.seq.length}`);
        await new Promise(r => setTimeout(r, 1000));
        for (const k of game.seq) {
          const pan = k === 'left' ? -0.8 : (k === 'right' ? 0.8 : 0);
          AudioEngine.playTone(game.tones[k], 0.25, pan);
          await new Promise(r => setTimeout(r, 550));
        }
        game.state = 'player'; game.idx = 0;
      };
      setTimeout(game.add, 1000);
    },
    onAction(game, type) {
      if (game.state !== 'player') return;
      const pan = type === 'left' ? -0.8 : (type === 'right' ? 0.8 : 0);
      AudioEngine.playTone(game.tones[type], 0.2, pan);
      if (type === game.seq[game.idx]) {
        game.idx++;
        if (game.idx >= game.seq.length) {
          game.score += game.seq.length * 150; game.updateScore(game.score);
          AudioEngine.playSound('confirm'); setTimeout(game.add, 1200);
        }
      } else {
        AudioEngine.playSound('error'); AudioEngine.speak('Verloren! Neuer Durchgang.');
        game.seq = []; setTimeout(game.add, 2000);
      }
    },
    destroy(game) {
      
    }
  },
  {
    id: 'safe_cracker',
    title: 'Tresor-Knacker',
    cat: 'logic',
    desc: 'Drehe die Tresorscheibe und lausche auf das metallische Einrasten!',
    tutorial: 'Tresor-Knacker: Drehe mit Links und Rechts die Scheibe von 0 bis 20. Hörst du ein lautes Klicken, ist die Ziffer eingerastet!',
    init(game) {
      game.score = 0; game.combo = [Math.floor(Math.random()*15)+1, Math.floor(Math.random()*15)+1, Math.floor(Math.random()*15)+1];
      game.pos = 0; game.idx = 0;
      AudioEngine.speak('Tresor bereit. Ziffer 1 suchen.');
    },
    onAction(game, type) {
      if (type === 'left' && game.pos > 0) game.pos--;
      else if (type === 'right' && game.pos < 20) game.pos++;
      AudioEngine.playTone(300 + game.pos * 20, 0.05, 0);
      if (game.pos === game.combo[game.idx]) {
        AudioEngine.playSound('metalLatch'); AudioEngine.vibrate([40, 40]);
        game.idx++;
        if (game.idx >= 3) {
          game.score += 1000; AudioEngine.playSound('cash');
          AudioEngine.speak('Tresor geöffnet! 1000 Punkte.');
          game.combo = [Math.floor(Math.random()*15)+1, Math.floor(Math.random()*15)+1, Math.floor(Math.random()*15)+1];
          game.idx = 0;
        } else {
          AudioEngine.speak(`Ziffer ${game.idx} korrekt! Weiter zu Ziffer ${game.idx + 1}.`);
        }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'number_guess',
    title: 'Zahlen-Raten',
    cat: 'logic',
    desc: 'Errate die Geheimzahl: Höre, ob deine Zahl zu hoch oder zu tief ist!',
    tutorial: 'Zahlen-Raten: Verändere die Zahl mit Links (-1) und Rechts (+1). Bestätige mit Aktion. Ein hoher Ton bedeutet: Die gesuchte Zahl ist größer!',
    init(game) {
      game.score = 0; game.secret = Math.floor(Math.random() * 50) + 1; game.guess = 25;
      AudioEngine.speak('Errate die Zahl zwischen 1 und 50. Start: 25');
    },
    onAction(game, type) {
      if (type === 'left' && game.guess > 1) { game.guess--; AudioEngine.speak(`${game.guess}`); }
      else if (type === 'right' && game.guess < 50) { game.guess++; AudioEngine.speak(`${game.guess}`); }
      else if (type === 'action') {
        if (game.guess === game.secret) {
          game.score += 500; AudioEngine.playSound('success'); AudioEngine.vibrate(60);
          AudioEngine.speak(`Richtig! Die Zahl war ${game.secret}. Neuer Durchgang!`);
          game.secret = Math.floor(Math.random() * 50) + 1; game.guess = 25;
        } else if (game.guess < game.secret) {
          AudioEngine.playTone(750, 0.15, 0); AudioEngine.speak('Höher!');
        } else {
          AudioEngine.playTone(250, 0.15, 0); AudioEngine.speak('Tiefer!');
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      
    }
  },
  {
    id: 'math_blitz',
    title: 'Mathe-Blitz',
    cat: 'logic',
    desc: 'Kopfrechnen unter Zeitdruck: Stimmt das Ergebnis? Links = Falsch, Rechts = Wahr!',
    tutorial: 'Mathe-Blitz: Höre die Rechenaufgabe. Ist das genannte Ergebnis richtig, drücke Rechts. Ist es falsch, drücke Links!',
    init(game) {
      game.score = 0; game.correct = true;
      game.next = () => {
        const a = Math.floor(Math.random() * 10) + 1; const b = Math.floor(Math.random() * 10) + 1;
        const real = a + b; game.correct = Math.random() < 0.5;
        const shown = game.correct ? real : real + (Math.random() < 0.5 ? 1 : -1);
        AudioEngine.speak(`${a} plus ${b} ist gleich ${shown}?`);
      };
      setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if ((type === 'right' && game.correct) || (type === 'left' && !game.correct)) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else { AudioEngine.playSound('error'); AudioEngine.vibrate(60); }
      game.updateScore(game.score); setTimeout(game.next, 1200);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'code_breaker',
    title: 'Code-Knacker',
    cat: 'logic',
    desc: 'Mastermind mit Tönen: Finde den 3-stelligen Farb-Code heraus!',
    tutorial: 'Code-Knacker: Ändere die Tonfarbe mit Links und Rechts, bestätige mit Aktion. Ein Doppelton zeigt die Anzahl richtiger Töne!',
    init(game) {
      game.score = 0; game.code = [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)];
      game.curr = [0,0,0]; game.step = 0; AudioEngine.speak('Wähle Ton 1 mit Links und Rechts, drücke Aktion.');
    },
    onAction(game, type) {
      if (type === 'left') { game.curr[game.step] = (game.curr[game.step] - 1 + 4) % 4; AudioEngine.playTone(300 + game.curr[game.step]*150, 0.15, 0); }
      else if (type === 'right') { game.curr[game.step] = (game.curr[game.step] + 1) % 4; AudioEngine.playTone(300 + game.curr[game.step]*150, 0.15, 0); }
      else if (type === 'action') {
        game.step++;
        if (game.step >= 3) {
          let hits = 0; for (let i=0; i<3; i++) if (game.curr[i] === game.code[i]) hits++;
          AudioEngine.speak(`${hits} von 3 Tönen korrekt!`);
          if (hits === 3) { game.score += 600; AudioEngine.playSound('success'); game.code = [Math.floor(Math.random()*4), Math.floor(Math.random()*4), Math.floor(Math.random()*4)]; }
          game.step = 0;
        } else { AudioEngine.speak(`Ton ${game.step + 1} wählen.`); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'dial_master',
    title: 'Audio-Schlossknacker',
    cat: 'logic',
    desc: 'Finde die Nullfrequenz des Schlosses durch feines Nachjustieren!',
    tutorial: 'Audio-Schlossknacker: Höre auf die Frequenzüberlagerung. Justiere mit Links und Rechts, bis das Flattern ganz verstummt, und öffne mit Aktion!',
    init(game) {
      game.score = 0; game.target = Math.floor(Math.random() * 20) - 10; game.pos = 0;
      game.iv = setInterval(() => {
        const diff = Math.abs(game.pos - game.target);
        AudioEngine.playTone(400 + diff * 15, 0.08, 0, 'sine', 0.4);
      }, 200);
    },
    onAction(game, type) {
      if (type === 'left') game.pos--;
      else if (type === 'right') game.pos++;
      else if (type === 'action') {
        if (game.pos === game.target) {
          game.score += 400; AudioEngine.playSound('metalLatch'); AudioEngine.speak('Schloss geknackt!');
          game.target = Math.floor(Math.random() * 20) - 10; game.pos = 0;
        } else { AudioEngine.playSound('error'); }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_sequence',
    title: 'Sound-Folge',
    cat: 'logic',
    desc: 'Präge dir 3 verschiedene Instrumente ein und wähle die richtige Reihenfolge!',
    tutorial: 'Sound-Folge: Höre drei Töne (Tief, Mittel, Hoch). Drücke die Tasten in exakt derselben Reihenfolge nach!',
    init(game) {
      game.score = 0; game.seq = [1, 2, 3];
      AudioEngine.speak('Präge dir die Reihenfolge ein.');
      setTimeout(() => AudioEngine.playTone(300, 0.2, 0), 1000);
      setTimeout(() => AudioEngine.playTone(500, 0.2, 0), 1500);
      setTimeout(() => AudioEngine.playTone(700, 0.2, 0), 2000);
      game.step = 0;
    },
    onAction(game, type) {
      const pressed = type === 'left' ? 1 : (type === 'action' ? 2 : 3);
      if (pressed === game.seq[game.step]) {
        game.step++;
        if (game.step >= 3) {
          game.score += 300; AudioEngine.playSound('success'); AudioEngine.speak('Folge komplett! +300');
          game.step = 0;
        }
      } else { AudioEngine.playSound('error'); game.step = 0; }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'spatial_memory',
    title: 'Audio-Kompass-Memory',
    cat: 'logic',
    desc: 'Merke dir Geräusch-Positionen im 3D-Stereoraum und rufe sie wieder ab!',
    tutorial: 'Audio-Kompass-Memory: Ein Ton erklingt links oder rechts. Merke dir die Positionen und tippe sie danach an!',
    init(game) {
      game.score = 0; game.side = 'left';
      game.play = () => {
        game.side = Math.random() < 0.5 ? 'left' : 'right';
        AudioEngine.playTone(520, 0.3, game.side === 'left' ? -0.9 : 0.9);
      };
      setTimeout(game.play, 1000);
    },
    onAction(game, type) {
      if (type === game.side) {
        game.score += 150; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score); setTimeout(game.play, 1200);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'ticking_clock',
    title: 'Tickende Uhren',
    cat: 'logic',
    desc: 'Drei Uhren ticken. Finde heraus, welche der Uhren asynchron aus der Reihe tanzt!',
    tutorial: 'Tickende Uhren: Höre Uhr 1 (Links), Uhr 2 (Mitte/Aktion) und Uhr 3 (Rechts). Wähle die Uhr mit dem abweichenden Ton!',
    init(game) {
      game.score = 0; game.odd = Math.floor(Math.random() * 3);
      AudioEngine.speak('Uhren werden angehört: Links, Mitte, Rechts.');
      setTimeout(() => AudioEngine.playTone(game.odd===0?500:400, 0.1, -0.7), 1200);
      setTimeout(() => AudioEngine.playTone(game.odd===1?500:400, 0.1, 0), 1800);
      setTimeout(() => AudioEngine.playTone(game.odd===2?500:400, 0.1, 0.7), 2400);
    },
    onAction(game, type) {
      const choice = type === 'left' ? 0 : (type === 'action' ? 1 : 2);
      if (choice === game.odd) {
        game.score += 350; AudioEngine.playSound('success'); AudioEngine.speak('Richtig herausgehört!');
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'pitch_perfect',
    title: 'Tonhöhen-Meister',
    cat: 'logic',
    desc: 'Verändere deine Tonhöhe mit Links/Rechts, bis sie exakt dem Referenzton gleicht!',
    tutorial: 'Tonhöhen-Meister: Erst hörst du den Zielton. Stimme deinen eigenen Ton mit Links (tiefer) und Rechts (höher) ab und drücke Aktion!',
    init(game) {
      game.score = 0; game.targetFreq = 440 + Math.floor(Math.random() * 8) * 40; game.currFreq = 440;
      AudioEngine.speak('Zielton anhören:');
      setTimeout(() => AudioEngine.playTone(game.targetFreq, 0.4, 0), 1000);
    },
    onAction(game, type) {
      if (type === 'left') { game.currFreq -= 40; AudioEngine.playTone(game.currFreq, 0.2, 0); }
      else if (type === 'right') { game.currFreq += 40; AudioEngine.playTone(game.currFreq, 0.2, 0); }
      else if (type === 'action') {
        if (game.currFreq === game.targetFreq) {
          game.score += 400; AudioEngine.playSound('success'); AudioEngine.speak('Perfekte Tonhöhe!');
          game.targetFreq = 440 + Math.floor(Math.random() * 8) * 40;
        } else { AudioEngine.playSound('error'); AudioEngine.speak('Nicht ganz!'); }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_math',
    title: 'Audio Math',
    cat: 'logic',
    desc: 'Löse wechselnde Mathe-Aufgaben durch Auswahl der Antwort A (Links) oder B (Rechts)!',
    tutorial: 'Audio Math: Höre die Rechenaufgabe. Wähle Antwort 1 mit Links oder Antwort 2 mit Rechts!',
    init(game) {
      game.score = 0; game.correct = 'left';
      game.next = () => {
        const a = Math.floor(Math.random() * 9) + 2; const b = Math.floor(Math.random() * 9) + 2;
        const res = a * b; const wrong = res + (Math.random() < 0.5 ? 2 : -2);
        game.correct = Math.random() < 0.5 ? 'left' : 'right';
        const optA = game.correct === 'left' ? res : wrong;
        const optB = game.correct === 'right' ? res : wrong;
        AudioEngine.speak(`Wieviel ist ${a} mal ${b}? Links: ${optA}. Rechts: ${optB}.`);
      };
      setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if (type === game.correct) {
        game.score += 150; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else { AudioEngine.playSound('error'); AudioEngine.vibrate(60); }
      game.updateScore(game.score); setTimeout(game.next, 1400);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_lockpicker',
    title: 'Audio Lockpicker',
    cat: 'logic',
    desc: 'Hebe die Stifte des Zylinderschlosses an und fixiere sie mit Gefühl!',
    tutorial: 'Audio Lockpicker: Hebe den Stift mit Rechts an. Wenn der Ton rein klingt, arretiere ihn mit Aktion!',
    init(game) {
      game.score = 0; game.pinHeight = 0; game.targetHeight = 4;
      AudioEngine.speak('Stift 1 anheben mit Rechts, fixieren mit Aktion.');
    },
    onAction(game, type) {
      if (type === 'right') {
        game.pinHeight++; AudioEngine.playTone(300 + game.pinHeight * 70, 0.08, 0);
      } else if (type === 'left' && game.pinHeight > 0) {
        game.pinHeight--; AudioEngine.playTone(300 + game.pinHeight * 70, 0.08, 0);
      } else if (type === 'action') {
        if (game.pinHeight === game.targetHeight) {
          game.score += 250; AudioEngine.playSound('metalLatch'); AudioEngine.speak('Stift eingerastet!');
          game.targetHeight = Math.floor(Math.random() * 5) + 2; game.pinHeight = 0;
        } else { AudioEngine.playSound('error'); }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_simon_says',
    title: 'Audio Simon Says',
    cat: 'logic',
    desc: 'Befolgen nur, wenn Simon es sagt!',
    tutorial: 'Audio Simon Says: Hörst du "Simon sagt: Links!", drücke Links. Sagt er nur "Rechts!", darfst du NICHT drücken!',
    init(game) {
      game.score = 0; game.simon = false; game.target = 'left';
      game.next = () => {
        game.simon = Math.random() < 0.6;
        game.target = Math.random() < 0.5 ? 'left' : 'right';
        const prefix = game.simon ? 'Simon sagt: ' : '';
        AudioEngine.speak(`${prefix}${game.target === 'left' ? 'Links' : 'Rechts'}!`);
      };
      game.timer = setTimeout(game.next, 1200);
    },
    onAction(game, type) {
      if (game.simon && type === game.target) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25);
      } else {
        AudioEngine.playSound('error'); AudioEngine.speak('Reingefallen!');
      }
      game.updateScore(game.score); game.timer = setTimeout(game.next, 1400);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'frequency_jammer',
    title: 'Frequenz-Jäger',
    cat: 'logic',
    desc: 'Drehe am Radio-Tuner und finde den klaren Sender im Äther!',
    tutorial: 'Frequenz-Jäger: Rausche mit Links und Rechts durch die Frequenzen. Sobald eine klare Melodie erklingt, drücke Aktion!',
    init(game) {
      game.score = 0; game.dial = 10; game.station = Math.floor(Math.random()*15)+5;
      game.iv = setInterval(() => {
        const d = Math.abs(game.dial - game.station);
        AudioEngine.playTone(d < 2 ? 600 : 200, 0.08, 0, d < 2 ? 'sine' : 'sawtooth', 0.3);
      }, 250);
    },
    onAction(game, type) {
      if (type === 'left') game.dial--;
      else if (type === 'right') game.dial++;
      else if (type === 'action') {
        if (Math.abs(game.dial - game.station) <= 1) {
          game.score += 300; AudioEngine.playSound('success'); AudioEngine.speak('Sender gefunden!');
          game.station = Math.floor(Math.random()*15)+5;
        } else { AudioEngine.playSound('error'); }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'stairs_of_fate',
    title: 'Treppe des Schicksals',
    cat: 'logic',
    desc: 'Steige 10 Stufen empor. Knarrt eine Stufe, weiche sofort zur Seite aus!',
    tutorial: 'Treppe des Schicksals: Steige mit Aktion eine Stufe hoch. Knarrt die Stufe, springe schnell mit Links oder Rechts zur Seite!',
    init(game) {
      game.score = 0; game.creaking = false;
      AudioEngine.speak('Erklimme die Treppe mit Aktion.');
    },
    onAction(game, type) {
      if (type === 'action') {
        if (Math.random() < 0.35) {
          game.creaking = true; AudioEngine.playTone(180, 0.2, 0, 'sawtooth');
          AudioEngine.speak('Knarren! Weiche aus!');
        } else {
          game.score += 50; AudioEngine.playTone(400 + game.score/5, 0.08, 0);
        }
      } else if ((type === 'left' || type === 'right') && game.creaking) {
        game.creaking = false; game.score += 100; AudioEngine.playSound('confirm');
        AudioEngine.speak('Sicher ausgewichen!');
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'golden_mic',
    title: 'Das Goldene Mikrofon',
    cat: 'nav',
    desc: 'Lokalisiere das Mikrofon im 3D-Stereo-Raum und zentriere es!',
    tutorial: 'Das Goldene Mikrofon: Das Signal piept links oder rechts. Tippe Links oder Rechts, um es in die Mitte zu holen. Drücke Aktion, wenn es genau zentriert ist!',
    init(game) {
      game.targetPan = (Math.random() * 1.8) - 0.9; game.score = 0;
      game.play = () => AudioEngine.playTone(587.33, 0.18, game.targetPan, 'sine');
      game.iv = setInterval(game.play, 800); game.play();
    },
    onAction(game, type) {
      if (type === 'left') { game.targetPan += 0.15; AudioEngine.playSound('click', -0.5); }
      else if (type === 'right') { game.targetPan -= 0.15; AudioEngine.playSound('click', 0.5); }
      else if (type === 'action') {
        const diff = Math.abs(game.targetPan);
        if (diff < 0.2) {
          game.score += Math.max(10, Math.round((0.2 - diff) * 500));
          AudioEngine.playSound('success'); AudioEngine.vibrate(50);
          AudioEngine.speak('Treffer! Perfekt mittig.'); game.targetPan = (Math.random() * 1.8) - 0.9;
        } else {
          AudioEngine.playSound('error'); AudioEngine.speak(game.targetPan < 0 ? 'Mehr links!' : 'Mehr rechts!');
        }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_maze',
    title: 'Audio-Labyrinth',
    cat: 'nav',
    desc: 'Finde den Ausgang aus dem unsichtbaren Irrgarten nur anhand von Echos!',
    tutorial: 'Audio-Labyrinth: Drehe dich mit Links und Rechts. Hoher Klingelton = Freier Weg nach vorn! Dumpfer Schlag = Wand! Gehe mit Aktion voran!',
    init(game) {
      game.score = 0; game.dir = 0; game.steps = 0;
      AudioEngine.speak('Labyrinth gestartet. Suche den freien Weg.');
    },
    onAction(game, type) {
      if (type === 'left') { game.dir = (game.dir - 1 + 4) % 4; AudioEngine.playTone(300, 0.08, -0.6); }
      else if (type === 'right') { game.dir = (game.dir + 1) % 4; AudioEngine.playTone(300, 0.08, 0.6); }
      else if (type === 'action') {
        if (game.dir === 1) {
          game.steps++; AudioEngine.playSound('confirm');
          if (game.steps >= 5) {
            game.score += 500; AudioEngine.playSound('success'); AudioEngine.speak('Ausgang erreicht! 500 Punkte.');
            game.steps = 0;
          } else { AudioEngine.speak(`Schritt ${game.steps} von 5.`); }
        } else { AudioEngine.playSound('bump'); AudioEngine.speak('Wand!'); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'echolot',
    title: 'Echolot',
    cat: 'nav',
    desc: 'Schätze die Entfernung zur Felswand anhand der Echo-Verzögerung!',
    tutorial: 'Echolot: Sende mit Aktion ein Pingsignal aus. Zähle die Zeit bis zum Echo und wähle die passende Entfernung mit Links oder Rechts!',
    init(game) {
      game.score = 0; game.dist = Math.floor(Math.random() * 3) + 1;
      AudioEngine.speak('Sende mit Aktion den Schallimpuls.');
    },
    onAction(game, type) {
      if (type === 'action') {
        AudioEngine.playTone(800, 0.1, 0);
        setTimeout(() => AudioEngine.playTone(400, 0.1, 0, 'sine', 0.4), game.dist * 400);
      } else if (type === 'left' || type === 'right') {
        const guess = type === 'left' ? 1 : 2;
        if (guess === game.dist) { game.score += 200; AudioEngine.playSound('success'); AudioEngine.speak('Exakte Peilung!'); }
        else { AudioEngine.playSound('error'); }
        game.dist = Math.floor(Math.random() * 3) + 1; game.updateScore(game.score);
      }
    },
    destroy(game) {
      
    }
  },
  {
    id: 'blind_farm',
    title: 'Die Blinde Farm',
    cat: 'nav',
    desc: 'Finde das Tier im Stall: Wandere von Stall zu Stall und entdecke die Schatzkiste!',
    tutorial: 'Die Blinde Farm: Gehe mit Links und Rechts durch die 10 Stallboxen. Öffne die Box mit Aktion!',
    init(game) {
      game.score = 0; game.pos = 1; game.target = Math.floor(Math.random() * 10) + 1;
      AudioEngine.speak('Stall 1. Gehe mit Links und Rechts.');
    },
    onAction(game, type) {
      if (type === 'left' && game.pos > 1) { game.pos--; AudioEngine.speak(`Box ${game.pos}`); AudioEngine.playTone(300 + game.pos*30, 0.08, -0.5); }
      else if (type === 'right' && game.pos < 10) { game.pos++; AudioEngine.speak(`Box ${game.pos}`); AudioEngine.playTone(300 + game.pos*30, 0.08, 0.5); }
      else if (type === 'action') {
        if (game.pos === game.target) {
          game.score += 500; AudioEngine.playSound('cash'); AudioEngine.speak('Schatzkiste gefunden! +500');
          game.target = Math.floor(Math.random() * 10) + 1;
        } else { AudioEngine.playSound('confirm'); AudioEngine.speak('Nur Stroh.'); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'space_flight',
    title: 'Weltraum-Flug',
    cat: 'nav',
    desc: 'Weiche herannahenden Meteoriten im tiefen Weltraum aus!',
    tutorial: 'Weltraum-Flug: Hörst du den Meteorit von links herandonnern, steuere mit Rechts nach rechts aus. Hörst du ihn rechts, fliege nach links!',
    init(game) {
      game.score = 0; game.threat = null;
      game.next = () => {
        game.threat = Math.random() < 0.5 ? 'left' : 'right';
        AudioEngine.playTone(160, 0.3, game.threat === 'left' ? -0.85 : 0.85, 'sawtooth');
      };
      game.iv = setInterval(game.next, 1300);
    },
    onAction(game, type) {
      if ((type === 'right' && game.threat === 'left') || (type === 'left' && game.threat === 'right')) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25);
      } else { AudioEngine.playSound('error'); AudioEngine.vibrate(80); }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'animal_radar',
    title: 'Tier-Radar',
    cat: 'nav',
    desc: 'Peile das Rufen des Tieres an und fange es genau im Visier!',
    tutorial: 'Tier-Radar: Richte den Empfänger mit Links und Rechts aus. Erklingt der Tierlaut in beiden Ohren gleich laut, fange es mit Aktion!',
    init(game) {
      game.score = 0; game.pan = (Math.random() - 0.5) * 1.8;
      game.iv = setInterval(() => AudioEngine.playTone(720, 0.12, game.pan), 600);
    },
    onAction(game, type) {
      if (type === 'left') game.pan += 0.2;
      else if (type === 'right') game.pan -= 0.2;
      else if (type === 'action') {
        if (Math.abs(game.pan) < 0.25) {
          game.score += 250; AudioEngine.playSound('success'); AudioEngine.speak('Tier aufgespürt!');
          game.pan = (Math.random() - 0.5) * 1.8;
        } else { AudioEngine.playSound('error'); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'mystery_door',
    title: 'Geheimnisvolle Türen',
    cat: 'nav',
    desc: 'Wähle Tür 1, 2 oder 3 und lausche auf den Windzug!',
    tutorial: 'Geheimnisvolle Türen: Schalte mit Links und Rechts zwischen Tür 1, 2 und 3 um. Hörst du ein magisches Summen, tritt mit Aktion ein!',
    init(game) {
      game.score = 0; game.door = 1; game.safe = Math.floor(Math.random()*3)+1;
      AudioEngine.speak('Tür 1 ausgewählt.');
    },
    onAction(game, type) {
      if (type === 'left' && game.door > 1) { game.door--; AudioEngine.speak(`Tür ${game.door}`); }
      else if (type === 'right' && game.door < 3) { game.door++; AudioEngine.speak(`Tür ${game.door}`); }
      else if (type === 'action') {
        if (game.door === game.safe) {
          game.score += 400; AudioEngine.playSound('success'); AudioEngine.speak('Goldener Raum gefunden!');
          game.safe = Math.floor(Math.random()*3)+1;
        } else { AudioEngine.playSound('error'); AudioEngine.speak('Sackgasse!'); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'submarine_sonar',
    title: 'Sonar-U-Boot',
    cat: 'nav',
    desc: 'Lokalisiere feindliche U-Boote durch Sonar-Ortung in der Tiefsee!',
    tutorial: 'Sonar-U-Boot: Drehe das Ruder mit Links und Rechts. Wenn der Sonarping exakt in der Mitte widerhallt, schieße den Torpedo mit Aktion ab!',
    init(game) {
      game.score = 0; game.pos = (Math.random() - 0.5) * 1.8;
      game.iv = setInterval(() => {
        AudioEngine.playTone(900, 0.08, game.pos, 'sine', 0.5);
      }, 700);
    },
    onAction(game, type) {
      if (type === 'left') game.pos += 0.2;
      else if (type === 'right') game.pos -= 0.2;
      else if (type === 'action') {
        if (Math.abs(game.pos) < 0.25) {
          game.score += 350; AudioEngine.playSound('success'); AudioEngine.speak('U-Boot versenkt!');
          game.pos = (Math.random() - 0.5) * 1.8;
        } else { AudioEngine.playSound('error'); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_train',
    title: 'Audio-Zug-Weiche',
    cat: 'nav',
    desc: 'Stelle die Weichen für den Expresszug nach Links oder Rechts!',
    tutorial: 'Audio-Zug-Weiche: Der Zug naht. Höre die Durchsage und lege die Weiche rechtzeitig nach Links oder Rechts um!',
    init(game) {
      game.score = 0; game.target = 'left';
      game.next = () => {
        game.target = Math.random() < 0.5 ? 'left' : 'right';
        AudioEngine.speak(game.target === 'left' ? 'Gleis 1 links!' : 'Gleis 2 rechts!');
      };
      game.timer = setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if (type === game.target) {
        game.score += 150; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score); game.timer = setTimeout(game.next, 1500);
    },
    destroy(game) {
      clearTimeout(game.timer);
    }
  },
  {
    id: 'echo_hunter',
    title: 'Echo-Jäger',
    cat: 'nav',
    desc: 'Folge dem Echo des Rufers in der Tropfsteinhöhle!',
    tutorial: 'Echo-Jäger: Ein Ruf erschallt. Drehe dich mit Links oder Rechts dorthin und bestätige mit Aktion!',
    init(game) {
      game.score = 0; game.target = Math.random() < 0.5 ? 'left' : 'right';
      game.call = () => AudioEngine.playTone(480, 0.2, game.target === 'left' ? -0.8 : 0.8);
      game.iv = setInterval(game.call, 800);
    },
    onAction(game, type) {
      if (type === game.target) {
        game.score += 150; AudioEngine.playSound('confirm');
        game.target = Math.random() < 0.5 ? 'left' : 'right';
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_archery_pro',
    title: 'Audio-Bogenschießen Pro',
    cat: 'nav',
    desc: 'Meisterklasse Bogenschießen: Gleiche Windgeräusche links und rechts aus!',
    tutorial: 'Bogenschießen Pro: Der Wind pfeift. Steuere mit Links und Rechts gegen die Winddrift an und schieße mit Aktion!',
    init(game) {
      game.score = 0; game.wind = (Math.random() - 0.5) * 1.5;
      game.iv = setInterval(() => AudioEngine.playTone(400, 0.08, game.wind), 300);
    },
    onAction(game, type) {
      if (type === 'left') game.wind -= 0.2;
      else if (type === 'right') game.wind += 0.2;
      else if (type === 'action') {
        if (Math.abs(game.wind) < 0.25) {
          game.score += 350; AudioEngine.playSound('success'); AudioEngine.speak('Perfekt im Wind geschossen!');
          game.wind = (Math.random() - 0.5) * 1.5;
        } else { AudioEngine.playSound('error'); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'word_snake',
    title: 'Wort-Schlange',
    cat: 'speech',
    desc: 'Bilde eine Kette: Welches Wort beginnt mit dem letzten Buchstaben? Links = A, Rechts = B!',
    tutorial: 'Wort-Schlange: Ich nenne ein Wort. Wähle mit Links oder Rechts das Wort, das mit dem Endbuchstaben beginnt!',
    init(game) {
      game.score = 0; game.correct = 'left';
      AudioEngine.speak('Start: Hund. Endet mit D. Links: Delfin. Rechts: Katze.');
      game.correct = 'left';
    },
    onAction(game, type) {
      if (type === game.correct) {
        game.score += 200; AudioEngine.playSound('confirm'); AudioEngine.speak('Richtig verkettet! +200');
        game.correct = game.correct === 'left' ? 'right' : 'left';
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'sound_quiz',
    title: 'Geräusche-Quiz',
    cat: 'speech',
    desc: 'Erkennst du den Sound? Wähle Antwort 1 mit Links oder Antwort 2 mit Rechts!',
    tutorial: 'Geräusche-Quiz: Höre das Tonsignal und wähle die richtige Zuordnung mit Links oder Rechts!',
    init(game) {
      game.score = 0; game.correct = 'left';
      game.next = () => {
        AudioEngine.playTone(300, 0.2, 0, 'sawtooth');
        AudioEngine.speak('Was war das? Links: Säge. Rechts: Flöte.');
        game.correct = 'left';
      };
      setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if (type === game.correct) {
        game.score += 200; AudioEngine.playSound('success'); AudioEngine.speak('Genau richtig!');
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score); setTimeout(game.next, 2000);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'letter_salad',
    title: 'Buchstaben-Salat',
    cat: 'speech',
    desc: 'Errate das geschüttelte Wort: Wähle Lösung A mit Links oder B mit Rechts!',
    tutorial: 'Buchstaben-Salat: Ich buchstabiere durcheinander: A-U-B-M. Was ist das? Links: Baum. Rechts: Maus.',
    init(game) {
      game.score = 0; game.correct = 'left';
      AudioEngine.speak('A - U - B - M. Links: Baum. Rechts: Maus.');
    },
    onAction(game, type) {
      if (type === game.correct) {
        game.score += 250; AudioEngine.playSound('confirm'); AudioEngine.speak('Richtig entwirrt!');
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'capital_hunter',
    title: 'Hauptstadt-Jäger',
    cat: 'speech',
    desc: 'Hauptstädte-Quiz: Stimmt die genannte Hauptstadt? Links = Nein, Rechts = Ja!',
    tutorial: 'Hauptstadt-Jäger: Höre die Aussage. Ist die Hauptstadt korrekt, tippe Rechts (Ja). Wenn nicht, tippe Links (Nein)!',
    init(game) {
      game.score = 0; game.isTrue = true;
      game.next = () => {
        const q = [
          { t: 'Die Hauptstadt von Frankreich ist Paris.', a: true },
          { t: 'Die Hauptstadt von Italien ist Mailand.', a: false },
          { t: 'Die Hauptstadt von Spanien ist Madrid.', a: true },
          { t: 'Die Hauptstadt von Deutschland ist München.', a: false }
        ];
        const item = q[Math.floor(Math.random() * q.length)];
        game.isTrue = item.a; AudioEngine.speak(item.t);
      };
      setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if ((type === 'right' && game.isTrue) || (type === 'left' && !game.isTrue)) {
        game.score += 200; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else { AudioEngine.playSound('error'); AudioEngine.vibrate(60); }
      game.updateScore(game.score); setTimeout(game.next, 1500);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'morse_runner',
    title: 'Morse-Läufer',
    cat: 'speech',
    desc: 'Lerne Morsezeichen: War das ein Dit (kurz) oder ein Dah (lang)?',
    tutorial: 'Morse-Läufer: Ein Morsesignal ertönt. War es kurz (Dit), drücke Links. War es lang (Dah), drücke Rechts!',
    init(game) {
      game.score = 0; game.isShort = true;
      game.next = () => {
        game.isShort = Math.random() < 0.5;
        AudioEngine.playTone(800, game.isShort ? 0.08 : 0.35, 0);
      };
      setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if ((type === 'left' && game.isShort) || (type === 'right' && !game.isShort)) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(25);
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score); setTimeout(game.next, 900);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_morse_code',
    title: 'Audio-Morsen',
    cat: 'speech',
    desc: 'Übermittle das Notsignal S-O-S mit Punkten und Strichen!',
    tutorial: 'Audio-Morsen: Tippe das Notsignal S O S: Drei kurze Töne mit Links, drei lange Töne mit Rechts, drei kurze mit Links!',
    init(game) {
      game.score = 0; game.step = 0; AudioEngine.speak('Übertrage S O S: Drei kurze mit Links.');
    },
    onAction(game, type) {
      if (game.step < 3 && type === 'left') { game.step++; AudioEngine.playTone(800, 0.08, 0); }
      else if (game.step >= 3 && game.step < 6 && type === 'right') { game.step++; AudioEngine.playTone(800, 0.3, 0); }
      else if (game.step >= 6 && game.step < 9 && type === 'left') { game.step++; AudioEngine.playTone(800, 0.08, 0); }
      else { AudioEngine.playSound('error'); game.step = 0; }
      if (game.step === 9) { game.score += 500; AudioEngine.playSound('success'); AudioEngine.speak('SOS erfolgreich gesendet!'); game.step = 0; }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_boss',
    title: 'Audio-Bosskampf',
    cat: 'speech',
    desc: 'Stelle dich dem Sound-Monster: Lausche den Angriffsmustern und kontere!',
    tutorial: 'Audio-Bosskampf: Wenn der Boss links brüllt, weiche nach rechts aus. Brüllt er rechts, weiche nach links aus. Lädt er Energie, schlage mit Aktion zu!',
    init(game) {
      game.score = 0; game.bossHp = 5; game.attack = 'left';
      game.next = () => {
        const r = Math.random(); game.attack = r < 0.4 ? 'left' : (r < 0.8 ? 'right' : 'action');
        if (game.attack === 'left') AudioEngine.playTone(180, 0.3, -0.85, 'sawtooth');
        else if (game.attack === 'right') AudioEngine.playTone(180, 0.3, 0.85, 'sawtooth');
        else AudioEngine.speak('Boss lädt auf!');
      };
      setTimeout(game.next, 1000);
    },
    onAction(game, type) {
      if ((type === 'right' && game.attack === 'left') || (type === 'left' && game.attack === 'right') || (type === 'action' && game.attack === 'action')) {
        game.score += 150; game.bossHp--; AudioEngine.playSound('confirm'); AudioEngine.vibrate(35);
        if (game.bossHp <= 0) { AudioEngine.playSound('success'); AudioEngine.speak('Boss besiegt! +1000'); game.score += 1000; game.bossHp = 5; }
      } else { AudioEngine.playSound('error'); AudioEngine.vibrate(80); }
      game.updateScore(game.score); setTimeout(game.next, 1400);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_spaceship',
    title: 'Audio-Raumschiff-Schlacht',
    cat: 'speech',
    desc: 'Verteidige deine Raumstation vor Angreifern im 360-Grad-Sektor!',
    tutorial: 'Audio-Raumschiff-Schlacht: Feinde nähern sich von links oder rechts. Zerstöre sie mit der passenden Taste!',
    init(game) {
      game.score = 0; game.side = 'left';
      game.spawn = () => {
        game.side = Math.random() < 0.5 ? 'left' : 'right';
        AudioEngine.playTone(550, 0.15, game.side === 'left' ? -0.9 : 0.9, 'sawtooth');
      };
      game.iv = setInterval(game.spawn, 1200);
    },
    onAction(game, type) {
      if (type === game.side) {
        game.score += 100; AudioEngine.playSound('confirm'); AudioEngine.vibrate(30);
      } else { AudioEngine.playSound('error'); }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'sound_weaver',
    title: 'Klang-Weber',
    cat: 'speech',
    desc: 'Weben harmonische Klangteppiche durch geschicktes Zusammenfügen!',
    tutorial: 'Klang-Weber: Verbinde die Akkorde. Drücke Aktion, wenn beide Töne vollkommen harmonieren!',
    init(game) {
      game.score = 0; game.f = 440;
      game.iv = setInterval(() => { AudioEngine.playTone(game.f, 0.1, 0); game.f = (game.f === 440 ? 550 : 440); }, 300);
    },
    onAction(game, type) {
      if (type === 'action') {
        game.score += 150; AudioEngine.playSound('success'); AudioEngine.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'audio_bowling',
    title: 'Audio-Bowling',
    cat: 'sim',
    desc: 'Hole Schwung und lasse die Kugel im richtigen Moment auf die Pins rollen!',
    tutorial: 'Audio-Bowling: Die Schwungstärke steigt akustisch an. Drücke Aktion beim höchsten Ton, um alle 10 Pins umzuwerfen!',
    init(game) {
      game.score = 0; game.p = 200; game.dir = 40;
      game.iv = setInterval(() => {
        AudioEngine.playTone(game.p, 0.08, 0); game.p += game.dir;
        if (game.p >= 800) game.dir = -40; if (game.p <= 200) game.dir = 40;
      }, 70);
    },
    onAction(game, type) {
      if (type === 'action') {
        if (game.p >= 720) {
          game.score += 300; AudioEngine.playSound('cash'); AudioEngine.vibrate([40, 40, 80]);
          AudioEngine.speak('Strike! Alle 10 Pins abgeräumt!');
        } else {
          const pins = Math.floor(game.p / 100); game.score += pins * 20;
          AudioEngine.playSound('confirm'); AudioEngine.speak(`Spare! ${pins} Pins umgeworfen.`);
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  },
  {
    id: 'rps_extreme',
    title: 'Schere, Stein, Papier Extreme',
    cat: 'sim',
    desc: 'Der Klassiker: Links = Schere, Aktion = Stein, Rechts = Papier!',
    tutorial: 'Schere, Stein, Papier: Wähle Schere mit Links, Stein mit Aktion oder Papier mit Rechts!',
    init(game) {
      game.score = 0; AudioEngine.speak('Wähle: Links Schere, Aktion Stein, Rechts Papier.');
    },
    onAction(game, type) {
      const cpu = ['left', 'action', 'right'][Math.floor(Math.random()*3)];
      const names = { left: 'Schere', action: 'Stein', right: 'Papier' };
      AudioEngine.speak(`Computer wählt ${names[cpu]}.`);
      if (type === cpu) { AudioEngine.speak('Unentschieden!'); }
      else if ((type==='left'&&cpu==='right') || (type==='action'&&cpu==='left') || (type==='right'&&cpu==='action')) {
        game.score += 200; AudioEngine.playSound('success'); AudioEngine.speak('Gewonnen! +200');
      } else { AudioEngine.playSound('error'); AudioEngine.speak('Verloren!'); }
      game.updateScore(game.score);
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_slots',
    title: 'Audio-Slots (Spielautomat)',
    cat: 'sim',
    desc: 'Drehe die Walzen und stoppe sie für den großen Jackpot!',
    tutorial: 'Audio-Slots: Drücke Aktion, um die 3 Walzen zu starten. Tippe dreimal Aktion im Takt, um sie anzuhalten!',
    init(game) {
      game.score = 0; game.reels = [0,0,0]; game.step = 0;
      AudioEngine.speak('Drücke Aktion zum Starten des Spielautomaten.');
    },
    onAction(game, type) {
      if (type === 'action') {
        if (game.step === 0) {
          AudioEngine.playSound('blip'); AudioEngine.speak('Walzen drehen...'); game.step = 1;
        } else {
          game.reels[game.step - 1] = Math.floor(Math.random() * 3);
          AudioEngine.playTone(400 + game.reels[game.step-1]*200, 0.15, (game.step-2)*0.6);
          game.step++;
          if (game.step > 3) {
            if (game.reels[0] === game.reels[1] && game.reels[1] === game.reels[2]) {
              game.score += 1000; AudioEngine.playSound('cash'); AudioEngine.vibrate([60, 40, 80]);
              AudioEngine.speak('JACKPOT! Dreifacher Gewinn! 1000 Punkte.');
            } else {
              AudioEngine.playSound('confirm'); AudioEngine.speak('Leider kein Drilling. Neuer Versuch mit Aktion.');
            }
            game.step = 0;
          }
        }
        game.updateScore(game.score);
      }
    },
    destroy(game) {
      
    }
  },
  {
    id: 'audio_fishing',
    title: 'Audio-Angeln',
    cat: 'sim',
    desc: 'Wirf die Angel aus, warte auf das Plätschern und reiße die Rute mit Aktion hoch!',
    tutorial: 'Audio-Angeln: Höre das ruhige Wasser. Wenn es platscht und die Schnur zappelt, drücke sofort Aktion zum Einholen!',
    init(game) {
      game.score = 0; game.biting = false;
      AudioEngine.speak('Angel ausgeworfen. Warte auf einen Biss...');
      game.timer = setTimeout(() => {
        game.biting = true; AudioEngine.playTone(280, 0.25, 0, 'sawtooth');
        AudioEngine.vibrate([30, 20, 40]); AudioEngine.speak('Ein Biss! Jetzt!');
        game.escapeTimer = setTimeout(() => { if (game.biting) { game.biting = false; AudioEngine.speak('Fisch entwischt.'); } }, 900);
      }, 2000 + Math.random()*2500);
    },
    onAction(game, type) {
      if (type === 'action' && game.biting) {
        clearTimeout(game.escapeTimer); game.biting = false; game.score += 350;
        AudioEngine.playSound('cash'); AudioEngine.vibrate(60);
        AudioEngine.speak('Großer Fang an Land gezogen! +350'); game.updateScore(game.score);
      }
    },
    destroy(game) {
      clearTimeout(game.timer); clearTimeout(game.escapeTimer);
    }
  },
  {
    id: 'audio_minesweeper',
    title: 'Audio-Minenräumer',
    cat: 'sim',
    desc: 'Tastender Minensucher: Der Geigerzähler warnt vor verborgenen Sprengsätzen!',
    tutorial: 'Audio-Minenräumer: Bewege dich mit Links und Rechts voran. Wenn das Knistern des Geigerzählers zu schnell wird, markiere die Mine mit Aktion!',
    init(game) {
      game.score = 0; game.pos = 0; game.mine = 4;
      game.iv = setInterval(() => {
        const d = Math.abs(game.pos - game.mine);
        const rate = Math.max(80, d * 150);
        AudioEngine.playTone(800, 0.03, 0, 'square', 0.2);
      }, 300);
    },
    onAction(game, type) {
      if (type === 'left' && game.pos > 0) game.pos--;
      else if (type === 'right' && game.pos < 8) game.pos++;
      else if (type === 'action') {
        if (game.pos === game.mine) {
          game.score += 400; AudioEngine.playSound('success'); AudioEngine.speak('Mine entschärft! +400');
          game.mine = Math.floor(Math.random() * 8);
        } else { AudioEngine.playSound('error'); }
      }
      game.updateScore(game.score);
    },
    destroy(game) {
      clearInterval(game.iv);
    }
  }
];
