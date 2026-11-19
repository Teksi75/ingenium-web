import "server-only";
import { storageConfig, type StorageConfig } from "@/lib/preinscripcion/storage";
import { readAdminAllowlist } from "./allowlist";
import { adminGoogleConfig, googleAuthorization, googleCallback, verifyGoogleIdentity } from "./google";
import { ADMIN_LOGIN_COOKIE, ADMIN_SESSION_COOKIE, adminSessionSecret, clearAdminCookie,
  createAdminLoginState, createAdminSession, readAdminLoginState, readAdminSession,
  validAdminCsrf, type AdminActor } from "./session";
import { AdminHttpError, adminAppOrigin, adminFailure, adminRedirect, adminResponse,
  isAdminSameOrigin, readAdminForm } from "./http";

/** Exactly one attempt per operation; no credential-bearing redirects or cache. */
async function adminFetch(config: StorageConfig, endpoint: string, payload: object): Promise<Response> {
  const response = await fetch(`${config.url}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}` },
    body: JSON.stringify(payload),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Admin service unavailable");
  return response;
}

/** T2 gateway; void return means a successful HTTP response, NOT JSON data. */
export async function logAdminEvent(actor: AdminActor, action: "login" | "logout" | "access_denied"): Promise<void> {
  const config = storageConfig();
  if (!config) throw new Error("Admin service unavailable");
  await adminFetch(config, "/rest/v1/rpc/admin_log_event", {
    p_actor_id: actor.id, p_actor_email: actor.email, p_actor_role: actor.role, p_action: action,
  });
}

function loginConfig() {
  const google = adminGoogleConfig();
  return google && adminSessionSecret() && readAdminAllowlist() ? google : null;
}

export async function startAdminLogin(request: Request): Promise<Response> {
  try {
    const config = loginConfig();
    if (!config) return adminResponse(503);
    if (!isAdminSameOrigin(request)) return adminResponse(403);
    await readAdminForm(request, []);
    const created = createAdminLoginState();
    const attempt = created && readAdminLoginState(created.cookie, created.state);
    if (!attempt) return adminResponse(503);
    // Destination is assembled only from fixed Google settings, never browser fields.
    return adminResponse(303, null, { Location: googleAuthorization(config, attempt), "Set-Cookie": created!.cookie });
  } catch (error) {
    return adminFailure(error);
  }
}

export async function verifyAdminLogin(request: Request): Promise<Response> {
  try {
    const config = loginConfig();
    if (!config) return adminResponse(503);
    if (!isAdminSameOrigin(request)) return adminResponse(403);
    const form = await readAdminForm(request, ["code", "state"]);
    const callback = googleCallback(Object.fromEntries(form));
    if (!callback) return adminResponse(400);
    const attempt = readAdminLoginState(request.headers.get("cookie"), callback.state);
    if (!attempt) return adminResponse(403);
    // Only this explicit browser-bound POST consumes Google's one-use code.
    const identity = await verifyGoogleIdentity(config, callback.code, attempt);
    // Metadata is deliberately ignored. Re-read allowlist after the network boundary.
    const created = createAdminSession(identity);
    if (!created) return adminResponse(403);
    await logAdminEvent(created.actor, "login");
    return adminRedirect("/admin", [created.cookie, clearAdminCookie(ADMIN_LOGIN_COOKIE)]);
  } catch (error) {
    return adminFailure(error);
  }
}

export async function logoutAdminSession(request: Request): Promise<Response> {
  try {
    if (!adminAppOrigin()) return adminResponse(503);
    if (!isAdminSameOrigin(request)) return adminResponse(403);
    const form = await readAdminForm(request, ["csrf"]);
    const actor = readAdminSession(request.headers.get("cookie"));
    if (!actor || !validAdminCsrf(actor, form.get("csrf")!)) throw new AdminHttpError(403);
    const cookies = [clearAdminCookie(ADMIN_SESSION_COOKIE), clearAdminCookie(ADMIN_LOGIN_COOKIE)];
    try {
      await logAdminEvent(actor, "logout");
    } catch {
      const response = adminResponse(503);
      for (const cookie of cookies) response.headers.append("Set-Cookie", cookie);
      return response;
    }
    return adminRedirect("/admin", cookies);
  } catch (error) {
    return adminFailure(error);
  }
}
