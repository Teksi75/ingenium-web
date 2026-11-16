import "server-only";
import { createHash, createHmac } from "node:crypto";
import { SITE_ORIGIN } from "../site";
import { preinscripcionConfig } from "./config";
import { validateSubmission } from "./validation";
import { persistSubmission, storageConfig, UUID_PATTERN } from "./storage";

const MAX_BODY_BYTES = 16 * 1024;
const unavailable = "No pudimos guardar la solicitud. Conservá tus datos e intentá nuevamente más tarde.";
const conflict = "No se pudo registrar la solicitud. Revisá si ya fue enviada o intentá nuevamente.";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function json(body: object, status: number, extra?: Record<string, string>): Response {
  return Response.json(body, { status, headers: { ...headers, ...extra } });
}
function error(message: string, status: number): Response {
  return json({ message }, status);
}
function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

class BodyTooLarge extends Error {}
async function readJson(request: Request): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && /^\d+$/.test(length) && Number(length) > MAX_BODY_BYTES) throw new BodyTooLarge();
  if (!request.body) throw new Error("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new BodyTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
}

function allowedOrigin(request: Request): boolean {
  // No fallback to Referer or forwarded headers; no wildcard CORS.
  const origin = request.headers.get("origin");
  const target = new URL(request.url);
  if (!origin) return false;
  if (origin === target.origin || origin === SITE_ORIGIN) return true;
  // Next's local production server normalizes Request.url to localhost even
  // when the browser used 127.0.0.1. Permit only a verified loopback alias,
  // exact actual Host and matching HTTP port, never an arbitrary forwarded host.
  const loopback = ["localhost", "127.0.0.1", "[::1]"];
  if (target.protocol !== "http:" || !loopback.includes(target.hostname)) return false;
  try {
    const source = new URL(origin);
    return source.origin === origin && source.protocol === "http:"
      && loopback.includes(source.hostname) && source.port === target.port
      && request.headers.get("host") === source.host;
  } catch {
    return false;
  }
}

export async function submitPreinscripcion(request: Request): Promise<Response> {
  if (!allowedOrigin(request)) {
    return error("No se pudo validar el origen de la solicitud.", 403);
  }
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "")) {
    return error("Usá el formato application/json.", 415);
  }
  const key = request.headers.get("idempotency-key");
  if (!key || !UUID_PATTERN.test(key)) return error("La solicitud necesita una clave de reintento válida.", 400);
  const config = storageConfig();
  if (!config) return error(unavailable, 503);
  if (preinscripcionConfig.status !== "abiertas") {
    return error(preinscripcionConfig.status === "cerradas" ? preinscripcionConfig.closedNotice : preinscripcionConfig.suspendedNotice, 503);
  }
  let input: unknown;
  try {
    input = await readJson(request);
  } catch (cause) {
    return cause instanceof BodyTooLarge
      ? error("La solicitud supera el tamaño permitido.", 413)
      : error("El cuerpo debe ser JSON válido.", 400);
  }
  const validated = validateSubmission(input);
  if (!validated.ok) return json({ message: "Revisá los datos de la solicitud.", errors: validated.errors }, 400);
  // validateSubmission constructs fields in stable order. Group selection is a set,
  // so canonicalize it without changing the shared validation/config contract.
  const data = { ...validated.data, groups: [...validated.data.groups].sort() };
  const { courseYear, entryYear, terms, privacy } = preinscripcionConfig;
  try {
    const result = await persistSubmission(config, {
      p_key: key.toLowerCase(),
      p_request_hash: hash({ courseYear, entryYear, programVersion: terms.version, privacyVersion: privacy.version, data }),
      p_student_hash: hash([courseYear, data.studentName.toLowerCase(), data.birthDate, data.email]),
      p_rate_hash: createHmac("sha256", config.rateSecret).update(`preinscripcion:contact:v1:${data.email}`).digest("hex"),
      p_course_year: courseYear, p_entry_year: entryYear,
      p_program_version: terms.version, p_privacy_version: privacy.version,
      p_data: data,
    });
    if (result.outcome === "created" || result.outcome === "replayed") {
      return json({ publicCode: result.public_code }, result.outcome === "created" ? 201 : 200);
    }
    if (result.outcome === "limited") {
      return json({ message: "Se alcanzó el límite de solicitudes. Intentá nuevamente más tarde." }, 429, { "Retry-After": "86400" });
    }
    return error(conflict, 409);
  } catch {
    // Deliberately no PII, hashes, keys, payloads or upstream messages in logs.
    return error(unavailable, 503);
  }
}

export function methodNotAllowed(request: Request): Response {
  const options = { status: 405, headers: { ...headers, Allow: "POST" } };
  return request.method === "HEAD" ? new Response(null, options)
    : Response.json({ message: "Método no permitido." }, options);
}
