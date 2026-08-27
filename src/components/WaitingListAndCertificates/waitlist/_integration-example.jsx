import React, { useState } from "react";
import { Users } from "lucide-react";
import { Card, Badge, EmptyState } from "../shared/ui";
import JoinWaitlistButton from "./JoinWaitlistButton";
import WaitlistConfirmationModal from "./WaitlistConfirmationModal";
import WaitlistPosition from "./WaitlistPosition";
import WaitlistStatus from "./WaitlistStatus";
import SeatOfferModal from "./SeatOfferModal";
import { useWaitlist } from "../hooks/useWaitlist";
import { CURRENT_STUDENT } from "../shared/mockData";

/* ==========================================================================
   INTEGRATION EXAMPLE — not part of the component architecture list, but
   shows exactly how the six waitlist components above plug into your
   existing EventDetails.jsx and MyRegistrations.jsx pages. Copy the
   relevant snippets into those real files rather than importing this
   file directly.
   ========================================================================== */

/** Drop-in snippet for EventDetails.jsx's CTA area. */
export function EventDetailsWaitlistSection({ eventId }) {
  const wl = useWaitlist(CURRENT_STUDENT.id);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [justJoined, setJustJoined] = useState(null);
  const [offerOpen, setOfferOpen] = useState(false);

  const { state, event, entry } = wl.getEventState(eventId);

  if (!event) return null;

  const seatsLine =
    state === "full"
      ? `${event.registeredCount} / ${event.maxParticipants} Seats Filled`
      : `${event.registeredCount} / ${event.maxParticipants} Registered`;

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Users size={16} />
          {seatsLine}
        </div>
        <WaitlistStatus state={state} position={entry?.position} />
      </div>

      {state === "full" && (
        <p className="mb-4 text-sm text-slate-400">
          This event has reached its maximum capacity.
        </p>
      )}

      <JoinWaitlistButton
        state={state}
        position={entry?.position}
        onRegister={() => {
          /* existing register flow */
        }}
        onJoinWaitlist={() => setJoinModalOpen(true)}
        onViewWaitlist={() => {
          /* navigate to My Registrations > Waitlisted */
        }}
        onViewRegistration={() => {
          /* existing view-registration flow */
        }}
        onAcceptSeat={() => setOfferOpen(true)}
      />

      {justJoined ? (
        <div className="mt-4 space-y-3 text-center">
          <p className="text-sm font-semibold text-white">
            ✓ Added to Waitlist
          </p>
          <p className="text-sm text-slate-400">
            You are currently #{justJoined.position} on the waitlist.
          </p>
          <WaitlistPosition
            position={justJoined.position}
            joinedAt={justJoined.joinedAt}
          />
        </div>
      ) : null}

      <WaitlistConfirmationModal
        open={joinModalOpen}
        mode="join"
        eventTitle={event.title}
        loading={wl.loading}
        onCancel={() => setJoinModalOpen(false)}
        onConfirm={async () => {
          const created = await wl.joinWaitlist(
            eventId,
            CURRENT_STUDENT.id,
            CURRENT_STUDENT.name
          );
          setJustJoined(created);
          setJoinModalOpen(false);
        }}
      />

      <SeatOfferModal
        open={offerOpen}
        eventTitle={event.title}
        hasClash={false /* wire to your real clash detector */}
        loading={wl.loading}
        onClose={() => setOfferOpen(false)}
        onAccept={async () => {
          await wl.acceptSeat(entry.id);
        }}
        onViewEvent={() => setOfferOpen(false)}
      />
    </Card>
  );
}

/** Drop-in snippet for MyRegistrations.jsx's "Waitlisted" filter tab. */
export function MyRegistrationsWaitlistedTab() {
  const wl = useWaitlist(CURRENT_STUDENT.id);
  const [leaveTarget, setLeaveTarget] = useState(null);

  if (wl.myWaitlistedEvents.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No waitlisted events"
        description="Events you've joined the waitlist for will show up here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {wl.myWaitlistedEvents.map((w) => (
        <Card key={w.id} className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {w.event?.title}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Badge tone={w.status}>Waitlisted</Badge>
              <span>Position #{w.position}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
              View Event
            </button>
            <button
              onClick={() => setLeaveTarget(w)}
              className="text-xs font-medium text-red-400 hover:text-red-300"
            >
              Leave Waitlist
            </button>
          </div>
        </Card>
      ))}

      <WaitlistConfirmationModal
        open={!!leaveTarget}
        mode="leave"
        eventTitle={leaveTarget?.event?.title}
        loading={wl.loading}
        onCancel={() => setLeaveTarget(null)}
        onConfirm={async () => {
          await wl.leaveWaitlist(leaveTarget.id);
          setLeaveTarget(null);
        }}
      />
    </div>
  );
}
