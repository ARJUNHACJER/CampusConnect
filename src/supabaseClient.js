import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Access tokens are short-lived JWTs (~1h). The client auto-refreshes in the
 * background, but there's a race: after a tab has sat idle past the token's
 * expiry, the very first request on return can go out with the stale token and
 * come back `401 { message: "JWT expired" }` before the refresh lands. That's
 * the "JWT expired" you see when clicking around after a while.
 *
 * This transport wrapper closes that gap: on a 401 caused by an expired JWT it
 * refreshes the session once and replays the request with the fresh token. If
 * the refresh itself fails (refresh token revoked/expired), it returns the
 * original 401 — GoTrue then emits SIGNED_OUT and the app falls back to the
 * login screen instead of erroring on every click.
 */
async function fetchWithAuthRetry(input, init) {
  const response = await fetch(input, init);

  // Only intervene on string-URL requests that failed auth, and never on the
  // token endpoint itself (that would loop).
  if (response.status !== 401 || typeof input !== "string") return response;
  if (input.includes("/auth/v1/")) return response;

  let isJwtError = false;
  try {
    const body = await response.clone().json();
    isJwtError =
      typeof body?.message === "string" &&
      body.message.toLowerCase().includes("jwt");
  } catch {
    isJwtError = false;
  }
  if (!isJwtError) return response;

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data?.session) return response;

  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `Bearer ${data.session.access_token}`);
  return fetch(input, { ...init, headers });
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: { fetch: fetchWithAuthRetry },
});
