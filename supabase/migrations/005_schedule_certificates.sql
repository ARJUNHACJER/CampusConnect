-- Ensure the student schedule and certificate flow exist in deployed databases.
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

alter table public.schedule_entries enable row level security;
drop policy if exists "Users manage their own schedule" on public.schedule_entries;
create policy "Users manage their own schedule" on public.schedule_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Events use text ids in this project, so certificates must use the same type.
alter table if exists public.certificates alter column event_id type text using event_id::text;
alter table if exists public.certificates add column if not exists template text not null default 'classic';

insert into public.emergency_contacts (name, category, description, phone, location, availability, priority, active)
select 'Aditya College Surampalem Campus Security', 'security', 'Campus security near Aditya College of Engineering and Technology, Surampalem, Kakinada district.', '112', 'Near Aditya College, Surampalem, Kakinada', '24/7', 1, true
where not exists (select 1 from public.emergency_contacts where name = 'Aditya College Surampalem Campus Security');

notify pgrst, 'reload schema';

-- Admin registrations need to read education fields for year, branch and roll number.
alter table if exists public.education_records enable row level security;
drop policy if exists "Admins read student education" on public.education_records;
create policy "Admins read student education" on public.education_records for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

alter table if exists public.contact_info enable row level security;
drop policy if exists "Admins read student contact" on public.contact_info;
create policy "Admins read student contact" on public.contact_info for select using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
