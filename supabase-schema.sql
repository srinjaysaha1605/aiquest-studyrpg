-- Supabase Schema for AI Quest - Study RPG
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

-- Profiles table: stores user game data
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text default 'Hero',
  xp integer default 0,
  level integer default 1,
  streak integer default 0,
  theme_preference text default 'dark' check (theme_preference in ('dark', 'light')),
  character_class text default 'warrior' check (character_class in ('warrior', 'mage', 'rogue')),
  completed_zones text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Quests table: stores completed quest history
create table if not exists public.quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  difficulty integer not null,
  questions jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.quests enable row level security;

-- Profiles policies: users can read/insert/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Quests policies: users can read/insert their own quests
create policy "Users can view own quests"
  on public.quests for select
  using (auth.uid() = user_id);

create policy "Users can insert own quests"
  on public.quests for insert
  with check (auth.uid() = user_id);
