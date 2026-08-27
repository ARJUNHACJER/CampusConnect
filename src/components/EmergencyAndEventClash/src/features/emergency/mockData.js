import { Siren, HeartPulse, UserCog, Building2 } from "lucide-react";

/**
 * mockData.js
 * ---------------------------------------------------------------------------
 * Default emergency contacts. These are REAL, public, nationwide Indian
 * emergency / helpline numbers — used as a safe baseline so students are
 * never left without emergency contacts when a college admin hasn't yet
 * configured campus-specific ones through /admin/help. Once the admin adds
 * rows to the Supabase `emergency_contacts` table, those take precedence
 * (see useEmergencyContacts). The shape matches the table exactly.
 * ---------------------------------------------------------------------------
 */

export const CONTACT_CATEGORIES = [
  { id: "security", label: "Security", icon: Siren, tone: "red" },
  { id: "medical", label: "Medical", icon: HeartPulse, tone: "amber" },
  { id: "student-support", label: "Student Support", icon: UserCog, tone: "indigo" },
  { id: "campus-services", label: "Campus Services", icon: Building2, tone: "neutral" },
];

export const MOCK_EMERGENCY_CONTACTS = [
  {
    id: "contact_112",
    name: "National Emergency Number",
    category: "security",
    description: "Single all-in-one emergency number for police, fire, and medical help across India.",
    phone: "112",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 1,
    active: true,
  },
  {
    id: "contact_100",
    name: "Police",
    category: "security",
    description: "Police control room for crime, safety, and security emergencies.",
    phone: "100",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 2,
    active: true,
  },
  {
    id: "contact_101",
    name: "Fire Brigade",
    category: "security",
    description: "Fire and rescue services for fire-related emergencies.",
    phone: "101",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 3,
    active: true,
  },
  {
    id: "contact_108",
    name: "Ambulance (Emergency Medical)",
    category: "medical",
    description: "Free 24/7 emergency ambulance and medical response service.",
    phone: "108",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 1,
    active: true,
  },
  {
    id: "contact_102",
    name: "Medical Helpline",
    category: "medical",
    description: "Medical and maternal/child health helpline.",
    phone: "102",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 2,
    active: true,
  },
  {
    id: "contact_kiran",
    name: "KIRAN Mental Health Helpline",
    category: "student-support",
    description: "Government mental-health support: stress, anxiety, depression, and crisis counselling.",
    phone: "1800-599-0019",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 1,
    active: true,
  },
  {
    id: "contact_ragging",
    name: "UGC Anti-Ragging Helpline",
    category: "student-support",
    description: "National anti-ragging helpline for students facing ragging or harassment.",
    phone: "1800-180-5522",
    email: "helpline@antiragging.in",
    location: "Nationwide",
    availability: "24/7",
    priority: 2,
    active: true,
  },
  {
    id: "contact_women",
    name: "Women Helpline",
    category: "student-support",
    description: "Support for women in distress, including harassment and safety concerns.",
    phone: "1091",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 3,
    active: true,
  },
  {
    id: "contact_cyber",
    name: "Cyber Crime Helpline",
    category: "campus-services",
    description: "Report online fraud, cyberbullying, and other cyber crimes.",
    phone: "1930",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 1,
    active: true,
  },
  {
    id: "contact_childline",
    name: "Childline (Under 18)",
    category: "campus-services",
    description: "Emergency helpline for children and minors in distress.",
    phone: "1098",
    email: null,
    location: "Nationwide",
    availability: "24/7",
    priority: 2,
    active: true,
  },
];
