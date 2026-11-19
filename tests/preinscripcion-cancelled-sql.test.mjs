import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

// STRUCTURAL only: these checks do not execute PostgreSQL or prove SQL behavior.
const path = "supabase/migrations/202611170001_prereg_cancelled_resubmission.sql";
const sql = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
const original = fs.readFileSync("supabase/migrations/202608130001_preinscripciones.sql", "utf8");
const signature = "public.submit_preinscripcion(uuid, text, text, text, integer, integer, text, text, jsonb)";
const activeGate = "where course_year = p_course_year and student_hash = p_student_hash and status <> 'cancelada'";
const functionSource = source => source.match(/create (?:or replace )?function public\.submit_preinscripcion\([\s\S]*?\n\$\$;/i)?.[0];

test("STRUCTURAL: only the original student constraint becomes active-only uniqueness", () => {
  // PostgreSQL's default name for the unnamed UNIQUE in the original DDL.
  assert.match(original, /unique \(course_year, student_hash\)/);
  assert.match(sql, /alter table prereg_private\.registrations\s+drop constraint registrations_course_year_student_hash_key;/i);
  assert.equal((sql.match(/drop constraint/gi) ?? []).length, 1);
  assert.match(sql, /create unique index registrations_active_student\s+on prereg_private\.registrations \(course_year, student_hash\)\s+where status <> 'cancelada';/i);
});

test("STRUCTURAL: duplicate gate rejects all active states but ignores cancelled history", () => {
  assert.ok(sql.includes(activeGate), "active-only duplicate gate required");
  assert.match(sql, /if exists \(select 1 from prereg_private\.registrations[^\n]+\) then\s+return pg_catalog\.jsonb_build_object\('outcome', 'duplicate'\);/);
});

test("STRUCTURAL: old keys replay their original receipt before active duplicate detection", () => {
  assert.match(sql, /where idempotency_key = p_key;[\s\S]*'outcome', 'replayed', 'public_code', v_existing\.public_code[\s\S]*'outcome', 'conflict'/);
  assert.ok(sql.indexOf("where idempotency_key = p_key") < sql.indexOf(activeGate), "key lookup must precede deduplication");
});

test("STRUCTURAL: entire public RPC stays identical except replacement and active gate", () => {
  const expected = functionSource(original)
    .replace("create function", "create or replace function")
    .replace("where course_year = p_course_year and student_hash = p_student_hash", activeGate);
  assert.ok(functionSource(sql) === expected, "signature, validation, locks, receipts, quotas, cleanup and errors must stay unchanged");
});

test("STRUCTURAL: definer, empty search path and service-only execution are preserved", () => {
  assert.match(sql, /returns jsonb language plpgsql security definer\s+set search_path = ''/);
  for (const statement of [
    `revoke all on function ${signature} from public, anon, authenticated;`,
    `grant execute on function ${signature} to service_role;`,
    "revoke all on all functions in schema prereg_private from public, anon, authenticated, service_role;",
  ]) assert.ok(sql.includes(statement), statement);
  assert.doesNotMatch(sql, /grant[^;]+(?:usage|select|insert|update|delete)[^;]+to/i);
});

test("STRUCTURAL: atomic forward migration leaves immutable evidence and slot guards alone", () => {
  assert.match(sql, /\bbegin;[\s\S]*\bcommit;\s*$/);
  assert.equal((sql.match(/create (?:or replace )?function /gi) ?? []).length, 1);
  assert.doesNotMatch(sql, /(?:update|delete from|truncate) prereg_private\.registrations|drop (?:trigger|table|schema)|disable trigger/i);
  assert.doesNotMatch(sql, /(?:create|alter|drop)[^;]*(?:guard_registration|set_registration_status|cycle_groups|confirmed_slot)/i);
});
