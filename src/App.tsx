/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { Auth } from './components/Auth';
import { Terminal } from './components/Terminal';
import { QuestSetup } from './components/QuestSetup';
import { BattleScreen } from './components/BattleScreen';
import { MatrixRain } from './components/MatrixRain';
import { generateQuest, Question } from './services/ai';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, User, Settings, LogOut, Sun, Moon, Flame, Shield, Sparkles, Terminal as TerminalIcon, CheckCircle2, Compass, Swords } from 'lucide-react';
import { supabase } from './lib/supabase';

function NavTab({ 
  active, 
  onClick, 
  onMouseEnter, 
  imgSrc, 
  fallbackIcon: Icon, 
  label, 
  activeColor 
}: { 
  active: boolean; 
  onClick: () => void; 
  onMouseEnter: () => void; 
  imgSrc: string; 
  fallbackIcon: React.ElementType; 
  label: string; 
  activeColor: string; 
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <button 
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
        active 
          ? `bg-[var(--bg-accent-box)] border-2 border-black shadow-[2px_2px_0_0_#000] px-3.5 py-1 ${activeColor} font-bold` 
          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] px-3.5 py-1'
      }`}
    >
      {!imgFailed ? (
        <img 
          src={imgSrc} 
          alt={label} 
          className="w-5 h-5 object-contain shrink-0" 
          onError={() => setImgFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <Icon size={18} className="shrink-0" />
      )}
      <span className="text-[9px] font-pixel uppercase">{label}</span>
    </button>
  );
}

export default function App() {
  const {
    user,
    loading,
    dbError,
    updateProgress,
    setTheme,
    resetProgress,
    saveQuest,
    isGodMode,
    setIsGodMode,
    isGlitchActive,
    setIsGlitchActive,
    isMatrixActive,
    setIsMatrixActive,
  } = useGame();

  const { playSound } = useSound();

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'setup' | 'battle' | 'profile' | 'rankings' | 'options'>('setup');
  const [currentQuest, setCurrentQuest] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Terminal Commands
  const commands = {
    dark: () => setTheme('dark'),
    light: () => setTheme('light'),
    matrix: () => {
      setIsMatrixActive(true);
      setTimeout(() => setIsMatrixActive(false), 10000);
    },
    god: () => {
      setIsGodMode(true);
      setTimeout(() => setIsGodMode(false), 60000);
    },
    xp: (args: string[]) => {
      const amount = parseInt(args[0]);
      if (!isNaN(amount)) updateProgress(amount);
    },
    glitch: () => {
      setIsGlitchActive(true);
      setTimeout(() => setIsGlitchActive(false), 5000);
    },
    reset: (args: string[]) => {
      if (args[0] === 'yes') {
        resetProgress();
      } else {
        console.log('Type "reset yes" to confirm');
      }
    }
  };

  // Keyboard listener for terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartQuest = async (topic: string, difficulty: number) => {
    setIsGenerating(true);
    try {
      const quest = await generateQuest(topic, difficulty);
      setCurrentQuest(quest.questions);
      await saveQuest(quest);
      setCurrentView('battle');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBattleComplete = (xpGain: number) => {
    updateProgress(xpGain);
    setCurrentView('setup');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060719] flex flex-col items-center justify-center text-green-400 font-mono gap-4 p-4">
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.98, 1.02, 0.98] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-lg font-bold border-4 border-black p-6 bg-black shadow-[4px_4px_0_0_#000] text-center"
        >
          🎮 BOOTING SYSTEM...
        </motion.div>
        {dbError && (
          <>
            <div className="text-[10px] text-red-400 max-w-sm text-center border-4 border-black p-4 bg-red-950/80 shadow-[4px_4px_0_0_#000]">
              {dbError}
            </div>
            <button 
              onClick={() => supabase?.auth.signOut()}
              className="text-[10px] text-yellow-400 underline hover:text-white"
            >
              LOGOUT AND RETRY
            </button>
          </>
        )}
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#060719] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-yellow-400 crt-glow">CONFIGURATION REQUIRED</h1>
        <div className="max-w-md bg-[#0d0e2e] p-6 pixel-card space-y-4">
          <p className="text-xs leading-relaxed text-slate-300">
            To begin your quest, you must link your Supabase account.
          </p>
          <p className="text-[10px] text-left text-cyan-400 font-mono bg-black/60 p-4 border-2 border-black">
            1. Open your Netlify Dashboard (or AI Studio Secrets).<br/>
            2. Add VITE_SUPABASE_URL<br/>
            3. Add VITE_SUPABASE_ANON_KEY<br/>
            4. Add GEMINI_API_KEY
          </p>
          <p className="text-[10px] text-slate-400 italic">
            Once configured, the system will reboot automatically.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const currentXpProgress = (user.xp % 1000) / 10; // percentage
  const completedQuestsEstimate = Math.max(1, Math.floor(user.xp / 250));

  return (
    <div className={`min-h-screen transition-colors duration-300 theme-${user.theme_preference} ${isGlitchActive ? 'animate-pulse' : ''}`}>
      <div className="scanlines" />
      <div className="crt-vignette" />
      
      {isMatrixActive && <MatrixRain />}

      {/* Header / HUD */}
      <header className="fixed top-0 left-0 w-full px-4 py-3 z-40 bg-[var(--bg-hud)] border-b-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.2)] flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[var(--bg-accent-box)] border-3 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src="/assets/profile.png" 
              alt="Avatar" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                // Fallback emoji if PNG fails to render
                e.currentTarget.style.display = 'none';
              }}
              referrerPolicy="no-referrer"
            />
            <span className="text-lg">🛡️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-[var(--accent-yellow)] bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/30 rounded-none">
                LVL {user.level}
              </span>
              <span className="text-[9px] font-bold text-[var(--accent-cyan)] uppercase">
                {user.character_class}
              </span>
            </div>
            <div className="text-xs font-bold text-[var(--text-main)] truncate max-w-[130px] sm:max-w-[180px] mt-0.5">
              {user.display_name}
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex-1 max-w-xs mx-6 hidden md:block">
          <div className="flex justify-between text-[9px] font-bold mb-1 text-[var(--text-sub)]">
            <span>XP: {user.xp % 1000} / 1000</span>
            <span>TOTAL: {user.xp}</span>
          </div>
          <div className="h-4 bg-slate-950 border-2 border-black shadow-[2px_2px_0_0_#000] overflow-hidden relative p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${currentXpProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle Button */}
          <button
            onClick={() => {
              playSound('click');
              setTheme(user.theme_preference === 'dark' ? 'light' : 'dark');
            }}
            onMouseEnter={() => playSound('hover')}
            title="Toggle Light/Dark Theme"
            className="p-2 bg-[var(--chip-bg)] border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-[var(--chip-hover-bg)] text-[var(--text-main)] active:translate-y-0.5 transition-all"
          >
            {user.theme_preference === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-800" />}
          </button>

          {/* Terminal Hint Button */}
          <button
            onClick={() => {
              playSound('click');
              setIsTerminalOpen(prev => !prev);
            }}
            onMouseEnter={() => playSound('hover')}
            title="Open Secret Terminal (/)"
            className="p-2 bg-[var(--chip-bg)] border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-[var(--chip-hover-bg)] text-[var(--accent-green)] active:translate-y-0.5 transition-all hidden sm:flex items-center gap-1 text-[10px]"
          >
            <TerminalIcon size={14} />
            <span>/</span>
          </button>

          {/* Sign Out Button */}
          <button 
            onClick={() => {
              playSound('click');
              supabase?.auth.signOut();
            }} 
            onMouseEnter={() => playSound('hover')}
            title="Sign Out"
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-24 pb-24 min-h-screen max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {currentView === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <QuestSetup onStart={handleStartQuest} loading={isGenerating} />
            </motion.div>
          )}

          {currentView === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <BattleScreen 
                questions={currentQuest} 
                onComplete={handleBattleComplete}
                onExit={() => setCurrentView('setup')}
                isGodMode={isGodMode}
              />
            </motion.div>
          )}

          {/* HERO PROFILE VIEW */}
          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-title)] crt-glow">
                  HERO PROFILE
                </h2>
                <p className="text-xs text-[var(--text-muted)]">STATISTICS & CHARACTER PROGRESSION</p>
              </div>

              <div className="w-full pixel-card p-6 space-y-6">
                {/* Hero Header Card */}
                <div className="flex items-center gap-5 p-4 bg-[var(--bg-accent-box)] border-3 border-black shadow-[3px_3px_0_0_#000]">
                  <div className="w-20 h-20 bg-[var(--bg-card)] border-3 border-black shadow-[3px_3px_0_0_#000] flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src="/assets/profile.png" 
                      alt="Profile" 
                      className="w-14 h-14 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-3xl">⚔️</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-base font-bold text-[var(--text-main)]">{user.display_name}</div>
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 text-[var(--accent-yellow)] px-2 py-0.5 border border-amber-500/40 text-[10px] font-bold">
                      <Flame size={12} />
                      LEVEL {user.level} {user.character_class.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] pt-1">
                      EMAIL: {user.email}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--bg-accent-box)] border-3 border-black shadow-[3px_3px_0_0_#000] space-y-1">
                    <div className="text-[9px] font-bold text-[var(--text-muted)]">TOTAL EXPERIENCE</div>
                    <div className="text-lg font-bold text-[var(--accent-yellow)]">{user.xp} XP</div>
                  </div>
                  <div className="p-4 bg-[var(--bg-accent-box)] border-3 border-black shadow-[3px_3px_0_0_#000] space-y-1">
                    <div className="text-[9px] font-bold text-[var(--text-muted)]">QUESTS COMPLETED</div>
                    <div className="text-lg font-bold text-[var(--accent-green)]">{completedQuestsEstimate}</div>
                  </div>
                </div>

                {/* Class Perks & Powers */}
                <div className="p-4 bg-[var(--bg-accent-box)] border-3 border-black shadow-[3px_3px_0_0_#000] space-y-2">
                  <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Shield size={16} className="text-[var(--accent-cyan)]" />
                    CLASS ADVANTAGE
                  </div>
                  <p className="text-[10px] leading-relaxed text-[var(--text-sub)]">
                    {user.character_class === 'warrior' && '🛡️ WARRIOR: High resilience to damage. Correct answers deal bonus critical attack power!'}
                    {user.character_class === 'mage' && '🔮 MAGE: Arcane wisdom boost. Gains +15% extra XP from complex topic battles!'}
                    {user.character_class === 'rogue' && '🗡️ ROGUE: Agile swift strike. Fast answer selection grants instant combo damage!'}
                  </p>
                </div>

                {/* XP Progress Detail */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-[var(--text-sub)]">
                    <span>NEXT LEVEL PROGRESS</span>
                    <span>{user.xp % 1000} / 1000 XP</span>
                  </div>
                  <div className="h-5 bg-slate-950 border-3 border-black shadow-[2px_2px_0_0_#000] overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                      style={{ width: `${currentXpProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* RANKINGS VIEW */}
          {currentView === 'rankings' && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-title)] crt-glow">
                  HALL OF HEROES
                </h2>
                <p className="text-xs text-[var(--text-muted)]">TOP STUDY WARRIORS LEADERBOARD</p>
              </div>

              <div className="w-full pixel-card p-6 space-y-4">
                {/* Ranking List */}
                <div className="space-y-3">
                  {[
                    { rank: '🥇 1ST', name: 'CyberScholar', level: 12, xp: 11400, class: 'MAGE' },
                    { rank: '🥈 2ND', name: 'AetherKnight', level: 9, xp: 8250, class: 'WARRIOR' },
                    { rank: '🥉 3RD', name: 'PixelNinja', level: 7, xp: 6100, class: 'ROGUE' },
                    { rank: '4TH', name: user.display_name, level: user.level, xp: user.xp, class: user.character_class.toUpperCase(), isCurrent: true },
                    { rank: '5TH', name: 'CodeSlayer', level: 3, xp: 2100, class: 'WARRIOR' },
                  ].map((hero, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 border-3 border-black flex items-center justify-between text-xs font-pixel ${
                        hero.isCurrent 
                          ? 'bg-amber-500/20 border-amber-500 shadow-[3px_3px_0_0_#000]' 
                          : 'bg-[var(--bg-accent-box)] shadow-[2px_2px_0_0_#000]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[10px] w-12 text-[var(--accent-yellow)]">{hero.rank}</span>
                        <div>
                          <div className="font-bold text-[var(--text-main)] flex items-center gap-2">
                            {hero.name}
                            {hero.isCurrent && <span className="text-[8px] bg-amber-500 text-black px-1 font-bold">(YOU)</span>}
                          </div>
                          <div className="text-[8px] text-[var(--text-muted)]">LVL {hero.level} {hero.class}</div>
                        </div>
                      </div>
                      <div className="text-right font-bold text-[var(--accent-green)]">
                        {hero.xp} XP
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-center text-[var(--text-muted)] pt-2">
                  ⚔️ Gain XP in battles to climb the global rankings!
                </p>
              </div>
            </motion.div>
          )}

          {/* OPTIONS VIEW */}
          {currentView === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-title)] crt-glow">
                  SYSTEM OPTIONS
                </h2>
                <p className="text-xs text-[var(--text-muted)]">CUSTOMIZE VISUALS & GAME CONFIGURATION</p>
              </div>

              <div className="w-full pixel-card p-6 space-y-6">
                {/* Theme Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[var(--text-main)] block">VISUAL THEME MODE</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Dark Mode Card */}
                    <button
                      onClick={() => {
                        playSound('click');
                        setTheme('dark');
                      }}
                      className={`p-4 border-3 border-black text-left cursor-pointer transition-all ${
                        user.theme_preference === 'dark'
                          ? 'bg-[#0d0e2e] text-cyan-400 shadow-[4px_4px_0_0_#000] ring-2 ring-cyan-400'
                          : 'bg-[#0d0e2e]/50 text-slate-400 opacity-70 hover:opacity-100 shadow-[2px_2px_0_0_#000]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>🌙 DARK CYBER</span>
                        {user.theme_preference === 'dark' && <CheckCircle2 size={16} className="text-cyan-400" />}
                      </div>
                    </button>

                    {/* Light Mode Card */}
                    <button
                      onClick={() => {
                        playSound('click');
                        setTheme('light');
                      }}
                      className={`p-4 border-3 border-black text-left cursor-pointer transition-all ${
                        user.theme_preference === 'light'
                          ? 'bg-white text-slate-900 shadow-[4px_4px_0_0_#000] ring-2 ring-amber-500'
                          : 'bg-white/80 text-slate-700 opacity-70 hover:opacity-100 shadow-[2px_2px_0_0_#000]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>☀️ LIGHT PAPER</span>
                        {user.theme_preference === 'light' && <CheckCircle2 size={16} className="text-amber-600" />}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Terminal Commands Guide */}
                <div className="p-4 bg-[var(--bg-accent-box)] border-3 border-black shadow-[3px_3px_0_0_#000] space-y-2">
                  <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                    <TerminalIcon size={16} className="text-[var(--accent-green)]" />
                    SECRET CHEAT TERMINAL
                  </div>
                  <p className="text-[10px] text-[var(--text-sub)] leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 bg-black text-green-400 font-mono border border-black">/</kbd> key anywhere in the app to open the secret command console!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full p-3 z-40 bg-[var(--bg-hud)] border-t-4 border-black shadow-[0_-4px_0_0_rgba(0,0,0,0.15)] flex justify-around items-center transition-colors">
        <NavTab 
          active={currentView === 'setup' || currentView === 'battle'}
          onClick={() => {
            playSound('click');
            setCurrentView('setup');
          }}
          onMouseEnter={() => playSound('hover')}
          imgSrc="/assets/quests.png"
          fallbackIcon={Swords}
          label="QUESTS"
          activeColor="text-[var(--accent-cyan)]"
        />

        <NavTab 
          active={currentView === 'rankings'}
          onClick={() => {
            playSound('click');
            setCurrentView('rankings');
          }}
          onMouseEnter={() => playSound('hover')}
          imgSrc="/assets/rankings.png"
          fallbackIcon={Trophy}
          label="RANKINGS"
          activeColor="text-[var(--accent-yellow)]"
        />

        <NavTab 
          active={currentView === 'profile'}
          onClick={() => {
            playSound('click');
            setCurrentView('profile');
          }}
          onMouseEnter={() => playSound('hover')}
          imgSrc="/assets/profile.png"
          fallbackIcon={User}
          label="PROFILE"
          activeColor="text-[var(--accent-green)]"
        />

        <NavTab 
          active={currentView === 'options'}
          onClick={() => {
            playSound('click');
            setCurrentView('options');
          }}
          onMouseEnter={() => playSound('hover')}
          imgSrc="/assets/options.png"
          fallbackIcon={Settings}
          label="OPTIONS"
          activeColor="text-[var(--text-main)]"
        />
      </nav>

      {/* Secret Terminal */}
      <Terminal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        commands={commands}
        user={user}
      />

      {/* God Mode Aura */}
      {isGodMode && (
        <div className="fixed inset-0 pointer-events-none border-[16px] border-yellow-400/40 animate-pulse z-30" />
      )}
    </div>
  );
}
