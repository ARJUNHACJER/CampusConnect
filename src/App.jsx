import { useEffect, useState } from "react";
import CampusConnectLogin from "./components/loginAndSignup/CampusConnectLogin";
import CampusConnectSignup from "./components/loginAndSignup/CampusConnectSignup";

import SideNavbar from "./components/SideNavbar";
import AdminPortal from "./admin-portal/AdminPortal";
import { supabase } from "./supabaseClient";
import { ProfileProvider } from "./campusconnect-profile/src/context/ProfileContext";
import { useProfile } from "./campusconnect-profile/src/context/useProfile";
import ProfileWizard from "./campusconnect-profile/src/components/profile/wizard/ProfileWizard";

function getAuthUserDetails(user) {
  const metadata = user?.user_metadata || {};
  const rawProvider = user?.app_metadata?.provider || user?.identities?.[0]?.provider || "email";
  const provider = rawProvider === "google" ? "google" : rawProvider === "email" ? "email" : "sso";

  return {
    id: user.id,
    authProvider: provider,
    name: metadata.full_name || metadata.name || "",
    email: user.email || metadata.email || "",
  };
}

function AuthenticatedContent({ currentUser, onLogout }) {
  const { loading, isNewUser } = useProfile();
  const [profileFinished, setProfileFinished] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-[#0b0a14] flex items-center justify-center text-slate-300">Loading your profile...</div>;
  }

  if (isNewUser && !profileFinished) {
    return <ProfileWizard startAtSection="basic" onFinish={() => setProfileFinished(true)} onCancel={() => setProfileFinished(true)} />;
  }

  return <SideNavbar currentUser={currentUser} onLogout={onLogout} />;
}

function AuthenticatedApp({ user, onLogout }) {
  const currentUser = getAuthUserDetails(user);

  if (user?.app_metadata?.role === "admin") {
    return <AdminPortal currentUserRole="admin" currentUser={currentUser} onLogout={onLogout} onExitAdmin={() => window.location.assign("/")} />;
  }

  return (
    <ProfileProvider
      userId={currentUser.id}
      authProvider={currentUser.authProvider}
      authName={currentUser.name}
      authEmail={currentUser.email}
    >
      <AuthenticatedContent currentUser={currentUser} onLogout={onLogout} />
    </ProfileProvider>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authView, setAuthView] = useState("login");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      const rememberUntil = Number(localStorage.getItem("campusconnect_remember_until"));
      if (rememberUntil && rememberUntil < Date.now()) {
        localStorage.removeItem("campusconnect_remember_until");
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(data.session?.user || null);
      }
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user || null);
      setCheckingSession(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async ({ email, password, remember }) => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      localStorage.setItem("campusconnect_remember_until", remember ? String(Date.now() + 30 * 24 * 60 * 60 * 1000) : "");
    }
    if (error) setAuthError(error.message);
  };

  const handleSignup = async ({ email, password, fullName }) => {
    setAuthError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setAuthError(error.message);
      return;
    }
    if (!data.session) {
      setAuthError("Account created. Check your email to confirm your account, then log in.");
      setAuthView("login");
    }
  };

  const handleCollegeSso = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo: window.location.origin },
    });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  };

  if (checkingSession) {
    return <div className="min-h-screen bg-[#0b0a14] flex items-center justify-center text-slate-300">Checking login...</div>;
  }

  if (!user) {
    return (
      <>
        {authError && <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-500/90 px-4 py-3 text-sm text-white">{authError}</div>}
        {authView === "login" ? (
          <CampusConnectLogin
            onLogin={handleLogin}
            onCollegeSso={handleCollegeSso}
            onCreateAccount={() => {
              setAuthError("");
              setAuthView("signup");
            }}
          />
        ) : (
          <CampusConnectSignup
            onSignup={handleSignup}
            onCollegeSso={handleCollegeSso}
            onLogin={() => {
              setAuthError("");
              setAuthView("login");
            }}
          />
        )}
      </>
    );
  }

  return <AuthenticatedApp user={user} onLogout={handleLogout} />;
}
