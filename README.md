<div align="center">

# ⚔️ AI Quest — Study RPG

Live Demo: https://aiquest-studyrpg.netlify.app/

<p align="center">
  <img src="public/assets/quests.png" alt="AI Quest Banner" width="120" />
</p>

<p align="center">
  <strong>An 8-bit retro RPG study adventure powered by Generative AI.</strong><br>
  Battle custom-generated monsters, master difficult academic topics, and level up your hero through curriculum-driven combat!
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?logo=google" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify" alt="Netlify" />
</p>

---

## 🎮 Key Features

- **🧠 Neural Quest Generator**: Powered by Google Gemini. Enter any subject (from *Quantum Physics* to *World War II History*) and select a difficulty rating (1–10) to dynamically spawn customized multi-stage quests.
- **👾 Turn-Based Battle Engine**:
  - Battle themed pixel monsters (e.g., *"The Fraction Hydra"*, *"Vector Phantom"*).
  - Answering correctly deals lethal damage to the enemy.
  - Incorrect answers damage the player and summon the **Wise Mentor** NPC for an in-depth pedagogical breakdown.
- **🧙‍♂️ Mentor Explanation System**: Instant educational feedback formatted in clean Markdown whenever a question is missed.
- **💾 Persistent Progression (Supabase)**: Saves user levels, XP history, theme preferences, and completed quests.
- **🎨 Retro Aesthetics**:
  - CRT screen scanlines, glowing text, and authentic pixel-art borders.
  - Custom audio sound synthesizer for attacks, clicks, level-ups, and damage SFX.
  - Custom PNG pixel icon support (`/public/assets/`).
- **💻 Secret Hacker Terminal**: Press <kbd>/</kbd> anywhere in the app to launch a retro cheat console!

---

## 🕹️ Secret Shortcuts & Console Commands

### **Global Keyboard Shortcuts**
| Key | Action |
|---|---|
| <kbd>/</kbd> | Open / Toggle the Secret Command Terminal |
| <kbd>Esc</kbd> | Close the Secret Command Terminal |

### **Terminal Console Commands**
Type `/help` or any of the following inside the terminal:
- `god` — Activate **God Mode** (invincibility & auto-correct answers for 60s)
- `matrix` — Trigger a 10-second green Matrix code rain visual effect
- `glitch` — Trigger a retro screen distortion effect
- `xp <number>` — Manually grant experience points to your profile (e.g., `xp 500`)
- `dark` / `light` — Switch system visual theme
- `whoami` — View current player identity & active session info
- `reset yes` — Reset account game progress and restart leveling
- `clear` — Clear terminal output history

---

## 🏗️ Architecture & Tech Stack
┌──────────────────────────────────────────────────────────┐
│ Client (SPA) │
│ React 19 • TypeScript • Tailwind CSS • Motion • Vite │
└──────────────┬────────────────────────────┬──────────────┘
│ │
(Auth & Profile Sync) (Quest Generation POST)
▼ ▼
┌──────────────────────────────┐ ┌───────────────────────────┐
│ Supabase │ │ Netlify Serverless Func │
│ PostgreSQL Auth & Database │ │ /generate-quest.ts │
└──────────────────────────────┘ └─────────────┬─────────────┘
│ (GEMINI_API_KEY)
▼
┌───────────────────────────┐
│ Google Gemini API │
└───────────────────────────┘
code
Code
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion, Lucide Icons
- **AI Integration**: Google Gemini via serverless Netlify Functions (zero API key exposure in the browser)
- **Backend & Auth**: Supabase (PostgreSQL, GoTrue Authentication)
- **Deployment**: Netlify / Cloud Run

---
