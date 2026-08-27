import React from "react";
import { Card } from "../../../shared/ui/primitives";
import { useClashSettings } from "./useClashSettings";

/**
 * ClashDetectionSettings
 * ---------------------------------------------------------------------------
 * Drop this card into the existing Admin event-management/settings screen
 * (do NOT create a new top-level admin page for it — the spec says only
 * to add it "if it fits the existing architecture").
 *
 * Controls:
 *  - Event Clash Detection: Enabled / Disabled
 *  - Registration Conflict Mode: Warning Only / Strict Blocking
 * Defaults: Enabled + Warning Only.
 * ---------------------------------------------------------------------------
 */
export default function ClashDetectionSettings() {
  const { settings, loading, updateSettings } = useClashSettings();

  if (loading) return null;

  return (
    <Card className="p-5 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-white">Event Clash Detection</h3>
        <p className="text-xs text-slate-400 mt-1">
          Warn students when they try to register for overlapping events.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-200">Enabled</p>
          <p className="text-xs text-slate-500">Detect and flag schedule conflicts</p>
        </div>
        <Toggle
          checked={settings.enabled}
          onChange={(enabled) => updateSettings({ ...settings, enabled })}
        />
      </div>

      <div className={settings.enabled ? "" : "opacity-40 pointer-events-none"}>
        <p className="text-sm font-medium text-slate-200 mb-2">Registration Conflict Mode</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ModeOption
            label="Warning Only"
            description="Students can still register after confirming"
            active={settings.mode === "warning"}
            onClick={() => updateSettings({ ...settings, mode: "warning" })}
          />
          <ModeOption
            label="Strict Blocking"
            description="Overlapping registrations are not allowed"
            active={settings.mode === "strict"}
            onClick={() => updateSettings({ ...settings, mode: "strict" })}
          />
        </div>
      </div>
    </Card>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors ${
        checked ? "bg-indigo-500" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ModeOption({ label, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl px-4 py-3 border transition-colors ${
        active
          ? "bg-indigo-500/15 border-indigo-500/40"
          : "bg-white/5 border-white/10 hover:bg-white/[0.07]"
      }`}
    >
      <p className={`text-sm font-semibold ${active ? "text-indigo-300" : "text-slate-200"}`}>
        {label}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </button>
  );
}
