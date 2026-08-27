import React, { useMemo, useState } from "react";
import { Siren, HeartPulse, UserCog, Phone } from "lucide-react";
import { Card, Button, EmptyState, LoadingState } from "../../shared/ui/primitives";
import { CONTACT_CATEGORIES } from "./mockData";
import { useEmergencyContacts } from "./hooks/useEmergencyContacts";
import EmergencyCategory from "./components/EmergencyCategory";
import EmergencyNotice from "./components/EmergencyNotice";
import CallConfirmDialog from "./components/CallConfirmDialog";

/**
 * EmergencyHelp.jsx
 * ---------------------------------------------------------------------------
 * Route: /help
 * Student-facing Emergency & Help Center. Designed for speed and clarity —
 * quick action cards up top, then a categorized contact directory.
 * Only shows contacts with active = true (enforced in useEmergencyContacts).
 * ---------------------------------------------------------------------------
 */

const QUICK_ACTIONS = [
  {
    id: "security",
    icon: Siren,
    tone: "text-red-400 bg-red-500/10",
    title: "Campus Security",
    description: "Contact campus security for immediate assistance.",
    buttonLabel: "Call Security",
  },
  {
    id: "medical",
    icon: HeartPulse,
    tone: "text-amber-400 bg-amber-500/10",
    title: "Medical Help",
    description: "Contact the campus medical center or medical support.",
    buttonLabel: "Call Medical Help",
  },
  {
    id: "student-support",
    icon: UserCog,
    tone: "text-indigo-400 bg-indigo-500/10",
    title: "Help Desk",
    description: "For general campus assistance and student support.",
    buttonLabel: "Contact Help Desk",
  },
  {
    id: "numbers",
    icon: Phone,
    tone: "text-emerald-400 bg-emerald-500/10",
    title: "Emergency Contact",
    description: "Important emergency contact information.",
    buttonLabel: "View Emergency Numbers",
  },
];

export default function EmergencyHelp() {
  const { contacts, loading } = useEmergencyContacts();
  const [callTarget, setCallTarget] = useState(null);

  const contactsByCategory = useMemo(() => {
    const map = {};
    CONTACT_CATEGORIES.forEach((cat) => (map[cat.id] = []));
    contacts.forEach((contact) => {
      if (!map[contact.category]) map[contact.category] = [];
      map[contact.category].push(contact);
    });
    // sort each category by priority
    Object.keys(map).forEach((key) => {
      map[key] = [...map[key]].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
    });
    return map;
  }, [contacts]);

  // Primary contact per quick-action category, for one-tap calling.
  const primaryContactFor = (categoryId) => {
    const list = contactsByCategory[categoryId] || [];
    return list.find((c) => c.phone) || null;
  };

  const handleQuickAction = (action) => {
    if (action.id === "numbers") {
      document.getElementById("important-contacts")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const contact = primaryContactFor(action.id);
    if (contact?.phone) {
      // Confirm before dialing — show who is being called and the number.
      setCallTarget({ name: contact.name || action.title, phone: contact.phone });
    } else {
      document.getElementById("important-contacts")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hasAnyContacts = contacts.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Emergency &amp; Help</h1>
          <p className="text-sm text-slate-400 mt-1">
            Quick access to important campus contacts and support services.
          </p>
        </div>
        <EmergencyNotice variant="banner" />
      </div>

      {/* Quick Help Section */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.id} className="p-5 flex flex-col gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${action.tone}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{action.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <Button
                  size="md"
                  className="w-full"
                  onClick={() => handleQuickAction(action)}
                >
                  {action.buttonLabel}
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Important Contacts */}
      <section id="important-contacts" className="space-y-6 scroll-mt-6">
        <h2 className="text-base font-semibold text-white">Important Contacts</h2>

        {loading ? (
          <LoadingState label="Loading campus contacts…" />
        ) : !hasAnyContacts ? (
          <Card>
            <EmptyState
              icon={Phone}
              title="No contacts configured yet"
              description="Your college admin hasn't added emergency or help contacts yet. Please check back soon."
            />
          </Card>
        ) : (
          CONTACT_CATEGORIES.map((category) => (
            <EmergencyCategory
              key={category.id}
              category={category}
              contacts={contactsByCategory[category.id]}
            />
          ))
        )}
      </section>

      {/* Footer Notice */}
      <EmergencyNotice variant="footer" />

      {/* Call confirmation */}
      <CallConfirmDialog
        open={!!callTarget}
        name={callTarget?.name}
        phone={callTarget?.phone}
        onCancel={() => setCallTarget(null)}
      />
    </div>
  );
}
