import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sword, Zap, ShieldAlert, Award } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 max-w-lg mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full pixel-card p-8 space-y-6 text-center"
        >
          <motion.h2 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`text-3xl font-bold crt-glow ${
              isVictory ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
            }`}
          >
            {battleResult.toUpperCase()}!
          </motion.h2>

          <p className="text-xs leading-relaxed font-sans font-semibold text-[var(--text-main)]">
            {isVictory 
              ? "🎉 You vanquished the dungeon monster and conquered the topic!" 
              : isEscaped 
                ? "🏃 The monster escaped! Practice your knowledge to defeat it next time."
                : "💀 You fell in battle... Revisit the mentor explanations to level up!"}
          </p>

          <div className="p-4 bg-[var(--bg-accent-box)] border-3 border-black shadow-[3px_3px_0_0_#000] inline-block font-bold text-lg text-[var(--accent-yellow)]">
            +{isVictory ? 500 : isEscaped ? 100 : 0} XP GAINED
          </div>

          <div>
            <button 
              onClick={() => onComplete(isVictory ? 500 : isEscaped ? 100 : 0)} 
              onMouseEnter={() => playSound('hover')}
              className="pixel-button w-full py-4 bg-[var(--accent-yellow)] text-black"
            >
              RETURN TO MAP
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative h-full flex flex-col space-y-6 ${shake ? 'animate-bounce' : ''}`}>
      {/* Battle Arena Stage */}
      <div className="pixel-card p-6 flex flex-col justify-between relative overflow-hidden bg-[var(--bg-card)]">
        {/* Retro Arena Floor Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[var(--bg-accent-box)] border-t-2 border-black opacity-60 pointer-events-none" />

        <div className="grid grid-cols-2 gap-4 items-end relative z-10">
          {/* Fighter / Player Box */}
          <motion.div 
            animate={isAttacking === 'player' ? { x: [0, 30, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[var(--bg-accent-box)] border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center overflow-hidden shrink-0 relative">
              <img 
                src="/assets/fighter.png" 
                alt="Fighter" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                referrerPolicy="no-referrer"
              />
              <span className="text-3xl">🛡️</span>
            </div>
            
            <div className="text-[10px] font-bold text-[var(--text-main)]">HERO FIGHTER</div>
            
            {/* Player HP Bar */}
            <div className="w-full max-w-[160px] space-y-1">
              <div className="flex justify-between text-[8px] font-bold text-[var(--text-sub)]">
                <span>HP</span>
                <span>{playerHp} / 100</span>
              </div>
              <div className="h-4 bg-slate-950 border-2 border-black shadow-[2px_2px_0_0_#000] overflow-hidden relative">
                <motion.div 
                  className="h-full bg-emerald-500" 
                  animate={{ width: `${playerHp}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Monster / Enemy Box */}
          <motion.div 
            animate={isAttacking === 'monster' ? { x: [0, -30, 0] } : { y: [0, -8, 0] }}
            transition={isAttacking === 'monster' ? { duration: 0.3 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-red-950/30 border-4 border-black shadow-[4px_4px_0_0_#000] flex items-center justify-center overflow-hidden shrink-0 relative">
              <img 
                src="/assets/monster.png" 
                alt="Monster" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                referrerPolicy="no-referrer"
              />
              <span className="text-3xl">👾</span>
            </div>
            
            <div className="text-[10px] font-bold text-red-500 truncate max-w-[140px]">
              {currentQuestion.monsterName}
            </div>

            {/* Monster HP Bar */}
            <div className="w-full max-w-[160px] space-y-1">
              <div className="flex justify-between text-[8px] font-bold text-[var(--text-sub)]">
                <span>HP</span>
                <span>{monsterHp} / 100</span>
              </div>
              <div className="h-4 bg-slate-950 border-2 border-black shadow-[2px_2px_0_0_#000] overflow-hidden relative">
                <motion.div 
                  className="h-full bg-red-500" 
                  animate={{ width: `${monsterHp}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Question Counter */}
        <div className="mt-4 pt-3 border-t-2 border-black/20 flex justify-between items-center text-[9px] font-bold text-[var(--text-muted)]">
          <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
          <span>STAGE: {currentQuestion.monsterName.toUpperCase()}</span>
        </div>
      </div>

      {/* Question & Answer Box */}
      <div className="pixel-card p-6 min-h-[260px] flex flex-col justify-between space-y-6">
        <div className="text-xs sm:text-sm font-bold text-[var(--text-main)] leading-relaxed font-sans">
          {currentQuestion.question}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((opt, i) => (
            <button 
              key={i}
              onMouseEnter={() => playSound('hover')}
              onClick={() => handleAnswer(opt)}
              disabled={!!explanation || !!isAttacking}
              className="text-left p-3.5 border-3 border-black bg-[var(--option-btn-bg)] hover:bg-[var(--option-btn-hover-bg)] text-[var(--option-btn-text)] shadow-[3px_3px_0_0_#000] active:translate-y-0.5 transition-all cursor-pointer font-pixel text-xs flex items-center gap-3 disabled:opacity-50"
            >
              <span className="bg-[var(--accent-yellow)] text-black border-2 border-black font-bold px-2 py-0.5 text-[10px] shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-sans font-semibold text-xs leading-snug">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Modal */}
      <AnimatePresence>
        {explanation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-xl w-full pixel-card p-6 sm:p-8 space-y-6 bg-[var(--bg-card-solid)] border-4 border-black shadow-[8px_8px_0_0_#000]"
            >
              <div className="flex items-center gap-4 border-b-3 border-black pb-4">
                <div className="w-14 h-14 bg-[var(--bg-accent-box)] border-3 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center overflow-hidden shrink-0">
                  <img 
                    src="/assets/mentor.png" 
                    alt="Mentor" 
                    className="w-10 h-10 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-2xl">🧙‍♂️</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--accent-yellow)]">THE MENTOR SPEAKS</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">"Listen closely, young hero..."</p>
                </div>
              </div>

              <div className="text-xs leading-relaxed font-sans text-[var(--text-main)] bg-[var(--bg-accent-box)] p-4 border-2 border-black space-y-2">
                <ReactMarkdown>{explanation}</ReactMarkdown>
              </div>

              <button 
                onClick={handleContinue} 
                onMouseEnter={() => playSound('hover')}
                className="pixel-button w-full py-4 bg-[var(--accent-yellow)] text-black"
              >
                I UNDERSTAND — CONTINUE BATTLE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
