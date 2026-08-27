import React, { useState } from "react";
import GoogleLogin from "./login/GoogleLogin";

export default function CampusConnectLogin({ onLogin, onCollegeSso, onCreateAccount }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const features = [
    { icon: "⚡", text: "Register for 50+ events instantly" },
    { icon: "📊", text: "Live results and leaderboards" },
    { icon: "🤖", text: "AI-powered event recommendations" },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0a14] p-3 sm:p-6">
      <div className="w-full max-w-6xl rounded-2xl sm:rounded-3xl border border-white/10 bg-linear-to-br from-[#151225] via-[#181229] to-[#0f0d1c] shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left panel */}
          <div className="relative flex flex-col justify-between p-8 sm:p-10 lg:p-14 overflow-hidden">
            {/* ambient glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-10 sm:mb-14">
                <div className="h-11 w-11 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-purple-900/40 shrink-0">
                  ⚡
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Campus <span className="text-orange-400">Connect</span>
                </h1>
              </div>

              {/* Headline */}
              <div className="mb-6">
                <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                  Your fest.
                  <br />
                  Your way.
                  <br />

                  <span className="bg-linear-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    All in one place.
                  </span>
                </h2>
              </div>

              <p className="text-slate-400 text-base sm:text-lg max-w-md mb-10 sm:mb-14">
                Register for events, track results, get AI recommendations, and
                never miss a moment of the fest.
              </p>

              {/* Feature list */}
              <ul className="space-y-4 sm:space-y-5">
                {features.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-base">
                      {f.icon}
                    </span>

                    <span className="text-slate-200 text-sm sm:text-base">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative z-10 mt-12 lg:mt-0 text-xs sm:text-sm text-slate-500">
              One Campus. One Fest. One Experience. ✦
            </p>
          </div>

          {/* Right panel */}
          <div className="flex items-center justify-center bg-black/20 border-t border-white/10 lg:border-t-0 lg:border-l p-8 sm:p-10 lg:p-14">
            <div className="w-full max-w-sm">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Welcome back 👋
              </h3>

              <p className="text-slate-400 text-sm mb-8">
                Sign in to your CampusConnect account
              </p>

              <form className="space-y-5" onSubmit={(e) => {
                e.preventDefault();
                onLogin?.({ email, password, remember });
              }}>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Email Address
                  </label>

                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-colors">
                    <span className="text-slate-500 text-sm shrink-0">
                      📧
                    </span>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="something@college.edu"
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Password
                    </label>

                    <a
                      href="#"
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-colors">
                    <span className="text-amber-400 text-sm shrink-0">
                      🔒
                    </span>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-xs text-slate-500 hover:text-slate-300 shrink-0"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded accent-violet-500"
                  />

                  <span className="text-sm text-slate-300">
                    Remember me for 30 days
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-[0.99] transition-all py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/30"
                >
                  Sign In →
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-7">
                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-slate-500">or</span>

                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google Login */}
                <GoogleLogin />

                {/* College SSO */}
                <button
                  type="button"
                  onClick={onCollegeSso}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors py-2.5 text-sm font-medium text-slate-200"
                >
                  <span>🎓</span>
                  College SSO
                </button>
              </div>

              <p className="text-center text-sm text-slate-400 mt-7">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Create one free →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}