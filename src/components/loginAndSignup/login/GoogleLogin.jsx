import React, { useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function GoogleLogin() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error("Google login error:", error.message);
        alert(error.message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors py-2.5 text-sm font-medium text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span>🔵</span>
      {loading ? "Connecting..." : "Google"}
    </button>
  );
}