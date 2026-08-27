-- Resume Builder table for CampusConnect.
-- Run in the Supabase SQL editor of the existing CampusConnect project.
-- Reuses the existing auth.users table for user_id — no new auth system.

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_name text not null default 'Untitled Resume',
  template text not null default 'modern',
  resume_data jsonb not null default '{}'::jsonb,
  completion_percentage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes(user_id);

alter table public.resumes enable row level security;

create policy "Users can view their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);
