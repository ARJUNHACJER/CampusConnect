import React from "react";
import { Phone, PhoneCall } from "lucide-react";
import { Modal, Button } from "../../../shared/ui/primitives";

/**
 * CallConfirmDialog
 * ---------------------------------------------------------------------------
 * Confirmation step shown before placing an emergency call. It surfaces the
 * exact contact name and number so the user can verify who they're calling,
 * then hands off to the device's native dialer via a `tel:` link.
 *
 * On mobile, confirming opens the phone dialer. On desktop (no dialer), the
 * number is shown prominently so it can be dialed manually — the tel: link is
 * still provided for systems that route it to Skype / a softphone.
 * ---------------------------------------------------------------------------
 */
export default function CallConfirmDialog({ open, name, phone, onCancel }) {
  const telHref = phone ? `tel:${String(phone).replace(/[^+\d]/g, "")}` : null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Confirm call"
      maxWidth="max-w-sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            as="a"
            href={telHref || undefined}
            icon={PhoneCall}
            variant="success"
            disabled={!telHref}
            onClick={onCancel}
          >
            Call now
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center gap-2">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Phone size={22} className="text-emerald-400" />
        </div>
        <p className="text-sm text-slate-400">You're about to call</p>
        <p className="text-base font-semibold text-white">{name || "this contact"}</p>
        {phone ? (
          <a href={telHref} className="text-xl font-bold tracking-wide text-emerald-300">
            {phone}
          </a>
        ) : (
          <p className="text-sm text-red-300">No phone number available for this contact.</p>
        )}
        <p className="mt-1 text-xs text-slate-500">
          On a phone this opens your dialer. On a computer, dial the number above manually.
        </p>
      </div>
    </Modal>
  );
}
