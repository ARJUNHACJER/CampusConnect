# Opportunities — Integration Guide

## 1. Architecture

```
ElevateU public API  ──►  src/services/opportunitiesApi.js  ──►  normalizeOpportunity()
                                                                        │
                                                                        ▼
                                                        src/services/opportunitiesService.js
                                                          syncExternalOpportunities()
                                                          (upsert on source + source_id)
                                                                        │
                                                                        ▼
                                                              Supabase `opportunities` table
                                                                        │
                                        useOpportunities() / useSavedOpportunities()
                                                                        │
                                                                        ▼
                                        OpportunityBoard / OpportunityDetails / Admin*
```

The React UI never calls the external API directly — it always reads from Supabase.
Only the admin "Sync Opportunities" action (in `AdminOpportunities.jsx`) triggers a
fetch from the external provider.

## 2. API provider

**ElevateU** (https://elevate-u.org/developers). The public
`GET /api/v1/opportunities` endpoint is used — it's unauthenticated (per-IP rate
limited) and supports `kind=internship|hackathon|scholarship`, `q`, `limit`, `offset`.
It does **not** currently offer a `fellowship` kind; fellowships in this app are
admin-entered only (`source = 'admin'`).

If you later add a provider that requires a secret key, do **not** call it from the
browser — add a Supabase Edge Function that holds the key server-side and proxies the
request, then point `opportunitiesApi.js` at that function instead of the provider
directly.

## 3. Environment variables

See `.env.example`:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — your Supabase project.
- `VITE_OPPORTUNITIES_API_URL` — defaults to ElevateU's public base URL.
- `VITE_OPPORTUNITIES_API_KEY` — unused today (ElevateU's public opportunities
  endpoint needs no key); kept for a future authenticated provider.

## 4. Supabase tables

Run `supabase/migrations/001_opportunities.sql`. It creates:

- `opportunities` — see the migration for the full column list. Two lifecycle
  fields coexist by design: `is_active` (boolean, used by RLS and default reads)
  and `status` (`draft|published|closing_soon|expired|cancelled`, used by the
  existing UI's `getDerivedStatus()` badge logic).
- `saved_opportunities` — `(user_id, opportunity_id)` with a unique constraint.

## 5. Row Level Security

- Any authenticated user can read `is_active = true` opportunities.
- Admins (checked against a `profiles.role = 'admin'` row — **adjust this if your
  project's role check works differently**, e.g. a JWT claim or a separate
  `admin_users` table) can read everything and write.
- Students can insert/select/delete only their own rows in `saved_opportunities`.

## 6. Duplicate detection

`syncExternalOpportunities()` upserts on `(source, source_id)`. ElevateU returns a
stable `id` per listing, which becomes `source_id`. If a future provider doesn't
supply one, `normalizeOpportunity()` falls back to a deterministic hash of
`source + title + organization`, so re-syncing never creates duplicate rows.

## 7. Admin sync workflow

`AdminOpportunities.jsx` has a "Sync Opportunities" button (admin-only route).
It calls `syncExternalOpportunities()`, then shows `"Successfully synced N
opportunities — X new, Y updated"`. It is a manual, on-demand action — nothing
polls the external API automatically.

## 8. Adding another provider

1. Add fetch + a `normalizeOpportunity(raw, sourceName)` mapping for the new
   provider in `opportunitiesApi.js` (or a new file, e.g. `providerXApi.js`).
2. Include its results in `getExternalOpportunities()`.
3. Use a distinct `source` value so dedupe keys stay unique across providers.

## 9. Running locally

1. Copy `.env.example` to `.env` and fill in your Supabase project's URL/anon key.
2. Run the SQL migration in the Supabase SQL editor.
3. `npm install @supabase/supabase-js` if it isn't already a dependency.
4. Start the dev server as usual.

## 10. Known gaps from this pass (see chat summary for full list)

This refactor was done against only the Opportunities/Feedback component tree —
the upload didn't include `package.json`, routing, an auth context, or an existing
Supabase client. Two integration points are stubbed with a clear comment and need
a one-line fix on your end:

- `src/lib/supabaseClient.js` — delete this if you already have a shared client,
  and repoint the two service files' imports at it.
- `currentUserId` prop on `OpportunityBoard` / `OpportunityDetails` — wire this to
  your actual auth hook (e.g. `useAuth().user.id`).
