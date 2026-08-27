// src/components/profile/ui/theme.js
//
// Pulled directly from CampusConnectLogin.jsx so every new screen matches
// the existing look exactly — same surface colors, borders, radii, buttons.

export const theme = {
  page: "min-h-screen w-full bg-[#0b0a14]",
  card: "rounded-2xl border border-white/10 bg-linear-to-br from-[#151225] via-[#181229] to-[#0f0d1c] shadow-2xl",
  subCard: "rounded-xl border border-white/10 bg-white/[0.03]",
  inputWrap:
    "flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-colors",
  input: "w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none",
  label: "block text-sm font-medium text-slate-300 mb-2",
  helpText: "text-xs text-slate-500 mt-1.5",
  errorText: "text-xs text-rose-400 mt-1.5",
  primaryBtn:
    "rounded-xl bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-[0.99] transition-all py-3 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
  secondaryBtn:
    "rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors py-3 px-6 text-sm font-medium text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed",
  ghostBtn: "text-sm text-slate-400 hover:text-slate-200 transition-colors py-3 px-4",
  chip: "flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200",
  chipRemove: "text-violet-400 hover:text-white",
};

export function progressBarColor(percent) {
  if (percent >= 90) return "from-emerald-500 to-teal-400";
  if (percent >= 50) return "from-violet-600 to-purple-500";
  return "from-orange-500 to-pink-500";
}
