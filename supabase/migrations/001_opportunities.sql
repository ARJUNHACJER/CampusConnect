-- ============================================================================
-- CampusConnect Opportunities module — schema + RLS
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Admins are identified exactly the way the app does it (see src/App.jsx:
-- `user.app_metadata.role === 'admin'`): the JWT `app_metadata.role` claim
-- equals 'admin'. This matches 002_features.sql / 003_external_opportunities.sql.
-- NOTE: the `profiles` table in this project is keyed by `user_id` and has no
-- `role` column, so the admin check intentionally does NOT read from `profiles`.
-- Safe to run more than once: every policy is dropped-then-created.
-- ============================================================================

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('internship', 'scholarship', 'hackathon', 'fellowship')),
  organization text not null default 'Not specified',
  description text not null default '',
  location text not null default 'Not specified',
  mode text not null default 'onsite' check (mode in ('remote', 'onsite', 'hybrid')),
  skills text[] not null default '{}',
  eligibility text not null default 'All Students',
  stipend text not null default 'Not specified',
  deadline date,
  apply_url text,
  source text not null default 'admin',        -- 'admin' | 'elevateu' | future providers
  source_id text,                                -- external id, null for admin-created rows
  image_url text,
  is_external boolean not null default false,
  is_active boolean not null default true,
  -- Kept alongside is_active because the existing UI already models a
  -- richer lifecycle (draft/published/closing_soon/expired/cancelled);
  -- see src/data/opportunityConstants.js#getDerivedStatus.
  status text not null default 'published'
    check (status in ('draft', 'published', 'closing_soon', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Section 7: prevents the same external listing from being inserted twice.
  constraint opportunities_source_unique unique (source, source_id)
);

create index if not exists idx_opportunities_type on public.opportunities (type);
create index if not exists idx_opportunities_deadline on public.opportunities (deadline);
create index if not exists idx_opportunities_active on public.opportunities (is_active);

create table if not exists public.saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint saved_opportunities_unique unique (user_id, opportunity_id)
);

create index if not exists idx_saved_opportunities_user on public.saved_opportunities (user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;

-- Everyone signed in can read active opportunities.
drop policy if exists "opportunities_select_active" on public.opportunities;
create policy "opportunities_select_active"
  on public.opportunities for select
  to authenticated
  using (is_active = true);

-- Admins can read everything, including drafts/deactivated rows.
-- Admin = JWT app_metadata.role claim (see src/App.jsx), NOT a profiles lookup.
drop policy if exists "opportunities_select_admin" on public.opportunities;
create policy "opportunities_select_admin"
  on public.opportunities for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Only admins can create/update/delete opportunities.
drop policy if exists "opportunities_write_admin" on public.opportunities;
create policy "opportunities_write_admin"
  on public.opportunities for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Students can manage only their own saved opportunities.
drop policy if exists "saved_opportunities_owner_select" on public.saved_opportunities;
create policy "saved_opportunities_owner_select"
  on public.saved_opportunities for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "saved_opportunities_owner_insert" on public.saved_opportunities;
create policy "saved_opportunities_owner_insert"
  on public.saved_opportunities for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "saved_opportunities_owner_delete" on public.saved_opportunities;
create policy "saved_opportunities_owner_delete"
  on public.saved_opportunities for delete
  to authenticated
  using (user_id = auth.uid());

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_opportunities_updated_at on public.opportunities;
create trigger trg_opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.set_updated_at();

-- Refresh the PostgREST schema cache so the new tables are immediately
-- queryable from the client.
notify pgrst, 'reload schema';
