import React, { useState } from "react";
import GoogleLogin from "./login/GoogleLogin";

export default function CampusConnectSignup({ onSignup, onCollegeSso, onLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0a14] p-3 sm:p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-[#151225] via-[#181229] to-[#0f0d1c] shadow-2xl sm:rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative flex flex-col justify-between overflow-hidden p-8 sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3 sm:mb-14">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 text-xl shadow-lg shadow-purple-900/40">⚡</div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Campus <span className="text-orange-400">Connect</span></h1>
              </div>
              <h2 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl">Create your<br />CampusConnect<br /><span className="bg-linear-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">account.</span></h2>
              <p className="max-w-md text-base text-slate-400 sm:text-lg">One account for your profile, events, registrations, notes, and campus experience.</p>
            </div>
            <p className="relative z-10 mt-12 text-xs text-slate-500 sm:text-sm">Your profile stays with your account.</p>
          </div>

          <div className="flex items-center justify-center border-t border-white/10 bg-black/20 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-14">
            <div className="w-full max-w-sm">
              <h3 className="mb-1 text-2xl font-bold text-white sm:text-3xl">Create account</h3>
              <p className="mb-8 text-sm text-slate-400">Start with your login details. We will collect your profile next.</p>

              <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onSignup?.({ fullName, email, password }); }}>
                <label className="block text-sm font-medium text-slate-300">Full name
                  <input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500" />
                </label>
                <label className="block text-sm font-medium text-slate-300">Email address
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="something@college.edu" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500" />
                </label>
                <label className="block text-sm font-medium text-slate-300">Password
                  <div className="mt-2 flex rounded-xl border border-white/10 bg-white/5 focus-within:border-violet-500">
                    <input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="px-3 text-xs text-slate-500 hover:text-slate-300">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                </label>
                <button type="submit" className="w-full rounded-xl bg-linear-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 hover:from-violet-500 hover:to-purple-500">Create account</button>
              </form>

              <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-white/10" /><span className="text-xs text-slate-500">or</span><div className="h-px flex-1 bg-white/10" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <GoogleLogin />
                <button type="button" onClick={onCollegeSso} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"><span>🎓</span> College SSO</button>
              </div>
              <p className="mt-7 text-center text-sm text-slate-400">Already have an account? <button type="button" onClick={onLogin} className="font-medium text-violet-400 hover:text-violet-300">Login now</button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
