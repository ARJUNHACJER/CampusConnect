-- Run this once in the Supabase SQL Editor for the project used by VITE_SUPABASE_URL.
create extension if not exists pgcrypto;

-- Student-visible published results and persistent notifications.
create table if not exists public.event_results (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  title text not null default 'Event Results',
  details jsonb not null default '[]',
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text not null default '',
  related_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null default '',
  category text not null default 'General',
  date date not null,
  start_time time,
  end_time time,
  venue text,
  organizer text,
  banner text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  event_title text not null,
  event_date date,
  status text not null default 'pending',
  event_category text,
  event_venue text,
  event_organizer text,
  event_banner text,
  start_time time,
  end_time time,
  registered_at timestamptz not null default now(),
  action_count integer not null default 1,
  unique (user_id, event_id)
);

create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  event_title text not null,
  event_date date,
  start_time time,
  end_time time,
  event_venue text,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.events add column if not exists eligibility text;
alter table public.events add column if not exists department text;
alter table public.events add column if not exists max_participants integer;
alter table public.events add column if not exists registration_deadline date;
alter table public.events add column if not exists rules text;
alter table public.events add column if not exists highlights text;
alter table public.events add column if not exists prize_info text;
alter table public.event_registrations add column if not exists status text not null default 'pending';
alter table public.event_registrations add column if not exists action_count integer not null default 1;

alter table public.schedule_entries enable row level security;
drop policy if exists "Users manage their own schedule" on public.schedule_entries;
create policy "Users manage their own schedule" on public.schedule_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.events enable row level security;
drop policy if exists "Anyone can view published events" on public.events;
create policy "Anyone can view published events" on public.events for select using (status = 'published');
drop policy if exists "Admins manage events" on public.events;
create policy "Admins manage events" on public.events for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

alter table public.event_registrations enable row level security;
drop policy if exists "Users manage their own registrations" on public.event_registrations;
create policy "Users manage their own registrations" on public.event_registrations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Admins manage registrations" on public.event_registrations;
create policy "Admins manage registrations" on public.event_registrations for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

alter table public.event_results enable row level security;
drop policy if exists "Students view published results" on public.event_results;
create policy "Students view published results" on public.event_results for select using (status = 'published');
drop policy if exists "Admins manage results" on public.event_results;
create policy "Admins manage results" on public.event_results for all using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

alter table public.notifications enable row level security;
drop policy if exists "Users manage their notifications" on public.notifications;
create policy "Users manage their notifications" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Portfolio links saved by each student's profile wizard.
create table if not exists public.social_links (
  user_id uuid primary key references auth.users(id) on delete cascade,
  github text,
  linkedin text,
  website text,
  behance text,
  leetcode text,
  codechef text,
  hackerrank text,
  other text
);

alter table public.social_links enable row level security;
drop policy if exists "Users manage their own social links" on public.social_links;
create policy "Users manage their own social links" on public.social_links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profile institution lookup tables used by the student profile wizard.
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution_type text,
  university_board text,
  city text,
  state text,
  country text,
  website text,
  code text unique
);

create table if not exists public.user_institutions (
  user_id uuid references auth.users(id) on delete cascade,
  institution_id uuid references public.institutions(id),
  campus_location text,
  primary key (user_id, institution_id)
);

alter table public.institutions enable row level security;
drop policy if exists "Authenticated users can view institutions" on public.institutions;
create policy "Authenticated users can view institutions" on public.institutions
  for select using (auth.role() = 'authenticated');
drop policy if exists "Authenticated users can add institutions" on public.institutions;
create policy "Authenticated users can add institutions" on public.institutions
  for insert with check (auth.role() = 'authenticated');
drop policy if exists "Authenticated users can update institutions" on public.institutions;
create policy "Authenticated users can update institutions" on public.institutions
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table public.user_institutions enable row level security;
drop policy if exists "Users manage their institution links" on public.user_institutions;
create policy "Users manage their institution links" on public.user_institutions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'General',
  priority text not null default 'Normal',
  publish_date date not null default current_date,
  attachment text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "Anyone can view published announcements" on public.announcements;
create policy "Anyone can view published announcements" on public.announcements
  for select using (status = 'published');

drop policy if exists "Admins manage announcements" on public.announcements;
create policy "Admins manage announcements" on public.announcements
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================================
-- Backend validation for event creation (mirrors the admin form's rules).
-- Added as `not valid` so any pre-existing rows are left untouched, but every
-- new insert / update is enforced at the database level — invalid events can't
-- be written even if the UI is bypassed.
-- ============================================================================
alter table public.events drop constraint if exists events_max_participants_positive;
alter table public.events add constraint events_max_participants_positive
  check (max_participants is null or max_participants > 0) not valid;

alter table public.events drop constraint if exists events_time_order;
alter table public.events add constraint events_time_order
  check (start_time is null or end_time is null or end_time > start_time) not valid;

alter table public.events drop constraint if exists events_deadline_not_after_date;
alter table public.events add constraint events_deadline_not_after_date
  check (registration_deadline is null or registration_deadline <= date) not valid;

notify pgrst, 'reload schema';
