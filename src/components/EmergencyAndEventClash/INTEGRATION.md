# CampusConnect — Integration Guide

Two new modular features, ready to drop in:

1. **🚨 Emergency / Help Center** — `/help` (student), `/admin/help` (admin)
2. **⚠️ Event Clash Detector** — no new route; integrated into events flows

`CampusConnectDashboard.jsx` in this bundle is your file **with the two
additions already made** (new nav item + `case "help"` route) — everything
else is untouched. Diff it against your original if you want to see exactly
what changed. All other existing files (BrowseEvents, EventDetails,
MyRegistrations, Schedule, the Admin router/sidebar) weren't shared with me,
so instead of guessing and risking breakage, this guide gives you exact,
copy-paste snippets to drop into each one.

---

## 0. Before you start

- Adjust the `../../../supabaseClient` import paths in the hooks
  (`useEmergencyContacts.js`, `useEventClash.js`, `useClashSettings.js`,
  `AdminEmergencyHelp.jsx`) to match your actual client path.
- Run `supabase/schema.sql` against your project (creates
  `emergency_contacts` + `app_settings`, with RLS policies you should
  double check against your existing admin-role pattern).
- Everything works with **mock data** out of the box — you can wire
  Supabase later without touching any UI code.

---

## 1. Emergency / Help Center

Already wired into `CampusConnectDashboard.jsx`:

```jsx
import EmergencyHelp from "../features/emergency/EmergencyHelp";
...
{ id: "help", label: "Emergency & Help", icon: Siren }  // own "SAFETY" nav section
...
case "help":
  return <EmergencyHelp />;
```

### Admin side

Your Admin Portal router/sidebar wasn't included, so wire these in manually
— same pattern as your other `/admin/*` routes:

```jsx
import AdminEmergencyHelp from "../features/admin/emergency/AdminEmergencyHelp";

// Sidebar, under an existing "Campus Services" group (create the group if
// it doesn't exist yet):
{
  section: "⚙️ Campus Services",
  items: [
    { id: "admin-help", label: "Emergency & Help", route: "/admin/help" },
  ],
}

// Router:
case "admin-help": // or your route equivalent
  return <AdminEmergencyHelp />;
```

Guard `/admin/help` with whatever role check already protects your other
admin routes — students must not be able to reach it.

---

## 2. Event Clash Detector

The clash logic lives entirely in two pure files:

- `src/utils/detectEventClash.js` — `detectEventClash(newEvent, registeredEvents) → boolean`
- `src/utils/getConflictingEvents.js` — `getConflictingEvents(newEvent, registeredEvents) → Event[]`
  and `getScheduleConflictGroups(registeredEvents) → { events: Event[] }[]`

Everything else is UI built on top of those two functions plus the
`useEventClash(studentId)` hook, which loads the student's current
registrations once and exposes `checkClash()` / `getConflicts()`.

Event object shape expected everywhere:

```js
{ id, title, date: "YYYY-MM-DD", startTime: "HH:MM", endTime: "HH:MM", location }
```

### 2a. Browse Events — subtle conflict badge

```jsx
import { useEventClash } from "../features/eventClash/hooks/useEventClash";
import EventClashWarning from "../features/eventClash/EventClashWarning";

function BrowseEvents({ onOpenEvent, currentUserId }) {
  const { checkClash } = useEventClash(currentUserId);

  // inside your event card render:
  const hasConflict = checkClash(event); // event = { id, date, startTime, endTime, ... }

  return (
    <Card onClick={() => onOpenEvent(event)}>
      {/* existing card content */}
      {hasConflict && <EventClashWarning.Badge className="mt-2" />}
    </Card>
  );
}
```

### 2b. Event Details — proactive warning + register flow

```jsx
import { useState } from "react";
import { useEventClash } from "../features/eventClash/hooks/useEventClash";
import { useClashSettings } from "../features/admin/settings/useClashSettings";
import EventClashWarning from "../features/eventClash/EventClashWarning";
import EventConflictModal from "../features/eventClash/EventConflictModal";

function EventDetails({ event, onBack, currentUserId, onNavigateToSchedule, onOpenEvent }) {
  const { getConflicts, refetch } = useEventClash(currentUserId);
  const { settings } = useClashSettings(); // { enabled, mode }
  const [modalOpen, setModalOpen] = useState(false);

  const conflicts = settings.enabled ? getConflicts(event) : [];

  const handleRegisterClick = () => {
    if (conflicts.length > 0) {
      setModalOpen(true); // shows the clash modal instead of registering directly
      return;
    }
    doActualRegister(event); // your existing registration call
  };

  const doActualRegister = async (evt) => {
    // ...existing Supabase insert into event_registrations...
    await refetch(); // keep the student's registered-events cache fresh
  };

  return (
    <div>
      {/* existing event details content */}

      {conflicts.length > 0 && (
        <EventClashWarning.Banner
          conflicts={conflicts}
          onViewSchedule={onNavigateToSchedule}
        />
      )}

      <Button onClick={handleRegisterClick}>Register</Button>

      <EventConflictModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        newEvent={event}
        conflicts={conflicts}
        mode={settings.mode} // "warning" (default) or "strict"
        onConfirmRegister={() => doActualRegister(event)}
        onViewSchedule={onNavigateToSchedule}
        onViewEvent={(existingEvent) => onOpenEvent(existingEvent.id)}
      />
    </div>
  );
}
```

In **strict mode**, `EventConflictModal` automatically hides the
"Register Anyway" button and only shows Cancel — registration stays
blocked without any extra logic on your part.

### 2c. My Registrations — inline conflict indicator

```jsx
import { getConflictingEvents } from "../utils/getConflictingEvents";
import EventClashWarning from "../features/eventClash/EventClashWarning";
import ConflictEventList from "../features/eventClash/ConflictEventList";

// For each registration row, check it against all the OTHER registrations:
const others = registrations.filter((r) => r.id !== registration.id);
const conflicts = getConflictingEvents(registration, others);

{conflicts.length > 0 && (
  <div className="mt-2">
    <EventClashWarning.Badge />
    <ConflictEventList events={conflicts} onViewEvent={onOpenEvent} />
  </div>
)}
```

Nothing is auto-cancelled or modified — purely informational, per spec.

### 2d. Schedule — overlap clusters

```jsx
import { getScheduleConflictGroups } from "../utils/getConflictingEvents";
import ConflictEventList from "../features/eventClash/ConflictEventList";

const conflictGroups = getScheduleConflictGroups(registeredEvents);

{conflictGroups.map((group, i) => (
  <div key={i} className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4 space-y-3">
    <p className="text-sm font-semibold text-amber-300">
      ⚠️ {group.events.length} Events Overlap
    </p>
    <ConflictEventList events={group.events} onViewEvent={onOpenEvent} />
  </div>
))}
```

### 2e. Admin settings (optional)

Drop `<ClashDetectionSettings />` (from
`src/features/admin/settings/ClashDetectionSettings.jsx`) into your existing
admin event-management or settings screen — it reads/writes
`app_settings.event_clash_detection` and needs no extra plumbing.

---

## 3. File map

```
src/
  utils/
    detectEventClash.js
    getConflictingEvents.js
  shared/ui/
    primitives.jsx            (Card, Badge, Button, Modal, EmptyState, LoadingState, ConfirmDialog)
  features/
    emergency/
      EmergencyHelp.jsx           → /help
      mockData.js
      hooks/useEmergencyContacts.js
      components/
        ContactCard.jsx
        EmergencyCategory.jsx
        EmergencyNotice.jsx
    admin/
      emergency/
        AdminEmergencyHelp.jsx    → /admin/help
        ContactForm.jsx
        ContactManagementTable.jsx
      settings/
        ClashDetectionSettings.jsx
        useClashSettings.js
    eventClash/
      EventClashWarning.jsx
      EventConflictModal.jsx
      ConflictEventList.jsx
      hooks/useEventClash.js
supabase/
  schema.sql
```

## 4. What was intentionally NOT touched

- No changes to BrowseEvents.jsx, EventDetails.jsx, MyRegistrations.jsx,
  Schedule.jsx, or the Admin router/sidebar — their source wasn't shared,
  so integration is given as snippets above rather than guessed edits that
  could break your build.
- No changes to typography, color tokens, spacing scale, or any existing
  component's visual behavior.
- `src/shared/ui/primitives.jsx` is a lightweight local UI kit matching your
  existing look (dark theme, indigo/purple accents, rounded-xl). If
  CampusConnect already has real shared `Button`/`Card`/`Modal`/`Badge`
  components elsewhere, swap the imports in the new files to point at those
  instead and delete `primitives.jsx`.
