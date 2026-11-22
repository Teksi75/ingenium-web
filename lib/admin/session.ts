import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { UUID_PATTERN } from "@/lib/preinscripcion/storage";
import { normalizeAdminEmail, resolveAdminRole, type AdminRole } from "./allowlist";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_LOGIN_COOKIE = "admin_login_state";
export const SESSION_SECONDS = 28800;
export const LOGIN_SECONDS = 600;
const NONCE_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export interface AdminActor {
  id: string;
  email: string;
  role: AdminRole;
  csrf: string;
  issuedAt: number;
  expiresAt: number;
}
interface LoginState {
  v: 2;
  state: string;
  verifier: string;
  nonce: string;
  iat: number;
  exp: number;
}

export function adminSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32 || secret.trim() !== secret
    || secret === process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return secret;
}

function sign(payload: object, purpose: "session" | "login"): string | null {
  const secret = adminSessionSecret();
  if (!secret) return null;
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", secret).update(`${purpose}.${encoded}`).digest("base64url");
  return `${encoded}.${mac}`;
}

/** Match exactly one cookie, rejecting ambiguous, oversized or malformed values. */
function readSigned(header: string | null, name: string, purpose: "session" | "login"): Record<string, unknown> | null {
  const secret = adminSessionSecret();
  if (!secret || !header || header.length > 16384) return null;
  const matches = header.split(";").map(part => part.trim()).filter(part => part.split("=", 1)[0].trim() === name);
  if (matches.length !== 1 || !matches[0].startsWith(`${name}=`)) return null;
  const value = matches[0].slice(name.length + 1);
  if (value.length > 4096) return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !NONCE_PATTERN.test(parts[1])) return null;
  const expected = createHmac("sha256", secret).update(`${purpose}.${parts[0]}`).digest();
  const provided = Buffer.from(parts[1], "base64url");
  if (provided.length !== expected.length || provided.toString("base64url") !== parts[1]
    || !timingSafeEqual(expected, provided)) return null;
  try {
    const bytes = Buffer.from(parts[0], "base64url");
    if (bytes.toString("base64url") !== parts[0]) return null;
    const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function validWindow(data: Record<string, unknown>, seconds: number, now: number): boolean {
  return Number.isSafeInteger(now) && Number.isSafeInteger(data.iat) && Number.isSafeInteger(data.exp)
    && (data.iat as number) >= 0 && data.exp === (data.iat as number) + seconds
    && (data.iat as number) <= now && now < (data.exp as number);
}
function exactKeys(data: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(data).sort().join(",") === keys.sort().join(",");
}
function verifiedEmail(email: unknown): email is string {
  return typeof email === "string" && normalizeAdminEmail(email) === email;
}
function nowSeconds(): number { return Math.floor(Date.now() / 1000); }

export function adminCookie(name: typeof ADMIN_SESSION_COOKIE | typeof ADMIN_LOGIN_COOKIE, value: string, seconds: number): string {
  return `${name}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${seconds}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export function clearAdminCookie(name: typeof ADMIN_SESSION_COOKIE | typeof ADMIN_LOGIN_COOKIE): string {
  return adminCookie(name, "", 0);
}

/** Signature first, then current environment role. Never refreshes the cookie. */
export function readAdminSession(cookieHeader: string | null, now: number = nowSeconds()): AdminActor | null {
  const data = readSigned(cookieHeader, ADMIN_SESSION_COOKIE, "session");
  if (!data || !exactKeys(data, ["v", "id", "email", "csrf", "iat", "exp"]) || data.v !== 1
    || !validWindow(data, SESSION_SECONDS, now) || typeof data.id !== "string" || !UUID_PATTERN.test(data.id)
    || !verifiedEmail(data.email) || typeof data.csrf !== "string" || !NONCE_PATTERN.test(data.csrf)) return null;
  const role = resolveAdminRole(data.email);
  return role ? { id: data.id, email: data.email, role, csrf: data.csrf,
    issuedAt: data.iat as number, expiresAt: data.exp as number } : null;
}

/** Only call with an already verified Auth identity, never browser fields. */
export function createAdminSession(identity: { id: string; email: string }, now: number = nowSeconds()): { cookie: string; actor: AdminActor } | null {
  const role = resolveAdminRole(identity.email);
  if (!role || !UUID_PATTERN.test(identity.id) || !verifiedEmail(identity.email) || !Number.isSafeInteger(now) || now < 0) return null;
  const csrf = randomBytes(32).toString("base64url");
  const payload = { v: 1, id: identity.id, email: identity.email, csrf, iat: now, exp: now + SESSION_SECONDS };
  const value = sign(payload, "session");
  if (!value) return null;
  return { cookie: adminCookie(ADMIN_SESSION_COOKIE, value, SESSION_SECONDS),
    actor: { ...identity, role, csrf, issuedAt: now, expiresAt: payload.exp } };
}

export function createAdminLoginState(now: number = nowSeconds()): { cookie: string; state: string } | null {
  if (!Number.isSafeInteger(now) || now < 0) return null;
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const value = sign({ v: 2, state, verifier, nonce, iat: now, exp: now + LOGIN_SECONDS }, "login");
  return value ? { cookie: adminCookie(ADMIN_LOGIN_COOKIE, value, LOGIN_SECONDS), state } : null;
}

export function readAdminLoginState(cookieHeader: string | null, state: string, now: number = nowSeconds()): LoginState | null {
  const data = readSigned(cookieHeader, ADMIN_LOGIN_COOKIE, "login");
  if (!data || !exactKeys(data, ["v", "state", "verifier", "nonce", "iat", "exp"]) || data.v !== 2
    || !validWindow(data, LOGIN_SECONDS, now)
    || ![data.state, data.verifier, data.nonce].every(value => typeof value === "string" && NONCE_PATTERN.test(value))
    || !NONCE_PATTERN.test(state)
    || !timingSafeEqual(Buffer.from(data.state as string), Buffer.from(state))) return null;
  return data as unknown as LoginState;
}

export function validAdminCsrf(actor: AdminActor, value: string): boolean {
  return NONCE_PATTERN.test(value) && timingSafeEqual(Buffer.from(actor.csrf), Buffer.from(value));
}
