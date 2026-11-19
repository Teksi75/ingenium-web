import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { test, beforeEach, afterEach } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { loadAdmin, mockGoogle, GOOGLE_EMAIL } from "./helpers/load-admin.mjs";

const require = createRequire(import.meta.url);
const ID = "eb4dd9f7-672b-40eb-9f8f-0f31e4ec1e50";
const EMAIL = "reader@example.invalid";
const CODE = "synthetic-code/one";
const DATE = "2026-11-17T12:00:00+00:00";
const item = { id: ID, public_code: ID, student_name: "Estudiante Ejemplo", target_school: "ambos",
  status: "recibida", groups: ["grupo-1", "grupo-3"], confirmed_group: null,
  created_at: DATE, course_year: 2027, first_preference: "grupo-3" };
const detail = { ...item, entry_year: 2028, birth_date: "2014-02-03", primary_school: "Escuela Ejemplo",
  grade: "séptimo grado", other_school: "", guardian_name: "Responsable Ejemplo", relationship: "tutor",
  whatsapp: "2615550100", email: "family@example.invalid", locality: "Localidad Ejemplo",
  schedule_notes: "Observación de horario", difficult_subjects: "Matemática", pedagogical_notes: "Nota de ejemplo",
  referral_source: "Recomendación", confirmed_slot: null, program_version: "1", privacy_version: "2",
  program_accepted_at: DATE, privacy_accepted_at: DATE, updated_at: DATE };
let f, session, cookie;

// Existing server loader stays unchanged. This adapter adds TSX/React and explicit
// Next request mocks in memory; there is no Next HTTP server or disk compilation.
function pageModule(relative) {
  const cache = new Map();
  function load(file) {
    assert.ok(fs.existsSync(file), `Missing implementation: ${file}`);
    if (cache.has(file)) return cache.get(file).exports;
    const loaded = { exports: {} };
    cache.set(file, loaded);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    }, fileName: file });
    function localRequire(name) {
      if (name === "server-only") return {};
      if (name === "next/headers") return { headers: async () => new Headers(cookie ? { cookie } : {}) };
      if (name === "next/navigation") return { redirect(destination) { throw new Error(`REDIRECT:${destination}`); } };
      if (name.startsWith("@/lib/admin/")) {
        const target = `${name.slice(2)}.ts`;
        assert.ok(fs.existsSync(target), `Missing implementation: ${target}`);
        return f.load(target);
      }
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? name.slice(2) : path.resolve(path.dirname(file), name);
        const target = [base, `${base}.ts`, `${base}.tsx`].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
        assert.ok(target, `Missing import: ${name}`);
        return load(target);
      }
      return require(name);
    }
    new vm.Script(`(function(exports,require,module){${outputText}\n})`, { filename: file })
      .runInThisContext()(loaded.exports, localRequire, loaded);
    return loaded.exports;
  }
  return load(relative);
}
async function home(query = {}) {
  return renderToStaticMarkup(await pageModule("app/admin/page.tsx").default({ searchParams: Promise.resolve(query) }));
}
async function registration(id = ID, query = {}) {
  return renderToStaticMarkup(await pageModule("app/admin/[id]/page.tsx").default({
    params: Promise.resolve({ id }), searchParams: Promise.resolve(query),
  }));
}
async function confirm(query = {}) {
  return renderToStaticMarkup(await pageModule("app/admin/confirm/page.tsx").default({ searchParams: Promise.resolve(query) }));
}
function signIn(email = EMAIL) { cookie = session.createAdminSession({ id: ID, email }).cookie.split(";")[0]; }
function mockList(items = [item], total = items.length) { f.fetchMock(() => Response.json({ items, total })); }
function noSecrets(html) {
  for (const secret of [process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.ADMIN_SESSION_SECRET,
    "hidden-request-hash", "hidden-student-hash", "hidden-idempotency", "unapproved-value", EMAIL]) {
    assert.ok(!html.includes(secret), `Unexpected secret or identity: ${secret}`);
  }
}
beforeEach(() => { f = loadAdmin(); session = f.load("lib/admin/session.ts"); cookie = null; });
afterEach(() => f.restore());

test("home authorizes before data; anonymous and revoked sessions only get generic login", async () => {
  for (const query of [{}, { sent: "1" }, { sent: ["1", "1"], escuela: "bad" }]) {
    const html = await home(query);
    assert.match(html, /action="\/admin\/login"/);
    assert.match(html, /method="post"/);
    assert.match(html, /Ingresar con Google/);
    assert.doesNotMatch(html, /type="email"|name="email"|recibirás un enlace/);
    noSecrets(html);
  }
  signIn();
  f.env({ ADMIN_ALLOWLIST: "other@example.invalid:reader" });
  assert.match(await home(), /action="\/admin\/login"/);
  await assert.rejects(registration(), /REDIRECT:\/admin$/);
  assert.equal(f.calls.length, 0);
});

test("detail checks its own session before any backend call; expired and malformed cookies fail closed", async () => {
  for (const value of [null, "admin_session=bad", session.createAdminSession({ id: ID, email: EMAIL }, 1).cookie]) {
    cookie = value;
    await assert.rejects(registration(), /REDIRECT:\/admin$/);
    assert.equal(f.calls.length, 0);
  }
});

test("Google callback GET is inert, exposes only code/state, and requires explicit browser POST", async () => {
  f.env({ ADMIN_ALLOWLIST: `${GOOGLE_EMAIL}:reader` });
  const origin = process.env.ADMIN_APP_ORIGIN;
  const { POST: login } = f.load("app/admin/login/route.ts");
  const { POST: verify } = f.load("app/admin/verify/route.ts");
  function form(path, fields = {}) {
    return new Request(`${origin}${path}`, { method: "POST", headers: { origin, ...(cookie ? { cookie } : {}) }, body: new URLSearchParams(fields) });
  }
  const started = await login(form("/admin/login"));
  assert.equal(started.status, 303);
  cookie = started.headers.get("set-cookie").split(";")[0];
  const state = new URL(started.headers.get("location")).searchParams.get("state");
  const query = { code: CODE, state };
  await mockGoogle(f, cookie);
  const html = await confirm({ ...query, scope: "openid email", authuser: "0", prompt: "none" });
  assert.match(html, /action="\/admin\/verify" method="post"/);
  const fields = Object.fromEntries([...html.matchAll(/<input type="hidden" name="([^"]+)" value="([^"]*)"/g)].map(([, name, value]) => [name, value]));
  assert.deepEqual(fields, query);
  const loginData = JSON.parse(Buffer.from(cookie.split("=")[1].split(".")[0], "base64url"));
  for (const secret of [loginData.nonce, loginData.verifier, process.env.ADMIN_GOOGLE_CLIENT_SECRET]) assert.ok(!html.includes(secret));
  assert.equal(f.calls.length, 0);
  assert.equal(await confirm(query), html, "GET neither consumes nor redirects");
  const completed = await verify(form("/admin/verify", fields));
  assert.equal(completed.status, 303); assert.equal(completed.headers.get("location"), "/admin");
  assert.equal(session.readAdminSession(completed.headers.getSetCookie()[0].split(";")[0]).role, "reader");
  assert.equal(f.calls.length, 3);
});

test("invalid callback errors, missing/repeated/malformed code/state or wrong browser never render proof or fetch", async () => {
  const attempt = session.createAdminLoginState();
  const good = { code: CODE, state: attempt.state };
  const browser = attempt.cookie.split(";")[0];
  for (const [value, query] of [[null, good], [browser, {}], [browser, { ...good, state: "x".repeat(43) }],
    [session.createAdminLoginState(1).cookie, good], [browser, { ...good, error: "private-provider-error" }],
    [browser, { ...good, other: "unknown" }],
    ...["", "a".repeat(2049), "a\nb", [CODE, CODE]].map(code => [browser, { ...good, code }]),
    ...["", "x".repeat(42), [attempt.state, attempt.state]].map(state => [browser, { ...good, state }])]) {
    cookie = value;
    const html = await confirm(query);
    assert.match(html, /El enlace no es válido o venció/);
    assert.doesNotMatch(html, /action="\/admin\/verify"|name="code"|name="state"|private-provider-error/);
    assert.equal(f.calls.length, 0);
  }
});

test("reader list uses bounded RPC and exact school/requested-group filters, safe list projection and logout csrf", async () => {
  signIn();
  mockList([{ ...item, email: "family@example.invalid", guardian_name: "Private guardian",
    request_hash: "hidden-request-hash", student_hash: "hidden-student-hash", idempotency_key: "hidden-idempotency",
    unexpected: "unapproved-value" }], 51);
  const html = await home({ escuela: "ambos", estado: "recibida", grupo: "grupo-3", pagina: "2",
    p_actor_email: "forged@example.invalid", role: "admin" });
  assert.equal(f.calls.length, 1);
  const call = f.calls[0];
  assert.equal(call.url, "https://supabase.example.invalid/rest/v1/rpc/admin_list_registrations");
  assert.deepEqual(call.payload, { p_actor_id: ID, p_actor_email: EMAIL, p_actor_role: "reader",
    p_school: "ambos", p_status: "recibida", p_group: "grupo-3", p_limit: 50, p_offset: 50 });
  assert.equal(call.cache, "no-store"); assert.equal(call.redirect, "error"); assert.equal(call.method, "POST");
  assert.equal(call.headers.apikey, process.env.SUPABASE_SERVICE_ROLE_KEY);
  assert.equal(call.headers.Authorization, `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  assert.ok(call.signal instanceof AbortSignal);
  assert.match(html, /Estudiante Ejemplo/); assert.match(html, /51 solicitudes/);
  assert.match(html, /Página 2/); assert.match(html, /Filtros activos/); assert.match(html, /Limpiar filtros/);
  assert.match(html, /action="\/admin\/logout" method="post"/);
  assert.ok(html.includes(`name="csrf" value="${session.readAdminSession(cookie).csrf}"`));
  assert.ok(html.includes(`/admin/${ID}?escuela=ambos&amp;estado=recibida&amp;grupo=grupo-3&amp;pagina=2`));
  assert.doesNotMatch(html, /family@example.invalid|Private guardian|rel="preload"/);
  noSecrets(html);
});

test("all supported filter choices and pagination boundaries reach the RPC without broadening", async () => {
  signIn(); mockList([]);
  for (const [key, param, values] of [["escuela", "p_school", ["uncuyo", "etec", "ambos"]],
    ["estado", "p_status", ["recibida", "contactada", "horario_propuesto", "convenio_enviado", "confirmada", "lista_espera", "cancelada"]],
    ["grupo", "p_group", ["grupo-1", "grupo-2", "grupo-3", "grupo-4"]]]) {
    for (const value of values) { await home({ [key]: value }); assert.equal(f.calls.at(-1).payload[param], value); }
  }
  await home({ pagina: "201" }); assert.equal(f.calls.at(-1).payload.p_offset, 10000);
  await home({ escuela: "", estado: "", grupo: "", pagina: "1" });
  assert.deepEqual(f.calls.at(-1).payload, { p_actor_id: ID, p_actor_email: EMAIL, p_actor_role: "reader",
    p_school: null, p_status: null, p_group: null, p_limit: 50, p_offset: 0 });
});

test("invalid/duplicate/oversized filters and page never fetch or silently broaden the list", async () => {
  signIn();
  for (const query of [{ escuela: "other" }, { escuela: "UNCUYO" }, { escuela: ["ambos", "etec"] },
    { estado: "new" }, { grupo: "grupo-5" }, { grupo: "x".repeat(5000) }, { estado: ["recibida"] },
    ...["0", "202", "-1", "1.5", "01", "1e2", "Infinity", ["1", "2"]].map(pagina => ({ pagina }))]) {
    assert.match(await home(query), /Los filtros no son válidos/);
    assert.equal(f.calls.length, 0);
  }
});

test("empty collection, no match, empty page and unavailable service are distinct with safe recovery", async () => {
  signIn(); mockList([]);
  assert.match(await home(), /Todavía no hay preinscripciones/);
  assert.match(await home({ escuela: "etec" }), /No hay solicitudes que coincidan/);
  mockList([], 2);
  assert.match(await home({ pagina: "2" }), /Esta página no tiene solicitudes/);
  for (const handler of [() => new Response("private error", { status: 503 }), () => { throw new Error("private error"); },
    () => new Response("bad json"), () => Response.json({ items: [item], total: -1 }),
    () => Response.json({ items: Array(51).fill(item), total: 51 }),
    () => Response.json({ items: [{ ...item, status: "unknown" }], total: 1 })]) {
    f.fetchMock(handler);
    const count = f.calls.length;
    const html = await home();
    assert.match(html, /No pudimos cargar las solicitudes/); assert.match(html, /Volver a intentar/);
    assert.doesNotMatch(html, /private error|bad json|Estudiante Ejemplo|Todavía no hay/);
    assert.equal(f.calls.length, count + 1, "no retries"); noSecrets(html);
  }
});

test("detail validates UUID, distinguishes not found/unavailable, and projects approved fields only", async () => {
  signIn();
  for (const id of ["bad", "../login", `${ID}x`, "00000000-0000-0000-0000-000000000000"]) {
    assert.match(await registration(id), /No encontramos la solicitud/); assert.equal(f.calls.length, 0);
  }
  f.fetchMock(() => Response.json(null));
  assert.match(await registration(), /No encontramos la solicitud/);
  f.fetchMock(() => new Response(null, { status: 503 }));
  assert.match(await registration(), /No pudimos cargar la solicitud/);
  f.fetchMock(() => Response.json({ ...detail, id: "bad" }));
  assert.match(await registration(), /No pudimos cargar la solicitud/);
  f.fetchMock(() => Response.json({ ...detail, request_hash: "hidden-request-hash", student_hash: "hidden-student-hash",
    idempotency_key: "hidden-idempotency", unexpected: "unapproved-value" }));
  const html = await registration(ID, { escuela: "ambos", pagina: "2" });
  assert.deepEqual(f.calls.at(-1).payload, { p_actor_id: ID, p_actor_email: EMAIL, p_actor_role: "reader", p_id: ID });
  assert.equal(f.calls.at(-1).url, "https://supabase.example.invalid/rest/v1/rpc/admin_registration_detail");
  for (const value of ["Estudiante Ejemplo", "Responsable Ejemplo", "family@example.invalid", "2615550100",
    "Escuela Ejemplo", "Matemática", "Nota de ejemplo", "Consentimiento", "Programa", "Privacidad"]) assert.ok(html.includes(value), value);
  assert.ok(html.includes('href="/admin?escuela=ambos&amp;pagina=2"'));
  assert.doesNotMatch(html, /<form|dangerouslySetInnerHTML/); noSecrets(html);
});

test("current role applies independently on each fetch and both roles retain read-only access", async () => {
  signIn(); mockList(); await home();
  f.env({ ADMIN_ALLOWLIST: `${EMAIL}:admin` });
  f.fetchMock(() => Response.json(detail)); await registration();
  assert.equal(f.calls.at(-1).payload.p_actor_role, "admin");
  f.env({ ADMIN_ALLOWLIST: `${EMAIL}:reader` });
  await registration(); assert.equal(f.calls.at(-1).payload.p_actor_role, "reader");
  f.env({ ADMIN_ALLOWLIST: "other@example.invalid:reader" });
  const before = f.calls.length;
  await assert.rejects(registration(), /REDIRECT:\/admin$/);
  assert.equal(f.calls.length, before);
});

test("layout is noindex/nofollow, dynamic, and pages never use client hydration, prefetch or credential bridges", () => {
  const layout = pageModule("app/admin/layout.tsx");
  assert.deepEqual(layout.metadata.robots, { index: false, follow: false });
  assert.equal(layout.dynamic, "force-dynamic");
  const html = renderToStaticMarkup(layout.default({ children: "synthetic child" }));
  assert.match(html, /synthetic child/);
  for (const file of ["app/admin/layout.tsx", "app/admin/page.tsx", "app/admin/confirm/page.tsx", "app/admin/[id]/page.tsx"]) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /["']use client["']|dangerouslySetInnerHTML|next\/link|console\.|<script|https?:\/\//);
  }
});
