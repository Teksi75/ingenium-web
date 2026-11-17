import "server-only";

export type AdminRole = "reader" | "admin";

/** Deliberately conservative ASCII mailbox syntax; addresses are environment-only. */
export function normalizeAdminEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254) return null;
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  const [local, domain] = parts;
  if (!local || local.length > 64 || !/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local)
    || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
  return email;
}

/** A single bad or duplicate entry invalidates the WHOLE configuration. No cache. */
export function readAdminAllowlist(): ReadonlyMap<string, AdminRole> | null {
  const raw = process.env.ADMIN_ALLOWLIST;
  if (!raw) return null;
  const result = new Map<string, AdminRole>();
  for (const entry of raw.split(",")) {
    const parts = entry.trim().split(":");
    if (parts.length !== 2) return null;
    const email = normalizeAdminEmail(parts[0]);
    const role = parts[1].trim();
    if (!email || (role !== "reader" && role !== "admin") || result.has(email)) return null;
    result.set(email, role);
  }
  return result;
}

export function resolveAdminRole(email: string): AdminRole | null {
  return readAdminAllowlist()?.get(email) ?? null;
}
