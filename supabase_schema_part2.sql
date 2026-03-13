-- Run this in Supabase SQL Editor to support the fast JSON sync approach

create table if not exists public.sync_data (
  user_id uuid references public.profiles(id) on delete cascade not null primary key,
  settings jsonb,
  progress jsonb,
  daily_state jsonb,
  bookmarks jsonb,
  custom_words jsonb,
  wrong_answers jsonb,
  gamification jsonb,
  srs jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sync_data enable row level security;

create policy "Users can manage own sync data" 
  on sync_data 
  for all 
  using (auth.uid() = user_id);
