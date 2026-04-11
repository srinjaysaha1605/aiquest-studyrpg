import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles } from 'lucide-react';
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

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-12">
      <div className="text-center space-y-4">
        <motion.h2 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-3xl font-bold text-cyan-400 crt-glow"
        >
          SELECT YOUR ZONE
        </motion.h2>
        <p className="text-xs text-theme-muted">Enter a topic to generate a new adventure</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted" size={20} />
          <input
            type="text"
            placeholder="e.g. Quantum Physics, World War II, JavaScript..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-black/50 border-4 border-theme-border p-6 pl-14 text-sm outline-none focus:border-cyan-400 transition-colors text-theme-text"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-[10px] text-theme-muted">
            <span>DIFFICULTY: {difficulty}</span>
            <span>{difficulty < 4 ? 'EASY' : difficulty < 8 ? 'NORMAL' : 'HEROIC'}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !topic.trim()}
          onMouseEnter={() => playSound('hover')}
          className="pixel-button w-full py-6 flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles size={20} />
              </motion.div>
              GENERATING WORLD...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              START QUEST
            </>
          )}
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
        {['History', 'Science', 'Coding', 'Math', 'Literature', 'Art'].map((t) => (
          <button
            key={t}
            onMouseEnter={() => playSound('hover')}
            onClick={() => {
              playSound('click');
              setTopic(t);
            }}
            className="p-3 border-2 border-theme-border text-[10px] hover:border-cyan-400 hover:bg-cyan-400/10 transition-colors text-theme-text"
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
