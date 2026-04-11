import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface GameUser {
  id: string;
  display_name: string;
  email: string;
  xp: number;
  level: number;
  streak: number;
  theme_preference: 'dark' | 'light';
  character_class: 'warrior' | 'mage' | 'rogue';
  completed_zones: string[];
}

export const INITIAL_USER_DATA = {
  display_name: 'Hero',
  xp: 0,
  level: 1,
  streak: 0,
  theme_preference: 'dark' as const,
  character_class: 'warrior' as const,
  completed_zones: [],
};

export function useGame() {
  const [user, setUser] = useState<GameUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isGodMode, setIsGodMode] = useState(false);
  const [isGlitchActive, setIsGlitchActive] = useState(false);
  const [isMatrixActive, setIsMatrixActive] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser.user) {
          const newProfile = {
            id: userId,
            email: authUser.user.email,
            ...INITIAL_USER_DATA,
          };
          const { data: created, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            setDbError('DATABASE ERROR: Could not create profile. Did you run the SQL schema?');
            setLoading(false);
          } else {
            setUser(created);
          }
        } else {
          setLoading(false);
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        setDbError('DATABASE ERROR: Could not fetch profile. Check your SQL schema.');
        setLoading(false);
      } else if (data) {
        setUser(data);
      }
    } catch (err) {
      console.error('Unexpected error in fetchProfile:', err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const updateProgress = useCallback(async (xpGain: number) => {
    if (!user || !supabase) return;

    const newXp = user.xp + xpGain;
    const newLevel = Math.floor(newXp / 1000) + 1;
    
    const updates = {
      xp: newXp,
      level: newLevel,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setUser(data);
    }
  }, [user]);

  const setTheme = useCallback(async (theme: 'dark' | 'light') => {
    if (!user || !supabase) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ theme_preference: theme })
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setUser(data);
    }
  }, [user]);

  const resetProgress = useCallback(async () => {
    if (!user || !supabase) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(INITIAL_USER_DATA)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setUser(data);
    }
  }, [user]);

  const saveQuest = useCallback(async (questData: any) => {
    if (!user || !supabase) return;

    const { error } = await supabase
      .from('quests')
      .insert([{
        user_id: user.id,
        topic: questData.topic,
        difficulty: questData.difficulty,
        questions: questData.questions,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error saving quest:', error);
    }
  }, [user]);

  return {
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
  };
}
