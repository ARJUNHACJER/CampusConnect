-- =============================================================================
-- CampusConnect — Emergency/Help Center + Event Clash Detector
-- Supabase schema additions
-- =============================================================================

-- -----------------------------------------------------------------------------
-- emergency_contacts
-- -----------------------------------------------------------------------------
create table if not exists emergency_contacts (
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
  on emergency_contacts (active, category, priority);

-- Row Level Security
alter table emergency_contacts enable row level security;

-- Students: read-only, active contacts only
create policy "Students can view active contacts"
  on emergency_contacts for select
  using (active = true);

-- Admins: full access (adjust the role check to match your existing
-- admin-detection pattern, e.g. a `profiles.role = 'admin'` lookup)
create policy "Admins can manage contacts"
  on emergency_contacts for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');


-- -----------------------------------------------------------------------------
-- app_settings — generic key/value config table (reuse if one already exists)
-- Used here for Event Clash Detection settings.
-- -----------------------------------------------------------------------------
create table if not exists app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

insert into app_settings (key, value)
values (
  'event_clash_detection',
  jsonb_build_object(
    'enabled', true,
    'mode', 'warning'   -- 'warning' | 'strict'
  )
)
on conflict (key) do nothing;

alter table app_settings enable row level security;

create policy "Anyone authenticated can read settings"
  on app_settings for select
  using (auth.role() = 'authenticated');

create policy "Admins can update settings"
  on app_settings for update
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
