# Audio Mini Games (Android)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-green.svg)](android)
[![Accessibility: TalkBack Ready](https://img.shields.io/badge/Accessibility-TalkBack%20Ready-brightgreen.svg)]()
[![F-Droid Ready](https://img.shields.io/badge/F--Droid-Ready-blue.svg)](fdroid)

**Audio Mini Games** ist eine vollständige Sammlung von **75 barrierefreien Audio-Minispielen** für Android. Sie sind so konzipiert, dass sie rein über Gehör, räumliche Akustik und haptisches Vibrationsfeedback ohne Blick auf den Bildschirm gespielt werden können!

---

## ✨ Features & Barrierefreiheit

* **75 abwechslungsreiche Minispiele in 5 Kategorien:**
  * **Action & Reaktion (30 Spiele):** z. B. Audio-Elfmeter, DJ-Turntable, Beat-Reaktor, Stereo-Fang, Bogenschießen.
  * **Logik & Gedächtnis (17 Spiele):** z. B. Audio-Alchemie, Safe-Knacker, Klang-Memory, Code-Breaker, Senso.
  * **Navigation & 3D-Stereo (12 Spiele):** z. B. Audio-Geisterjagd, Goldenes Mikrofon, Echolot, U-Boot Sonar, Labyrinth.
  * **Sprache & Wissen (10 Spiele):** z. B. Vogelstimmen-Erkennung, Hauptstadt-Jäger, Geräusche-Quiz, Wort-Schlange.
  * **Simulation & Spaß (6 Spiele):** z. B. Audio-Barista, Audio-Angeln, Bowling, Schere-Stein-Papier, Spielautomat.
* **Vollständig zweisprachig (Deutsch 🇩🇪 / English 🇬🇧):** Dynamische Umschaltung im Menü oder den Einstellungen mit nativer Web Speech Sprachsynthese.
* **TalkBack & Screenreader:** Vollwertige barrierefreie Bedienung über ARIA Live Regionen, Screenreader-Fokus und haptisches Feedback.
* **Ergonomische Touch-Steuerung:** D-Pad (Oben, Unten, Links, Rechts), zentrale Aktionstaste, Wischgesten (Swipe) sowie dynamische Zifferntasten (1-4).
* **3D-Raumklang:** Binaurale Web Audio StereoPanner-Soundeffekte für räumliches Richtungshören mit Kopfhörern.
* **Haptisches Feedback:** Haptics API Vibration zur haptischen Bestätigung von Treffern und Aktionen.
* **Zufallsspiel & Suchleiste:** Sofortiges Starten zufälliger Spiele oder schnelles Filtern aller 75 Spiele per Textsuche.
* **100% Offline & Open Source:** Keine Werbung, kein Tracking, kein Internet erforderlich.

---

## 🛠️ Projektstruktur

* `www/`: Audio-Game Engine, Minispiele und Sound-Assets
* `android/`: Natives Android-Projekt mit Capacitor & Haptics
* `tools/test_android_games.js`: Automatisierte Verifikations-Suite für alle 75 Spiele
* `fastlane/metadata/android/`: Metadaten für F-Droid
* `fdroid/`: F-Droid Rezept (`de.lauri.minigames.yml`)

---

## 🚀 Bauen aus dem Quellcode

```bash
npm ci
npx cap sync android
cd android
./gradlew assembleRelease
```

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).
