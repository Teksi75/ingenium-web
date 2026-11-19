import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { test, beforeEach, afterEach } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { loadAdmin } from "./helpers/load-admin.mjs";

const require = createRequire(import.meta.url);
const ID = "eb4dd9f7-672b-40eb-9f8f-0f31e4ec1e50";
const OTHER = "eb4dd9f7-672b-40eb-9f8f-0f31e4ec1e51";
const ORIGIN = "https://panel.example.invalid";
const ERROR = "No se pudo completar la solicitud.";
const UNCERTAIN = "No pudimos confirmar el resultado. Revisá el estado de la solicitud antes de volver a intentar.";
const DATE = "2026-11-17T12:00:00+00:00";
const detail = { id: ID, public_code: OTHER, student_name: "Estudiante Ejemplo", target_school: "ambos",
  status: "recibida", groups: ["grupo-1", "grupo-3"], confirmed_group: null, confirmed_slot: null,
  created_at: DATE, updated_at: DATE, course_year: 2027, entry_year: 2028, first_preference: "grupo-3",
  birth_date: "2014-02-03", primary_school: "Escuela Ejemplo", grade: "séptimo grado", other_school: "",
  guardian_name: "Responsable Ejemplo", relationship: "tutor", whatsapp: "2615550100",
  email: "family@example.invalid", locality: "Localidad Ejemplo", schedule_notes: "", difficult_subjects: "",
  pedagogical_notes: "", referral_source: "", program_version: "1", privacy_version: "2",
  program_accepted_at: DATE, privacy_accepted_at: DATE };
let f, session, made, cookie;
beforeEach(() => {
  f = loadAdmin(); session = f.load("lib/admin/session.ts"); signIn();
});
afterEach(() => f.restore());
function signIn(email = "admin@example.invalid", now) {
  made = session.createAdminSession({ id: OTHER, email }, now);
  cookie = made.cookie.split(";")[0];
}
function route() { return f.load("app/admin/[id]/status/route.ts"); }
function request(body = {}, headers = {}, id = ID) {
  const values = { status: "contactada", group: "", csrf: made.actor.csrf, confirmCancel: "", ...body };
  const merged = { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded", cookie, ...headers };
  for (const key of Object.keys(merged)) if (merged[key] === null) delete merged[key];
  return new Request(`${ORIGIN}/admin/${id}/status?success=1&returnTo=https://evil.example.invalid`, {
    method: "POST", headers: merged,
    body: typeof body === "string" || body instanceof ReadableStream ? body : new URLSearchParams(values),
    ...(body instanceof ReadableStream ? { duplex: "half" } : {}),
  });
}
async function post(body = {}, headers = {}, id = ID) {
  return route().POST(request(body, headers, id), { params: Promise.resolve({ id }) });
}
async function check(response, status, body = ERROR) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("location"), status === 303 ? `/admin/${ID}` : null);
  assert.equal(response.headers.get("set-cookie"), null, "no rolling session");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(await response.text(), status === 303 ? "" : body);
}
function success(status = "contactada", group = null) {
  return { id: ID, status, confirmed_group: group, confirmed_slot: group ? 1 : null };
}
// TSX/Next boundary adapter, in memory only; the server-only loader is unchanged.
function pageModule(relative) {
  const cache = new Map();
  function load(file) {
    assert.ok(fs.existsSync(file), `Missing implementation: ${file}`);
    if (cache.has(file)) return cache.get(file).exports;
    const loaded = { exports: {} }; cache.set(file, loaded);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    }, fileName: file });
    function localRequire(name) {
      if (name === "server-only") return {};
      if (name === "next/headers") return { headers: async () => new Headers(cookie ? { cookie } : {}) };
      if (name === "next/navigation") return { redirect(to) { throw new Error(`REDIRECT:${to}`); } };
      if (name.startsWith("@/lib/admin/") && fs.existsSync(`${name.slice(2)}.ts`)) return f.load(`${name.slice(2)}.ts`);
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? name.slice(2) : path.resolve(path.dirname(file), name);
        const target = [`${base}.ts`, `${base}.tsx`].find(p => fs.existsSync(p));
        assert.ok(target, `Missing import: ${name}`); return load(target);
      }
      return require(name);
    }
    new vm.Script(`(function(exports,require,module){${outputText}\n})`, { filename: file })
      .runInThisContext()(loaded.exports, localRequire, loaded);
    return loaded.exports;
  }
  return load(relative);
}
async function render(query = {}) {
  return renderToStaticMarkup(await pageModule("app/admin/[id]/page.tsx").default({
    params: Promise.resolve({ id: ID }), searchParams: Promise.resolve(query),
  }));
}

test("reader has no controls and cannot mutate or forge authority; anonymous denial makes no network calls", async () => {
  signIn("reader@example.invalid"); f.fetchMock(() => Response.json(detail));
  assert.doesNotMatch(await render(), /<form|name="status"|name="confirmCancel"/);
  const before = f.calls.length;
  await check(await post(), 403);
  await check(await post({ actor: OTHER, role: "admin", p_actor_email: "admin@example.invalid" }), 403);
  cookie = null;
  await check(await post(), 403);
  await check(await post({ role: "admin" }), 403);
  assert.equal(f.calls.length, before, "no mutation or audit-only fetch");
});

test("every allowed state uses only the audited RPC, derives actor from cookie, and clears group outside confirmation", async () => {
  for (const status of ["recibida", "contactada", "horario_propuesto", "convenio_enviado", "lista_espera", "confirmada", "cancelada"]) {
    const group = status === "confirmada" ? "grupo-3" : null;
    f.fetchMock(() => Response.json(success(status, group)));
    const before = f.calls.length;
    await check(await post({ status, group: group ?? "", confirmCancel: status === "cancelada" ? "yes" : "" }), 303);
    assert.equal(f.calls.length, before + 1);
    const call = f.calls.at(-1);
    assert.equal(call.url, "https://supabase.example.invalid/rest/v1/rpc/admin_set_registration_status");
    assert.deepEqual(call.payload, { p_actor_id: OTHER, p_actor_email: "admin@example.invalid", p_actor_role: "admin",
      p_id: ID, p_status: status, p_group: group });
    assert.equal(call.method, "POST"); assert.equal(call.cache, "no-store"); assert.equal(call.redirect, "error");
    assert.equal(call.headers.apikey, process.env.SUPABASE_SERVICE_ROLE_KEY);
    assert.equal(call.headers.Authorization, `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
    assert.ok(call.signal instanceof AbortSignal);
    for (const key of ["program_version", "privacy_version", "program_accepted_at", "privacy_accepted_at", "student_name"]) {
      assert.ok(!(key in call.payload), "submitted evidence never enters a mutation payload");
    }
  }
});

test("strict action payload rejects invalid status/group/cancel, editable fields, actor and return URLs before fetching", async () => {
  for (const body of [{ status: "unknown" }, { status: "Confirmada" }, { status: "" }, { group: "grupo-1" },
    { group: "null" }, { status: "confirmada" }, { status: "confirmada", group: "grupo-5" },
    { status: "confirmada", group: " grupo-1" }, { status: "cancelada" },
    ...["true", "on", "1", "YES"].map(confirmCancel => ({ status: "cancelada", confirmCancel })),
    { confirmCancel: "yes" }, { status: "confirmada", group: "grupo-1", confirmCancel: "yes" },
    { status: "cancelada", confirmCancel: "yes", group: "grupo-1" },
    { student_name: "edited" }, { privacy_version: "new" }, { actor: OTHER }, { role: "admin" },
    { p_actor_role: "admin" }, { reason: "free text" }, { returnTo: "/admin" },
    `status=contactada&status=cancelada&group=&csrf=${made.actor.csrf}&confirmCancel=`,
    `status=contactada&group=&csrf=${made.actor.csrf}`, "status=%GG", "x".repeat(4097)]) {
    await check(await post(body), typeof body === "string" && body.length > 4096 ? 413 : 400);
    assert.equal(f.calls.length, 0);
  }
});

test("invalid UUID/origin/CSRF/session/config and expired or now-disallowed roles never mutate", async () => {
  for (const id of ["bad", "../login", `${ID}x`, "00000000-0000-0000-0000-000000000000"]) await check(await post({}, {}, id), 400);
  for (const origin of [null, "null", `${ORIGIN}/`, "https://evil.example.invalid"]) await check(await post({}, { origin }), 403);
  for (const csrf of ["", "wrong", "a".repeat(43)]) await check(await post({ csrf }), 403);
  for (const value of [null, "admin_session=bad", `${cookie}x`, `${cookie}; ${cookie}`]) await check(await post({}, { cookie: value }), 403);
  await check(await post({}, { "content-type": "application/json" }), 415);
  await check(await post({}, { "content-length": "4097" }), 413);
  const validCookie = cookie, validSession = made;
  signIn("admin@example.invalid", 1); await check(await post(), 403); cookie = validCookie; made = validSession;
  f.env({ ADMIN_ALLOWLIST: "other@example.invalid:admin" }); await check(await post(), 403);
  f.env({ ADMIN_ALLOWLIST: "admin@example.invalid:reader" }); await check(await post(), 403);
  f.env({ SUPABASE_SERVICE_ROLE_KEY: undefined }); await check(await post(), 503);
  assert.equal(f.calls.length, 0);
});

test("auth is revalidated after an awaited body: removal, demotion and absolute expiry all deny before RPC", async () => {
  const realNow = Date.now;
  try {
    for (const change of [() => f.env({ ADMIN_ALLOWLIST: "other@example.invalid:admin" }),
      () => f.env({ ADMIN_ALLOWLIST: "admin@example.invalid:reader" }),
      () => { Date.now = () => (made.actor.expiresAt * 1000); }]) {
      f.env(); Date.now = realNow; signIn();
      const encoded = new TextEncoder().encode(new URLSearchParams({ status: "contactada", group: "",
        csrf: made.actor.csrf, confirmCancel: "" }).toString());
      let controller;
      const stream = new ReadableStream({ start(value) { controller = value; } });
      const pending = post(stream);
      await new Promise(resolve => setImmediate(resolve));
      change(); controller.enqueue(encoded); controller.close();
      await check(await pending, 403);
      assert.equal(f.calls.length, 0);
    }
  } finally { Date.now = realNow; }
});

test("malformed/mismatched upstream or uncertain network never redirects or retries and tells operator to check status", async () => {
  for (const result of [null, [], {}, { ...success(), id: OTHER }, { ...success(), status: "recibida" },
    { ...success(), confirmed_group: "grupo-1" }, { ...success(), confirmed_slot: 1 }, { ...success(), extra: "private" }]) {
    f.fetchMock(() => Response.json(result)); const before = f.calls.length;
    await check(await post(), 503, UNCERTAIN); assert.equal(f.calls.length, before + 1);
  }
  for (const handler of [() => new Response("private invalid json"), () => new Response(null, { status: 204 }),
    () => new Response(null, { status: 302, headers: { Location: "https://evil.example.invalid" } }),
    () => { throw new Error("private credential failure"); },
    () => Response.json({ code: "unknown", message: "private detail" }, { status: 500 }),
    () => Response.json({ message: "P0002 23505 private" }, { status: 400 })]) {
    f.fetchMock(handler); const before = f.calls.length;
    await check(await post(), 503, UNCERTAIN); assert.equal(f.calls.length, before + 1);
  }
  for (const result of [{ ...success("confirmada", "grupo-1"), confirmed_slot: 0 },
    { ...success("confirmada", "grupo-1"), confirmed_slot: 9 },
    { ...success("confirmada", "grupo-1"), confirmed_slot: "1" }, success("confirmada", "grupo-3")]) {
    f.fetchMock(() => Response.json(result));
    await check(await post({ status: "confirmada", group: "grupo-1" }), 503, UNCERTAIN);
  }
});

test("only validated SQLSTATE distinguishes unknown target and conflict/capacity without exposing upstream text", async () => {
  for (const [code, status, message] of [["P0002", 404, "No encontramos la solicitud. Volvé al listado."],
    ["23505", 409, "No se pudo completar el cambio. Revisá el estado y la disponibilidad del grupo."],
    ["23514", 409, "No se pudo completar el cambio. Revisá el estado y la disponibilidad del grupo."],
    ["23505 private", 503, UNCERTAIN], [23505, 503, UNCERTAIN]]) {
    f.fetchMock(() => Response.json({ code, message: "private payload", details: "private credentials" }, { status: 400 }));
    const before = f.calls.length;
    await check(await post(), status, message); assert.equal(f.calls.length, before + 1);
  }
});

test("GET/HEAD/unsupported methods are private and inert even with action query flags", async () => {
  for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const response = await route()[method](new Request(`${ORIGIN}/admin/${ID}/status?status=cancelada&success=1`, { method }));
    assert.equal(response.headers.get("allow"), "POST");
    await check(response, 405, method === "HEAD" ? "" : ERROR);
  }
  assert.equal(f.calls.length, 0);
});

test("admin detail separates ordinary status, requested-group confirmation and explicit native cancel confirmation", async () => {
  f.fetchMock(() => Response.json(detail));
  const html = await render({ success: "1", status: "cancelada" });
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map(m => m[0]);
  assert.equal(forms.length, 3);
  for (const form of forms) {
    assert.ok(form.includes(`action="/admin/${ID}/status"`)); assert.match(form, /method="post"/);
    assert.deepEqual([...form.matchAll(/name="([^"]+)"/g)].map(m => m[1]).sort(), ["confirmCancel", "csrf", "group", "status"]);
    assert.ok(form.includes(`name="csrf" value="${made.actor.csrf}"`));
  }
  assert.match(forms[0], /<select[^>]*name="status"/);
  assert.doesNotMatch(forms[0], /value="confirmada"|value="cancelada"/);
  assert.match(forms[1], /name="status" value="confirmada"/);
  assert.match(forms[1], /<select[^>]*name="group"/);
  for (const group of ["grupo-1", "grupo-3"]) assert.ok(forms[1].includes(`value="${group}"`));
  assert.doesNotMatch(forms[1], /value="grupo-2"|value="grupo-4"/);
  assert.match(forms[2], /<input\b(?=[^>]*type="checkbox")(?=[^>]*name="confirmCancel")(?=[^>]*required="")(?=[^>]*value="yes")[^>]*>/);
  assert.match(forms[2], /name="status" value="cancelada"/);
  assert.match(html, /conserva los datos enviados/); assert.match(html, /libera el lugar/);
  assert.match(html, /familia.*volver a enviar.*manualmente/);
  assert.doesNotMatch(html, /Cambio realizado|Solicitud cancelada|name="reason"|name="actor"|name="role"|Reorganizar|Reenviar/);
  assert.ok(!html.includes(process.env.SUPABASE_SERVICE_ROLE_KEY));
  assert.ok(!html.includes(process.env.ADMIN_SESSION_SECRET));
  assert.ok(html.includes("Consentimiento y fechas"), "existing read-only detail preserved");
  assert.equal(f.calls.length, 1, "render never mutates");
});

test("confirmation choices remain compatible and cancelled details retain immutable evidence", async () => {
  f.fetchMock(() => Response.json({ ...detail, target_school: "uncuyo", groups: ["grupo-1", "grupo-2"],
    first_preference: "grupo-1", status: "cancelada" }));
  const html = await render();
  const confirmForm = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map(m => m[0]).find(form => form.includes('value="confirmada"'));
  assert.ok(confirmForm.includes('value="grupo-1"')); assert.ok(!confirmForm.includes('value="grupo-2"'));
  for (const value of ["Estudiante Ejemplo", "Responsable Ejemplo", "family@example.invalid", "Programa", "Privacidad"]) assert.ok(html.includes(value));
});

test("operator docs describe manual resend, atomic audit, uncertainty, local limits and rollback", () => {
  const docs = fs.readFileSync("docs/preinscripciones-admin-actions.md", "utf8");
  for (const pattern of [/admin_set_registration_status/, /actor/, /antes.*después/, /manualmente/,
    /consentimiento/, /antes de.*repetir/, /rollback|Reversión/, /SMTP/, /producción/]) assert.match(docs, pattern);
  for (const file of ["lib/admin/registration-actions.ts", "lib/admin/registration-status-controls.tsx", "app/admin/[id]/status/route.ts"]) {
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /["']use client["']|console\.|dangerouslySetInnerHTML/);
  }
});
