# CampusConnect — Admin Portal

A complete Admin Portal built to sit alongside the existing Student Portal
(`CampusConnectDashboard.js`), reusing its exact visual language: `#0b0f1a` /
`#0d1220` backgrounds, `bg-white/5` + `border-white/10` cards, the indigo →
purple gradient logo mark, `rounded-xl`/`rounded-2xl`, and the same sidebar +
mobile-drawer pattern.

## File structure

```
admin-portal/
├── AdminPortal.jsx                 # Entry point + role guard + page router
├── data/
│   └── mockData.js                 # Students, events, registrations, announcements, results, certificates
├── components/
│   ├── AdminLayout.jsx             # Sidebar, header, mobile drawer, logout modal
│   ├── AdminUI.jsx                 # StatCard, StatusBadge, ConfirmationModal, EmptyState, LoadingSkeleton, Field, buttons
│   ├── EventComponents.jsx         # EventManagementCard, EventForm
│   └── DataComponents.jsx          # RegistrationTable, StudentTable, AnnouncementForm, ResultForm, CertificateCard
└── pages/
    ├── AdminDashboard.jsx
    ├── AdminEvents.jsx             # exports AdminEventsCreate + AdminEventsManage
    ├── AdminRegistrations.jsx
    ├── AdminAnnouncements.jsx
    ├── AdminResults.jsx
    ├── AdminStudents.jsx
    ├── AdminCertificates.jsx
    ├── AdminAnalytics.jsx
    └── AdminProfile.jsx
```

Drop the whole `admin-portal/` folder into your `src/` next to the existing
Student Portal files. Nothing in the Student Portal is modified.

## Wiring it up

The portal is self-contained and uses simple internal `useState` navigation
(the same pattern as `CampusConnectDashboard.js`), so it drops in with one
line. If/when you move to `react-router`, the route map is documented at the
top of `AdminLayout.jsx` — every internal page id maps 1:1 to a route like
`/admin/events/create`.

**Quick mount (matches the existing app's pattern):**

```jsx
import AdminPortal from "./admin-portal/AdminPortal";

// role comes from your auth/session state
<AdminPortal
  currentUserRole={user.role}   // "admin" | "student"
  onExitAdmin={() => setView("student")}
  onLogout={() => { /* clear session, redirect to /login */ }}
/>
```

**With react-router:**

```jsx
<Route
  path="/admin/*"
  element={
    user.role === "admin"
      ? <AdminPortal currentUserRole="admin" onLogout={handleLogout} />
      : <Navigate to="/unauthorized" replace />
  }
/>
<Route path="/unauthorized" element={<UnauthorizedPage onBackToDashboard={() => navigate("/dashboard")} />} />
```

`UnauthorizedPage` is exported from `AdminPortal.jsx`.

## Role-based access

- Every new signup should default to `role: "student"`.
- `AdminPortal` itself refuses to render anything if `currentUserRole !==
  "admin"` (defense in depth) — but the *real* gate is your router guard,
  and ultimately your backend.
- **Frontend route protection is not security.** Once you connect Supabase,
  add Row Level Security policies on `events`, `registrations`,
  `announcements`, `results`, and `certificates` so that writes require
  `role = 'admin'` on the `users` table, e.g.:

  ```sql
  create policy "Admins can manage events"
    on events for all
    using (exists (
      select 1 from users where id = auth.uid() and role = 'admin'
    ));
  ```

## Mock data → Supabase

`data/mockData.js` is shaped exactly like the tables it will eventually
replace, with explicit foreign keys:

| Entity          | Key relationships                                  |
|------------------|-----------------------------------------------------|
| `students`       | `id`                                                 |
| `events`         | `id`                                                 |
| `registrations`  | `event_id → events.id`, `student_id → students.id`   |
| `announcements`  | `id`                                                 |
| `results`        | `event_id → events.id`                               |
| `certificateSummary` | `event_id → events.id`                           |

Every page only ever reads from these arrays and calls `useState` setters to
simulate mutation — swap the array source for a `supabase.from(...).select()`
call and the setters for `.insert()` / `.update()` / `.delete()`, and no
component prop shape needs to change.

## End-to-end flow this supports

1. Admin creates an event as a **Draft** (`events-create`) →
2. Admin publishes it (`events-manage`, status → *Published* / *Registration
   Open*) →
3. Student sees it in Browse Events (existing Student Portal) →
4. Student registers →
5. Admin sees the registration (`registrations`) →
6. Event happens, admin marks it **Completed** →
7. Admin publishes results (`results`) → visible to students under
   *Updates → Results* →
8. Admin generates certificates (`certificates`) → visible to students
   under *Student Toolkit → Achievements*.

## Notes

- Analytics (`AdminAnalytics.jsx`) intentionally uses plain
  Tailwind-styled bars instead of a charting library, since none was
  confirmed present in the project — swap in `recharts`/`chart.js` later
  without changing the underlying data.
- All destructive actions (delete event, delete/unpublish announcement)
  go through `ConfirmationModal`.
- Tables collapse into stacked cards below the `md` breakpoint
  (`RegistrationTable`, `StudentTable`) so nothing overflows on mobile.
