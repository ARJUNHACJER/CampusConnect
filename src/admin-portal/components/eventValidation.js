/**
 * eventValidation.js
 * -----------------------------------------------------------------------
 * Single source of truth for event-creation validation. Used both by the
 * admin EventForm (inline field errors) and by the save handler right
 * before it writes to Supabase (defense-in-depth, so invalid data can't be
 * submitted even if the form is bypassed). A matching set of CHECK
 * constraints lives in the 005 migration for true backend enforcement.
 *
 * Operates on the FORM shape (camelCase): name, description, category,
 * date, startTime, endTime, venue, maxParticipants, registrationDeadline.
 * Returns an object of { fieldKey: message }; empty object == valid.
 */
export function validateEventForm(form, { requireAll = true } = {}) {
  const errors = {};
  const name = (form.name || "").trim();
  const description = (form.description || "").trim();
  const venue = (form.venue || "").trim();

  // A title is required even for drafts — a nameless draft is useless.
  if (!name) errors.name = "Event name is required.";

  if (requireAll) {
    if (!description) errors.description = "Description is required.";
    if (!form.date) errors.date = "Event date is required.";
    if (!form.startTime) errors.startTime = "Start time is required.";
    if (!form.endTime) errors.endTime = "End time is required.";
    if (!venue) errors.venue = "Venue is required.";
    if (!(form.organizer || "").trim()) errors.organizer = "Organizer is required.";
    if (!(form.department || "").trim()) errors.department = "Department is required.";
    if (!(form.eligibility || "").trim()) errors.eligibility = "Eligibility is required.";
  }

  // Max participants: required on publish; whenever present it must be a
  // whole number greater than zero.
  const rawMax = form.maxParticipants;
  const hasMax = rawMax !== "" && rawMax !== null && rawMax !== undefined;
  if (requireAll && !hasMax) {
    errors.maxParticipants = "Enter the maximum number of participants.";
  } else if (hasMax) {
    const n = Number(rawMax);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      errors.maxParticipants = "Participants must be a whole number greater than 0.";
    }
  }

  // Guard against manually-set invalid dates (native input constrains format).
  if (form.date && Number.isNaN(new Date(form.date).getTime())) {
    errors.date = "Enter a valid date.";
  }

  // Registration deadline can't be after the event itself.
  if (form.registrationDeadline && form.date && form.registrationDeadline > form.date) {
    errors.registrationDeadline = "Deadline can't be after the event date.";
  }

  // Times: if both are given, end must be strictly after start (same-day).
  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.endTime = "End time must be after the start time.";
  }

  return errors;
}

export default validateEventForm;
