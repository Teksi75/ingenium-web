import assert from "node:assert/strict";
import { test, after } from "node:test";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

// In-memory TS loader; only server-only is stubbed. All application behavior runs
// through the exported Next Route Handler with real Request/Response objects.
const require = createRequire(import.meta.url);
const root = path.resolve(".");
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } });
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule);
  const localRequire = (specifier) => {
    if (specifier === "server-only") return {};
    if (specifier.startsWith("node:")) return require(specifier);
    const base = specifier.startsWith("@/") ? path.join(root, specifier.slice(2))
      : path.resolve(path.dirname(filename), specifier);
    assert.ok(base.startsWith(`${root}${path.sep}`));
    return load(`${base}.ts`);
  };
  new vm.Script(`(function(exports, require, module) {${outputText}\n})`, { filename })
    .runInThisContext()(loadedModule.exports, localRequire, loadedModule);
  return loadedModule.exports;
}
const route = load(path.join(root, "app/api/preinscripcion/route.ts"));
const oldFetch = globalThis.fetch;
const savedEnv = Object.fromEntries(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "PREINSCRIPCION_RATE_SECRET"].map(k => [k, process.env[k]]));
after(() => {
  globalThis.fetch = oldFetch;
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
const KEY = "1c7977ca-5c94-46f7-9f87-2e52ff4df931";
const CODE = "eb4dd9f7-672b-40eb-9f8f-0f31e4ec1e50";
const messages = {
  invalid: "Revisá los datos de la solicitud.", origin: "No se pudo validar el origen de la solicitud.",
  key: "La solicitud necesita una clave de reintento válida.", json: "El cuerpo debe ser JSON válido.",
  type: "Usá el formato application/json.", large: "La solicitud supera el tamaño permitido.",
  conflict: "No se pudo registrar la solicitud. Revisá si ya fue enviada o intentá nuevamente.",
  limited: "Se alcanzó el límite de solicitudes. Intentá nuevamente más tarde.",
  unavailable: "No pudimos guardar la solicitud. Conservá tus datos e intentá nuevamente más tarde.",
};
function valid(overrides = {}) {
  return { studentName: "Ana Prueba", birthDate: "2014-02-28", primarySchool: "Escuela ficticia",
    targetSchool: "uncuyo", otherSchool: "", guardianName: "Responsable Prueba", relationship: "madre",
    whatsapp: "+54 (9) 261-555-0101", email: " FAMILIA@EXAMPLE.TEST ", locality: "",
    groups: ["grupo-3", "grupo-1"], firstPreference: "grupo-3", scheduleNotes: "",
    difficultSubjects: "", pedagogicalNotes: "", referralSource: "", acceptedProgram: true,
    acceptedPrivacy: true, website: "", ...overrides };
}
let calls;
function setup(result = { outcome: "created", public_code: CODE }) {
  process.env.SUPABASE_URL = "https://synthetic-project.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "synthetic-server-key-not-a-real-credential";
  delete process.env.PREINSCRIPCION_RATE_SECRET;
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, ...options, payload: JSON.parse(options.body) });
    return Response.json(result);
  };
}
function request(body = valid(), headers = {}, raw = false) {
  const merged = { "content-type": "application/json", origin: "https://ingenium-web.vercel.app", "idempotency-key": KEY, ...headers };
  for (const key of Object.keys(merged)) if (merged[key] === null) delete merged[key];
  return new Request("https://ingenium-web.vercel.app/api/preinscripcion", {
    method: "POST", headers: merged, body: raw ? body : JSON.stringify(body),
    ...(body instanceof ReadableStream ? { duplex: "half" } : {}),
  });
}
async function response(req, status, body, dbCalls = 0) {
  const result = await route.POST(req);
  assert.equal(result.status, status);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(result.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(result.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(await result.json(), body);
  assert.equal(calls.length, dbCalls, "no DB side effects on rejected requests");
  return result;
}

test("confirmed persistence returns only unpredictable receipt; server owns years, versions and initial state", async () => {
  setup();
  await response(request(), 201, { publicCode: CODE }, 1);
  const call = calls[0];
  assert.equal(call.url, "https://synthetic-project.supabase.co/rest/v1/rpc/submit_preinscripcion");
  assert.equal(call.method, "POST");
  assert.equal(call.cache, "no-store");
  assert.ok(call.signal instanceof AbortSignal);
  assert.equal(call.headers.Authorization, `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  assert.equal(call.payload.p_course_year, 2027);
  assert.equal(call.payload.p_entry_year, 2028);
  assert.equal(call.payload.p_program_version, "1");
  assert.equal(call.payload.p_privacy_version, "3");
  assert.equal(call.payload.p_key, KEY);
  assert.equal(call.payload.p_data.email, "familia@example.test");
  assert.equal(call.payload.p_data.whatsapp, "5492615550101");
  assert.deepEqual(call.payload.p_data.groups, ["grupo-1", "grupo-3"]);
  for (const field of ["p_request_hash", "p_student_hash", "p_rate_hash"]) assert.match(call.payload[field], /^[a-f0-9]{64}$/);
  for (const field of ["status", "createdAt", "acceptedAt", "publicCode"]) assert.equal(call.payload.p_data[field], undefined);
});

test("same normalized request/key and reordered groups have identical hashes; replay is 200", async () => {
  setup(); await response(request(), 201, { publicCode: CODE }, 1);
  const first = calls[0].payload;
  setup({ outcome: "replayed", public_code: CODE });
  await response(request(valid({ studentName: " Ana   Prueba ", email: "familia@example.test", groups: ["grupo-1", "grupo-3"] })), 200, { publicCode: CODE }, 1);
  assert.deepEqual(calls[0].payload, first);
});

test("changed request changes canonical hash, not student identity; key reuse and dedup never reveal old receipt", async () => {
  setup(); await response(request(), 201, { publicCode: CODE }, 1);
  const first = calls[0].payload;
  setup({ outcome: "conflict", public_code: CODE });
  await response(request(valid({ scheduleNotes: "Otra opción" })), 409, { message: messages.conflict }, 1);
  assert.notEqual(calls[0].payload.p_request_hash, first.p_request_hash);
  assert.equal(calls[0].payload.p_student_hash, first.p_student_hash);
  setup({ outcome: "duplicate", public_code: CODE });
  await response(request(valid(), { "idempotency-key": "2c7977ca-5c94-46f7-9f87-2e52ff4df931" }), 409, { message: messages.conflict }, 1);
});

for (const field of ["courseYear", "entryYear", "status", "acceptedAt", "programVersion", "dni"]) {
  test(`rejects browser authority ${field} before DB`, async () => {
    setup(); await response(request(valid({ [field]: 2040 })), 400, { message: messages.invalid, errors: { _form: "La solicitud contiene campos no permitidos." } });
  });
}
for (const [patch, errors] of [
  [{ targetSchool: "otra" }, { targetSchool: "Seleccioná una escuela secundaria válida." }],
  [{ relationship: "vecino" }, { relationship: "Seleccioná un vínculo válido." }],
  [{ acceptedProgram: "true" }, { acceptedProgram: "Aceptá la información del programa." }],
  [{ acceptedPrivacy: 1 }, { acceptedPrivacy: "Aceptá el aviso de privacidad para gestionar la solicitud." }],
  [{ website: "https://bot.example.test" }, { website: "No se pudo validar la solicitud." }],
  [{ groups: [], firstPreference: null }, { groups: "Seleccioná al menos un grupo." }],
  [{ firstPreference: "grupo-2" }, { firstPreference: "Elegí un grupo marcado o Sin preferencia." }],
  [{ pedagogicalNotes: "x".repeat(1001) }, { pedagogicalNotes: "Usá hasta 1000 caracteres." }],
]) {
  test(`shared validation remains enforced: ${Object.keys(patch).join(",")}`, async () => {
    setup(); await response(request(valid(patch)), 400, { message: messages.invalid, errors });
  });
}

test("all allowed school/relationship values and no preference still persist", async () => {
  for (const targetSchool of ["uncuyo", "etec", "ambos"]) for (const relationship of ["madre", "padre", "tutor", "otro"]) {
    setup(); await response(request(valid({ targetSchool, relationship, firstPreference: null })), 201, { publicCode: CODE }, 1);
  }
});
test("origin required and exact; spoofed forwarding headers do not authorize", async () => {
  for (const origin of [null, "null", "https://evil.example", "https://ingenium-web.vercel.app.evil.test", "https://ingenium-web.vercel.app/"]) {
    setup(); await response(request(valid(), { origin, "x-forwarded-host": "ingenium-web.vercel.app" }), 403, { message: messages.origin });
  }
});
test("local request origin works without wildcard CORS", async () => {
  setup(); const req = new Request("http://localhost:3000/api/preinscripcion", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json; charset=utf-8", "idempotency-key": KEY }, body: JSON.stringify(valid()) });
  await response(req, 201, { publicCode: CODE }, 1);
});
test("UUID idempotency key is mandatory", async () => {
  for (const key of [null, "", "123", "1c7977ca-5c94-46f7-9f87-2e52ff4df931.extra"]) {
    setup(); await response(request(valid(), { "idempotency-key": key }), 400, { message: messages.key });
  }
});
test("strict content type and malformed JSON", async () => {
  for (const type of [null, "text/plain", "application/jsonp", "application/json; charset=latin1"]) {
    setup(); await response(request(valid(), { "content-type": type }), 415, { message: messages.type });
  }
  for (const body of ["{", "", "undefined"]) {
    setup(); await response(request(body, {}, true), 400, { message: messages.json });
  }
});
test("stream byte limit works without Content-Length and with multibyte input", async () => {
  setup(); let canceled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new TextEncoder().encode("á".repeat(5000))); }, cancel() { canceled = true; } });
  await response(request(stream, {}, true), 413, { message: messages.large });
  assert.equal(canceled, true);
  setup(); await response(request(valid(), { "content-length": "17000" }), 413, { message: messages.large });
});
test("bad UTF-8 and read errors are hidden before storage", async () => {
  setup(); await response(request(new Uint8Array([0xff]), {}, true), 400, { message: messages.json });
  setup(); const stream = new ReadableStream({ start(c) { c.error(new Error("synthetic reader error")); } });
  await response(request(stream, {}, true), 400, { message: messages.json });
});
test("unconfigured or invalid server env fails closed; no secret is reflected", async () => {
  for (const change of [() => delete process.env.SUPABASE_URL, () => delete process.env.SUPABASE_SERVICE_ROLE_KEY,
    () => { process.env.SUPABASE_URL = "http://unsafe.example.test"; },
    () => { process.env.PREINSCRIPCION_RATE_SECRET = "short"; }]) {
    setup(); change(); await response(request(), 503, { message: messages.unavailable });
  }
});
test("rate limit uses DB outcome and keyed contact hash, no IP/privileged headers", async () => {
  setup({ outcome: "limited" });
  const result = await response(request(valid(), { "x-forwarded-for": "192.0.2.1", "x-admin": "true" }), 429, { message: messages.limited }, 1);
  assert.equal(result.headers.get("retry-after"), "86400");
  const first = calls[0].payload.p_rate_hash;
  setup(); process.env.PREINSCRIPCION_RATE_SECRET = "synthetic-rate-secret-at-least-32-characters";
  await response(request(), 201, { publicCode: CODE }, 1);
  assert.notEqual(calls[0].payload.p_rate_hash, first);
  assert.equal(calls[0].payload.ip, undefined);
});
test("Supabase failures, aborts and invalid receipts never return false confirmation or internal errors", async () => {
  for (const mock of [async () => { throw new Error("internal synthetic secret"); },
    async () => { throw new DOMException("timeout", "TimeoutError"); },
    async () => new Response("internal synthetic secret", { status: 500 }),
    async () => new Response("not json"),
    async () => Response.json({ outcome: "created", public_code: "predictable" }),
    async () => Response.json({ outcome: "created" }),
    async () => Response.json({ outcome: "unknown", public_code: CODE }),
    async () => Response.json(null)]) {
    setup(); globalThis.fetch = async (...args) => { calls.push(args); return mock(); };
    await response(request(), 503, { message: messages.unavailable }, 1);
  }
});
test("uncertain write is not retried automatically; explicit retry uses exactly same key/hash", async () => {
  setup(); const realMock = globalThis.fetch;
  globalThis.fetch = async (...args) => { await realMock(...args); throw new Error("response lost after commit"); };
  await response(request(), 503, { message: messages.unavailable }, 1);
  const uncertain = calls[0].payload;
  setup({ outcome: "replayed", public_code: CODE });
  await response(request(), 200, { publicCode: CODE }, 1);
  assert.deepEqual(calls[0].payload, uncertain);
});
test("Next production loopback normalization preserves actual same-origin requests only", async () => {
  const local = (origin, host = "127.0.0.1:3107") => new Request("http://localhost:3107/api/preinscripcion", {
    method: "POST", headers: { origin, host, "content-type": "application/json", "idempotency-key": KEY,
      "x-forwarded-host": "127.0.0.1:3107" }, body: JSON.stringify(valid()),
  });
  setup();
  await response(local("http://127.0.0.1:3107"), 201, { publicCode: CODE }, 1);
  for (const [origin, host] of [
    ["http://127.0.0.1:3108", "127.0.0.1:3108"],
    ["https://127.0.0.1:3107", "127.0.0.1:3107"],
    ["http://127.0.0.1:3107", "evil.example:3107"],
    ["http://evil.example:3107", "evil.example:3107"],
  ]) {
    setup(); await response(local(origin, host), 403, { message: messages.origin });
  }
});
test("unsupported methods are noncacheable, nonindexable and cannot query data", async () => {
  setup();
  for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const result = await route[method](new Request("https://ingenium-web.vercel.app/api/preinscripcion", { method }));
    assert.equal(result.status, 405);
    assert.equal(result.headers.get("cache-control"), "no-store");
    assert.equal(result.headers.get("x-robots-tag"), "noindex, nofollow");
    if (method !== "HEAD") assert.deepEqual(await result.json(), { message: "Método no permitido." });
  }
  assert.equal(calls.length, 0);
});
