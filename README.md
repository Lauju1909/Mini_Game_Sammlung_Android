# Audio Mini Games (Android)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-green.svg)](android)
[![Accessibility: TalkBack Ready](https://img.shields.io/badge/Accessibility-TalkBack%20Ready-brightgreen.svg)]()
[![F-Droid Ready](https://img.shields.io/badge/F--Droid-Ready-blue.svg)](fdroid)

**Audio Mini Games** ist eine vielseitige Sammlung von über 60 barrierefreien Audio-Minispielen für Android. Sie sind so konzipiert, dass sie rein über Gehör, Audio-Feedback und Vibration ohne Blick auf den Bildschirm gespielt werden können!

---

## ✨ Features & Barrierefreiheit

* **Über 60 abwechslungsreiche Minispiele:**
  * Action & Reaktion (z. B. Reflex-Sounds, Beat-Matcher)
  * Logik & Gedächtnis (z. B. Klang-Memory, Zahlenfolgen)
  * Navigation & 3D-Stereo (z. B. Ortung, Labyrinth-Hörakustik)
  * Sprache & Wissen (z. B. Quiz, Worträtsel)
  * Simulation & Entspannung
* **TalkBack & Audio-Engine:** Vollwertig mit TalkBack bedienbar oder mit integrierter Sprachsynthese.
* **3D-Raumklang:** Binaurale Soundeffekte für räumliches Richtungshören mit Kopfhörern.
* **Haptisches Feedback:** Vibration zur Bestätigung von Treffern und Aktionen.
* **100% Offline & Kostenlos:** Keine Werbung, kein Tracking, kein Internet erforderlich.

---

## 🛠️ Projektstruktur

* `www/`: Audio-Game Engine, Minispiele und Sound-Assets
* `android/`: Natives Android-Projekt mit Capacitor Haptics
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
