import React, { useState } from "react";
import { Pencil, KeyRound } from "lucide-react";
import { Field, inputClass, PrimaryButton, SecondaryButton } from "../components/AdminUI";
import { useTimedMessage } from "../../components/ui/useTimedMessage";
import { supabase } from "../../supabaseClient";

export default function AdminProfile({ currentUser }) {
  const adminName = currentUser?.name || currentUser?.email || "Administrator";
  const adminEmail = currentUser?.email || "Admin account";
  const initialForm = { name: adminName, email: adminEmail, department: "" };
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Auto-dismissing status message. Restarts its own timer on each show()
  // and cleans up on unmount, so repeated saves never stack timers.
  const { message, show: showMessage } = useTimedMessage(2500);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xl font-semibold text-white">
          {adminName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-semibold text-white">{adminName}</p>
          <p className="text-sm text-slate-400">Administrator</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">
        {editing ? (
          <>
            <Field label="Full Name">
              <input className={inputClass} value={form.name} onChange={update("name")} />
            </Field>
            <Field label="Email">
              <input className={inputClass} value={form.email} onChange={update("email")} />
            </Field>
            <Field label="Department / Organization">
              <input className={inputClass} value={form.department} onChange={update("department")} />
            </Field>
            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={() => { setForm(initialForm); setEditing(false); }}>Cancel</SecondaryButton>
              <PrimaryButton onClick={async () => {
                const { error: authError } = await supabase.auth.updateUser({ data: { full_name: form.name } });
                const { error: profileError } = await supabase.from("profiles").update({ full_name: form.name, updated_at: new Date().toISOString() }).eq("user_id", currentUser.id);
                if (authError || profileError) { showMessage({ type: "error", text: authError?.message || profileError?.message || "Could not save profile" }); return; }
                showMessage({ type: "success", text: "Profile saved" }); setEditing(false);
              }}>Save Changes</PrimaryButton>
            </div>
          </>
        ) : (
          <>
            <Row label="Name" value={form.name} />
            <Row label="Email" value={form.email} />
            <Row label="Role" value="Administrator" />
            <Row label="Department / Organization" value={form.department} />
            <div className="flex flex-wrap gap-3 pt-2">
              <SecondaryButton onClick={() => setEditing(true)}>
                <span className="inline-flex items-center gap-1.5"><Pencil size={14} /> Edit Profile</span>
              </SecondaryButton>
              <SecondaryButton onClick={() => setChangingPassword(true)}>
                <span className="inline-flex items-center gap-1.5"><KeyRound size={14} /> Change Password</span>
              </SecondaryButton>
            </div>
          </>
        )}
      </div>

      {changingPassword && (
        <div className="fixed inset-0 z-90 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setChangingPassword(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0d1220] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-4">Change Password</h3>
            <div className="space-y-4">
              <Field label="Current Password">
                <input type="password" className={inputClass} placeholder="Current password is not required" disabled />
              </Field>
              <Field label="New Password">
                <input type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </Field>
              <Field label="Confirm New Password">
                <input type="password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <SecondaryButton className="flex-1" onClick={() => setChangingPassword(false)}>Cancel</SecondaryButton>
              <PrimaryButton className="flex-1" onClick={async () => {
                if (newPassword.length < 6 || newPassword !== confirmPassword) { showMessage({ type: "error", text: "Passwords must match and contain at least 6 characters" }); return; }
                const { error } = await supabase.auth.updateUser({ password: newPassword });
                if (error) { showMessage({ type: "error", text: error.message }); return; }
                showMessage({ type: "success", text: "Password updated" }); setNewPassword(""); setConfirmPassword(""); setChangingPassword(false);
              }}>Update</PrimaryButton>
            </div>
          </div>
        </div>
      )}
      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${message.type === "error" ? "text-red-400" : "text-emerald-300"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  );
}
