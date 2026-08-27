import React, { useState } from "react";
import {
  Zap,
  LayoutDashboard,
  PlusCircle,
  ListChecks,
  ClipboardCheck,
  Megaphone,
  Trophy,
  GraduationCap,
  Award,
  BarChart3,
  Briefcase,
  LifeBuoy,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { ConfirmationModal } from "./AdminUI";

/**
 * AdminLayout.jsx
 * -----------------------------------------------------------------------
 * Mirrors the Student Portal's sidebar shell (same background colors,
 * spacing, NavItem treatment, mobile drawer behavior) so the Admin
 * Portal feels like part of the same product, not a bolted-on template.
 *
 * ROUTE MAP (for future react-router migration):
 *   dashboard              -> /admin
 *   events-create          -> /admin/events/create
 *   events-manage          -> /admin/events
 *   registrations          -> /admin/events/:eventId/registrations
 *   announcements          -> /admin/announcements
 *   results                -> /admin/results
 *   students               -> /admin/students
 *   certificates           -> /admin/certificates
 *   analytics              -> /admin/analytics
 *   profile                -> /admin/profile
 * -----------------------------------------------------------------------
 */

const navMain = [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }];

const navEvents = [
  { id: "events-create", label: "Create Event", icon: PlusCircle },
  { id: "events-manage", label: "Manage Events", icon: ListChecks },
  { id: "registrations", label: "Registrations", icon: ClipboardCheck },
];

const navUpdates = [
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "results", label: "Results", icon: Trophy },
];

const navStudents = [{ id: "students", label: "Student Management", icon: GraduationCap }];

const navExtra = [
  { id: "opportunities-manage", label: "Opportunities", icon: Briefcase },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "emergency-help", label: "Emergency & Help", icon: LifeBuoy },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-500/30"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={18} className={active ? "text-indigo-400" : ""} />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

function NavGroup({ label, items, currentPage, onNavigate }) {
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold tracking-widest text-slate-500 mb-2">{label}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentPage === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SidebarContent({ currentPage, onNavigate, onLogoutClick, adminName, adminEmail, avatarInitials }) {
  return (
    <div className="flex h-full flex-col">
      {/* LOGO */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-6">
        <div className="h-9 w-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap size={18} className="text-white" fill="white" />
        </div>
        <span className="text-lg font-bold text-white">
          Campus <span className="text-orange-400">Connect</span>
        </span>
        <span className="ml-auto text-[10px] font-semibold tracking-wide text-indigo-300 bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/30 px-2 py-1 rounded-lg">
          ADMIN
        </span>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6">
        <NavGroup label="MAIN" items={navMain} currentPage={currentPage} onNavigate={onNavigate} />
        <NavGroup label="EVENTS" items={navEvents} currentPage={currentPage} onNavigate={onNavigate} />
        <NavGroup label="UPDATES" items={navUpdates} currentPage={currentPage} onNavigate={onNavigate} />
        <NavGroup label="STUDENTS" items={navStudents} currentPage={currentPage} onNavigate={onNavigate} />
        <NavGroup label="MORE" items={navExtra} currentPage={currentPage} onNavigate={onNavigate} />
      </nav>

      {/* ACCOUNT */}
      <div className="px-4 pb-4 pt-2 space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-widest text-slate-500 mb-2">ACCOUNT</p>
        <NavItem
          icon={User}
          label="Profile"
          active={currentPage === "profile"}
          onClick={() => onNavigate("profile")}
        />
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* ADMIN CARD */}
      <div className="mx-4 mb-5 mt-1 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
        <div className="h-9 w-9 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold text-white text-sm shrink-0">
          {avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{adminName}</p>
          <p className="text-xs text-slate-400 truncate">{adminEmail}</p>
        </div>
      </div>
    </div>
  );
}

const PAGE_TITLES = {
  dashboard: "Dashboard",
  "events-create": "Create Event",
  "events-manage": "Manage Events",
  registrations: "Registrations",
  announcements: "Announcements",
  results: "Results",
  students: "Student Management",
  certificates: "Certificates",
  analytics: "Analytics",
  "opportunities-manage": "Manage Opportunities",
  "opportunities-create": "Create Opportunity",
  "opportunities-view": "Opportunity Details",
  "emergency-help": "Emergency & Help",
  profile: "Profile",
};

export default function AdminLayout({ currentPage, onNavigate, onLogout, currentUser, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const adminName = currentUser?.name || currentUser?.email || "Administrator";
  const adminEmail = currentUser?.email || "Admin account";
  const avatarInitials = adminName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const navigate = (page) => {
    onNavigate(page);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col border-r border-white/10 bg-[#0d1220] sticky top-0 h-screen">
        <SidebarContent
          currentPage={currentPage}
          onNavigate={navigate}
          onLogoutClick={() => setLogoutModalOpen(true)}
          adminName={adminName}
          adminEmail={adminEmail}
          avatarInitials={avatarInitials}
        />
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-[#0d1220] border-r border-white/10 shadow-2xl">
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-5 right-4 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent
              currentPage={currentPage}
              onNavigate={navigate}
              onLogoutClick={() => setLogoutModalOpen(true)}
              adminName={adminName}
              adminEmail={adminEmail}
              avatarInitials={avatarInitials}
            />
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-[#0b0f1a]/90 backdrop-blur px-4 py-3 lg:px-8 lg:py-4">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5"
          >
            <Menu size={22} />
          </button>

          <h1 className="text-base lg:text-lg font-semibold text-white">
            {PAGE_TITLES[currentPage] || "Admin Portal"}
          </h1>

          <button
            onClick={() => navigate("profile")}
            className="ml-auto flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-semibold text-white text-xs">
              {avatarInitials}
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </header>

        <main className="p-4 lg:p-8 max-w-350 mx-auto w-full">{children}</main>
      </div>

      {/* LOGOUT CONFIRMATION */}
      <ConfirmationModal
        open={logoutModalOpen}
        title="Are you sure you want to logout?"
        description="You'll need to sign in again to access the Admin Portal."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        destructive
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          onLogout();
        }}
      />
    </div>
  );
}
