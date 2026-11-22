import "server-only";
import { storageConfig, UUID_PATTERN } from "@/lib/preinscripcion/storage";
import { readAdminSession, validAdminCsrf } from "./session";
import { adminFailure, adminResponse, isAdminSameOrigin, readAdminForm } from "./http";
import { groupOptions, isOption, statusOptions } from "./registration-options";

const UNCERTAIN = "No pudimos confirmar el resultado. Revisá el estado de la solicitud antes de volver a intentar.";
const CONFLICT = "No se pudo completar el cambio. Revisá el estado y la disponibilidad del grupo.";

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
/** T2 returns exactly this projection. An HTTP 2xx alone is not proof of success. */
function validResult(value: unknown, id: string, status: string, group: string | null): boolean {
  if (!record(value) || Object.keys(value).sort().join(",") !== "confirmed_group,confirmed_slot,id,status"
    || typeof value.id !== "string" || !UUID_PATTERN.test(value.id) || value.id.toLowerCase() !== id
    || value.status !== status || value.confirmed_group !== group) return false;
  return group === null ? value.confirmed_slot === null
    : typeof value.confirmed_slot === "number" && Number.isSafeInteger(value.confirmed_slot)
      && value.confirmed_slot >= 1 && value.confirmed_slot <= 8;
}
async function upstreamFailure(response: Response): Promise<Response> {
  const value: unknown = await response.json();
  // Never interpret or expose messages/details, or infer SQLSTATE from text.
  const code = record(value) ? value.code : null;
  if (code === "P0002") return adminResponse(404, "No encontramos la solicitud. Volvé al listado.");
  if (code === "23505" || code === "23514") return adminResponse(409, CONFLICT);
  return adminResponse(503, UNCERTAIN);
}

export async function updateRegistrationStatus(request: Request, id: string): Promise<Response> {
  try {
    const cookie = request.headers.get("cookie");
    const initial = readAdminSession(cookie);
    if (!initial || initial.role !== "admin") return adminResponse(403);
    if (!isAdminSameOrigin(request)) return adminResponse(403);
    if (!UUID_PATTERN.test(id)) return adminResponse(400);
    const form = await readAdminForm(request, ["status", "group", "csrf", "confirmCancel"]);
    const status = form.get("status")!;
    const rawGroup = form.get("group")!;
    const confirmation = form.get("confirmCancel")!;
    if (!isOption(statusOptions, status)
      || (status === "confirmada" ? !isOption(groupOptions, rawGroup) : rawGroup !== "")
      || (status === "cancelada" ? confirmation !== "yes" : confirmation !== "")) return adminResponse(400);
    const config = storageConfig();
    // Body reads can suspend: current allowlist, absolute expiry and CSRF are
    // checked again immediately before the only network boundary.
    const actor = readAdminSession(cookie);
    if (!actor || actor.role !== "admin" || !validAdminCsrf(actor, form.get("csrf")!)) return adminResponse(403);
    if (!config) return adminResponse(503);
    const targetId = id.toLowerCase();
    const group = status === "confirmada" ? rawGroup : null;
    try {
      const response = await fetch(`${config.url}/rest/v1/rpc/admin_set_registration_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: config.serviceKey,
          Authorization: `Bearer ${config.serviceKey}` },
        body: JSON.stringify({ p_actor_id: actor.id, p_actor_email: actor.email, p_actor_role: actor.role,
          p_id: targetId, p_status: status, p_group: group }),
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return await upstreamFailure(response);
      if (response.status !== 200 || !validResult(await response.json(), targetId, status, group)) {
        return adminResponse(503, UNCERTAIN);
      }
      // No success query flag or caller-selected destination; reload current data.
      return adminResponse(303, null, { Location: `/admin/${targetId}` });
    } catch {
      // A write may have committed despite a timeout/malformed response. No retry
      // and no assertion that the registration or its counters stayed unchanged.
      return adminResponse(503, UNCERTAIN);
    }
  } catch (error) {
    return adminFailure(error);
  }
}
