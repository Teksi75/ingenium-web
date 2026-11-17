import { preinscripcionConfig } from "./config";
import type { FormStep, GroupId, PreinscripcionFormData, RegistrationStatus, SubmissionData, ValidationErrors } from "./types";
import { initialFormData, validateStep, validateSubmission } from "./validation";

export interface SendAttempt {
  key: string;
  payload: SubmissionData;
}
export interface Draft {
  data: PreinscripcionFormData;
  attempt: SendAttempt | null;
}
export type SendResult =
  | { ok: true; publicCode: string }
  | { ok: false; message: string; errors: ValidationErrors };

export function createDraft(): Draft {
  return { data: { ...initialFormData, groups: [...initialFormData.groups] }, attempt: null };
}

export function editDraft<K extends keyof PreinscripcionFormData>(draft: Draft, field: K, value: PreinscripcionFormData[K]): Draft {
  if (draft.data[field] === value) return draft;
  return { data: { ...draft.data, [field]: value }, attempt: null };
}

export function toggleGroup(draft: Draft, group: GroupId, checked: boolean): Draft {
  if (checked === draft.data.groups.includes(group)) return draft;
  const groups = checked
    ? [...draft.data.groups, group]
    : draft.data.groups.filter((id) => id !== group);
  const updated = editDraft(draft, "groups", groups);
  return updated.data.firstPreference && !groups.includes(updated.data.firstPreference)
    ? editDraft(updated, "firstPreference", null) : updated;
}

export function advanceStep(step: FormStep, data: PreinscripcionFormData): { step: FormStep; errors: ValidationErrors } {
  const errors = validateStep(step, data);
  return { step: Object.keys(errors).length ? step : Math.min(step + 1, 4) as FormStep, errors };
}

export function stepForErrors(errors: ValidationErrors): FormStep {
  const fields = [
    ["studentName", "birthDate", "primarySchool", "targetSchool", "otherSchool"],
    ["guardianName", "relationship", "whatsapp", "email", "locality"],
    ["groups", "firstPreference", "scheduleNotes", "difficultSubjects", "pedagogicalNotes", "referralSource"],
  ];
  const index = fields.findIndex((keys) => keys.some((key) => errors[key]));
  return index < 0 ? 4 : (index + 1) as FormStep;
}

export function availabilityNotice(status: RegistrationStatus = preinscripcionConfig.status): string | null {
  if (status === "cerradas") return preinscripcionConfig.closedNotice;
  if (status === "suspendidas") return preinscripcionConfig.suspendedNotice;
  return null;
}

export function prepareAttempt(data: PreinscripcionFormData, previous: SendAttempt | null, randomUUID: () => string): SendAttempt {
  const result = validateSubmission(data);
  if (!result.ok) throw new Error("Revisá los datos antes de enviar.");
  if (previous && JSON.stringify(previous.payload) === JSON.stringify(result.data)) return previous;
  return { key: randomUUID(), payload: result.data };
}

// A synchronous lock closes the interval before React commits disabled buttons.
export function createSubmissionLock() {
  let busy = false;
  return {
    tryAcquire() { if (busy) return false; busy = true; return true; },
    release() { busy = false; },
  };
}

const retryMessage = "No pudimos verificar la recepción de la solicitud. Tus datos siguen en este formulario; podés reintentar sin cambiarlos. Si recargás la página, se perderán.";
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Only an acknowledged 201/200 with a random UUID-shaped public receipt succeeds.
 * The same attempt survives ambiguous network/storage failures for safe retries.
 */
export async function sendAttempt(attempt: SendAttempt, fetcher: typeof fetch = fetch, timeoutMs = 20_000): Promise<SendResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher("/api/preinscripcion", {
      method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": attempt.key },
      // Preserve protected Preview authentication on this origin only.
      body: JSON.stringify(attempt.payload), credentials: "same-origin", cache: "no-store", redirect: "error",
      signal: controller.signal,
    });
    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, message: retryMessage, errors: {} };
    const result = body as Record<string, unknown>;
    if (response.ok && (response.status === 201 || response.status === 200)
      && typeof result.publicCode === "string" && uuidV4.test(result.publicCode)) {
      return { ok: true, publicCode: result.publicCode };
    }
    const errors = result.errors && typeof result.errors === "object" && !Array.isArray(result.errors)
      ? Object.fromEntries(Object.entries(result.errors).filter(([field, message]) =>
        (Object.hasOwn(initialFormData, field) || field === "_form") && typeof message === "string")) : {};
    return {
      ok: false,
      message: !response.ok && typeof result.message === "string" && result.message.trim() ? result.message : retryMessage,
      errors,
    };
  } catch {
    return { ok: false, message: retryMessage, errors: {} };
  } finally {
    clearTimeout(timer);
  }
}
