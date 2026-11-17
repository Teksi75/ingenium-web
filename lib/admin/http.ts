import "server-only";

export const ADMIN_ERROR = "No se pudo completar la solicitud.";
export const ADMIN_FORM_BYTES = 4096;
const RESPONSE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

export function adminResponse(status: number, body: string | null = ADMIN_ERROR, headers?: HeadersInit): Response {
  const result = new Headers(headers);
  for (const [key, value] of Object.entries(RESPONSE_HEADERS)) result.set(key, value);
  result.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(body, { status, headers: result });
}
export function adminRedirect(destination: "/admin" | "/admin?sent=1", cookies: string[] = []): Response {
  const headers = new Headers({ Location: destination });
  for (const cookie of cookies) headers.append("Set-Cookie", cookie);
  return adminResponse(303, null, headers);
}
export function adminMethodNotAllowed(request: Request): Response {
  return adminResponse(405, request.method === "HEAD" ? null : ADMIN_ERROR, { Allow: "POST" });
}
function loopback(hostname: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

/** Never inferred from a request, Host or forwarded headers. */
export function adminAppOrigin(): string | null {
  const raw = process.env.ADMIN_APP_ORIGIN ?? process.env.SITE_ORIGIN;
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (raw !== parsed.origin || parsed.username || parsed.password) return null;
    if (parsed.protocol === "https:") return parsed.origin;
    if (process.env.NODE_ENV !== "production" && parsed.protocol === "http:" && loopback(parsed.hostname)) return parsed.origin;
  } catch { /* Fail closed. */ }
  return null;
}

export function isAdminSameOrigin(request: Request): boolean {
  const configured = adminAppOrigin();
  const origin = request.headers.get("origin");
  if (!configured || !origin) return false;
  if (origin === configured) return true;
  if (process.env.NODE_ENV === "production") return false;
  try {
    const url = new URL(request.url);
    const claimed = new URL(origin);
    const host = request.headers.get("host");
    if (!host || url.protocol !== "http:" || !loopback(url.hostname)
      || claimed.protocol !== url.protocol || !loopback(claimed.hostname)
      || claimed.port !== url.port || origin !== claimed.origin) return false;
    // Next may normalize 127.0.0.1 to localhost; require exact browser Host and same URL port.
    return host === claimed.host;
  } catch {
    return false;
  }
}

export class AdminHttpError extends Error {
  constructor(public readonly status: number) { super(ADMIN_ERROR); }
}

/** Strict fields, no duplicates, 4 KiB including streamed bytes, one 8s deadline. */
export async function readAdminForm(request: Request, fields: readonly string[]): Promise<URLSearchParams> {
  if (!/^application\/x-www-form-urlencoded(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")) {
    throw new AdminHttpError(415);
  }
  const length = request.headers.get("content-length");
  if (length !== null && !/^\d+$/.test(length)) throw new AdminHttpError(400);
  if (length !== null && Number(length) > ADMIN_FORM_BYTES) throw new AdminHttpError(413);
  if (!request.body) throw new AdminHttpError(400);
  const reader = request.body.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new AdminHttpError(400)), 8000);
  });
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let bytes = 0;
    let raw = "";
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > ADMIN_FORM_BYTES) throw new AdminHttpError(413);
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    // URLSearchParams otherwise silently repairs bad percent escapes / UTF-8.
    for (const pair of raw.split("&")) {
      for (const component of pair.split("=")) decodeURIComponent(component.replace(/\+/g, " "));
    }
    const form = new URLSearchParams(raw);
    const seen = new Set<string>();
    for (const [key] of form) {
      if (!fields.includes(key) || seen.has(key)) throw new AdminHttpError(400);
      seen.add(key);
    }
    if (fields.some(field => !form.has(field))) throw new AdminHttpError(400);
    return form;
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error instanceof AdminHttpError ? error : new AdminHttpError(400);
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}

export function adminFailure(error: unknown): Response {
  return adminResponse(error instanceof AdminHttpError ? error.status : 503);
}
