import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Compass, Flame, Shield, Award } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface QuestSetupProps {
  onStart: (topic: string, difficulty: number) => void;
  loading: boolean;
}

export const QuestSetup: React.FC<QuestSetupProps> = ({ onStart, loading }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const { playSound } = useSound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      playSound('click');
      onStart(topic.trim(), difficulty);
    }
  };

  const getDifficultyTier = (level: number) => {
    if (level < 4) return { label: 'EASY', color: 'text-emerald-600 bg-emerald-500/20 border-emerald-600', icon: '🌱' };
    if (level < 8) return { label: 'NORMAL', color: 'text-amber-600 bg-amber-500/20 border-amber-600', icon: '⚔️' };
    return { label: 'HEROIC', color: 'text-red-600 bg-red-500/20 border-red-600', icon: '🔥' };
  };

  const currentTier = getDifficultyTier(difficulty);

  return (
    <div className="flex flex-col items-center justify-center h-full p-2 sm:p-4 space-y-8 sm:space-y-10 max-w-xl mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <motion.div 
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-accent-box)] border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-bold text-[var(--accent-cyan)]"
        >
          <Compass size={14} />
          DUNGEON SETUP
        </motion.div>
        <h2 className="text-2xl sm:text-4xl font-bold text-[var(--text-title)] crt-glow tracking-tight">
          SELECT YOUR ZONE
        </h2>
      </div>

      {/* Main Quest Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[var(--text-main)] block uppercase">
            QUEST TOPIC / SUBJECT
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={20} />
            <input
              type="text"
              placeholder="e.g. Quantum Physics, World War II, JavaScript..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="pixel-input w-full p-4 pl-12 text-xs sm:text-sm font-pixel text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
              required
            />
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="p-4 bg-[var(--bg-accent-box)] border-3 border-black shadow-[3px_3px_0_0_#000] space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-[var(--text-main)]">DIFFICULTY LEVEL: {difficulty} / 10</span>
            <span className={`px-2 py-0.5 border-2 border-black shadow-[1px_1px_0_0_#000] font-bold text-[9px] ${currentTier.color}`}>
              {currentTier.icon} {currentTier.label}
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            className="w-full accent-[var(--accent-yellow)] h-3 bg-slate-900 border-2 border-black rounded-none cursor-pointer appearance-none"
          />

          <div className="flex justify-between text-[8px] text-[var(--text-muted)] font-mono">
            <span>LVL 1 (RECRUIT)</span>
            <span>LVL 5 (VETERAN)</span>
            <span>LVL 10 (CHAMPION)</span>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || !topic.trim()}
          onMouseEnter={() => playSound('hover')}
          className="pixel-button w-full py-5 text-sm flex items-center justify-center gap-3 bg-[var(--accent-yellow)] text-black hover:brightness-110 disabled:opacity-50"
        >
          {loading ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles size={20} />
              </motion.div>
              <span>GENERATING DUNGEON...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>START QUEST BATTLE</span>
            </>
          )}
        </button>
      </form>

      {/* Popular Topics Quick Pick */}
      <div className="w-full space-y-3">
        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase text-center">
          QUICK START POPULAR ZONES
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { name: 'History', icon: '🏛️' },
            { name: 'Science', icon: '🧪' },
            { name: 'Coding', icon: '💻' },
            { name: 'Math', icon: '📐' },
            { name: 'Literature', icon: '📚' },
            { name: 'Art', icon: '🎨' },
          ].map((item) => (
            <button
              key={item.name}
              type="button"
              onMouseEnter={() => playSound('hover')}
              onClick={() => {
                playSound('click');
                setTopic(item.name);
              }}
              className="p-3 border-3 border-[var(--chip-border)] bg-[var(--chip-bg)] hover:bg-[var(--chip-hover-bg)] text-[var(--chip-text)] shadow-[3px_3px_0_0_#000] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-[10px] font-bold font-pixel cursor-pointer"
            >
              <span>{item.icon}</span>
              <span>{item.name.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
