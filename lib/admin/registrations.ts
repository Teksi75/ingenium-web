import "server-only";
import { storageConfig, UUID_PATTERN } from "@/lib/preinscripcion/storage";
import { readAdminSession } from "./session";
import { groupOptions, isOption, PAGE_SIZE, parseRegistrationFilters, schoolOptions, statusOptions,
  type AdminSearchParams, type RegistrationFilters } from "./registration-options";

export interface RegistrationListItem {
  id: string;
  public_code: string;
  student_name: string;
  target_school: string;
  status: string;
  groups: string[];
  confirmed_group: string | null;
  created_at: string;
  course_year: number;
  first_preference: string | null;
}
const detailTextLimits = {
  birth_date: 10, primary_school: 160, grade: 20, other_school: 160,
  guardian_name: 160, relationship: 8, whatsapp: 15, email: 254, locality: 160,
  schedule_notes: 1000, difficult_subjects: 1000, pedagogical_notes: 1000, referral_source: 160,
  program_version: 40, privacy_version: 40, program_accepted_at: 40, privacy_accepted_at: 40, updated_at: 40,
} as const;
type DetailTextField = keyof typeof detailTextLimits;
export type RegistrationDetail = RegistrationListItem & Record<DetailTextField, string> & {
  entry_year: number; confirmed_slot: number | null;
};
type Failure = { kind: "unauthorized" | "invalid" | "unavailable" };
type ListResult = Failure | { kind: "ok"; items: RegistrationListItem[]; total: number; filters: RegistrationFilters };
type DetailResult = Failure | { kind: "not-found" } | { kind: "ok"; registration: RegistrationDetail };

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid registration response");
  return value as Record<string, unknown>;
}
function text(value: unknown, max: number, required = false): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new Error("Invalid registration field");
  return value;
}
function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) throw new Error("Invalid registration identifier");
  return value;
}
function timestamp(value: unknown): string {
  const result = text(value, 40, true);
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d:\d\d)$/.test(result)
    || !Number.isFinite(Date.parse(result))) throw new Error("Invalid registration date");
  return result;
}
function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) throw new Error("Invalid registration number");
  return value;
}
function choice(options: Parameters<typeof isOption>[0], value: unknown): string {
  if (!isOption(options, value)) throw new Error("Invalid registration choice");
  return value;
}
/** Explicit projection: extra upstream keys cannot enter rendered data. */
function listItem(value: unknown): RegistrationListItem {
  const r = record(value);
  if (!Array.isArray(r.groups) || r.groups.length < 1 || r.groups.length > 4
    || new Set(r.groups).size !== r.groups.length) throw new Error("Invalid requested groups");
  const groups = r.groups.map(group => choice(groupOptions, group));
  const firstPreference = r.first_preference === null ? null : choice(groupOptions, r.first_preference);
  const confirmedGroup = r.confirmed_group === null ? null : choice(groupOptions, r.confirmed_group);
  const status = choice(statusOptions, r.status);
  if ((firstPreference && !groups.includes(firstPreference)) || (confirmedGroup && !groups.includes(confirmedGroup))
    || (status === "confirmada") !== (confirmedGroup !== null)) throw new Error("Invalid registration groups");
  return { id: uuid(r.id), public_code: uuid(r.public_code), student_name: text(r.student_name, 160, true),
    target_school: choice(schoolOptions, r.target_school), status, groups, confirmed_group: confirmedGroup,
    created_at: timestamp(r.created_at), course_year: integer(r.course_year, 2000, 2200), first_preference: firstPreference };
}
function registrationDetail(value: unknown, requestedId: string): RegistrationDetail {
  const r = record(value);
  const base = listItem(r);
  if (base.id.toLowerCase() !== requestedId.toLowerCase()) throw new Error("Mismatched registration");
  const fields = {} as Record<DetailTextField, string>;
  for (const key of Object.keys(detailTextLimits) as DetailTextField[]) fields[key] = text(r[key], detailTextLimits[key]);
  for (const key of ["program_accepted_at", "privacy_accepted_at", "updated_at"] as const) fields[key] = timestamp(r[key]);
  if (!/^\d{4}-\d\d-\d\d$/.test(fields.birth_date) || !Number.isFinite(Date.parse(fields.birth_date))
    || new Date(fields.birth_date).toISOString().slice(0, 10) !== fields.birth_date
    || !["madre", "padre", "tutor", "otro"].includes(fields.relationship)
    || !/^[0-9]{10,15}$/.test(fields.whatsapp)
    || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(fields.email)
    || !fields.guardian_name.trim() || !fields.primary_school.trim() || fields.grade !== "séptimo grado"
    || !fields.program_version || !fields.privacy_version) throw new Error("Invalid registration detail");
  const entryYear = integer(r.entry_year, 2001, 2201);
  const slot = r.confirmed_slot === null ? null : integer(r.confirmed_slot, 1, 8);
  if (entryYear !== base.course_year + 1 || (base.status === "confirmada") !== (slot !== null)) throw new Error("Invalid registration cycle/slot");
  return { ...base, ...fields, entry_year: entryYear, confirmed_slot: slot };
}

/** Same vetted one-attempt transport as auth; that helper is private to T3.
 * Cookie is the only actor input. Recheck its current role immediately before
 * every audited read, even when a server page already checked authorization. */
async function readRpc(cookieHeader: string | null, name: "admin_list_registrations" | "admin_registration_detail", args: object): Promise<unknown> {
  const config = storageConfig();
  const actor = readAdminSession(cookieHeader);
  if (!config || !actor) throw new Error("Admin service unavailable");
  const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}` },
    body: JSON.stringify({ ...args, p_actor_id: actor.id, p_actor_email: actor.email, p_actor_role: actor.role }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Admin service unavailable");
  return response.json();
}
export async function listRegistrations(cookieHeader: string | null, query: AdminSearchParams): Promise<ListResult> {
  if (!readAdminSession(cookieHeader)) return { kind: "unauthorized" };
  const filters = parseRegistrationFilters(query);
  if (!filters) return { kind: "invalid" };
  try {
    const result = record(await readRpc(cookieHeader, "admin_list_registrations", {
      p_school: filters.escuela, p_status: filters.estado, p_group: filters.grupo,
      p_limit: PAGE_SIZE, p_offset: (filters.pagina - 1) * PAGE_SIZE,
    }));
    const total = integer(result.total, 0, Number.MAX_SAFE_INTEGER);
    if (!Array.isArray(result.items) || result.items.length > PAGE_SIZE || result.items.length > total) throw new Error("Invalid registration page");
    return { kind: "ok", items: result.items.map(listItem), total, filters };
  } catch { return { kind: "unavailable" }; }
}
export async function registrationById(cookieHeader: string | null, id: string): Promise<DetailResult> {
  if (!readAdminSession(cookieHeader)) return { kind: "unauthorized" };
  if (!UUID_PATTERN.test(id)) return { kind: "not-found" };
  try {
    const result = await readRpc(cookieHeader, "admin_registration_detail", { p_id: id });
    return result === null ? { kind: "not-found" } : { kind: "ok", registration: registrationDetail(result, id) };
  } catch { return { kind: "unavailable" }; }
}
