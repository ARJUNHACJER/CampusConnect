import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, Badge, Button } from "../../../shared/ui/primitives";
import CallConfirmDialog from "./CallConfirmDialog";

/**
 * ContactCard
 * ---------------------------------------------------------------------------
 * Renders a single emergency/help contact with mobile-friendly action
 * buttons. Calling always goes through a confirmation dialog (showing the
 * contact name + number) before handing off to the device's native dialer.
 * Never simulates completing a call.
 * ---------------------------------------------------------------------------
 */
export default function ContactCard({ contact }) {
  const {
    name,
    description,
    phone,
    email,
    location,
    availability,
    priority,
  } = contact;

  const is247 = (availability || "").trim().toUpperCase() === "24/7";
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{name}</h3>
          {description ? (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
          ) : null}
        </div>
        {priority === 1 ? <Badge tone="indigo">Primary</Badge> : null}
      </div>

      <div className="space-y-2 text-xs text-slate-300">
        {location ? (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-500 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        ) : null}
        {phone ? (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-500 shrink-0" />
            <span>{phone}</span>
          </div>
        ) : null}
        {email ? (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-500 shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        ) : null}
        {availability ? (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-500 shrink-0" />
            <span>
              Available: <span className="text-slate-200 font-medium">{availability}</span>
            </span>
            {is247 ? <Badge tone="green" className="ml-1">24/7</Badge> : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {phone ? (
          <Button
            icon={Phone}
            size="sm"
            className="flex-1 min-w-[120px]"
            onClick={() => setConfirmOpen(true)}
          >
            Call Now
          </Button>
        ) : null}
        {email ? (
          <Button
            variant="secondary"
            as="a"
            href={`mailto:${email}`}
            icon={Mail}
            size="sm"
            className="flex-1 min-w-[100px]"
          >
            Email
          </Button>
        ) : null}
        {location ? (
          <Button
            variant="secondary"
            icon={MapPin}
            size="sm"
            className="flex-1 min-w-[130px]"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  location
                )}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            View Location
          </Button>
        ) : null}
      </div>

      <CallConfirmDialog
        open={confirmOpen}
        name={name}
        phone={phone}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  );
}
