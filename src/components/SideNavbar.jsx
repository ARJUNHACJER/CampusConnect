import React, { useState, useEffect, useCallback } from "react";

// Context & Services
import { useProfile } from "../campusconnect-profile/src/context/useProfile";
import { supabase } from "../supabaseClient";

// Feature Components
import CampusConnectDashboard2 from "./CampusConnectDashboard";
//import BrowseEvents from "./browseEvents/BrowseEvents";
import BrowseEvents from "./browseEvents/BrowseEvents";
//import EventDetails from "./browseEvents/EventDetails";
import EventDetails from "./browseEvents/EventDetails";
import MyRegistrations from "../Features/Myregistrations";
import Schedule from "../Features/Schedule";
import Announcements from "../Features/Announcements/Announcements";
import Results from "../Features/Results";
//import QuickNotes from "./QuickNotes";
import QuickNotes from "./quickNotes/QuickNotes"
import ResumeBuilder from "../Features/ResumeBuilder/ResumeBuilder";
import CareerRoadmaps from "../Features/CareerRoadmaps/CareerRoadmaps";
import ProfilePage from "../campusconnect-profile/src/components/profile/ProfilePage";
import ProfileWizard from "../campusconnect-profile/src/components/profile/wizard/ProfileWizard";
//Opportunities
import OpportunityBoard from "./OpportunitiesFolder/components/opportunities/OpportunityBoard";
import OpportunityDetails from "./OpportunitiesFolder/components/opportunities/OpportunityDetails";
// Emergency & Certificates
import EmergencyHelp from "./EmergencyAndEventClash/src/features/emergency/EmergencyHelp";
import CertificatesHub from "./WaitingListAndCertificates/certificates/CertificatesHub";
// Icons
import {
  Briefcase,
  Zap,
  LayoutDashboard,
  Compass,
  ClipboardList,
  CalendarDays,
  Megaphone,
  Trophy,
  StickyNote,
  FileText,
  Map,
  User,
  LogOut,
  Menu,
  X,
  Award,
  LifeBuoy,
} from "lucide-react";

/* ==========================================================================
   NAVIGATION CONFIGURATION
   ========================================================================== */

const NAV_SECTIONS = [
  {
    title: "MAIN",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "browse-events", label: "Browse Events", icon: Compass },
      { id: "opportunities", label: "Opportunities", icon: Briefcase }, // NEW
      { id: "my-registrations", label: "My Registrations", icon: ClipboardList },
      { id: "schedule", label: "Schedule", icon: CalendarDays },
    ],
  },
  {
    title: "UPDATES",
    items: [
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "results", label: "Results", icon: Trophy },
    ],
  },
  {
    title: "STUDENT TOOLKIT",
    items: [
      { id: "quick-notes", label: "Quick Notes", icon: StickyNote },
      { id: "resume-builder", label: "Resume Builder", icon: FileText },
      { id: "career-roadmaps", label: "Career Roadmaps", icon: Map },
      { id: "certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { id: "emergency-help", label: "Emergency & Help", icon: LifeBuoy },
    ],
  },
];

// Mapping for backward compatibility with label-based navigation calls
const NAV_LABEL_TO_ID = {
  "Dashboard": "dashboard",
  "Browse Events": "browse-events",
  "My Registrations": "my-registrations",
  "Schedule": "schedule",
  "Announcements": "announcements",
  "Results": "results",
  "Quick Notes": "quick-notes",
  "Resume Builder": "resume-builder",
  "Career Roadmaps": "career-roadmaps",
  "Opportunities" : "opportunities",
  "Certificates": "certificates",
  "Emergency & Help": "emergency-help",
  "Profile": "profile",
  "profile-wizard": "profile-wizard",
};

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */

function getInitials(name = "User") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"
  );
}

/* ==========================================================================
   SUBCOMPONENTS
   ========================================================================== */

/**
 * Individual sidebar navigation button item
 */
function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30 shadow-sm"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon
        size={18}
        className={`shrink-0 transition-colors ${active ? "text-indigo-400" : "text-slate-400"}`}
      />
      <span className="flex-1 text-left truncate">{label}</span>
      {badge ? (
        <span className="bg-red-500 text-white text-[11px] font-semibold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/**
 * Grouped navigation section with category header
 */
function NavSection({ title, items, currentPage, onNavigate }) {
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold tracking-widest text-slate-500 mb-2 uppercase">
        {title}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            active={currentPage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Bottom user profile display card
 */
function UserProfileCard({ userName, userEmail }) {
  const initials = getInitials(userName);

  return (
    <div className="mx-4 mb-5 mt-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 border border-white/5">
      <div className="h-9 w-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold text-white text-sm shrink-0 shadow-sm">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate" title={userName}>
          {userName}
        </p>
        <p className="text-xs text-slate-400 truncate" title={userEmail}>
          {userEmail}
        </p>
      </div>
    </div>
  );
}

/**
 * Shared sidebar content used for both desktop and mobile drawer
 */
function SidebarContent({ currentPage, onNavigate, onLogout, userName, userEmail }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-6 border-b border-white/5">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          Campus <span className="text-orange-400">Connect</span>
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <NavSection
            key={section.title}
            title={section.title}
            items={section.items}
            currentPage={currentPage}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Account Actions */}
      <div className="px-4 pb-2 pt-2 space-y-1 border-t border-white/5">
        <p className="px-3 text-[11px] font-semibold tracking-widest text-slate-500 mb-2 uppercase">
          Account
        </p>
        <NavItem
          icon={User}
          label="Profile"
          active={currentPage === "profile" || currentPage === "profile-wizard"}
          onClick={() => onNavigate("profile")}
        />
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Info Card */}
      <UserProfileCard userName={userName} userEmail={userEmail} />
    </div>
  );
}

/* ==========================================================================
   MAIN DASHBOARD COMPONENT
   ========================================================================== */

export default function SideNavbar({ currentUser, onLogout }) {
  const { profile } = useProfile();

  // Resolved user identity with safe fallbacks
  const userName =
    profile?.basic?.displayName ||
    profile?.basic?.fullName ||
    currentUser?.name ||
    "CampusConnect User";

  const userEmail =
    profile?.basic?.email ||
    currentUser?.email ||
    "Student account";

  // Application routing & view states
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProfileSection, setSelectedProfileSection] = useState("basic");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileNavOpen]);

  /* =========================
     NAVIGATION HANDLERS
     ========================= */

  const handleNavigate = useCallback((destination) => {
    // Resolve page ID whether passed as ID (e.g. 'browse-events') or label (e.g. 'Browse Events')
    const resolvedPageId = NAV_LABEL_TO_ID[destination] || destination;
    setCurrentPage(resolvedPageId);
    setMobileNavOpen(false);
  }, []);

  const handleOpenEvent = useCallback((event) => {
    setSelectedEvent(event);
    setCurrentPage("event-details");
  }, []);

  const handleBackToBrowse = useCallback(() => {
    setSelectedEvent(null);
    setCurrentPage("browse-events");
  }, []);

  //Opportunities
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(null);

  const handleViewOpportunity = useCallback((id) => {
    setSelectedOpportunityId(id);
    setCurrentPage("opportunity-details");
  }, []);

  const handleBackToOpportunities = useCallback(() => {
    setSelectedOpportunityId(null);
    setCurrentPage("opportunities");
  }, []);

  const handleEditProfileSection = useCallback((section) => {
    setSelectedProfileSection(section);
    setCurrentPage("profile-wizard");
  }, []);

  const handleOpenEventById = useCallback(async (eventId) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .maybeSingle();

      if (data && !error) {
        setSelectedEvent({
          ...data,
          startTime: data.start_time || "",
          endTime: data.end_time || "",
        });
        setCurrentPage("event-details");
      }
    } catch (err) {
      console.error("Failed to load event details:", err);
    }
  }, []);

  /* =========================
     PAGE CONTENT RENDERER
     ========================= */

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <CampusConnectDashboard2
            userName={userName}
            onNavigate={handleNavigate}
            onOpenEvent={handleOpenEventById}
          />
        );

      case "browse-events":
        return <BrowseEvents onOpenEvent={handleOpenEvent} />;

      case "event-details":
        return (
          <EventDetails
            event={selectedEvent}
            onBack={handleBackToBrowse}
          />
        );

      case "my-registrations":
        return (
          <MyRegistrations
            onNavigateToBrowse={() => setCurrentPage("browse-events")}
            onOpenCertificates={() => setCurrentPage("certificates")}
          />
        );

      case "schedule":
        return (
          <Schedule
            onNavigateToBrowse={() => setCurrentPage("browse-events")}
            onOpenEvent={handleOpenEventById}
          />
        );

      case "announcements":
        return <Announcements onViewEvent={handleOpenEventById} />;

      case "results":
        return <Results />;

      case "quick-notes":
        return <QuickNotes />;

      case "resume-builder":
        return (
          <ResumeBuilder
            onNavigateToProfile={() => setCurrentPage("profile-wizard")}
          />
        );

      case "career-roadmaps":
        return <CareerRoadmaps />;

      case "opportunities":
        return (
          <OpportunityBoard
            currentUserId={currentUser?.id}
            onViewOpportunity={handleViewOpportunity}
          />
        );

      case "opportunity-details":
        return (
          <OpportunityDetails
            opportunityId={selectedOpportunityId}
            currentUserId={currentUser?.id}
            onBack={handleBackToOpportunities}
          />
        );

      case "certificates":
        return <CertificatesHub studentId={currentUser?.id} />;

      case "emergency-help":
        return <EmergencyHelp />;

      case "profile":
        return (
          <ProfilePage
            onEditSection={handleEditProfileSection}
            onExploreEvents={() => setCurrentPage("browse-events")}
          />
        );

      case "profile-wizard":
        return (
          <ProfileWizard
            startAtSection={selectedProfileSection}
            onFinish={() => setCurrentPage("profile")}
            onCancel={() => setCurrentPage("profile")}
          />
        );

      default:
        return (
          <CampusConnectDashboard2
            userName={userName}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col border-r border-white/10 bg-[#0d1220] sticky top-0 h-screen shrink-0">
        <SidebarContent
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={onLogout}
          userName={userName}
          userEmail={userEmail}
        />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar Drawer */}
          <aside className="fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-[#0d1220] border-r border-white/10 shadow-2xl z-10 flex flex-col">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-5 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>

            <SidebarContent
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onLogout={onLogout}
              userName={userName}
              userEmail={userEmail}
            />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header Menu Button */}
        <div className="lg:hidden p-4 border-b border-white/5 bg-[#0d1220]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-bold text-white">Campus Connect</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Dynamic Page Views */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
