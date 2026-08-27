import { SECTION_KEYS } from "../defaultResumeData";

/**
 * Builds the same set of section-render functions for any template, so
 * templates only need to differ in header layout, typography and color —
 * not in how each section's data is turned into markup.
 *
 * `cx` is a small class-name bundle so each template can restyle sections
 * without duplicating this logic: { title, text, muted, heading }
 */
export function buildSectionRenderers(data, cx) {
  return {
    [SECTION_KEYS.summary]: () =>
      data.summary && (
        <section>
          <p className={cx.title}>Summary</p>
          <p className={cx.text}>{data.summary}</p>
        </section>
      ),
    [SECTION_KEYS.education]: () =>
      data.education?.length > 0 && (
        <section>
          <p className={cx.title}>Education</p>
          <div className="space-y-2">
            {data.education.map((e) => (
              <div key={e.id} className={cx.text}>
                <div className={`flex flex-wrap justify-between gap-x-3 ${cx.heading}`}>
                  <span>{e.institution}</span>
                  <span className={cx.muted}>{e.startYear}{e.startYear && e.endYear ? " – " : ""}{e.endYear}</span>
                </div>
                <p className={cx.muted}>{[e.degree, e.branch].filter(Boolean).join(", ")}{e.grade ? ` · ${e.grade}` : ""}</p>
              </div>
            ))}
          </div>
        </section>
      ),
    [SECTION_KEYS.skills]: () => {
      const groups = Object.entries(data.skills || {}).filter(([, v]) => v?.length);
      if (!groups.length) return null;
      return (
        <section>
          <p className={cx.title}>Skills</p>
          <div className={`space-y-1 ${cx.text}`}>
            {groups.map(([key, values]) => (
              <p key={key}><span className={cx.heading}>{key}: </span>{values.join(", ")}</p>
            ))}
          </div>
        </section>
      );
    },
    [SECTION_KEYS.projects]: () =>
      data.projects?.length > 0 && (
        <section>
          <p className={cx.title}>Projects</p>
          <div className="space-y-2.5">
            {data.projects.map((p) => (
              <div key={p.id} className={cx.text}>
                <p className={cx.heading}>
                  {p.name}
                  {(p.githubUrl || p.liveUrl) && <span className={`font-normal ${cx.muted}`}> — {[p.githubUrl, p.liveUrl].filter(Boolean).join(" · ")}</span>}
                </p>
                {p.description && <p>{p.description}</p>}
                {p.technologies && <p className={`italic ${cx.muted}`}>{p.technologies}</p>}
              </div>
            ))}
          </div>
        </section>
      ),
    [SECTION_KEYS.experience]: () =>
      data.experience?.length > 0 && (
        <section>
          <p className={cx.title}>Experience</p>
          <div className="space-y-2.5">
            {data.experience.map((x) => (
              <div key={x.id} className={cx.text}>
                <div className={`flex flex-wrap justify-between gap-x-3 ${cx.heading}`}>
                  <span>{x.role}{x.company ? ` · ${x.company}` : ""}</span>
                  <span className={cx.muted}>{x.startDate}{x.startDate && x.endDate ? " – " : ""}{x.endDate}</span>
                </div>
                {x.description && <p>{x.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ),
    [SECTION_KEYS.certifications]: () =>
      data.certifications?.length > 0 && (
        <section>
          <p className={cx.title}>Certifications</p>
          <ul className={`list-disc list-inside space-y-0.5 ${cx.text}`}>
            {data.certifications.map((c) => (
              <li key={c.id}>{c.name}{c.organization ? ` — ${c.organization}` : ""}{c.date ? ` (${c.date})` : ""}</li>
            ))}
          </ul>
        </section>
      ),
    [SECTION_KEYS.achievements]: () =>
      data.achievements?.length > 0 && (
        <section>
          <p className={cx.title}>Achievements</p>
          <ul className={`list-disc list-inside space-y-0.5 ${cx.text}`}>
            {data.achievements.map((a) => <li key={a.id}>{a.title}</li>)}
          </ul>
        </section>
      ),
    [SECTION_KEYS.activities]: () =>
      data.activities?.length > 0 && (
        <section>
          <p className={cx.title}>Workshops &amp; Activities</p>
          <ul className={`list-disc list-inside space-y-0.5 ${cx.text}`}>
            {data.activities.map((a) => <li key={a.id}><span className={cx.heading}>{a.type}:</span> {a.title}</li>)}
          </ul>
        </section>
      ),
    [SECTION_KEYS.languages]: () =>
      data.languagesSpoken?.length > 0 && (
        <section>
          <p className={cx.title}>Languages</p>
          <p className={cx.text}>{data.languagesSpoken.map((l) => `${l.name} (${l.proficiency})`).join(", ")}</p>
        </section>
      ),
  };
}
