-- Run this entire script in your Supabase SQL Editor

-- 1. Create Profiles Table (Linked to Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar text,
  provider text default 'email',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- 2. Create Settings Table
create table public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  selected_level text default 'topik1-1',
  words_per_day integer default 20,
  show_pronunciation boolean default true,
  course_mode text default '20words'
);

alter table public.user_settings enable row level security;
create policy "Users can view own settings" on user_settings for select using (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings for update using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings for insert with check (auth.uid() = user_id);

-- 3. Create Progress Table
create table public.user_progress (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  total_words_learned integer default 0,
  total_quizzes_taken integer default 0,
  total_correct_answers integer default 0,
  streak integer default 0,
  best_streak integer default 0,
  last_study_date text
);

alter table public.user_progress enable row level security;
create policy "Users can manage own progress" on user_progress for all using (auth.uid() = user_id);

-- 4. Create Wrong Answers
create table public.wrong_answers (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  korean text not null,
  english text not null,
  pronunciation text,
  example text,
  example_translation text,
  wrong_count integer default 1,
  last_wrong_date text,
  sentence text
);

alter table public.wrong_answers enable row level security;
create policy "Users can manage own wrong answers" on wrong_answers for all using (auth.uid() = user_id);

-- 5. Create Gamification (XP & Level)
create table public.gamification (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  total_xp integer default 0,
  level integer default 1
);

alter table public.gamification enable row level security;
create policy "Users can manage own gamification" on gamification for all using (auth.uid() = user_id);
