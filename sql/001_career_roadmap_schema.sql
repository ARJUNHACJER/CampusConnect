-- =====================================================================
-- CampusConnect · Career Roadmap feature
-- Migration 001: schema, indexes, RLS policies
-- Run this against your existing Supabase project (same DB, no new project)
-- =====================================================================

-- ---------------------------------------------------------------------
-- roadmaps
-- ---------------------------------------------------------------------
create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,                 -- e.g. 'Full Stack', 'AI/ML', 'Data', 'Cloud', 'Security'
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration text not null,        -- e.g. '5-6 months'
  icon text not null default 'Compass',    -- lucide-react icon name
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- roadmap_phases
-- ---------------------------------------------------------------------
create table if not exists public.roadmap_phases (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_roadmap_phases_roadmap_id on public.roadmap_phases(roadmap_id);
create index if not exists idx_roadmap_phases_order on public.roadmap_phases(roadmap_id, order_index);

-- ---------------------------------------------------------------------
-- roadmap_topics
-- ---------------------------------------------------------------------
create table if not exists public.roadmap_topics (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references public.roadmap_phases(id) on delete cascade,
  title text not null,
  description text,
  what_youll_learn text[] default '{}',
  practice_tasks text[] default '{}',
  suggested_project text,
  prerequisites text,
  estimated_time text,                     -- e.g. '3-4 days'
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_roadmap_topics_phase_id on public.roadmap_topics(phase_id);
create index if not exists idx_roadmap_topics_order on public.roadmap_topics(phase_id, order_index);

-- ---------------------------------------------------------------------
-- roadmap_resources
-- ---------------------------------------------------------------------
create table if not exists public.roadmap_resources (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.roadmap_topics(id) on delete cascade,
  title text not null,
  url text,                                -- nullable: left configurable if no reliable link yet
  resource_type text not null check (resource_type in
    ('documentation', 'video', 'article', 'course', 'practice', 'tool')),
  description text,
  order_index int not null default 0
);

create index if not exists idx_roadmap_resources_topic_id on public.roadmap_resources(topic_id);

-- ---------------------------------------------------------------------
-- user_roadmaps  (a student "starting" a roadmap)
-- ---------------------------------------------------------------------
create table if not exists public.user_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  last_active_topic_id uuid references public.roadmap_topics(id) on delete set null,
  completed_at timestamptz,
  unique (user_id, roadmap_id)
);

create index if not exists idx_user_roadmaps_user_id on public.user_roadmaps(user_id);
create index if not exists idx_user_roadmaps_roadmap_id on public.user_roadmaps(roadmap_id);

-- ---------------------------------------------------------------------
-- user_roadmap_progress  (per-topic status)
-- ---------------------------------------------------------------------
create table if not exists public.user_roadmap_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  topic_id uuid not null references public.roadmap_topics(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);

create index if not exists idx_progress_user_id on public.user_roadmap_progress(user_id);
create index if not exists idx_progress_roadmap_id on public.user_roadmap_progress(user_id, roadmap_id);
create index if not exists idx_progress_topic_id on public.user_roadmap_progress(topic_id);

-- ---------------------------------------------------------------------
-- custom roadmaps (Section 14 — "Create Custom Roadmap")
-- Stores the intake form + the generated topic selection (array of topic_ids)
-- so it can reuse the same roadmap_topics content instead of new content.
-- ---------------------------------------------------------------------
create table if not exists public.user_custom_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  career_goal text not null,
  current_skills text,
  experience_level text not null check (experience_level in ('Beginner', 'Intermediate', 'Advanced')),
  hours_per_day numeric not null default 1,
  target_duration text not null,
  target_role text not null,
  base_roadmap_id uuid references public.roadmaps(id) on delete set null,
  generated_topic_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_roadmaps_user_id on public.user_custom_roadmaps(user_id);

-- ---------------------------------------------------------------------
-- updated_at trigger helper (reused if the project doesn't already have one)
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_roadmaps_updated_at on public.roadmaps;
create trigger trg_roadmaps_updated_at
  before update on public.roadmaps
  for each row execute function public.set_updated_at();

drop trigger if exists trg_progress_updated_at on public.user_roadmap_progress;
create trigger trg_progress_updated_at
  before update on public.user_roadmap_progress
  for each row execute function public.set_updated_at();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table public.roadmaps enable row level security;
alter table public.roadmap_phases enable row level security;
alter table public.roadmap_topics enable row level security;
alter table public.roadmap_resources enable row level security;
alter table public.user_roadmaps enable row level security;
alter table public.user_roadmap_progress enable row level security;
alter table public.user_custom_roadmaps enable row level security;

-- ---- Public/global roadmap content: readable by anyone (incl. anonymous
--      browsing per Section 20), writable only via service role / dashboard.

drop policy if exists "roadmaps_select_published" on public.roadmaps;
create policy "roadmaps_select_published"
  on public.roadmaps for select
  using (is_published = true);

drop policy if exists "phases_select_all" on public.roadmap_phases;
create policy "phases_select_all"
  on public.roadmap_phases for select
  using (
    exists (select 1 from public.roadmaps r
            where r.id = roadmap_id and r.is_published = true)
  );

drop policy if exists "topics_select_all" on public.roadmap_topics;
create policy "topics_select_all"
  on public.roadmap_topics for select
  using (
    exists (
      select 1 from public.roadmap_phases p
      join public.roadmaps r on r.id = p.roadmap_id
      where p.id = phase_id and r.is_published = true
    )
  );

drop policy if exists "resources_select_all" on public.roadmap_resources;
create policy "resources_select_all"
  on public.roadmap_resources for select
  using (
    exists (
      select 1 from public.roadmap_topics t
      join public.roadmap_phases p on p.id = t.phase_id
      join public.roadmaps r on r.id = p.roadmap_id
      where t.id = topic_id and r.is_published = true
    )
  );

-- ---- user_roadmaps: a student can only see/manage their own rows

drop policy if exists "user_roadmaps_select_own" on public.user_roadmaps;
create policy "user_roadmaps_select_own"
  on public.user_roadmaps for select
  using (auth.uid() = user_id);

drop policy if exists "user_roadmaps_insert_own" on public.user_roadmaps;
create policy "user_roadmaps_insert_own"
  on public.user_roadmaps for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_roadmaps_update_own" on public.user_roadmaps;
create policy "user_roadmaps_update_own"
  on public.user_roadmaps for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_roadmaps_delete_own" on public.user_roadmaps;
create policy "user_roadmaps_delete_own"
  on public.user_roadmaps for delete
  using (auth.uid() = user_id);

-- ---- user_roadmap_progress: a student can only see/manage their own rows

drop policy if exists "progress_select_own" on public.user_roadmap_progress;
create policy "progress_select_own"
  on public.user_roadmap_progress for select
  using (auth.uid() = user_id);

drop policy if exists "progress_insert_own" on public.user_roadmap_progress;
create policy "progress_insert_own"
  on public.user_roadmap_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "progress_update_own" on public.user_roadmap_progress;
create policy "progress_update_own"
  on public.user_roadmap_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "progress_delete_own" on public.user_roadmap_progress;
create policy "progress_delete_own"
  on public.user_roadmap_progress for delete
  using (auth.uid() = user_id);

-- ---- user_custom_roadmaps: own rows only

drop policy if exists "custom_select_own" on public.user_custom_roadmaps;
create policy "custom_select_own"
  on public.user_custom_roadmaps for select
  using (auth.uid() = user_id);

drop policy if exists "custom_insert_own" on public.user_custom_roadmaps;
create policy "custom_insert_own"
  on public.user_custom_roadmaps for insert
  with check (auth.uid() = user_id);

drop policy if exists "custom_delete_own" on public.user_custom_roadmaps;
create policy "custom_delete_own"
  on public.user_custom_roadmaps for delete
  using (auth.uid() = user_id);
