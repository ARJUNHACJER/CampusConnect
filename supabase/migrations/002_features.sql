-- ============================================================================
-- CampusConnect — Feature tables for modules wired into the app
--   * emergency_contacts / app_settings   (Emergency & Help + Event Clash)
--   * event_feedback                       (Rate & Review on completed events)
--   * certificates                         (student Certificates hub)
--   * event_registrations flags            (attended / feedback_submitted)
--
-- Safe to run more than once: every object uses IF NOT EXISTS and every policy
-- is dropped-then-created. Admins are identified exactly the way the app does
-- it (see src/App.jsx): the JWT `app_metadata.role` claim equals 'admin'.
--
-- Run in the Supabase SQL editor or via `supabase db push`. 001 (opportunities)
-- is normally applied first, but this file is self-contained.
-- ============================================================================

-- Shared trigger helper (also defined in 001; re-declared here so this file is
-- standalone and re-runnable).
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- emergency_contacts
-- (columns mirror src/components/EmergencyAndEventClash/supabase/schema.sql)
-- ----------------------------------------------------------------------------
create table if not exists public.emergency_contacts (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null check (category in ('security', 'medical', 'student-support', 'campus-services')),
  description  text,
  phone        text,
  email        text,
  location     text,
  availability text,
  priority     integer not null default 99,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_emergency_contacts_active_priority
  on public.emergency_contacts (active, category, priority);

alter table public.emergency_contacts enable row level security;

-- Students: read-only, active contacts only.
drop policy if exists "emergency_contacts_select_active" on public.emergency_contacts;
create policy "emergency_contacts_select_active"
  on public.emergency_contacts for select
  to authenticated
  using (active = true);

-- Admins: full access.
drop policy if exists "emergency_contacts_admin_all" on public.emergency_contacts;
create policy "emergency_contacts_admin_all"
  on public.emergency_contacts for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop trigger if exists trg_emergency_contacts_updated_at on public.emergency_contacts;
create trigger trg_emergency_contacts_updated_at
  before update on public.emergency_contacts
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- app_settings — generic key/value config (Event Clash Detection settings).
-- ----------------------------------------------------------------------------
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values (
  'event_clash_detection',
  jsonb_build_object('enabled', true, 'mode', 'warning')  -- 'warning' | 'strict'
)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "app_settings_select_authenticated" on public.app_settings;
create policy "app_settings_select_authenticated"
  on public.app_settings for select
  to authenticated
  using (true);

drop policy if exists "app_settings_admin_write" on public.app_settings;
create policy "app_settings_admin_write"
  on public.app_settings for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- event_feedback — one row per student per event (Rate & Review flow).
-- Columns match the insert in src/Features/Myregistrations.jsx#handleSubmitFeedback.
-- event_id / registration_id are uuids that logically reference events(id) /
-- event_registrations(id); kept without hard FKs so this file applies cleanly
-- regardless of how those tables were originally created. The unique
-- (user_id, event_id) constraint is what lets the client treat a 23505 as
-- "already submitted".
-- ----------------------------------------------------------------------------
create table if not exists public.event_feedback (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  event_id            uuid not null,
  registration_id     uuid,
  overall_rating      integer not null check (overall_rating between 1 and 5),
  organization_rating integer check (organization_rating between 1 and 5),
  content_rating      integer check (content_rating between 1 and 5),
  venue_rating        integer check (venue_rating between 1 and 5),
  coordination_rating integer check (coordination_rating between 1 and 5),
  comment             text,
  liked_most          text,
  could_improve       text,
  would_attend_again  text,
  created_at          timestamptz not null default now(),

  constraint event_feedback_user_event_unique unique (user_id, event_id)
);

create index if not exists idx_event_feedback_event on public.event_feedback (event_id);

alter table public.event_feedback enable row level security;

-- Students can read and create only their own feedback.
drop policy if exists "event_feedback_owner_select" on public.event_feedback;
create policy "event_feedback_owner_select"
  on public.event_feedback for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "event_feedback_owner_insert" on public.event_feedback;
create policy "event_feedback_owner_insert"
  on public.event_feedback for insert
  to authenticated
  with check (user_id = auth.uid());

-- Admins can read all feedback (for analytics / results).
drop policy if exists "event_feedback_admin_select" on public.event_feedback;
create policy "event_feedback_admin_select"
  on public.event_feedback for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ----------------------------------------------------------------------------
-- certificates — student credentials, generated + published by admins.
-- Columns match src/components/WaitingListAndCertificates/hooks/useCertificates.js.
-- student_id references auth.users(id); event_id is a logical events(id) ref.
-- ----------------------------------------------------------------------------
create table if not exists public.certificates (
  id             uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  event_id       uuid,
  event_name     text not null default '',
  student_id     uuid not null references auth.users (id) on delete cascade,
  recipient_name text not null default '',
  type           text not null default 'participation'
                   check (type in ('participation', 'winner', 'runner_up', 'achievement')),
  issue_date     date not null default current_date,
  status         text not null default 'generated'
                   check (status in ('generated', 'published', 'revoked')),
  pdf_url        text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_certificates_student on public.certificates (student_id, status);

alter table public.certificates enable row level security;

-- Students see only their own *published* certificates.
drop policy if exists "certificates_owner_select" on public.certificates;
create policy "certificates_owner_select"
  on public.certificates for select
  to authenticated
  using (student_id = auth.uid() and status = 'published');

-- Admins manage everything (generate / publish / revoke, and read drafts).
drop policy if exists "certificates_admin_all" on public.certificates;
create policy "certificates_admin_all"
  on public.certificates for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ----------------------------------------------------------------------------
-- event_registrations — attendance + feedback flags the UI reads/writes.
-- ----------------------------------------------------------------------------
alter table public.event_registrations
  add column if not exists attended boolean not null default false,
  add column if not exists feedback_submitted boolean not null default false;

-- Refresh the PostgREST schema cache so the new tables/columns are immediately
-- queryable from the client.
notify pgrst, 'reload schema';
