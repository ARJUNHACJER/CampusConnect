import React, { useState } from "react";
import BrowseEvents from "./BrowseEvents";
import EventDetails from "./EventDetails";

/* =========================================================
   CampusConnectDashboard3
   -----------------------------------------------------------
   A minimal, self-contained Browse Events -> Event Details flow.
   App.jsx imports this directly; it isn't rendered by the main
   CampusConnectDashboard (which already embeds the same two
   pages behind its own sidebar), so this exists as a standalone
   entry point for whoever wires it in — e.g. a simplified public
   "browse without logging in" route later.
========================================================= */

export default function CampusConnectDashboard3() {
  const [selectedEvent, setSelectedEvent] = useState(true);

  const handleOpenEvent = (event) => setSelectedEvent(event);
  const handleBack = () => setSelectedEvent(null);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200">
      {selectedEvent ? (
        <EventDetails event={selectedEvent} onBack={handleBack} />
      ) : (
        <BrowseEvents onOpenEvent={handleOpenEvent} />
      )}
    </div>
  );
}
