import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { useSound } from '../hooks/useSound';
import { Shield, Sparkles, KeyRound, Mail } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { playSound } = useSound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    playSound('click');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.session) {
          setSuccess('Account created! Logging in...');
        } else {
          setSuccess('Check your email for the confirmation link!');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#060719] theme-dark">
      <div className="scanlines" />
      <div className="crt-vignette" />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md pixel-card p-8 space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-accent-box)] border-2 border-black shadow-[2px_2px_0_0_#000] text-xs font-bold text-[var(--accent-yellow)] mb-2">
            <Shield size={14} />
            AI QUEST ARCHIVES
          </div>
          <h1 className="text-2xl font-bold text-[var(--accent-yellow)] crt-glow tracking-tight">
            {isLogin ? 'LOAD SAVE FILE' : 'CREATE NEW HERO'}
          </h1>
          <p className="text-[10px] text-[var(--text-muted)] font-mono">
            {isLogin ? 'INSERT COIN TO CONTINUE YOUR JOURNEY' : 'REGISTER TO RECORD YOUR XP & PROGRESS'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-main)] block uppercase flex items-center gap-1.5">
              <Mail size={12} className="text-[var(--accent-cyan)]" />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@study.app"
              className="pixel-input w-full p-3.5 text-xs font-mono font-bold text-[var(--text-main)]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-main)] block uppercase flex items-center gap-1.5">
              <KeyRound size={12} className="text-[var(--accent-yellow)]" />
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pixel-input w-full p-3.5 text-xs font-mono font-bold text-[var(--text-main)]"
              required
            />
          </div>

          {error && (
            <div className="text-[10px] font-mono text-red-400 bg-red-950/40 p-3 border-2 border-red-500 shadow-[2px_2px_0_0_#000]">
              ⚠️ ERROR: {error}
            </div>
          )}

          {success && (
            <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-3 border-2 border-emerald-500 shadow-[2px_2px_0_0_#000]">
              ✨ SUCCESS: {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            onMouseEnter={() => playSound('hover')}
            className="pixel-button w-full py-4 text-xs font-bold bg-[var(--accent-yellow)] text-black disabled:opacity-50"
          >
            {loading ? 'INITIALIZING...' : isLogin ? 'CONTINUE QUEST' : 'START GAME'}
          </button>
        </form>

        <div className="text-center pt-2 border-t-2 border-black/20">
          <button 
            onClick={() => {
              playSound('click');
              setIsLogin(!isLogin);
            }}
            onMouseEnter={() => playSound('hover')}
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)] underline cursor-pointer font-mono"
          >
            {isLogin ? 'NEW PLAYER? CREATE SAVE FILE' : 'ALREADY HAVE A SAVE? LOG IN'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
