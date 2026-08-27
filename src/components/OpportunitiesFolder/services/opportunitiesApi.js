/**
 * opportunitiesApi.js
 * ------------------------------------------------------------------
 * Talks to the external opportunities provider. We use the **Arbeitnow
 * public Job Board API**:
 *
 *     https://www.arbeitnow.com/api/job-board-api
 *
 * Why this provider:
 *   • FREE and requires NO API key / authentication — verified against
 *     the live endpoint (HTTP 200, no auth header) and documented at
 *     https://www.arbeitnow.com/blog/job-board-api ("requires no API key").
 *   • CORS-enabled, so the browser can call it directly.
 *   • Paginates with `?page=` (see `meta`/`links` in the response).
 *
 * India scope (section 1): CampusConnect serves students in India, so live
 * results are filtered to Indian locations via `isIndiaLocation()` before they
 * reach the board or the admin sync. Arbeitnow is EU-centric, so in practice
 * the curated Supabase `opportunities` table is the primary India source; set
 * VITE_OPPORTUNITIES_API_URL to an India-capable provider to feed the live gate.
 *
 * Official response shape (these are the EXACT keys the API returns —
 * nothing here is invented):
 *   {
 *     "data": [
 *       {
 *         "slug":         string,      // stable id → our source_id
 *         "company_name": string,
 *         "title":        string,
 *         "description":  string,      // HTML — stripped before display
 *         "remote":       boolean,     // → mode: remote | onsite
 *         "url":          string,      // → apply_url
 *         "tags":         string[],    // → skills
 *         "job_types":    string[],    // → type: internship | job
 *         "location":     string,
 *         "created_at":   number       // unix seconds
 *       }, ...
 *     ],
 *     "links": { first, last, prev, next },
 *     "meta":  { current_page, per_page, ... }
 *   }
 *
 * All external-API fetch logic lives here — components and the sync
 * service never call `fetch` directly.
 * ------------------------------------------------------------------
 */

// The FULL endpoint URL (not a base path). Overridable per environment,
// but no key is ever required or sent — we never add a fake API key.
const API_URL = (
  import.meta.env.VITE_OPPORTUNITIES_API_URL || "https://www.arbeitnow.com/api/job-board-api"
).replace(/\/+$/, "");

// Arbeitnow returns ~175 jobs per page; a couple of pages is plenty for a
// campus board. Increase for more history.
const DEFAULT_PAGES = 2;
const DEFAULT_IMAGE_URL = "/assets/opportunity-default.png";

async function fetchJobsPage(page = 1) {
  const url = `${API_URL}${API_URL.includes("?") ? "&" : "?"}page=${page}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Arbeitnow API error ${res.status} while fetching jobs (page ${page})`);
  }
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * Fetches the raw external job listings (one or more pages) and returns
 * the provider's objects untouched — the sync service normalizes them.
 * Throws only if *every* page request failed (so a partial outage still
 * yields whatever pages succeeded).
 */
export async function getExternalOpportunities({ pages = DEFAULT_PAGES } = {}) {
  const pageNums = Array.from({ length: Math.max(1, pages) }, (_, i) => i + 1);
  const results = await Promise.allSettled(pageNums.map((p) => fetchJobsPage(p)));
  const jobs = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  if (jobs.length === 0 && results.every((r) => r.status === "rejected")) {
    const reason = results[0]?.reason;
    throw reason instanceof Error ? reason : new Error("Failed to reach the opportunities provider.");
  }
  return jobs;
}

/**
 * Board-ready LIVE opportunities: fetched, normalized, and given a stable
 * synthetic `id` (`ext:<source>:<source_id>`) so the student board can
 * render — and save — them even before an admin has synced them into
 * Supabase. `q` filters client-side across title/org/description/skills.
 */
export async function getLiveOpportunities({ pages = DEFAULT_PAGES, q = "" } = {}) {
  const raw = await getExternalOpportunities({ pages });
  let items = raw
    .map((r) => {
      const n = normalizeOpportunity(r);
      return { ...n, id: `ext:${n.source}:${n.source_id}`, is_active: true };
    })
    // India-only: drop any live listing not based in India (section 1).
    .filter((o) => isIndiaLocation(o.location));

  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    items = items.filter((o) =>
      [o.title, o.organization, o.description, ...(o.skills || [])]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  return items;
}

/** Strips HTML tags + common entities from the provider's rich-text description. */
function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Arbeitnow's `job_types` are free-form (e.g. "Full Time", "Internship",
// "Working student", "Intern", "Praktikum"). Anything internship-ish maps
// to our "internship" type; everything else is a general "job".
const INTERNSHIP_HINT = /(intern|working student|trainee|apprentice|werkstudent|praktik|\bstudent\b)/i;
function deriveType(jobTypes) {
  const joined = (Array.isArray(jobTypes) ? jobTypes : []).join(" ");
  return INTERNSHIP_HINT.test(joined) ? "internship" : "job";
}

// CampusConnect serves students in India, so live external listings are
// restricted to Indian locations (country/location filtering, section 1).
// Matches "India" plus the major hiring hubs; remote-from-abroad postings are
// intentionally excluded so foreign roles never leak onto the campus board.
// If VITE_OPPORTUNITIES_API_URL is pointed at an India-capable provider, its
// India listings flow straight through this same gate.
const INDIA_LOCATION_HINT =
  /\b(india|bharat|bengaluru|bangalore|mumbai|navi mumbai|new delhi|delhi|ncr|hyderabad|chennai|kolkata|calcutta|pune|ahmedabad|gurgaon|gurugram|noida|jaipur|kochi|cochin|chandigarh|indore|coimbatore|trivandrum|thiruvananthapuram|visakhapatnam|vizag|nagpur|lucknow|bhopal|surat|vadodara|mysuru|mysore|mangalore|mangaluru|nashik|patna|ranchi|bhubaneswar|goa)\b/i;

/** True when a listing's location string indicates it's based in India. */
export function isIndiaLocation(location) {
  return INDIA_LOCATION_HINT.test(String(location || ""));
}

/**
 * Maps an Arbeitnow job into our internal `opportunities` shape. Missing
 * fields get safe defaults so the UI never has to guard against `undefined`.
 * Returns a DB-insertable object (no `id`) — the sync service inserts it and
 * lets Postgres assign the uuid.
 */
export function normalizeOpportunity(raw, sourceName = "arbeitnow") {
  const tags = Array.isArray(raw?.tags) ? raw.tags.filter(Boolean) : [];
  const isRemote = raw?.remote === true;
  const location = raw?.location || (isRemote ? "Remote" : "Not specified");
  const createdAtIso = raw?.created_at
    ? new Date(Number(raw.created_at) * 1000).toISOString()
    : null;

  return {
    title: raw?.title || "Untitled Opportunity",
    type: deriveType(raw?.job_types),
    organization: raw?.company_name || "Not specified",
    description: stripHtml(raw?.description),
    location,
    mode: isRemote ? "remote" : "onsite",
    skills: tags.slice(0, 12),
    eligibility: "Open to all applicants",
    stipend: "Not specified",
    deadline: null, // Arbeitnow doesn't publish deadlines → treated as rolling.
    apply_url: raw?.url || null,
    source: sourceName,
    source_id:
      raw?.slug != null ? String(raw.slug) : deterministicId(sourceName, raw?.title, raw?.company_name),
    image_url: DEFAULT_IMAGE_URL,
    is_external: true,
    status: "published",
    // Preserve the provider's posting date so "Newest" sorting is meaningful.
    ...(createdAtIso ? { created_at: createdAtIso } : {}),
  };
}

/**
 * Deterministic fallback identifier for the rare listing without a slug —
 * hashes source+title+organization so re-syncing the same listing always
 * produces the same source_id (dedupe via UNIQUE(source, source_id)).
 */
function deterministicId(source, title, org) {
  const base = `${source}|${title || ""}|${org || ""}`.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (Math.imul(hash, 31) + base.charCodeAt(i)) >>> 0;
  }
  return `gen_${hash.toString(16)}`;
}
