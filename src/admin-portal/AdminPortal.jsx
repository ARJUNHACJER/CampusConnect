import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminEventsCreate, AdminEventsManage } from "./pages/AdminEvents";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminResults from "./pages/AdminResults";
import AdminStudents from "./pages/AdminStudents";
import AdminCertificates from "./pages/AdminCertificates";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminProfile from "./pages/AdminProfile";
import AdminOpportunities from "../components/OpportunitiesFolder/components/admin/opportunities/AdminOpportunities";
import CreateOpportunity from "../components/OpportunitiesFolder/components/admin/opportunities/CreateOpportunity";
import OpportunityDetails from "../components/OpportunitiesFolder/components/opportunities/OpportunityDetails";
import AdminEmergencyHelp from "../components/EmergencyAndEventClash/src/features/admin/emergency/AdminEmergencyHelp";
import { createOpportunity, updateOpportunity } from "../components/OpportunitiesFolder/services/opportunitiesService";

/**
 * AdminPortal.jsx
 * -----------------------------------------------------------------------
 * Single entry point for the whole Admin Portal. Drop this in alongside
 * the existing CampusConnectDashboard (Student Portal) component and
 * mount it behind a role check.
 *
 * ROLE-BASED ACCESS
 * `currentUserRole` below stands in for whatever your auth/session state
 * provides (Supabase auth + a `role` column on `users`, a JWT claim,
 * context, etc). This component itself does NOT decide who is an admin —
 * it only refuses to render admin content when the role isn't "admin".
 * The actual gate belongs one level up, in your router:
 *
 *   <Route path="/admin/*" element={
 *     user.role === "admin" ? <AdminPortal /> : <Navigate to="/unauthorized" />
 *   } />
 *
 * IMPORTANT — this is a frontend convenience only. It stops a student
 * from *seeing* admin screens; it does not stop API calls. Every
 * mutation this portal makes (create event, publish results, mark
 * attendance, etc.) must ALSO be enforced with Supabase Row Level
 * Security policies keyed off `auth.uid()` and the user's role, e.g.:
 *
 *   create policy "Only admins can insert events"
 *     on events for insert
 *     using (exists (
 *       select 1 from users where id = auth.uid() and role = 'admin'
 *     ));
 * -----------------------------------------------------------------------
 */

export function UnauthorizedPage({ onBackToDashboard }) {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-red-500/15 flex items-center justify-center mb-5">
          <ShieldAlert size={26} className="text-red-400" />
        </div>
        <h1 className="text-lg font-semibold text-white">You don't have access to this page</h1>
        <p className="text-sm text-slate-400 mt-2">
          This area is restricted to CampusConnect administrators. If you believe this is a mistake, contact the
          Student Affairs Office.
        </p>
        <button
          onClick={onBackToDashboard}
          className="mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-indigo-500 to-purple-600 hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function AdminPortal({ currentUserRole = "admin", currentUser, onExitAdmin, onLogout }) {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);

  // Defense in depth: even if this component is reached by mistake,
  // it refuses to render admin content for non-admins.
  if (currentUserRole !== "admin") {
    return <UnauthorizedPage onBackToDashboard={onExitAdmin} />;
  }

  const navigate = (page, event = null) => {
    setSelectedEvent(page === "events-create" ? event : selectedEvent);
    setCurrentPage(page);
  };

  // Create when there's no id in play, update when editing an existing row.
  // CreateOpportunity emits a payload already shaped for the `opportunities`
  // table (see opportunitiesService / migration 001).
  const persistOpportunity = async (payload) => {
    try {
      if (selectedOpportunityId) {
        await updateOpportunity(selectedOpportunityId, payload);
      } else {
        await createOpportunity(payload);
      }
      setSelectedOpportunityId(null);
      setCurrentPage("opportunities-manage");
    } catch (err) {
      console.error("Failed to save opportunity:", err);
      window.alert(err.message || "Could not save opportunity.");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard onNavigate={navigate} />;
      case "events-create":
        return <AdminEventsCreate onNavigate={navigate} event={selectedEvent} />;
      case "events-manage":
        return <AdminEventsManage onNavigate={navigate} onSelectEvent={setSelectedEvent} />;
      case "registrations":
        return <AdminRegistrations selectedEvent={selectedEvent} />;
      case "announcements":
        return <AdminAnnouncements />;
      case "results":
        return <AdminResults />;
      case "students":
        return <AdminStudents />;
      case "certificates":
        return <AdminCertificates />;
      case "analytics":
        return <AdminAnalytics />;
      case "profile":
        return <AdminProfile currentUser={currentUser} />;
      case "opportunities-manage":
        return (
          <AdminOpportunities
            onCreateNew={() => {
              setSelectedOpportunityId(null);
              setCurrentPage("opportunities-create");
            }}
            onView={(id) => {
              setSelectedOpportunityId(id);
              setCurrentPage("opportunities-view");
            }}
            onEdit={(id) => {
              setSelectedOpportunityId(id);
              setCurrentPage("opportunities-create");
            }}
          />
        );
      case "opportunities-create":
        return (
          <CreateOpportunity
            opportunityId={selectedOpportunityId}
            onBack={() => {
              setSelectedOpportunityId(null);
              setCurrentPage("opportunities-manage");
            }}
            onSaveDraft={persistOpportunity}
            onPublish={persistOpportunity}
          />
        );
      case "opportunities-view":
        return (
          <OpportunityDetails
            opportunityId={selectedOpportunityId}
            currentUserId={currentUser?.id}
            onBack={() => setCurrentPage("opportunities-manage")}
          />
        );
      case "emergency-help":
        return <AdminEmergencyHelp />;
      default:
        return <AdminDashboard onNavigate={navigate} />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onNavigate={navigate} onLogout={onLogout} currentUser={currentUser}>
      {renderPage()}
    </AdminLayout>
  );
}
