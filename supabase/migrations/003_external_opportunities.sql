-- ============================================================================
-- CampusConnect — External opportunities (Arbeitnow live jobs) support
--
--   1. Allow 'job' as an opportunity type (Arbeitnow is a general jobs board,
--      not just internships/hackathons/scholarships/fellowships).
--   2. Add a JWT-based admin write policy on `opportunities` so the admin
--      "Sync Opportunities" action works under the SAME admin convention the
--      rest of the app uses (App.jsx / 002_features.sql check the JWT
--      app_metadata.role claim; 001 only had a profiles.role='admin' policy).
--      This is additive — both policies are OR'd, so nothing existing breaks.
--   3. `saved_external_opportunities` — lets a student bookmark a LIVE listing
--      that isn't (yet) a row in `opportunities`. Stored as an owner-scoped
--      jsonb snapshot so the save survives even if the provider drops it.
--
-- Safe to run more than once (idempotent). Run in the Supabase SQL editor or
-- via `supabase db push`. Apply 001_opportunities.sql first.
-- ============================================================================

-- 1) Allow the 'job' type ---------------------------------------------------
-- 001 declared the check inline, so Postgres auto-named it
-- `opportunities_type_check`. Drop-and-recreate with 'job' added.
alter table public.opportunities drop constraint if exists opportunities_type_check;
alter table public.opportunities
  add constraint opportunities_type_check
  check (type in ('internship', 'scholarship', 'hackathon', 'fellowship', 'job'));

-- 2) JWT-admin write policy on opportunities --------------------------------
drop policy if exists "opportunities_write_admin_jwt" on public.opportunities;
create policy "opportunities_write_admin_jwt"
  on public.opportunities for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins identified by the JWT claim can also read drafts/deactivated rows
-- (mirrors 001's profiles-based `opportunities_select_admin`).
drop policy if exists "opportunities_select_admin_jwt" on public.opportunities;
create policy "opportunities_select_admin_jwt"
  on public.opportunities for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 3) saved_external_opportunities -------------------------------------------
create table if not exists public.saved_external_opportunities (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  source     text not null,
  source_id  text not null,
  snapshot   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  -- One save per (user, external listing) — prevents duplicate bookmarks.
  constraint saved_external_opportunities_unique unique (user_id, source, source_id)
);

create index if not exists idx_saved_external_opps_user
  on public.saved_external_opportunities (user_id);

alter table public.saved_external_opportunities enable row level security;

-- Students manage only their own external saves.
drop policy if exists "saved_external_opps_owner_all" on public.saved_external_opportunities;
create policy "saved_external_opps_owner_all"
  on public.saved_external_opportunities for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Refresh the PostgREST schema cache so the new table/policies are queryable.
notify pgrst, 'reload schema';
