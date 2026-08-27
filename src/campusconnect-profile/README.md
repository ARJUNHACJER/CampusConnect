# CampusConnect — Student Profile & Profile Completion System

Drop the `src/` contents into your existing CampusConnect project (same
folder structure). Everything is plain JSX + Tailwind, matching the visual
language of your existing `CampusConnectLogin.jsx` (dark violet theme,
`rounded-2xl` cards, `bg-white/5` inputs).

## What's here

```
src/
  lib/
    educationConfig.js      # 19 education types → which fields each shows
    profileCompletion.js    # weights, % math, 90%-and-mandatory gate logic
    profileValidation.js    # required-field checks per section
    profileSchema.js        # empty profile shape + dummy preview data
    profileService.js       # fetch/save — dummy now, Supabase queries commented in
    supabaseClient.js       # stub — delete if you already have one
    supabaseSchema.sql.txt  # suggested normalized tables (reference only)
  context/
    ProfileContext.jsx      # useProfile() — the single source of truth
  components/
    profile/
      ui/                   # FormField, TagInput, ChipToggleGroup, ProgressBar, theme
      wizard/
        ProfileWizard.jsx   # 9-step flow, preserves drafts across Back/Next
        WizardShell.jsx     # header/progress/footer chrome
        steps/*.jsx         # one file per step
      ProfileCompletionGate.jsx  # post-login onboarding screen (<90%)
      ProfilePage.jsx            # profile overview + section cards
      ProfileSectionCard.jsx
    events/
      EventRegistrationGuard.jsx # wraps your "Register" button
  AppProfileIntegrationExample.jsx  # wiring example — not a real router
```

## Wiring it up (3 steps)

1. **After a successful Google/SSO/email login**, wrap your authenticated
   app in `<ProfileProvider userId={...} authProvider={...} authName={...} authEmail={...}>`.
   `authName`/`authEmail` are whatever Google/SSO already gave you — the
   provider auto-creates a profile row and pre-fills Basic Information with
   them on a brand-new user.

2. **Check completion once per session** (see `AppProfileIntegrationExample.jsx`):
   if `overallCompletion < 90`, show `<ProfileCompletionGate />` instead of
   the dashboard. It has its own "Browse dashboard instead" button — it
   never hard-blocks navigation.

3. **Wrap every "Register for Event" button** in `<EventRegistrationGuard>`.
   It checks auth + `registrationReady` (90% AND all mandatory sections'
   required fields) and shows a message + deep link to the missing section
   if not met — exactly per the spec, hitting 90% alone is never enough.

## Connecting Supabase for real

You said you're already on Supabase. Everything currently runs on dummy
in-memory data in `profileService.js` so the UI works standalone. To go
live:

1. Run `supabaseSchema.sql.txt` (or adapt it to tables you already have).
2. In `profileService.js`, each function has the real Supabase query
   already written as a comment directly below the dummy line — delete the
   dummy line, uncomment the real one. Function signatures don't change, so
   nothing else in the app needs touching.
3. Delete `supabaseClient.js` and point `profileService.js` at your
   existing client if you already have one elsewhere in the project.

## Extending to a new education type

Add one entry to `EDUCATION_TYPES` in `lib/educationConfig.js` — the
wizard, validation, and completion % all read from that config
automatically. No other file needs to change.
