import "server-only";
import { storageConfig, UUID_PATTERN, type StorageConfig } from "@/lib/preinscripcion/storage";
import { normalizeAdminEmail, readAdminAllowlist, resolveAdminRole } from "./allowlist";
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

function loginConfig(): { storage: StorageConfig; origin: string } | null {
  const storage = storageConfig();
  const origin = adminAppOrigin();
  return storage && origin && adminSessionSecret() && readAdminAllowlist() ? { storage, origin } : null;
}

export async function startAdminLogin(request: Request): Promise<Response> {
  try {
    const config = loginConfig();
    if (!config) return adminResponse(503);
    if (!isAdminSameOrigin(request)) return adminResponse(403);
    const form = await readAdminForm(request, ["email"]);
    const email = normalizeAdminEmail(form.get("email"));
    if (!email) return adminResponse(400);
    const state = createAdminLoginState(email);
    if (!state) return adminResponse(503);
    if (resolveAdminRole(email)) {
      const redirect = `${config.origin}/admin/confirm?state=${state.state}`;
      try {
        await adminFetch(config.storage, `/auth/v1/otp?redirect_to=${encodeURIComponent(redirect)}`, {
          email, create_user: false,
        });
      } catch { /* Same response and state-cookie shape: no account enumeration. */ }
    }
    return adminRedirect("/admin?sent=1", [state.cookie]);
  } catch (error) {
    return adminFailure(error);
  }
}

export async function verifyAdminLogin(request: Request): Promise<Response> {
  try {
    const config = loginConfig();
    if (!config) return adminResponse(503);
    if (!isAdminSameOrigin(request)) return adminResponse(403);
    const form = await readAdminForm(request, ["token_hash", "state"]);
    const tokenHash = form.get("token_hash")!;
    if (!/^[a-f0-9]{56}$/.test(tokenHash)) return adminResponse(400);
    const state = readAdminLoginState(request.headers.get("cookie"), form.get("state")!);
    if (!state || !resolveAdminRole(state.email)) return adminResponse(403);
    // Consumed only by an explicit, browser-bound POST, never a GET/mail scanner.
    const response = await adminFetch(config.storage, "/auth/v1/verify", { token_hash: tokenHash, type: "email" });
    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Invalid admin proof");
    const user = (result as Record<string, unknown>).user;
    if (!user || typeof user !== "object" || Array.isArray(user)) return adminResponse(403);
    const { id, email: rawEmail, email_confirmed_at: confirmed } = user as Record<string, unknown>;
    const email = normalizeAdminEmail(rawEmail);
    if (typeof id !== "string" || !UUID_PATTERN.test(id) || email !== state.email
      || typeof confirmed !== "string" || !Number.isFinite(Date.parse(confirmed))) return adminResponse(403);
    // Metadata is deliberately ignored. Re-read allowlist after the network boundary.
    const created = createAdminSession({ id, email });
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
