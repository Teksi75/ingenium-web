import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { test, beforeEach, afterEach } from "node:test";
import { loadAdmin, mockGoogle, GOOGLE_EMAIL as EMAIL, GOOGLE_ADMIN } from "./helpers/load-admin.mjs";

const ORIGIN = "https://panel.example.invalid";
const ID = "eb4dd9f7-672b-40eb-9f8f-0f31e4ec1e50";
const ERROR = "No se pudo completar la solicitud.";
let f, session, login, verify, logout;
beforeEach(() => {
  f = loadAdmin();
  f.env({ ADMIN_ALLOWLIST: `${EMAIL}:reader,${GOOGLE_ADMIN}:admin` });
  session = f.load("lib/admin/session.ts");
  login = f.load("app/admin/login/route.ts");
  verify = f.load("app/admin/verify/route.ts");
  logout = f.load("app/admin/logout/route.ts");
});
afterEach(() => f.restore());
function request(route, body = {}, headers = {}) {
  const merged = { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded", ...headers };
  for (const key of Object.keys(merged)) if (merged[key] === null) delete merged[key];
  return new Request(`${ORIGIN}/admin/${route}`, { method: "POST", headers: merged,
    body: typeof body === "string" || body instanceof ReadableStream || body instanceof Uint8Array
      ? body : new URLSearchParams(body), ...(body instanceof ReadableStream ? { duplex: "half" } : {}) });
}
function cookieValue(response, name) {
  return response.headers.getSetCookie().find(value => value.startsWith(`${name}=`))?.split(";")[0] ?? null;
}
function signed(payload, purpose = "session") {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(`${purpose}.${data}`).digest("base64url")}`;
}
function decode(cookie) { return JSON.parse(Buffer.from(cookie.split("=")[1].split(".")[0], "base64url").toString()); }
async function check(response, status, location = null) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.get("location"), location);
  assert.equal(await response.text(), status === 303 ? "" : ERROR);
  return response;
}
async function begin() {
  const response = await login.POST(request("login"));
  assert.equal(response.status, 303);
  const url = new URL(response.headers.get("location"));
  await check(response, 303, url.href);
  const cookie = cookieValue(response, session.ADMIN_LOGIN_COOKIE);
  return { response, cookie, state: url.searchParams.get("state"), url };
}
function complete(attempt, body = {}, headers = {}) {
  return verify.POST(request("verify", { code: "synthetic-code/one", state: attempt.state, ...body }, { cookie: attempt.cookie, ...headers }));
}
function actor(now = Math.floor(Date.now() / 1000), email = EMAIL) { return session.createAdminSession({ id: ID, email }, now); }
function noSession(response) { assert.equal(cookieValue(response, session.ADMIN_SESSION_COOKIE), null); }

test("Google authorization is fixed, confidential, independent state/nonce, S256 PKCE; no network or email", async () => {
  const a = await begin(), b = await begin(), data = decode(a.cookie), params = a.url.searchParams;
  assert.equal(a.url.origin + a.url.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
  assert.deepEqual(Object.fromEntries(params), { client_id: process.env.ADMIN_GOOGLE_CLIENT_ID,
    redirect_uri: `${ORIGIN}/admin/confirm`, response_type: "code", scope: "openid email",
    state: a.state, nonce: data.nonce,
    code_challenge: createHash("sha256").update(data.verifier).digest("base64url"), code_challenge_method: "S256" });
  assert.equal(data.state, a.state);
  assert.equal(new Set([data.state, data.nonce, data.verifier, b.state]).size, 4);
  assert.equal(params.has("code_verifier"), false);
  assert.equal(params.has("client_secret"), false);
  assert.match(a.response.headers.get("set-cookie"), /HttpOnly; SameSite=Lax; Path=\/; Max-Age=600/);
  assert.equal(data.exp - data.iat, 600);
  assert.equal(f.calls.length, 0);
});

test("strict same-origin forms and configuration fail privately before any provider or audit calls", async () => {
  for (const origin of [null, "null", `${ORIGIN}/`, "https://other.example.invalid"]) {
    const response = await check(await login.POST(request("login", {}, { origin, "x-forwarded-host": "panel.example.invalid" })), 403);
    noSession(response);
  }
  for (const [body, headers, status] of [[{ email: EMAIL }, {}, 400], ["state=x&state=y", {}, 400],
    ["x=%GG", {}, 400], ["x=%FF", {}, 400], [new Uint8Array([255]), {}, 400],
    [{}, { "content-type": "application/json" }, 415], ["x".repeat(4097), {}, 413],
    [{}, { "content-length": "4097" }, 413]]) {
    const response = await check(await login.POST(request("login", body, headers)), status);
    assert.equal(response.headers.get("set-cookie"), null);
  }
  let canceled = false;
  const stream = new ReadableStream({ pull(c) { c.enqueue(new TextEncoder().encode("a".repeat(5000))); }, cancel() { canceled = true; } });
  await check(await login.POST(request("login", stream)), 413);
  assert.equal(canceled, true);
  for (const overrides of [{ ADMIN_GOOGLE_CLIENT_ID: undefined }, { ADMIN_GOOGLE_CLIENT_SECRET: undefined },
    { ADMIN_APP_ORIGIN: "http://localhost:3107" }, { ADMIN_APP_ORIGIN: `${ORIGIN}/` },
    { ADMIN_APP_ORIGIN: `${ORIGIN}/path` }, { ADMIN_APP_ORIGIN: "https://user:pass@panel.example.invalid" },
    { ADMIN_APP_ORIGIN: undefined, SITE_ORIGIN: undefined }, { ADMIN_SESSION_SECRET: "short" },
    ...[undefined, "", `${EMAIL}:owner`, `${EMAIL}:reader,`, `${EMAIL}:reader,bad:admin`,
      `${EMAIL}:reader,${EMAIL.toUpperCase()}:admin`, `${EMAIL}:reader,${EMAIL}:reader`,
      "a@@example.invalid:reader", "a b@example.invalid:reader"].map(ADMIN_ALLOWLIST => ({ ADMIN_ALLOWLIST }))]) {
    f.env({ ADMIN_ALLOWLIST: `${EMAIL}:reader`, ...overrides });
    const response = await check(await login.POST(request("login")), 503);
    assert.equal(response.headers.get("set-cookie"), null);
  }
  assert.equal(f.calls.length, 0);
});

test("explicit verify exchanges code once using fixed URL-encoded confidential token request; audit before session", async () => {
  const a = await begin();
  await mockGoogle(f, a.cookie);
  const response = await check(await complete(a), 303, "/admin");
  assert.equal(f.calls.length, 3);
  const [token, jwks, audit] = f.calls;
  assert.equal(token.url, "https://oauth2.googleapis.com/token");
  assert.equal(token.method, "POST");
  assert.equal(new Headers(token.headers).get("content-type"), "application/x-www-form-urlencoded");
  assert.deepEqual(token.payload, { grant_type: "authorization_code", code: "synthetic-code/one",
    redirect_uri: `${ORIGIN}/admin/confirm`, client_id: process.env.ADMIN_GOOGLE_CLIENT_ID,
    client_secret: process.env.ADMIN_GOOGLE_CLIENT_SECRET, code_verifier: decode(a.cookie).verifier });
  for (const call of [token, jwks]) {
    assert.equal(call.redirect, "error"); assert.equal(call.cache, "no-store");
    assert.ok(call.signal instanceof AbortSignal);
    assert.equal(new Headers(call.headers).has("apikey"), false);
    assert.equal(new Headers(call.headers).has("authorization"), false);
  }
  assert.equal(jwks.url, "https://www.googleapis.com/oauth2/v3/certs");
  const made = session.readAdminSession(cookieValue(response, session.ADMIN_SESSION_COOKIE));
  assert.equal(made.email, EMAIL); assert.equal(made.role, "reader");
  assert.match(made.id, /^[a-f0-9]{8}-[a-f0-9]{4}-8[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.deepEqual(audit.payload, { p_actor_id: made.id, p_actor_email: EMAIL, p_actor_role: "reader", p_action: "login" });
  assert.ok(response.headers.getSetCookie().some(c => c.startsWith(`${session.ADMIN_LOGIN_COOKIE}=`) && c.includes("Max-Age=0")));
  assert.doesNotMatch(JSON.stringify({ cookies: response.headers.getSetCookie(), audit: audit.payload }), /never-store|id_token|access_token|refresh_token|code_verifier/);
  const count = f.calls.length;
  await check(await complete({ ...a, cookie: "" }), 403);
  assert.equal(f.calls.length, count);
});

test("invalid code/state/browser, exact cookie schema/version/expiry and foreign Origin do not contact Google", async () => {
  const a = await begin(), data = decode(a.cookie), now = Math.floor(Date.now() / 1000);
  for (const patch of [{ v: 1 }, { extra: true }, { verifier: "bad" }, { nonce: "bad" }, { nonce: "x".repeat(43) + "\n" }, { state: "bad" },
    { iat: now - 600, exp: now }, { exp: data.exp + 1 }]) {
    await check(await complete({ ...a, cookie: `${session.ADMIN_LOGIN_COOKIE}=${signed({ ...data, ...patch }, "login")}` }), 403);
  }
  for (const cookie of ["", `${a.cookie}x`, `${a.cookie}; ${a.cookie}`, `${session.ADMIN_LOGIN_COOKIE} =bad; ${a.cookie}`]) {
    await check(await complete({ ...a, cookie }), 403);
  }
  await check(await complete(a, { state: "x".repeat(43) }), 403);
  for (const state of ["", "x".repeat(42), "x".repeat(44), "!".repeat(43), "x".repeat(43) + "\n"]) await check(await complete(a, { state }), 400);
  for (const code of ["", "a".repeat(2049), "a\nb", "a\n", "a b", "é"]) await check(await complete(a, { code }), 400);
  for (const body of ["code=x&code=y&state=x", `code=x&state=${a.state}&state=${a.state}`,
    `code=x&state=${a.state}&error=access_denied`, `state=${a.state}`]) {
    await check(await verify.POST(request("verify", body, { cookie: a.cookie })), 400);
  }
  for (const origin of [null, "https://other.example.invalid"]) await check(await complete(a, {}, { origin }), 403);
  const other = await begin();
  await check(await complete({ ...a, cookie: other.cookie }), 403);
  assert.equal(f.calls.length, 0);
});

test("signed ID tokens reject foreign or malformed provider identity/claims without audit or session", async () => {
  const now = Math.floor(Date.now() / 1000);
  for (const claims of [{ iss: "https://evil.example.invalid" }, { aud: "foreign" },
    { aud: [process.env.ADMIN_GOOGLE_CLIENT_ID, "foreign"] }, { azp: "foreign" }, { azp: null }, { nonce: "foreign" },
    { email_verified: false }, { email_verified: "true" }, { email: "ingenium.unknown.fixture.000000@gmail.com" },
    { email: "reader@example.invalid" }, { email: EMAIL.replace("@", "+alias@") },
    { email: EMAIL.replace("@gmail.com", "@googlemail.com") },
    { sub: "" }, { sub: "valid\n" }, { sub: "non ASCII é" }, { sub: "x".repeat(256) }, { exp: now - 1 },
    { iat: now - 601, exp: now + 600 }, { iat: now + 60 },
    ...["iss", "aud", "exp", "iat", "sub", "nonce", "email", "email_verified"].map(key => ({ [key]: undefined }))]) {
    const a = await begin();
    await mockGoogle(f, a.cookie, claims);
    const count = f.calls.length;
    const response = await complete(a);
    assert.ok([403, 503].includes(response.status));
    await check(response, response.status); noSession(response);
    assert.equal(f.calls.length, count + 2, "token and signed key fetch only; no audit");
  }
});

test("Google issuer spellings, normalized Gmail, stable sub UUID and current allowlist roles", async () => {
  const ids = [];
  for (const iss of ["accounts.google.com", "https://accounts.google.com"]) {
    const a = await begin();
    await mockGoogle(f, a.cookie, { iss, email: EMAIL.toUpperCase(), azp: process.env.ADMIN_GOOGLE_CLIENT_ID, role: "admin" });
    const response = await check(await complete(a), 303, "/admin");
    const made = session.readAdminSession(cookieValue(response, session.ADMIN_SESSION_COOKIE));
    ids.push(made.id); assert.equal(made.role, "reader");
  }
  assert.equal(ids[0], ids[1]);
  const a = await begin();
  await mockGoogle(f, a.cookie, { email: GOOGLE_ADMIN, sub: "999999999999999999999", role: "reader" });
  const response = await check(await complete(a), 303, "/admin");
  const made = session.readAdminSession(cookieValue(response, session.ADMIN_SESSION_COOKIE));
  assert.equal(made.role, "admin"); assert.notEqual(made.id, ids[0]);
  assert.equal(f.calls.at(-1).payload.p_actor_role, "admin");
});

test("provider rejection/replay, invalid signatures/JWKS, audit failure and removed role never issue a session or retry", async () => {
  for (const options of [{ reject: true }, { providerError: true }, { token: "invalid.jwt.signature" }, { tamper: true },
    { keyClaims: { alg: "HS256" } }, { keyClaims: { kid: "foreign" } }, { audit: false }]) {
    const a = await begin(); await mockGoogle(f, a.cookie, {}, options);
    const response = await complete(a); assert.ok([403, 503].includes(response.status));
    await check(response, response.status); noSession(response);
    assert.equal(f.calls.filter(c => c.url.endsWith("/token")).length, 1);
    f.calls.length = 0;
  }
  const a = await begin(); await mockGoogle(f, a.cookie);
  await check(await complete(a), 303, "/admin");
  const count = f.calls.length;
  await mockGoogle(f, a.cookie, {}, { reject: true });
  noSession(await check(await complete(a), 503));
  assert.equal(f.calls.length, count + 1, "provider owns atomic code consumption; no second audit");
  for (const failure of [() => new Response("private-json"), () => Response.json({}),
    () => { throw new Error("private-provider-secret"); }]) {
    const b = await begin(); f.fetchMock(failure);
    const before = f.calls.length; noSession(await check(await complete(b), 503)); assert.equal(f.calls.length, before + 1);
  }
  const b = await begin(); await mockGoogle(f, b.cookie);
  const before = f.calls.length;
  const goodFetch = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    const result = await goodFetch(...args);
    if (String(args[0]).endsWith("/token")) process.env.ADMIN_ALLOWLIST = "other@example.invalid:reader";
    return result;
  };
  noSession(await check(await complete(b), 403));
  assert.equal(f.calls.length, before + 2);
});

test("session retains signed absolute eight hours, current roles, strict schema and secure cookies", () => {
  const now = Math.floor(Date.now() / 1000), made = actor(now), cookie = made.cookie.split(";")[0], payload = decode(cookie);
  assert.equal(session.SESSION_SECONDS, 28800);
  assert.deepEqual(session.readAdminSession(cookie, now + 28799), made.actor);
  assert.equal(session.readAdminSession(cookie, now + 28800), null);
  assert.equal(session.readAdminSession(cookie, now - 1), null);
  assert.equal(session.readAdminSession(cookie, now + 5).expiresAt, now + 28800);
  for (const patch of [{ exp: now + 28799 }, { iat: now + 1, exp: now + 28801 }, { id: "bad" },
    { email: EMAIL.toUpperCase() }, { email: "bad" }, { csrf: "short" }, { role: "admin" },
    { exp: "28800" }, { iat: now + 0.5, exp: now + 28800.5 }, { v: 2 }]) {
    assert.equal(session.readAdminSession(`${session.ADMIN_SESSION_COOKIE}=${signed({ ...payload, ...patch })}`, now), null);
  }
  const name = session.ADMIN_SESSION_COOKIE;
  for (const bad of [null, "", `${cookie}x`, `${cookie}; ${cookie}`, `${name}=; ${cookie}`,
    `${name} =bad; ${cookie}`, `${cookie}; ${name} =bad`, `${name}=bad`, `${name}=${"a".repeat(4097)}`,
    `${name}=%GG`, `${name}=${signed(payload, "login")}`]) assert.equal(session.readAdminSession(bad, now), null);
  f.env({ ADMIN_ALLOWLIST: ` ${EMAIL.toUpperCase()}:reader , ${GOOGLE_ADMIN.toUpperCase()}:admin ` });
  assert.equal(session.readAdminSession(cookie, now).role, "reader");
  assert.equal(actor(now, GOOGLE_ADMIN).actor.role, "admin");
  f.env({ ADMIN_ALLOWLIST: `${EMAIL}:admin` }); assert.equal(session.readAdminSession(cookie, now).role, "admin");
  f.env({ ADMIN_ALLOWLIST: "other@example.invalid:reader" }); assert.equal(session.readAdminSession(cookie, now), null);
  f.env({ NODE_ENV: "production", ADMIN_ALLOWLIST: `${EMAIL}:reader` }); assert.match(actor(now).cookie, /; Secure/);
  assert.match(made.cookie, /HttpOnly; SameSite=Lax; Path=\//); assert.notEqual(actor(now).actor.csrf, made.actor.csrf);
  for (const secret of [undefined, "short", " ".repeat(32)]) {
    f.env({ ADMIN_SESSION_SECRET: secret }); assert.equal(session.readAdminSession(cookie), null);
    assert.equal(session.createAdminSession({ id: ID, email: EMAIL }, now), null);
  }
});

test("logout preserves session+Origin+CSRF, reader audit, cookies cleared even on audit failure", async () => {
  const made = actor(), cookie = made.cookie.split(";")[0];
  for (const [body, headers] of [[{ csrf: "wrong" }, { cookie }], [{ csrf: made.actor.csrf }, {}],
    [{ csrf: made.actor.csrf }, { cookie, origin: null }],
    [{ csrf: made.actor.csrf }, { cookie, origin: "https://evil.example.invalid" }], [{ csrf: made.actor.csrf, role: "admin" }, { cookie }]]) {
    const response = await logout.POST(request("logout", body, headers));
    assert.ok([400, 403].includes(response.status)); await check(response, response.status);
    assert.equal(response.headers.get("set-cookie"), null); assert.equal(f.calls.length, 0);
  }
  f.fetchMock(() => new Response(null, { status: 204 }));
  const response = await check(await logout.POST(request("logout", { csrf: made.actor.csrf }, { cookie })), 303, "/admin");
  assert.deepEqual(f.calls[0].payload, { p_actor_id: ID, p_actor_email: EMAIL, p_actor_role: "reader", p_action: "logout" });
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
  f.fetchMock(() => new Response(null, { status: 503 }));
  assert.match((await check(await logout.POST(request("logout", { csrf: made.actor.csrf }, { cookie })), 503)).headers.get("set-cookie"), /Max-Age=0/);
  f.env({ ADMIN_ALLOWLIST: `${EMAIL}:reader`, SUPABASE_SERVICE_ROLE_KEY: undefined });
  assert.match((await check(await logout.POST(request("logout", { csrf: made.actor.csrf }, { cookie })), 503)).headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(f.calls.length, 2);
});

test("unsupported methods remain inert 405 including scanner GET and public handler", async () => {
  for (const route of [login, verify, logout]) for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const response = await route[method](new Request(`${ORIGIN}/admin/verify?code=secret`, { method }));
    assert.equal(response.status, 405); assert.equal(await response.text(), method === "HEAD" ? "" : ERROR);
    assert.equal(response.headers.get("allow"), "POST"); assert.equal(response.headers.get("set-cookie"), null);
  }
  const response = await f.load("app/api/preinscripcion/route.ts").GET(new Request(`${ORIGIN}/api/preinscripcion`));
  assert.equal(response.status, 405); assert.deepEqual(await response.json(), { message: "Método no permitido." }); assert.equal(f.calls.length, 0);
});
