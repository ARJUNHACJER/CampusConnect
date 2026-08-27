import React, { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Trash2, X } from "lucide-react";
import { inputClass, EmptyState, PrimaryButton, SecondaryButton } from "../components/AdminUI";
import { supabase } from "../../supabaseClient";

function mapStudent(row) {
  return { ...row, name: row.full_name || row.email || "Unnamed student", collegeId: row.user_id, department: row.department || "", year: row.year || "", status: "Active" };
}

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [message, setMessage] = useState("");

  const loadStudents = async () => {
    const { data, error } = await supabase.from("profiles").select("user_id, full_name, email, phone, updated_at").order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setStudents((data || []).map(mapStudent));
  };

  useEffect(() => {
    loadStudents();
    const timer = setInterval(loadStudents, 10000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => students.filter((student) => `${student.name} ${student.email} ${student.user_id}`.toLowerCase().includes(search.toLowerCase())), [students, search]);

  const saveStudent = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: draft.name, email: draft.email, phone: draft.phone, updated_at: new Date().toISOString() }).eq("user_id", draft.user_id);
    if (error) setMessage(error.message);
    else { setMessage("Student updated"); setSelected(null); await loadStudents(); }
  };

  const deleteStudent = async (student) => {
    if (!window.confirm(`Delete profile for ${student.name}?`)) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", student.user_id);
    if (error) setMessage(error.message);
    else { setMessage("Student profile deleted"); await loadStudents(); }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className={`${inputClass} pl-10`} placeholder="Search by name, email, or user ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {message && <p className="text-sm text-slate-400">{message}</p>}
      <p className="text-xs text-slate-500">{filtered.length} students from Supabase</p>
      {filtered.length === 0 ? <EmptyState title="No students found" description="Students appear here after they create a profile." /> : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Student</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Actions</th></tr></thead>
            <tbody>{filtered.map((student) => <tr key={student.user_id} className="border-t border-white/10 text-slate-300"><td className="p-4 font-medium text-white">{student.name}</td><td className="p-4">{student.email}</td><td className="p-4">{student.phone || "-"}</td><td className="p-4"><div className="flex gap-2"><button title="Edit student" onClick={() => { setSelected(student); setDraft({ ...student }); }} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><Pencil size={15} /></button><button title="Delete profile" onClick={() => deleteStudent(student)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"><Trash2 size={15} /></button></div></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1220] p-6"><div className="mb-5 flex items-center justify-between"><h3 className="font-semibold text-white">Edit student</h3><button onClick={() => setSelected(null)}><X size={18} className="text-slate-400" /></button></div><div className="space-y-4"><label className="block text-sm text-slate-300">Name<input className={`${inputClass} mt-2`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label><label className="block text-sm text-slate-300">Email<input className={`${inputClass} mt-2`} value={draft.email || ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label><label className="block text-sm text-slate-300">Phone<input className={`${inputClass} mt-2`} value={draft.phone || ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label></div><div className="mt-6 flex justify-end gap-3"><SecondaryButton onClick={() => setSelected(null)}>Cancel</SecondaryButton><PrimaryButton onClick={saveStudent}>Save</PrimaryButton></div></div></div>}
    </div>
  );
}
