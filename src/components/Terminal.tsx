import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: {
    [key: string]: (args: string[]) => void;
  };
  user: any;
}

export const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, commands, user }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['SYSTEM TERMINAL v1.0 — ACCESS GRANTED. Type "help" for commands.']);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const [cmd, ...args] = input.trim().toLowerCase().split(' ');
    setHistory(prev => [...prev, `> ${input}`]);
    playSound('click');

    if (commands[cmd]) {
      commands[cmd](args);
    } else if (cmd === 'help') {
      setHistory(prev => [...prev, 
        'AVAILABLE COMMANDS:',
        'dark          → switch to dark mode',
        'light         → switch to light mode',
        'matrix        → trigger a 10-second Matrix rain animation overlay',
        'god           → toggle god mode (all answers marked correct for 60 seconds)',
        'xp [number]   → add that many XP points to the current session',
        'clear         → clear terminal history',
        'whoami        → show current player name, class, level, and total XP',
        'reset         → confirm and reset all progress',
        'glitch        → trigger a 5-second glitch/CRT distortion animation'
      ]);
    } else if (cmd === 'clear') {
      setHistory([]);
    } else if (cmd === 'whoami') {
      setHistory(prev => [...prev, 
        `NAME: ${user?.display_name || 'Unknown Hero'}`,
        `CLASS: ${user?.character_class || 'Warrior'}`,
        `LEVEL: ${user?.level || 1}`,
        `TOTAL XP: ${user?.xp || 0}`
      ]);
    } else {
      setHistory(prev => [...prev, `Unknown command: ${cmd}`]);
    }

    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed top-0 left-0 w-full h-1/2 bg-black border-b-4 border-green-500 z-[100] font-mono p-4 overflow-hidden flex flex-col shadow-2xl"
        >
          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10" />
          
          <div className="flex justify-between items-center mb-4 border-b border-green-500 pb-2">
            <div className="flex items-center gap-2 text-green-500">
              <TerminalIcon size={20} />
              <span className="text-sm">QUEST_OS v1.0</span>
            </div>
            <button onClick={onClose} className="text-green-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto text-green-500 space-y-1 mb-4 scrollbar-hide">
            {history.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap">{line}</div>
            ))}
          </div>

          <form onSubmit={handleCommand} className="flex items-center gap-2 text-green-500">
            <span>{'>'}</span>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-green-500 caret-green-500"
              spellCheck={false}
            />
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
