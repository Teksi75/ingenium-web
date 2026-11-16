import "server-only";
import type { SubmissionData } from "./types";

export interface StorageConfig {
  url: string;
  serviceKey: string;
  rateSecret: string;
}
export interface SubmissionRecord {
  p_key: string;
  p_request_hash: string;
  p_student_hash: string;
  p_rate_hash: string;
  p_course_year: number;
  p_entry_year: number;
  p_program_version: string;
  p_privacy_version: string;
  p_data: SubmissionData;
}
export type StorageResult =
  | { outcome: "created" | "replayed"; public_code: string }
  | { outcome: "conflict" | "duplicate" | "limited" };

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Read at request time, never expose config to client modules or logs. */
export function storageConfig(): StorageConfig | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const rateSecret = process.env.PREINSCRIPCION_RATE_SECRET ?? serviceKey;
  if (!url || !serviceKey || !rateSecret || rateSecret.length < 32) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password
      || parsed.search || parsed.hash || parsed.pathname !== "/") return null;
    return { url: parsed.origin, serviceKey, rateSecret };
  } catch {
    return null;
  }
}

/** One bounded network attempt. Retrying uncertain writes is the caller's explicit
 * action with its ORIGINAL idempotency key; never generate a replacement here. */
export async function persistSubmission(config: StorageConfig, record: SubmissionRecord): Promise<StorageResult> {
  const response = await fetch(`${config.url}/rest/v1/rpc/submit_preinscripcion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
    },
    body: JSON.stringify(record),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Storage unavailable");
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || Array.isArray(result)) throw new Error("Invalid storage response");
  const { outcome, public_code } = result as Record<string, unknown>;
  if (outcome === "created" || outcome === "replayed") {
    if (typeof public_code !== "string" || !UUID_PATTERN.test(public_code)) throw new Error("Invalid receipt");
    return { outcome, public_code };
  }
  if (outcome === "conflict" || outcome === "duplicate" || outcome === "limited") return { outcome };
  throw new Error("Invalid storage outcome");
}
