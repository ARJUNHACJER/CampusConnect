import React from "react";
import { Clock } from "lucide-react";
import { Button } from "../shared/ui";

/**
 * Renders the correct CTA for an event's registration/waitlist state.
 * Purely presentational — parent owns the click handler so it can be
 * wired to whichever modal / navigation the surrounding page needs.
 */
export default function JoinWaitlistButton({
  state, // "open" | "full" | "waitlisted" | "offered" | "registered" | "completed"
  position,
  onRegister,
  onJoinWaitlist,
  onViewWaitlist,
  onViewRegistration,
  onAcceptSeat,
  size = "md",
  className = "",
}) {
  switch (state) {
    case "open":
      return (
        <Button size={size} className={className} onClick={onRegister}>
          Register
        </Button>
      );
    case "full":
      return (
        <Button
          size={size}
          className={className}
          onClick={onJoinWaitlist}
          variant="secondary"
        >
          <Clock size={16} />
          Join Waitlist
        </Button>
      );
    case "waitlisted":
      return (
        <Button
          size={size}
          className={className}
          variant="secondary"
          onClick={onViewWaitlist}
        >
          Waitlisted{position ? ` · #${position}` : ""}
        </Button>
      );
    case "offered":
      return (
        <Button size={size} className={className} onClick={onAcceptSeat}>
          Accept Seat
        </Button>
      );
    case "registered":
      return (
        <Button
          size={size}
          className={className}
          variant="secondary"
          onClick={onViewRegistration}
        >
          View Registration
        </Button>
      );
    case "completed":
      return (
        <Button size={size} className={className} variant="ghost" disabled>
          View Event
        </Button>
      );
    default:
      return null;
  }
}
