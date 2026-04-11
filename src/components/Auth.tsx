import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { useSound } from '../hooks/useSound';

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
      if (!supabase) throw new Error('Supabase is not configured');
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-black/80 p-8 pixel-border space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-yellow-400 crt-glow">
            {isLogin ? 'LOAD SAVE FILE' : 'CREATE NEW HERO'}
          </h1>
          <p className="text-[10px] text-theme-muted">
            {isLogin ? 'INSERT COIN TO CONTINUE' : 'BEGIN YOUR JOURNEY'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] block text-theme-text">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border-2 border-theme-border p-3 text-xs outline-none focus:border-yellow-400 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] block text-theme-text">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border-2 border-theme-border p-3 text-xs outline-none focus:border-yellow-400 text-white"
              required
            />
          </div>

          {error && (
            <div className="text-[10px] text-red-500 bg-red-500/10 p-2 border border-red-500">
              ERROR: {error}
            </div>
          )}

          {success && (
            <div className="text-[10px] text-green-400 bg-green-400/10 p-2 border border-green-400">
              SUCCESS: {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            onMouseEnter={() => playSound('hover')}
            className="pixel-button w-full py-4 text-sm bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50"
          >
            {loading ? 'LOADING...' : isLogin ? 'CONTINUE' : 'START GAME'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => {
              playSound('click');
              setIsLogin(!isLogin);
            }}
            onMouseEnter={() => playSound('hover')}
            className="text-[10px] text-theme-muted hover:text-theme-text underline"
          >
            {isLogin ? 'NEW PLAYER? SIGN UP' : 'ALREADY HAVE A SAVE? LOGIN'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
