import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
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

function mailSettings() {
  const url = process.env.ADMIN_MAIL_URL, token = process.env.ADMIN_MAIL_TOKEN;
  const raw = process.env.SUPABASE_EMAIL_HOOK_SECRET, from = normalizeAdminEmail(process.env.ADMIN_MAIL_FROM);
  if (!url || !token || token.length < 32 || !raw?.startsWith("v1,whsec_") || !from) return null;
  const key = Buffer.from(raw.slice(9), "base64");
  try {
    const parsed = new URL(url);
    if (key.length !== 32 || key.toString("base64") !== raw.slice(9) || parsed.protocol !== "https:"
      || parsed.username || parsed.password || parsed.search || parsed.hash || token === adminSessionSecret()
      || token === process.env.SUPABASE_SERVICE_ROLE_KEY || token === raw) return null;
    return { url, token, key, from };
  } catch { return null; }
}

function proofSignature(email: string, nonce: string, tokenHash: string): string {
  return createHmac("sha256", adminSessionSecret()!).update(`proof.${email}.${nonce}.${tokenHash}`).digest("base64url");
}

async function hookBody(request: Request): Promise<string> {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "") || !request.body) throw new AdminHttpError(415);
  const reader = request.body.getReader(), decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0, raw = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 16384) throw new AdminHttpError(413);
      raw += decoder.decode(value, { stream: true });
    }
    return raw + decoder.decode();
  } catch (error) { void reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
}

/** Supabase authenticates the exact proof; only the recipient receives its attempt-bound link. */
export async function receiveAdminEmail(request: Request): Promise<Response> {
  try {
    const settings = mailSettings();
    if (!settings || !adminAppOrigin() || !adminSessionSecret()) return adminResponse(503);
    const raw = await hookBody(request);
    const id = request.headers.get("webhook-id") ?? "", timestamp = request.headers.get("webhook-timestamp") ?? "";
    const expected = createHmac("sha256", settings.key).update(`${id}.${timestamp}.${raw}`).digest();
    const signatures = (request.headers.get("webhook-signature") ?? "").split(" ");
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(id) || !/^\d+$/.test(timestamp)
      || Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300
      || !signatures.some(value => value.startsWith("v1,") && (() => {
        const provided = Buffer.from(value.slice(3), "base64");
        return provided.length === expected.length && provided.toString("base64") === value.slice(3) && timingSafeEqual(provided, expected);
      })())) return adminResponse(403);
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return adminResponse(403);
    const { user, email_data: event } = data as Record<string, { id?: unknown; email?: unknown } | Record<string, unknown> | undefined>;
    if (!user || !event || Array.isArray(user) || Array.isArray(event) || !UUID_PATTERN.test(String(user.id))) return adminResponse(403);
    const fields = event as Record<string, unknown>, email = normalizeAdminEmail(user.email), hash = fields.token_hash;
    const redirect = typeof fields.redirect_to === "string" ? new URL(fields.redirect_to) : null, nonce = redirect?.searchParams.get("state") ?? "";
    if (!email || !resolveAdminRole(email)
      || fields.email_action_type !== "magiclink" || typeof hash !== "string" || !/^[a-f0-9]{56}$/.test(hash)
      || redirect?.origin !== adminAppOrigin() || redirect.pathname !== "/admin/confirm" || redirect.search !== `?state=${nonce}`
      || !/^[A-Za-z0-9_-]{43}$/.test(nonce)) return adminResponse(403);
    const state = `${nonce}.${proofSignature(email, nonce, hash)}`, query = new URLSearchParams({ state, token_hash: hash });
    const link = `${adminAppOrigin()}/admin/confirm?${query}`;
    const mail = await fetch(settings.url, { method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000), headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.token}` },
      body: JSON.stringify({ from: settings.from, to: [email], subject: "Acceso al panel de Ingenium",
        html: `<p><a href="${link.replaceAll("&", "&amp;")}">Ingresar al panel</a></p><p>El enlace vence en 10 minutos y sólo funciona en el navegador donde lo solicitaste.</p>` }) });
    return mail.ok ? adminResponse(200, null) : adminResponse(503);
  } catch (error) { return adminFailure(error); }
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
  return storage && origin && adminSessionSecret() && readAdminAllowlist() && mailSettings() ? { storage, origin } : null;
}

export async function startAdminLogin(request: Request): Promise<Response> {
  if (request.headers.has("webhook-signature")) return receiveAdminEmail(request);
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
    const [nonce, proof, extra] = form.get("state")!.split(".");
    const state = !extra && readAdminLoginState(request.headers.get("cookie"), nonce);
    if (!state || !resolveAdminRole(state.email) || !proof || !/^[A-Za-z0-9_-]{43}$/.test(proof)
      || !timingSafeEqual(Buffer.from(proof), Buffer.from(proofSignature(state.email, state.nonce, tokenHash)))) return adminResponse(403);
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
