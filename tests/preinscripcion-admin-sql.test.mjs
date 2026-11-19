import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

// STRUCTURAL ONLY: source checks do not execute PostgreSQL or prove privileges.
// Missing implementation is an ordinary test failure, never an import crash.
const load = path => fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
const sql = load("supabase/migrations/202611170002_prereg_admin_gateway.sql");
const engine = load("supabase/tests/prereg_admin_gateway.sql");
const docs = load("docs/preinscripciones-admin-base.md");
const source = name => sql.match(new RegExp(`create function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`, "i"))?.[0] ?? "";
const signatures = {
  admin_list_registrations: "uuid, text, text, text, text, text, integer, integer",
  admin_registration_detail: "uuid, text, text, uuid",
  admin_set_registration_status: "uuid, text, text, uuid, text, text",
  admin_log_event: "uuid, text, text, text",
};

for (const [name, args] of Object.entries(signatures)) {
  test(`STRUCTURAL: ${name} is a service-only definer with validated actor`, () => {
    const body = source(name);
    assert.match(body, /security definer\s+set search_path = ''/i);
    assert.match(body, /perform prereg_private\.validate_admin_actor\(p_actor_id, p_actor_email, p_actor_role\)/);
    assert.ok(sql.includes(`revoke all on function public.${name}(${args}) from public, anon, authenticated;`));
    assert.ok(sql.includes(`grant execute on function public.${name}(${args}) to service_role;`));
  });
}

test("STRUCTURAL: stable argument order, defaults and return contracts", () => {
  assert.match(source("admin_list_registrations"), /p_actor_id uuid, p_actor_email text, p_actor_role text,\s+p_school text default null, p_status text default null, p_group text default null,\s+p_limit integer default 50, p_offset integer default 0\s*\) returns jsonb/);
  assert.match(source("admin_registration_detail"), /p_actor_id uuid, p_actor_email text, p_actor_role text, p_id uuid\s*\) returns jsonb/);
  assert.match(source("admin_set_registration_status"), /p_actor_id uuid, p_actor_email text, p_actor_role text,\s+p_id uuid, p_status text, p_group text default null\s*\) returns jsonb/);
  assert.match(source("admin_log_event"), /p_actor_id uuid, p_actor_email text, p_actor_role text, p_action text\s*\) returns void/);
});

test("STRUCTURAL: actor UUID/email/role validation fails closed", () => {
  assert.match(sql, /p_actor_id is null/);
  assert.match(sql, /p_actor_email is null/);
  assert.match(sql, /length\(p_actor_email\) > 254/);
  assert.match(sql, /p_actor_email <> lower\(btrim\(p_actor_email\)\)/);
  assert.match(sql, /p_actor_role is null or p_actor_role not in \('reader', 'admin'\)/);
  assert.match(sql, /errcode = '42501'/);
});

test("STRUCTURAL: list filters requested groups, validates bounds and uses stable explicit projection", () => {
  const body = source("admin_list_registrations");
  assert.match(body, /p_school not in \('uncuyo', 'etec', 'ambos'\)/);
  assert.match(body, /p_status not in \('recibida', 'contactada', 'horario_propuesto', 'convenio_enviado', 'confirmada', 'lista_espera', 'cancelada'\)/);
  assert.match(body, /p_group not in \('grupo-1', 'grupo-2', 'grupo-3', 'grupo-4'\)/);
  assert.match(body, /p_limit is null or p_limit not between 1 and 100/);
  assert.match(body, /p_offset is null or p_offset not between 0 and 10000/);
  assert.match(body, /r\.target_school = p_school/);
  assert.match(body, /p_group = any\(r\.groups\)/);
  assert.match(body, /order by r\.created_at desc, r\.id desc\s+limit p_limit offset p_offset/);
  assert.match(body, /jsonb_build_object\('items', v_items, 'total', v_total\)/);
  for (const key of ["id", "public_code", "student_name", "target_school", "status", "groups", "confirmed_group", "created_at", "course_year", "first_preference"]) {
    assert.ok(body.includes(`'${key}', r.${key}`), key);
  }
  assert.doesNotMatch(body, /'email'|'guardian_name'|'whatsapp'|to_jsonb\(r\)|select \*/i);
  assert.match(body, /record_admin_event\([\s\S]*'list'/);
});

test("STRUCTURAL: detail projects every business/consent field but no secrets, unknown stays null", () => {
  const body = source("admin_registration_detail");
  for (const key of ["id", "public_code", "course_year", "entry_year", "student_name", "birth_date", "primary_school", "grade", "target_school", "other_school", "guardian_name", "relationship", "whatsapp", "email", "locality", "groups", "first_preference", "schedule_notes", "difficult_subjects", "pedagogical_notes", "referral_source", "status", "confirmed_group", "confirmed_slot", "program_version", "privacy_version", "program_accepted_at", "privacy_accepted_at", "created_at", "updated_at"]) {
    assert.ok(body.includes(`'${key}', r.${key}`), key);
  }
  assert.doesNotMatch(body, /idempotency_key|request_hash|student_hash|to_jsonb\(r\)|select \*/i);
  assert.match(body, /if v_detail is not null then[\s\S]*record_admin_event\([\s\S]*'detail'/);
  assert.match(body, /return v_detail;/);
});

test("STRUCTURAL: admin setter locks before capture, reuses original setter and audits actual state", () => {
  const body = source("admin_set_registration_status");
  assert.match(body, /if p_actor_role <> 'admin' then/);
  assert.match(body, /p_status is null or p_status not in/);
  assert.match(body, /p_status = 'confirmada' and p_group is null/);
  assert.match(body, /p_status <> 'confirmada' and p_group is not null/);
  assert.match(body, /select r\.status, r\.confirmed_group into v_from_status, v_from_group[\s\S]*for update;/);
  assert.match(body, /if not found then[\s\S]*errcode = 'P0002'/);
  assert.match(body, /perform prereg_private\.set_registration_status\(p_id, p_status, p_group\)/);
  assert.ok(body.indexOf("for update;") < body.indexOf("perform prereg_private.set_registration_status"));
  assert.match(body, /'confirmed_slot', r\.confirmed_slot/);
  assert.match(body, /case when p_status = 'cancelada' then 'cancel' else 'status_change' end/);
  assert.match(body, /v_from_status, v_result->>'status', v_from_group, v_result->>'confirmed_group'/);
  assert.doesNotMatch(body, /update prereg_private\.registrations|exception when/i);
});

test("STRUCTURAL: log-event cannot forge registration mutation events", () => {
  const body = source("admin_log_event");
  assert.match(body, /p_action is null or p_action not in \('login', 'logout', 'access_denied'\)/);
  assert.match(body, /record_admin_event\(p_actor_id, p_actor_email, p_actor_role, p_action\)/);
  assert.doesNotMatch(body, /p_id|p_data|exception when/);
});

test("STRUCTURAL: private append-only audit has no submitted data or deletion-blocking FK", () => {
  const table = sql.match(/create table prereg_private\.admin_audit_events \([\s\S]*?\n\);/)?.[0] ?? "";
  for (const column of ["id uuid primary key default pg_catalog.gen_random_uuid()", "occurred_at timestamptz", "actor_id uuid not null", "actor_email text not null", "actor_role text not null", "action text not null", "registration_id uuid", "from_status text", "to_status text", "from_group text", "to_group text", "request_id uuid not null default pg_catalog.gen_random_uuid()"]) assert.ok(table.includes(column), column);
  assert.doesNotMatch(table, /references|jsonb|payload|hash|token|secret|student|guardian/i);
  assert.match(sql, /before update or delete on prereg_private\.admin_audit_events/);
  assert.match(sql, /before truncate on prereg_private\.admin_audit_events/);
  assert.match(sql, /raise exception 'audit is append-only' using errcode = '23514'/);
  assert.match(sql, /alter table prereg_private\.admin_audit_events enable row level security/);
});

test("STRUCTURAL: private boundaries and original immutability/slot triggers are untouched", () => {
  assert.match(sql, /revoke all on schema prereg_private from public, anon, authenticated, service_role/);
  assert.match(sql, /revoke all on all tables in schema prereg_private from public, anon, authenticated, service_role/);
  assert.match(sql, /revoke all on all functions in schema prereg_private from public, anon, authenticated, service_role/);
  assert.match(sql, /alter default privileges in schema prereg_private revoke all on tables/);
  assert.match(sql, /alter default privileges in schema prereg_private revoke execute on functions/);
  assert.doesNotMatch(sql, /grant (?!execute)|create (?:or replace )?view|create policy|create or replace|disable trigger|drop (?:trigger|table|schema)|delete from prereg_private\.registrations/i);
  assert.match(sql, /\bbegin;[\s\S]*\bcommit;\s*$/);
});

test("STRUCTURAL: rollback SQL exercises real roles, projections, rejects and exact audit", () => {
  assert.match(engine, /\bbegin;[\s\S]*\brollback;\s*$/);
  for (const marker of ["set local role", "anon", "authenticated", "service_role", "reader cannot mutate", "invalid actor", "invalid status", "invalid group", "unknown id", "requested group", "exact list projection", "exact detail projection", "exact mutation audit", "audit tampering", "audit failure rolls back", "capacity", "immutable", "unchanged"]) assert.ok(engine.includes(marker), marker);
  for (const name of Object.keys(signatures)) assert.ok(engine.includes(`public.${name}(`), name);
});

test("STRUCTURAL: operator docs state trusted backend boundary and no runtime/production claim", () => {
  for (const marker of ["ADMIN_ALLOWLIST", "service_role", "grupo solicitado", "request_id", "PostgreSQL", "no ejecutadas", "producción", "fase 2"]) assert.ok(docs.includes(marker), marker);
  assert.doesNotMatch(sql + engine + docs, /[A-Z0-9._%+-]+@(?![A-Z0-9.-]+\.invalid\b)[A-Z0-9.-]+\.[A-Z]{2,}/i);
});
