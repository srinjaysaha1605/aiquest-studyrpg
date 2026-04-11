import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Shield, Sword, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Question } from '../services/ai';
import { useSound } from '../hooks/useSound';

interface BattleScreenProps {
  questions: Question[];
  onComplete: (xpGain: number) => void;
  onExit: () => void;
  isGodMode: boolean;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ questions, onComplete, onExit, isGodMode }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [monsterHp, setMonsterHp] = useState(100);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | 'escaped' | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isAttacking, setIsAttacking] = useState<'player' | 'monster' | null>(null);
  const [shake, setShake] = useState(false);

  const { playSound } = useSound();

  const currentQuestion = questions[currentIdx];

  const checkBattleEnd = (newPlayerHp: number, newMonsterHp: number, isLastQuestion: boolean) => {
    if (newMonsterHp <= 0) {
      setBattleResult('victory');
      playSound('victory');
      return true;
    }
    if (newPlayerHp <= 0) {
      setBattleResult('defeat');
      return true;
    }
    if (isLastQuestion) {
      setBattleResult('escaped');
      return true;
    }
    return false;
  };

  const handleAnswer = (answer: string) => {
    const isCorrect = answer === currentQuestion.correctAnswer || isGodMode;
    const isLast = currentIdx === questions.length - 1;

    playSound('click');

    if (isCorrect) {
      setIsAttacking('player');
      const nextMonsterHp = Math.max(0, monsterHp - 25); // 4 correct answers to kill
      setMonsterHp(nextMonsterHp);
      
      setTimeout(() => {
        setIsAttacking(null);
        if (!checkBattleEnd(playerHp, nextMonsterHp, isLast)) {
          setCurrentIdx(prev => prev + 1);
        }
      }, 1000);
    } else {
      setIsAttacking('monster');
      setShake(true);
      playSound('damage');
      const nextPlayerHp = Math.max(0, playerHp - 25);
      setPlayerHp(nextPlayerHp);
      setExplanation(currentQuestion.explanation);
      
      setTimeout(() => {
        setIsAttacking(null);
        setShake(false);
      }, 1000);
    }
  };

  const handleContinue = () => {
    playSound('click');
    setExplanation(null);
    const isLast = currentIdx === questions.length - 1;
    
    if (!checkBattleEnd(playerHp, monsterHp, isLast)) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  if (battleResult) {
    const isVictory = battleResult === 'victory';
    const isEscaped = battleResult === 'escaped';

    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <motion.h2 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-bold crt-glow ${isVictory ? 'text-yellow-400' : 'text-red-500'}`}
        >
          {battleResult.toUpperCase()}!
        </motion.h2>
        <p className="text-xl text-theme-text">
          {isVictory 
            ? "You defeated the monsters and gained knowledge!" 
            : isEscaped 
              ? "The monster escaped! You need more training."
              : "You were defeated... Study harder, hero!"}
        </p>
        <div className={`text-2xl ${isVictory ? 'text-green-400' : 'text-theme-muted'}`}>
          +{isVictory ? 500 : isEscaped ? 100 : 0} XP
        </div>
        <button 
          onClick={() => onComplete(isVictory ? 500 : isEscaped ? 100 : 0)} 
          onMouseEnter={() => playSound('hover')}
          className="pixel-button mt-8"
        >
          RETURN TO MAP
        </button>
      </div>
    );
  }

  return (
    <div className={`relative h-full flex flex-col p-4 ${shake ? 'animate-bounce' : ''}`}>
      {/* Battle Arena */}
      <div className="flex-1 flex flex-col justify-around items-center relative">
        {/* Monster */}
        <motion.div 
          animate={isAttacking === 'monster' ? { x: [0, -20, 0] } : { y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-32 h-32 bg-red-900 pixel-border flex items-center justify-center overflow-hidden">
            <img 
              src="/assets/monster.png" 
              alt="Monster" 
              className="w-24 h-24 object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-sm font-bold text-theme-text">{currentQuestion.monsterName}</div>
          <div className="w-48 h-4 bg-gray-800 border-2 border-black overflow-hidden">
            <motion.div 
              className="h-full bg-red-500" 
              animate={{ width: `${monsterHp}%` }}
            />
          </div>
        </motion.div>

        {/* Player */}
        <motion.div 
          animate={isAttacking === 'player' ? { x: [0, 20, 0] } : {}}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-24 h-24 bg-blue-900 pixel-border flex items-center justify-center overflow-hidden">
            <img 
              src="/assets/fighter.png" 
              alt="Fighter" 
              className="w-16 h-16 object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="w-48 h-4 bg-gray-800 border-2 border-black overflow-hidden">
            <motion.div 
              className="h-full bg-green-500" 
              animate={{ width: `${playerHp}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-theme-muted">
            <span className="flex items-center gap-1"><Heart size={12} /> {playerHp}</span>
            <span className="flex items-center gap-1"><Sword size={12} /> 15</span>
          </div>
        </motion.div>
      </div>

      {/* Question UI */}
      <div className="bg-black/80 p-6 pixel-border min-h-[250px] flex flex-col">
        <div className="mb-4 text-sm leading-relaxed text-white">
          {currentQuestion.question}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((opt, i) => (
            <button 
              key={i}
              onMouseEnter={() => playSound('hover')}
              onClick={() => handleAnswer(opt)}
              disabled={!!explanation || !!isAttacking}
              className="text-left p-3 border-2 border-white/20 hover:border-white hover:bg-white/10 transition-colors text-xs text-white"
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Modal */}
      <AnimatePresence>
        {explanation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          >
            <div className="max-w-2xl w-full bg-gray-900 p-8 pixel-border space-y-6">
              <div className="flex items-center gap-4 text-yellow-400">
                <div className="w-16 h-16 bg-yellow-900 pixel-border flex items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/mentor.png" 
                    alt="Mentor" 
                    className="w-12 h-12 object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">THE MENTOR SPEAKS</h3>
                  <p className="text-xs text-theme-muted">"Listen closely, young hero..."</p>
                </div>
              </div>
              <div className="text-sm leading-relaxed prose prose-invert max-w-none">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>
              <button 
                onClick={handleContinue} 
                onMouseEnter={() => playSound('hover')}
                className="pixel-button w-full"
              >
                I UNDERSTAND
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
