import { preinscripcionConfig, relationshipOptions, targetSchoolOptions } from "./config";
import type {
  FormStep, GroupId, PreinscripcionFormData, Relationship, SubmissionData,
  TargetSchool, ValidationErrors, ValidationResult,
} from "./types";

export const MAX_LENGTHS = {
  name: 160, text: 160, longText: 1000, email: 254, phoneDigitsMin: 10, phoneDigitsMax: 15,
} as const;

// Clone this template (including groups) when creating a form. No persistence.
export const initialFormData: PreinscripcionFormData = {
  studentName: "", birthDate: "", primarySchool: "", targetSchool: "", otherSchool: "",
  guardianName: "", relationship: "", whatsapp: "", email: "", locality: "",
  groups: [], firstPreference: null, scheduleNotes: "", difficultSubjects: "",
  pedagogicalNotes: "", referralSource: "", acceptedProgram: false, acceptedPrivacy: false,
  website: "",
};

const allowedFields = new Set(Object.keys(initialFormData));
const groupIds = new Set<string>(preinscripcionConfig.groups.map(({ id }) => id));
const etecOnlyGroupIds = new Set<string>(
  preinscripcionConfig.groups.filter((group) => group.etecOnly).map(({ id }) => id),
);
const schoolValues = new Set<string>(targetSchoolOptions.map(({ value }) => value));
const relationshipValues = new Set<string>(relationshipOptions.map(({ value }) => value));
const stepFields: Record<FormStep, readonly (keyof SubmissionData)[]> = {
  1: ["studentName", "birthDate", "primarySchool", "targetSchool", "otherSchool"],
  2: ["guardianName", "relationship", "whatsapp", "email", "locality"],
  3: ["groups", "firstPreference", "scheduleNotes", "difficultSubjects", "pedagogicalNotes", "referralSource"],
  4: ["acceptedProgram", "acceptedPrivacy", "website"],
};

function isGroupId(value: unknown): value is GroupId {
  return typeof value === "string" && groupIds.has(value);
}

function isPastDate(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value) || value.startsWith("0000-")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    && value < new Date().toISOString().slice(0, 10);
}

/** No IO, logs or mutations. Dates use today's UTC date; no school-age cutoff.
 * Optional text may be omitted and normalizes to ""; omitted preference to null.
 * Does not enforce open/closed status: the API must check its active configuration.
 */
export function validateSubmission(input: unknown): ValidationResult {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, errors: { _form: "La solicitud no es válida." } };
  }
  if (Reflect.ownKeys(input).some((key) => typeof key !== "string" || !allowedFields.has(key))) {
    return { ok: false, errors: { _form: "La solicitud contiene campos no permitidos." } };
  }
  const raw = input as Record<string, unknown>;
  const errors: ValidationErrors = {};

  function text(field: keyof SubmissionData, max: number, requiredMessage?: string): string {
    const value = raw[field];
    if (value === undefined && !requiredMessage) return "";
    if (typeof value !== "string") {
      errors[field] = requiredMessage ?? "Ingresá un texto válido.";
      return "";
    }
    const normalized = value.trim().normalize("NFC");
    if (!normalized && requiredMessage) errors[field] = requiredMessage;
    else if (normalized.length > max) errors[field] = `Usá hasta ${max} caracteres.`;
    return normalized;
  }

  function name(field: "studentName" | "guardianName"): string {
    const message = "Ingresá nombre y apellido.";
    const value = text(field, MAX_LENGTHS.name, message).replace(/\s+/g, " ");
    const parts = value.split(" ");
    const token = /^\p{L}[\p{L}\p{M}]*(?:['’.-]\p{L}[\p{L}\p{M}]*)*\.?$/u;
    if (!errors[field] && (parts.length < 2 || !parts.every((part) => token.test(part)))) errors[field] = message;
    return value;
  }

  const studentName = name("studentName");
  const birthDate = typeof raw.birthDate === "string" ? raw.birthDate.trim() : "";
  if (!isPastDate(birthDate)) errors.birthDate = "Ingresá una fecha de nacimiento válida y anterior a hoy.";
  const primarySchool = text("primarySchool", MAX_LENGTHS.text, "Ingresá la escuela primaria actual.");
  if (typeof raw.targetSchool !== "string" || !schoolValues.has(raw.targetSchool)) errors.targetSchool = "Seleccioná una escuela secundaria válida.";
  const otherSchool = text("otherSchool", MAX_LENGTHS.text);
  const guardianName = name("guardianName");
  if (typeof raw.relationship !== "string" || !relationshipValues.has(raw.relationship)) errors.relationship = "Seleccioná un vínculo válido.";

  const phone = typeof raw.whatsapp === "string" ? raw.whatsapp.trim() : "";
  const whatsapp = phone.replace(/\D/g, "");
  if (phone.length > MAX_LENGTHS.text || !/^\+?[0-9 ().-]+$/.test(phone)
    || whatsapp.length < MAX_LENGTHS.phoneDigitsMin || whatsapp.length > MAX_LENGTHS.phoneDigitsMax) {
    errors.whatsapp = "Ingresá un teléfono de WhatsApp de 10 a 15 dígitos.";
  }
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (email.length > MAX_LENGTHS.email || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)) {
    errors.email = "Ingresá un correo electrónico válido.";
  }
  const locality = text("locality", MAX_LENGTHS.text);

  let groups: GroupId[] = [];
  // Materialize holes as undefined before validation; Array.every skips them.
  const selected: unknown[] | null = Array.isArray(raw.groups) ? Array.from(raw.groups) : null;
  if (!selected || selected.length > groupIds.size || !selected.every(isGroupId)
    || new Set(selected).size !== selected.length) {
    errors.groups = "Seleccioná grupos válidos sin repetir.";
  } else if (selected.length === 0) {
    errors.groups = "Seleccioná al menos un grupo.";
  } else {
    groups = selected;
  }
  // The Tuesday group is reserved for families aiming at ETec admission.
  if (!errors.groups && raw.targetSchool === "uncuyo" && groups.some((id) => etecOnlyGroupIds.has(id))) {
    errors.groups = "El grupo de martes es sólo para quienes aspiran a ingresar al ETec.";
  }
  const preference = raw.firstPreference ?? null;
  let firstPreference: GroupId | null = null;
  if (preference !== null) {
    if (!isGroupId(preference) || !groups.includes(preference)) errors.firstPreference = "Elegí un grupo marcado o Sin preferencia.";
    else firstPreference = preference;
  }
  const scheduleNotes = text("scheduleNotes", MAX_LENGTHS.longText);
  const difficultSubjects = text("difficultSubjects", MAX_LENGTHS.longText);
  const pedagogicalNotes = text("pedagogicalNotes", MAX_LENGTHS.longText);
  const referralSource = text("referralSource", MAX_LENGTHS.text);
  if (raw.acceptedProgram !== true) errors.acceptedProgram = "Aceptá la información del programa.";
  if (raw.acceptedPrivacy !== true) errors.acceptedPrivacy = "Aceptá el aviso de privacidad para gestionar la solicitud.";
  if (raw.website !== "") errors.website = "No se pudo validar la solicitud.";
  if (Object.keys(errors).length) return { ok: false, errors };

  return { ok: true, data: {
    studentName, birthDate, primarySchool, targetSchool: raw.targetSchool as TargetSchool, otherSchool,
    guardianName, relationship: raw.relationship as Relationship, whatsapp, email, locality, groups,
    firstPreference, scheduleNotes, difficultSubjects, pedagogicalNotes, referralSource,
    acceptedProgram: true, acceptedPrivacy: true, website: "",
  } };
}

/** UI-only step errors; the API must always run full validateSubmission. */
export function validateStep(step: FormStep, input: unknown): ValidationErrors {
  const result = validateSubmission(input);
  if (result.ok) return {};
  const visible = new Set<string>(stepFields[step]);
  return Object.fromEntries(Object.entries(result.errors).filter(([key]) => key === "_form" || visible.has(key)));
}
