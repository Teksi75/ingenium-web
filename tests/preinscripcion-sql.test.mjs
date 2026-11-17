import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

// Structural guardrails only. These tests do NOT execute a PostgreSQL engine.
const migrations = fs.readdirSync("supabase/migrations").filter(name => /^\d+_preinscripciones\.sql$/.test(name));
assert.equal(migrations.length, 1);
const sql = fs.readFileSync(`supabase/migrations/${migrations[0]}`, "utf8");
const engine = fs.readFileSync("supabase/tests/preinscripciones.sql", "utf8");

test("private bounded records, RLS and no public data grants/views", () => {
  for (const table of ["cycle_groups", "registrations", "rate_windows"]) {
    assert.match(sql, new RegExp(`create table prereg_private\\.${table}`, "i"));
    assert.match(sql, new RegExp(`alter table prereg_private\\.${table} enable row level security`, "i"));
  }
  assert.match(sql, /revoke all on schema prereg_private from public, anon, authenticated, service_role/i);
  assert.match(sql, /revoke all on all tables in schema prereg_private from public, anon, authenticated, service_role/i);
  assert.doesNotMatch(sql, /create (?:or replace )?view|grant (?:select|insert|update).*to (?:anon|authenticated)/i);
  assert.match(sql, /student_name varchar\(160\)/i);
  assert.match(sql, /pedagogical_notes varchar\(1000\)/i);
  assert.doesNotMatch(sql, /\b(?:payload|raw_data)\s+jsonb/i);
  assert.match(sql, /public_code uuid not null default gen_random_uuid\(\) unique/i);
  for (const index of ["cycle", "target_school", "status", "created_at", "groups"]) assert.match(sql, new RegExp(`create index registrations_${index}`, "i"));
});
test("minimal RPC, empty search path and revoked default function execution", () => {
  assert.match(sql, /create function public\.submit_preinscripcion/i);
  assert.match(sql, /security definer\s+set search_path = ''/i);
  assert.match(sql, /revoke all on function public\.submit_preinscripcion[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.submit_preinscripcion[\s\S]*to service_role/i);
  assert.match(sql, /revoke all on all functions in schema prereg_private from public, anon, authenticated, service_role/i);
});
test("atomic key replay, unique student dedup and capped daily counters", () => {
  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /idempotency_key uuid not null unique/i);
  assert.match(sql, /unique \(course_year, student_hash\)/i);
  assert.match(sql, /on conflict \(rate_hash, window_day\) do update/i);
  assert.match(sql, /where prereg_private\.rate_windows\.submissions < 5/i);
  assert.match(sql, /exception when unique_violation then/i);
  assert.match(sql, /for update skip locked limit 100/i);
});
test("all confirmation paths use bounded unique persisted slots and group row lock", () => {
  assert.match(sql, /unique \(course_year, confirmed_group, confirmed_slot\)/i);
  assert.match(sql, /confirmed_slot between 1 and 8/i);
  assert.match(sql, /foreign key \(course_year, confirmed_group\)/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /before insert or update on prereg_private\.registrations/i);
  assert.match(sql, /new\.confirmed_group = any\(new\.groups\)/i);
  assert.match(sql, /generate_series\(1, v_capacity\)/i);
  assert.match(sql, /new\.updated_at :=/i);
  assert.match(sql, /'confirmada'.*'lista_espera'.*'cancelada'/i);
});
test("engine script rolls back synthetic fixtures and checks privileges, replay and actual ninth confirmation", () => {
  assert.match(engine, /^--[\s\S]*begin;/i);
  assert.match(engine, /rollback;\s*$/i);
  for (const text of ["has_table_privilege", "has_function_privilege", "relrowsecurity", "ninth confirmation", "changed key payload", "rate counter unchanged", "cross-cycle", "transfer", "direct insert", "expired cleanup", "replay"]) assert.ok(engine.includes(text), text);
});
