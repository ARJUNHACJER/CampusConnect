import React from "react";
import { CheckCircle2, Clock, XCircle, Circle } from "lucide-react";
import { Badge } from "../shared/ui";

const CONFIG = {
  open: { tone: "open", icon: Circle, label: "Registration Open" },
  full: { tone: "full", icon: XCircle, label: "Event Full" },
  waitlisted: { tone: "waiting", icon: Clock, label: "Waitlisted" },
  offered: { tone: "offered", icon: Clock, label: "Seat Offered" },
  registered: { tone: "registered", icon: CheckCircle2, label: "Registered" },
  completed: { tone: "completed", icon: CheckCircle2, label: "Completed" },
};

/** Small status pill used on Event Details and Browse Events cards. */
export default function WaitlistStatus({ state, position, className = "" }) {
  const cfg = CONFIG[state] || CONFIG.open;
  const Icon = cfg.icon;
  return (
    <Badge tone={cfg.tone} className={className}>
      <Icon size={12} />
      {cfg.label}
      {state === "waitlisted" && position ? ` #${position}` : ""}
    </Badge>
  );
}
