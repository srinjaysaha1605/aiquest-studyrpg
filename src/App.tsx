/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { Auth } from './components/Auth';
import { Terminal } from './components/Terminal';
import { QuestSetup } from './components/QuestSetup';
import { BattleScreen } from './components/BattleScreen';
import { MatrixRain } from './components/MatrixRain';
import { generateQuest, Question } from './services/ai';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, User, Map as MapIcon, Settings, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-green-500 font-mono gap-4">
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          BOOTING SYSTEM...
        </motion.div>
        {dbError && (
          <>
            <div className="text-[10px] text-red-500 max-w-xs text-center border border-red-500 p-2 bg-red-500/10">
              {dbError}
            </div>
            <button 
              onClick={() => supabase?.auth.signOut()}
              className="text-[10px] text-theme-muted underline hover:text-theme-text"
            >
              LOGOUT AND TRY AGAIN
            </button>
          </>
        )}
      </div>
    );
  }

  if (!supabase) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="text-2xl font-bold text-yellow-400 crt-glow">CONFIGURATION REQUIRED</h1>
        <div className="max-w-md bg-gray-900 p-6 pixel-border space-y-4">
          <p className="text-xs leading-relaxed text-theme-muted">
            To begin your quest, you must link your Supabase account.
          </p>
          <p className="text-[10px] text-left text-cyan-400 font-mono">
            1. Open your Netlify Dashboard (or AI Studio Secrets).<br/>
            2. Add VITE_SUPABASE_URL<br/>
            3. Add VITE_SUPABASE_ANON_KEY<br/>
            4. Add GEMINI_API_KEY
          </p>
          <p className="text-[10px] text-theme-muted italic">
            Once configured, the system will reboot automatically.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 theme-${user.theme_preference} ${isGlitchActive ? 'animate-pulse' : ''}`}>
      <div className="scanlines" />
      
      {isMatrixActive && <MatrixRain />}

      {/* Header / HUD */}
      <header className="fixed top-0 left-0 w-full p-4 z-40 bg-black/50 border-b-4 border-black flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-800 pixel-border flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <div className="text-[10px] text-theme-muted">LVL {user.level} {user.character_class.toUpperCase()}</div>
            <div className="text-xs font-bold text-theme-text">{user.display_name}</div>
          </div>
        </div>

        <div className="flex-1 max-w-xs mx-8 hidden md:block">
          <div className="flex justify-between text-[8px] mb-1 text-theme-muted">
            <span>XP: {user.xp % 1000} / 1000</span>
            <span>TOTAL: {user.xp}</span>
          </div>
          <div className="h-3 bg-gray-900 border-2 border-black">
            <motion.div 
              className="h-full bg-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${(user.xp % 1000) / 10}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              playSound('click');
              supabase?.auth.signOut();
            }} 
            onMouseEnter={() => playSound('hover')}
            className="p-2 hover:bg-theme-border transition-colors text-theme-text"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-20 min-h-screen max-w-4xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {currentView === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <QuestSetup onStart={handleStartQuest} loading={isGenerating} />
            </motion.div>
          )}

          {currentView === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
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

          {currentView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center"
            >
              <div className="w-24 h-24 bg-blue-900 pixel-border flex items-center justify-center overflow-hidden">
                <img 
                  src="/assets/profile.png" 
                  alt="Profile" 
                  className="w-16 h-16 object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-2xl font-bold text-cyan-400 crt-glow">HERO PROFILE</h2>
              <div className="bg-gray-900/50 p-6 pixel-border w-full max-w-md space-y-4 font-mono text-left">
                <p className="text-sm"><span className="text-theme-muted">NAME:</span> {user.display_name}</p>
                <p className="text-sm"><span className="text-theme-muted">CLASS:</span> {user.character_class.toUpperCase()}</p>
                <p className="text-sm"><span className="text-theme-muted">LEVEL:</span> {user.level}</p>
                <p className="text-sm"><span className="text-theme-muted">TOTAL XP:</span> {user.xp}</p>
                <div className="pt-4 border-t border-theme-border text-[10px] text-yellow-400 animate-pulse">
                  [ FEATURE UNDER CONSTRUCTION ]
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'rankings' && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center"
            >
              <div className="w-24 h-24 bg-yellow-900 pixel-border flex items-center justify-center overflow-hidden">
                <img 
                  src="/assets/rankings.png" 
                  alt="Rankings" 
                  className="w-16 h-16 object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400 crt-glow">GLOBAL RANKINGS</h2>
              <div className="bg-gray-900/50 p-6 pixel-border w-full max-w-md space-y-4">
                <p className="text-xs text-theme-muted">Connecting to Hall of Fame...</p>
                <div className="h-2 bg-gray-800 overflow-hidden">
                  <motion.div 
                    animate={{ x: [-100, 400] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-24 h-full bg-yellow-400"
                  />
                </div>
                <p className="text-[10px] text-yellow-400 animate-pulse">
                  [ LEADERBOARD UNDER CONSTRUCTION ]
                </p>
              </div>
            </motion.div>
          )}

          {currentView === 'options' && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center"
            >
              <div className="w-24 h-24 bg-gray-800 pixel-border flex items-center justify-center overflow-hidden">
                <img 
                  src="/assets/options.png" 
                  alt="Options" 
                  className="w-16 h-16 object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <h2 className="text-2xl font-bold text-theme-muted crt-glow">SYSTEM OPTIONS</h2>
              <div className="bg-gray-900/50 p-6 pixel-border w-full max-w-md space-y-4">
                <div className="flex justify-between items-center p-2 border border-theme-border">
                  <span className="text-xs">THEME</span>
                  <button 
                    onClick={() => {
                      playSound('click');
                      setTheme(user.theme_preference === 'dark' ? 'light' : 'dark');
                    }}
                    className="text-[10px] bg-theme-border px-3 py-1 hover:bg-white/20"
                  >
                    {user.theme_preference.toUpperCase()}
                  </button>
                </div>
                <p className="text-[10px] text-yellow-400 animate-pulse pt-4">
                  [ ADDITIONAL SETTINGS UNDER CONSTRUCTION ]
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full p-4 z-40 bg-black/50 border-t-4 border-black flex justify-around items-center">
        <button 
          onMouseEnter={() => playSound('hover')}
          onClick={() => {
            playSound('click');
            setCurrentView('setup');
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'setup' || currentView === 'battle' ? 'text-cyan-400' : 'text-theme-muted hover:text-theme-text'}`}
        >
          <img 
            src="/assets/quests.png" 
            alt="" 
            className={`w-5 h-5 object-contain ${currentView === 'setup' || currentView === 'battle' ? '' : 'opacity-50'}`} 
            referrerPolicy="no-referrer"
          />
          <span className="text-[8px]">QUESTS</span>
        </button>
        <button 
          onMouseEnter={() => playSound('hover')}
          onClick={() => {
            playSound('click');
            setCurrentView('rankings');
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'rankings' ? 'text-yellow-400' : 'text-theme-muted hover:text-theme-text'}`}
        >
          <img 
            src="/assets/rankings.png" 
            alt="" 
            className={`w-5 h-5 object-contain ${currentView === 'rankings' ? '' : 'opacity-50'}`} 
            referrerPolicy="no-referrer"
          />
          <span className="text-[8px]">RANKINGS</span>
        </button>
        <button 
          onMouseEnter={() => playSound('hover')}
          onClick={() => {
            playSound('click');
            setCurrentView('profile');
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'profile' ? 'text-blue-400' : 'text-theme-muted hover:text-theme-text'}`}
        >
          <img 
            src="/assets/profile.png" 
            alt="" 
            className={`w-5 h-5 object-contain ${currentView === 'profile' ? '' : 'opacity-50'}`} 
            referrerPolicy="no-referrer"
          />
          <span className="text-[8px]">PROFILE</span>
        </button>
        <button 
          onMouseEnter={() => playSound('hover')}
          onClick={() => {
            playSound('click');
            setCurrentView('options');
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'options' ? 'text-theme-text' : 'text-theme-muted hover:text-theme-text'}`}
        >
          <img 
            src="/assets/options.png" 
            alt="" 
            className={`w-5 h-5 object-contain ${currentView === 'options' ? '' : 'opacity-50'}`} 
            referrerPolicy="no-referrer"
          />
          <span className="text-[8px]">OPTIONS</span>
        </button>
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
        <div className="fixed inset-0 pointer-events-none border-[16px] border-yellow-400/30 animate-pulse z-30" />
      )}
    </div>
  );
}
