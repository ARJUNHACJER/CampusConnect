import { emptyResumeData, makeId } from "../defaultResumeData";

/**
 * Copies data out of the CampusConnect `profile` object (from useProfile())
 * into a brand-new, independent resume data object.
 *
 * IMPORTANT: This performs a deep copy. Nothing here keeps a reference back
 * to the original profile, so editing the resume never touches the
 * student's CampusConnect profile.
 *
 * The exact shape of `profile` depends on campusconnect-profile's context.
 * Field lookups below are defensive (optional chaining + fallbacks) so this
 * keeps working even if some profile fields are missing or renamed —
 * adjust the paths on the right-hand side to match your real profile shape.
 */
export function importProfileIntoResume(profile) {
  const data = emptyResumeData();
  if (!profile) return data;

  const basic = profile.basic || {};
  const academic = profile.academic || profile.education || {};
  const educationFields = academic.fields || {};
  const institution = profile.institution || {};
  const links = profile.links || profile.social || profile.portfolio || {};
  const skillsSrc = profile.skills || {};
  const projectsSrc = profile.projects || [];
  const certsSrc = profile.certifications || [];
  const achievementsSrc = profile.achievements || [];

  data.personal = {
    fullName: basic.fullName || basic.displayName || "",
    title: basic.professionalTitle || basic.headline || profile.career?.goal || "",
    email: basic.email || "",
    phone: basic.phone || basic.phoneNumber || "",
    location: basic.location || basic.city || institution.campusLocation || institution.city || "",
    linkedin: links.linkedin || basic.linkedin || "",
    github: links.github || basic.github || "",
    portfolio: links.portfolio || basic.portfolio || "",
  };

  const collegeName = academic.college || academic.university || academic.institution || institution.name;
  if (collegeName) {
    data.education = [
      {
        id: makeId("edu"),
        institution: collegeName,
        degree: educationFields.course || academic.course || academic.program || academic.degree || academic.type || "",
        branch: educationFields.branch || educationFields.department || educationFields.specialization || academic.branch || academic.department || academic.specialization || "",
        startYear: educationFields.startYear || academic.startYear || "",
        endYear: educationFields.expectedGraduation || educationFields.endYear || academic.endYear || academic.graduationYear || "",
        grade: educationFields.cgpaPercentage || academic.cgpa || academic.percentage || "",
      },
    ];
  }

  const toSkillArray = (val) =>
    Array.isArray(val)
      ? val
      : typeof val === "string" && val.trim()
      ? val.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  data.skills = {
    languages: toSkillArray(skillsSrc.programmingLanguages || skillsSrc.languages),
    frameworks: toSkillArray(skillsSrc.frameworks),
    databases: toSkillArray(skillsSrc.databases),
    tools: toSkillArray(skillsSrc.tools),
    other: toSkillArray(skillsSrc.other || profile.skills?.otherSkills),
  };

  if (profile.career?.roles?.length) {
    data.skills.other = [...data.skills.other, ...toSkillArray(profile.career.roles)];
  }

  if (Array.isArray(projectsSrc) && projectsSrc.length) {
    data.projects = projectsSrc.map((p) => ({
      id: makeId("proj"),
      name: p.name || p.title || "",
      description: p.description || "",
      technologies: Array.isArray(p.technologies) ? p.technologies.join(", ") : p.technologies || "",
      githubUrl: p.githubUrl || p.github || "",
      liveUrl: p.liveUrl || p.demoUrl || "",
    }));
  }

  if (Array.isArray(certsSrc) && certsSrc.length) {
    data.certifications = certsSrc.map((c) => ({
      id: makeId("cert"),
      name: c.name || c.title || "",
      organization: c.organization || c.issuer || "",
      date: c.date || "",
      credentialUrl: c.credentialUrl || c.url || "",
    }));
  }

  if (Array.isArray(achievementsSrc) && achievementsSrc.length) {
    data.achievements = achievementsSrc.map((a) => ({
      id: makeId("ach"),
      title: typeof a === "string" ? a : a.title || "",
    }));
  }

  return data;
}
