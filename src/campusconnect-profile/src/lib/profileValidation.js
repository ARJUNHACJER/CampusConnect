// src/lib/profileValidation.js
//
// Returns { fieldKey: "error message" } for a given section's draft data.
// An empty object means the section is valid and the wizard can advance.

import { getEducationFields } from "./educationConfig";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;

const required = (val) => (Array.isArray(val) ? val.length > 0 : String(val || "").trim().length > 0);

export function validateBasic(data) {
  const errors = {};
  if (!required(data.fullName)) errors.fullName = "Full name is required.";
  if (!required(data.email)) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(data.email)) errors.email = "Enter a valid email address.";
  if (!required(data.phone)) errors.phone = "Phone number is required.";
  else if (!PHONE_RE.test(data.phone)) errors.phone = "Enter a valid 10-digit phone number.";
  return errors;
}

export function validateEducation(data) {
  const errors = {};
  if (!required(data.type)) {
    errors.type = "Please select your education type.";
    return errors;
  }
  const fields = getEducationFields(data.type);
  fields
    .filter((f) => f.required)
    .forEach((f) => {
      if (!required(data.fields?.[f.key])) {
        errors[f.key] = `${f.label} is required.`;
      }
    });
  const cgpa = data.fields?.cgpaPercentage;
  if (cgpa !== undefined && String(cgpa).trim() !== "") {
    const value = Number(cgpa);
    if (!/^\d+(\.\d{1,2})?$/.test(String(cgpa).trim()) || value < 1 || value > 10) {
      errors.cgpaPercentage = "CGPA must be a number from 1 to 10 (for example, 9.8).";
    }
  }
  return errors;
}

export function validateContact(data, basicData) {
  const errors = {};
  if (!required(basicData?.email)) errors.email = "Email is required (set in Basic Information).";
  return errors;
}

export function validateInstitution(data) {
  const errors = {};
  if (!required(data.name)) errors.name = "Institution name is required.";
  return errors;
}

// Recommended/optional sections have no required fields.
export function validateNoop() {
  return {};
}

export const SECTION_VALIDATORS = {
  basic: validateBasic,
  education: validateEducation,
  contact: validateContact,
  institution: validateInstitution,
  skills: validateNoop,
  career: validateNoop,
  achievements: validateNoop,
  portfolio: validateNoop,
  preferences: validateNoop,
};
