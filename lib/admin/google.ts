import "server-only";
import { createHash } from "node:crypto";
import { createRemoteJWKSet, customFetch, jwtVerify } from "jose";
import { normalizeAdminEmail } from "./allowlist";
import { AdminHttpError, adminAppOrigin } from "./http";

const AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const CERTS = "https://www.googleapis.com/oauth2/v3/certs";
const STATE = /^[A-Za-z0-9_-]{43}$/;
const CODE = /^[\x21-\x7e]{1,2048}$/;

export function adminGoogleConfig() {
  const origin = adminAppOrigin(), clientId = process.env.ADMIN_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.ADMIN_GOOGLE_CLIENT_SECRET;
  if (!origin?.startsWith("https://") || !clientId || clientId.length > 254
    || !/^[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId)
    || !clientSecret || !/^[\x21-\x7e]{1,4096}$/.test(clientSecret)) return null;
  return { clientId, clientSecret, redirectUri: `${origin}/admin/confirm` };
}
type GoogleConfig = NonNullable<ReturnType<typeof adminGoogleConfig>>;

/** Callback metadata is inert. Errors, unknown fields and repeated values fail closed. */
export function googleCallback(query: Record<string, string | string[] | undefined>): { code: string; state: string } | null {
  // Google appends `iss` to the redirect; it is validated below, never ignored.
  if (Object.entries(query).some(([key, value]) => !["code", "state", "scope", "authuser", "prompt", "hd", "iss"].includes(key)
    || typeof value !== "string" || value.length > 2048)) return null;
  const { code, state, iss } = query;
  if (iss !== undefined && iss !== "https://accounts.google.com") return null;
  return typeof code === "string" && CODE.test(code) && typeof state === "string" && STATE.test(state) ? { code, state } : null;
}

export function googleAuthorization(config: GoogleConfig, attempt: { state: string; nonce: string; verifier: string }): string {
  const query = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri,
    response_type: "code", scope: "openid email", state: attempt.state, nonce: attempt.nonce,
    code_challenge: createHash("sha256").update(attempt.verifier).digest("base64url"), code_challenge_method: "S256" });
  return `${AUTHORIZE}?${query}`;
}

/** Namespace and UUID layout are durable audit identity, not an auth.users reference. */
function googleActorId(sub: string): string {
  const bytes = createHash("sha256").update(`ingenium.admin.google.sub.v1\0${sub}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 128;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** One code exchange, no redirects/retries or service credentials at Google. */
export async function verifyGoogleIdentity(config: GoogleConfig, code: string, attempt: { verifier: string; nonce: string }) {
  const response = await fetch(TOKEN, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: config.redirectUri,
      client_id: config.clientId, client_secret: config.clientSecret, code_verifier: attempt.verifier }),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Admin service unavailable");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data) || "error" in data || !("id_token" in data)
    || typeof data.id_token !== "string" || data.id_token.length > 16384) throw new Error("Invalid admin proof");
  // A fresh fixed resolver bounds each verification to one JWKS request (5s), no discovery URLs.
  const keys = createRemoteJWKSet(new URL(CERTS), { timeoutDuration: 5000,
    [customFetch]: (url, options) => fetch(url, { ...options, cache: "no-store", redirect: "error" }) });
  const { payload } = await jwtVerify(data.id_token, keys, { algorithms: ["RS256"],
    issuer: ["https://accounts.google.com", "accounts.google.com"], audience: config.clientId,
    requiredClaims: ["exp", "iat", "sub", "nonce", "email", "email_verified"], maxTokenAge: 600 });
  const email = normalizeAdminEmail(payload.email);
  const singleAudience = payload.aud === config.clientId
    || (Array.isArray(payload.aud) && payload.aud.length === 1 && payload.aud[0] === config.clientId);
  if (!singleAudience || (payload.azp !== undefined && payload.azp !== config.clientId)
    || payload.nonce !== attempt.nonce || payload.email_verified !== true
    || typeof payload.sub !== "string" || !/^[A-Za-z0-9_-]{1,255}$/.test(payload.sub)
    || !email || !/^[a-z0-9]+(?:\.[a-z0-9]+)*@gmail\.com$/.test(email)) throw new AdminHttpError(403);
  return { id: googleActorId(payload.sub), email };
}
