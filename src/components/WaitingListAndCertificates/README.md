# CampusConnect — Event Waitlist + Certificates Hub

Two modular feature sets, built to slot into the existing CampusConnect
React + Tailwind project without touching the current Student/Admin
portals. Nothing here redesigns existing pages — it's meant to be
imported into them.

## What's in here

```
shared/
  ui.jsx          Card, Badge, Button, Modal, EmptyState, LoadingState,
                   formatDate — lightweight stand-ins for CampusConnect's
                   real components, built to the same tokens (dark navy
                   bg, indigo/purple gradient, rounded-xl). Replace the
                   imports with your real ../ui/Button etc. and delete
                   this file once wired up.
  mockData.js     Mock events / waitlist_entries / certificates, shaped
                   1:1 with the suggested Supabase tables.

hooks/
  useWaitlist.js       join/leave/promote/accept-seat logic
  useCertificates.js   generate/publish/revoke logic

waitlist/
  JoinWaitlistButton.jsx        CTA that adapts to event/student state
  WaitlistConfirmationModal.jsx Join / Leave confirmation (shared modal)
  WaitlistStatus.jsx            Status pill (Open/Full/Waitlisted/etc.)
  WaitlistPosition.jsx          "Your Position: #N" display
  SeatOfferModal.jsx            Offer → clash check → confirm → success
  WaitlistManagement.jsx        Admin → Events → Registrations panel
  _integration-example.jsx      Copy-paste snippets for EventDetails.jsx
                                 and MyRegistrations.jsx (not a component
                                 to import as-is)

certificates/
  CertificatesHub.jsx            Student page — route: /certificates
  CertificateCard.jsx            Grid card
  CertificatePreview.jsx         The visual certificate (on-screen)
  CertificateDetails.jsx         "View Certificate" modal
  CertificatePDFGenerator.jsx    Real vector PDF via jsPDF (not html→pdf)
  CertificateVerification.jsx    Public route: /certificates/verify/:id
  AdminCertificates.jsx          Admin page — route: /admin/certificates
  CertificateGenerationModal.jsx Bulk-generate confirmation
```

## Install

```bash
npm install jspdf
```

Everything else (`lucide-react`, Tailwind) is already in the project.

## Wiring it up

### 1. Sidebar nav (student)

In `CampusConnectDashboard.jsx`, add one entry to `NAV_SECTIONS` (e.g. a
new `ACHIEVEMENTS` group, or inside `UPDATES`) and a case in
`renderContent()`:

```jsx
import { Trophy } from "lucide-react"; // already imported
import CertificatesHub from "../features/certificates/CertificatesHub";

// NAV_SECTIONS:
{ title: "ACHIEVEMENTS", items: [
  { id: "certificates", label: "Certificates", icon: Trophy },
]}

// renderContent():
case "certificates":
  return <CertificatesHub />;
```

Do **not** nest CertificatesHub inside ProfilePage — Profile only gets a
summary (see step 3).

### 2. Event Details — waitlist states

`EventDetails.jsx` currently renders a `Register` button. Replace that
block with the pattern shown in
`waitlist/_integration-example.jsx::EventDetailsWaitlistSection` — it
uses `useWaitlist().getEventState(eventId)` to decide which of the five
states (open/full/waitlisted/offered/registered/completed) to render,
and wires up `JoinWaitlistButton`, `WaitlistConfirmationModal`,
`WaitlistPosition`, and `SeatOfferModal`.

### 3. My Registrations — Waitlisted filter

Add a `Waitlisted` tab to `MyRegistrations.jsx` alongside whatever
filters already exist, rendering
`waitlist/_integration-example.jsx::MyRegistrationsWaitlistedTab`'s
logic (list from `useWaitlist().myWaitlistedEvents`, each card using
`WaitlistStatus` + `WaitlistConfirmationModal` in `mode="leave"`).

### 4. Profile summary

In `ProfilePage.jsx`, add a small card:

```jsx
import { useCertificates } from "../features/hooks/useCertificates";

const { summary } = useCertificates(currentUser.id);

<Card className="p-4">
  <p className="text-sm font-semibold text-white">Achievements</p>
  <p className="mt-1 text-2xl font-bold text-white">
    🏆 {summary.total} Certificates
  </p>
  <Button size="sm" variant="secondary" onClick={() => onNavigate("certificates")}>
    View All Certificates
  </Button>
</Card>
```

### 5. Admin

- `Admin → Events → Registrations`: render `WaitlistManagement` per
  event, passing `event`, the sorted `waiting` entries from
  `useWaitlist().getWaitlistForEvent(eventId)`, and handlers wired to
  `promoteNextInLine` / `leaveWaitlist`.
- New admin route `/admin/certificates` → `AdminCertificates`, fed with
  your real completed-events + attendance/result roster data (see the
  `completedEvents` prop shape documented at the top of that file).
- Event create/edit form: add `Maximum Participants`, `Enable Waitlist`
  (default ON), `Waitlist Limit`, `Seat Offer Duration` fields — these
  map straight onto `events.maxParticipants`, `waitlistEnabled`,
  `waitlistLimit`, `seatOfferDurationHours` in `mockData.js`.

### 6. Notifications

Both `promoteNextInLine()` (seat available) and `publishCertificates()`
(certificate ready) are marked with `// TODO(supabase)` comments where a
notification row should be inserted — hook these into your existing
notification system at those two call sites.

### 7. Route guarding

`/admin/certificates` and the admin waitlist panel must be excluded from
student routes. This is UI-level gating only until Supabase Row Level
Security policies are added (see below) — don't rely on it alone.

## Supabase migration path

Every mutating function in `useWaitlist.js` and `useCertificates.js` has
a `// TODO(supabase): ...` comment showing the exact query/RPC it should
become. In short:

- `waitlist_entries`: unique constraint on `(event_id, student_id)`;
  position recalculation on leave/promote should be an RPC/transaction
  to avoid race conditions.
- `certificates`: unique constraint on `(event_id, student_id, type)`
  unless you explicitly allow duplicates; students should only ever
  query `status = 'published'` (enforce via RLS, not just client
  filtering).
- Suggested RLS shape: students can `select` their own
  `waitlist_entries`/`certificates` rows and `insert`/`delete` their own
  `waitlist_entries`; only admins can `update` `certificates.status` or
  `waitlist_entries` belonging to other students.

## Notes

- `shared/ui.jsx` primitives intentionally mirror the tokens visible in
  the dashboard file you shared (bg `#0b0f1a`/`#0d1220`, indigo→purple
  gradient, `rounded-xl`, slate text scale). Swap them for your actual
  Button/Card/Badge/Modal components — I don't have those files, so I
  couldn't import them directly.
- `CertificatePreview.jsx` renders on a **light** background
  intentionally (certificates print/display on white), separate from
  the app's dark theme.
- Responsive grid classes for the certificate grid
  (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) already match the
  requested 1/2/3-column breakpoints.
