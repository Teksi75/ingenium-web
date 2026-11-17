import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { test, beforeEach, afterEach } from "node:test";
import { loadAdmin } from "./helpers/load-admin.mjs";

const ORIGIN = "https://panel.example.invalid";
const ID = "eb4dd9f7-672b-40eb-9f8f-0f31e4ec1e50";
const EMAIL = "reader@example.invalid";
const TOKEN = createHash("sha224").update(EMAIL + "123456").digest("hex");
const ERROR = "No se pudo completar la solicitud.";
let f, session, login, verify, logout;
beforeEach(() => {
  f = loadAdmin();
  session = f.load("lib/admin/session.ts");
  login = f.load("app/admin/login/route.ts");
  verify = f.load("app/admin/verify/route.ts");
  logout = f.load("app/admin/logout/route.ts");
});
afterEach(() => f.restore());
function request(route, body = {}, headers = {}, base = ORIGIN) {
  const merged = { origin: base, "content-type": "application/x-www-form-urlencoded", ...headers };
  for (const key of Object.keys(merged)) if (merged[key] === null) delete merged[key];
  return new Request(`${base}/admin/${route}`, { method: "POST", headers: merged,
    body: typeof body === "string" || body instanceof ReadableStream || body instanceof Uint8Array
      ? body : new URLSearchParams(body), ...(body instanceof ReadableStream ? { duplex: "half" } : {}) });
}
function cookieValue(response, name) {
  const all = response.headers.getSetCookie();
  const cookie = all.find(value => value.startsWith(`${name}=`));
  return cookie?.split(";")[0] ?? null;
}
function signed(payload, purpose = "session") {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
    .update(`${purpose}.${data}`).digest("base64url");
  return `${data}.${signature}`;
}
function decode(cookie) {
  return JSON.parse(Buffer.from(cookie.split("=")[1].split(".")[0], "base64url").toString());
}
async function check(response, status, { location = null, body = ERROR } = {}) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.get("location"), location);
  assert.equal(await response.text(), status === 303 ? "" : body);
  return response;
}
function mockAuth({ user = { id: ID, email: EMAIL, email_confirmed_at: "2026-01-01T00:00:00Z" }, audit = true } = {}) {
  f.fetchMock(call => {
    if (call.url.endsWith("/auth/v1/verify")) return Response.json({ user, access_token: "never-store-this", refresh_token: "never-store-this-either" });
    if (call.url.endsWith("/rest/v1/rpc/admin_log_event")) return new Response(null, { status: audit ? 204 : 503 });
    return Response.json({});
  });
}
async function begin(email = EMAIL) {
  const response = await check(await login.POST(request("login", { email })), 303, { location: "/admin?sent=1" });
  const cookie = cookieValue(response, session.ADMIN_LOGIN_COOKIE);
  assert.ok(cookie);
  return { response, cookie, state: decode(cookie).nonce };
}
async function complete(state, body = {}, headers = {}) {
  return verify.POST(request("verify", { state: state.state, token_hash: TOKEN, ...body }, { cookie: state.cookie, ...headers }));
}
function actor(now = Math.floor(Date.now() / 1000), email = EMAIL) {
  return session.createAdminSession({ id: ID, email }, now);
}

test("allowlist denies the entire malformed configuration and normalizes both roles", async () => {
  mockAuth();
  for (const config of [undefined, "", `${EMAIL}:owner`, `${EMAIL}:reader,`, `${EMAIL}:reader,bad:admin`,
    `${EMAIL}:reader,READER@EXAMPLE.INVALID:admin`, `${EMAIL}:reader,${EMAIL}:reader`,
    "a@@example.invalid:reader", "a b@example.invalid:reader"]) {
    f.env({ ADMIN_ALLOWLIST: config });
    const res = await login.POST(request("login", { email: EMAIL }));
    await check(res, 503);
    assert.equal(res.headers.get("set-cookie"), null);
    assert.equal(f.calls.length, 0);
    assert.equal(session.readAdminSession(null), null);
  }
  f.env({ ADMIN_ALLOWLIST: " READER@EXAMPLE.INVALID:reader , ADMIN@EXAMPLE.INVALID:admin " });
  for (const [email, role] of [[EMAIL, "reader"], ["admin@example.invalid", "admin"]]) {
    const made = actor(undefined, email);
    assert.equal(session.readAdminSession(made.cookie).role, role);
  }
});

test("session is signed, absolute eight hours, current-role checked, and never contains upstream tokens", () => {
  const now = Math.floor(Date.now() / 1000);
  const made = actor(now);
  assert.equal(session.SESSION_SECONDS, 28800);
  assert.match(made.cookie, /; HttpOnly; SameSite=Lax; Path=\//);
  assert.match(made.cookie, /Max-Age=28800/);
  assert.equal(made.actor.id, ID);
  assert.equal(made.actor.email, EMAIL);
  assert.match(made.actor.csrf, /^[A-Za-z0-9_-]{43}$/);
  assert.deepEqual(session.readAdminSession(made.cookie, now + 28799), made.actor);
  assert.equal(session.readAdminSession(made.cookie, now + 28800), null);
  assert.equal(session.readAdminSession(made.cookie, now - 1), null);
  assert.equal(session.readAdminSession(made.cookie, now + 5).expiresAt, now + 28800);
  f.env({ ADMIN_ALLOWLIST: `${EMAIL}:admin` });
  assert.equal(session.readAdminSession(made.cookie, now).role, "admin");
  f.env({ ADMIN_ALLOWLIST: "someone@example.invalid:reader" });
  assert.equal(session.readAdminSession(made.cookie, now), null);
  f.env({ NODE_ENV: "production" });
  assert.match(actor(now).cookie, /; Secure/);
  assert.notEqual(actor(now).actor.csrf, made.actor.csrf);
  assert.doesNotMatch(made.cookie, /access_token|refresh_token/);
});

test("session rejects signature/schema/UUID/email/duration/nonce/cookie ambiguity and missing secrets", () => {
  const now = Math.floor(Date.now() / 1000);
  const made = actor(now);
  const cookie = made.cookie.split(";")[0];
  const payload = decode(cookie);
  const name = session.ADMIN_SESSION_COOKIE;
  for (const patch of [{ exp: now + 28799 }, { iat: now + 1, exp: now + 28801 }, { id: "bad" },
    { email: EMAIL.toUpperCase() }, { email: "bad" }, { csrf: "short" }, { role: "admin" },
    { exp: "28800" }, { iat: now + 0.5, exp: now + 28800.5 }, { v: 2 }]) {
    assert.equal(session.readAdminSession(`${name}=${signed({ ...payload, ...patch })}`, now), null);
  }
  for (const bad of [null, "", `${cookie}x`, `${cookie}; ${cookie}`, `${name}=; ${cookie}`,
    `${name} =bad; ${cookie}`, `${cookie}; ${name} =bad`,
    `${name}=bad`, `${name}=${"a".repeat(4097)}`, `${name}=%GG`, `${name}=${signed(payload, "login")}`]) {
    assert.equal(session.readAdminSession(bad, now), null);
  }
  for (const secret of [undefined, "short", " ".repeat(32)]) {
    f.env({ ADMIN_SESSION_SECRET: secret });
    assert.equal(session.readAdminSession(cookie, now), null);
    assert.equal(session.createAdminSession({ id: ID, email: EMAIL }, now), null);
  }
});

test("login is enumeration-generic; only allowlisted account triggers OTP with fixed redirect and no signup", async () => {
  mockAuth();
  const allowed = await begin(" READER@EXAMPLE.INVALID ");
  assert.equal(f.calls.length, 1);
  const call = f.calls[0];
  assert.equal(call.url, `https://supabase.example.invalid/auth/v1/otp?redirect_to=${encodeURIComponent(`${ORIGIN}/admin/confirm?state=${allowed.state}`)}`);
  assert.deepEqual(call.payload, { email: EMAIL, create_user: false });
  assert.equal(call.method, "POST");
  assert.equal(call.cache, "no-store");
  assert.equal(call.redirect, "error");
  assert.ok(call.signal instanceof AbortSignal);
  assert.equal(call.headers.apikey, process.env.SUPABASE_SERVICE_ROLE_KEY);
  assert.match(allowed.response.headers.get("set-cookie"), /HttpOnly; SameSite=Lax; Path=\//);
  assert.match(allowed.response.headers.get("set-cookie"), /Max-Age=600/);
  const denied = await begin("unknown@example.invalid");
  assert.equal(f.calls.length, 1);
  assert.equal(denied.response.status, allowed.response.status);
  assert.deepEqual(Object.keys(decode(denied.cookie)), Object.keys(decode(allowed.cookie)));
  assert.equal(decode(denied.cookie).exp - decode(denied.cookie).iat, 600);
  assert.notEqual(denied.state, allowed.state);
  for (const handler of [() => new Response(null, { status: 503 }), () => { throw new Error("private failure"); }]) {
    f.fetchMock(handler);
    await begin();
  }
});

test("origin is mandatory/exact, forwarding is ignored, local Host/port validated, app config fails before network", async () => {
  mockAuth();
  for (const origin of [null, "null", `${ORIGIN}/`, "https://other.example.invalid"]) {
    await check(await login.POST(request("login", { email: EMAIL }, { origin, "x-forwarded-host": "panel.example.invalid" })), 403);
  }
  for (const overrides of [{ ADMIN_APP_ORIGIN: undefined, SITE_ORIGIN: undefined }, { ADMIN_APP_ORIGIN: "https://bad.example.invalid/path" },
    { ADMIN_APP_ORIGIN: "https://panel.example.invalid/" }, { ADMIN_APP_ORIGIN: "http://public.example.invalid" },
    { ADMIN_APP_ORIGIN: "https://user:pass@panel.example.invalid" }, { ADMIN_SESSION_SECRET: "short" },
    { SUPABASE_URL: "http://supabase.example.invalid" }, { SUPABASE_SERVICE_ROLE_KEY: undefined },
    { ADMIN_APP_ORIGIN: "http://localhost:3107", NODE_ENV: "production" }]) {
    f.env(overrides);
    await check(await login.POST(request("login", { email: EMAIL })), 503);
  }
  assert.equal(f.calls.length, 0);
  f.env({ ADMIN_APP_ORIGIN: undefined, SITE_ORIGIN: ORIGIN });
  await begin();
  f.env();
  const local = (origin, host) => request("login", { email: EMAIL }, { origin, host }, "http://localhost:3107");
  await check(await login.POST(local("http://127.0.0.1:3107", "127.0.0.1:3107")), 303, { location: "/admin?sent=1" });
  // Emailed redirect still uses configured origin, never the request Host.
  assert.ok(f.calls.at(-1).url.includes(encodeURIComponent(`${ORIGIN}/admin/confirm?state=`)));
  const count = f.calls.length;
  for (const [origin, host] of [["http://127.0.0.1:3108", "127.0.0.1:3108"],
    ["http://127.0.0.1:3107", "other.example.invalid:3107"], ["https://127.0.0.1:3107", "127.0.0.1:3107"]]) {
    await check(await login.POST(local(origin, host)), 403);
  }
  assert.equal(f.calls.length, count);
});

test("bounded strict URL-encoded forms reject duplicates, unknown authority, encoding, size and types without calls", async () => {
  for (const [body, headers, status] of [[{ email: EMAIL }, { "content-type": "application/json" }, 415],
    ["email=x%GG", {}, 400], ["email=x%FF", {}, 400], [new Uint8Array([255]), {}, 400],
    [`email=${EMAIL}&email=${EMAIL}`, {}, 400], [{ email: EMAIL, role: "admin" }, {}, 400],
    [{ email: EMAIL, redirect: "https://other.example.invalid" }, {}, 400], ["email=bad", {}, 400],
    ["x".repeat(4097), {}, 413], [{ email: EMAIL }, { "content-length": "4097" }, 413]]) {
    await check(await login.POST(request("login", body, headers)), status);
    assert.equal(f.calls.length, 0);
  }
  let canceled = false;
  const stream = new ReadableStream({ pull(c) { c.enqueue(new TextEncoder().encode("a".repeat(5000))); }, cancel() { canceled = true; } });
  await check(await login.POST(request("login", stream)), 413);
  assert.equal(canceled, true);
  assert.equal(f.calls.length, 0);
});

test("Supabase SHA-224 token hash verifies with signed browser state and audit before issuing session", async () => {
  const tokenHash = createHash("sha224").update(EMAIL + "123456").digest("hex");
  assert.equal(tokenHash.length, 56);
  const state = session.createAdminLoginState(EMAIL);
  assert.ok(state);
  mockAuth();
  const response = await check(await verify.POST(request("verify", {
    token_hash: tokenHash, state: state.state,
  }, { cookie: state.cookie })), 303, { location: "/admin" });
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[0].url, "https://supabase.example.invalid/auth/v1/verify");
  assert.deepEqual(f.calls[0].payload, { token_hash: tokenHash, type: "email" });
  assert.equal(f.calls[1].url, "https://supabase.example.invalid/rest/v1/rpc/admin_log_event");
  assert.deepEqual(f.calls[1].payload, {
    p_actor_id: ID, p_actor_email: EMAIL, p_actor_role: "reader", p_action: "login",
  });
  const cookie = cookieValue(response, session.ADMIN_SESSION_COOKIE);
  assert.ok(cookie);
  const verified = session.readAdminSession(cookie);
  assert.equal(verified.id, ID);
  assert.equal(verified.email, EMAIL);
  assert.equal(verified.role, "reader");
});

test("verify rejects malformed SHA-224 hash boundaries before network or cookies", async () => {
  const state = session.createAdminLoginState(EMAIL);
  assert.ok(state);
  mockAuth();
  for (const tokenHash of ["", "a".repeat(55), "a".repeat(57), "a".repeat(64),
    TOKEN.toUpperCase(), "g".repeat(56)]) {
    const response = await check(await verify.POST(request("verify", {
      token_hash: tokenHash, state: state.state,
    }, { cookie: state.cookie })), 400);
    assert.equal(f.calls.length, 0);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("verify requires explicit POST, matching signed browser state, confirmed allowlisted user, audit before session", async () => {
  mockAuth();
  const state = await begin();
  const response = await check(await complete(state), 303, { location: "/admin" });
  assert.equal(f.calls.length, 3);
  assert.equal(f.calls[1].url, "https://supabase.example.invalid/auth/v1/verify");
  assert.deepEqual(f.calls[1].payload, { token_hash: TOKEN, type: "email" });
  assert.equal(f.calls[2].url, "https://supabase.example.invalid/rest/v1/rpc/admin_log_event");
  assert.deepEqual(f.calls[2].payload, { p_actor_id: ID, p_actor_email: EMAIL, p_actor_role: "reader", p_action: "login" });
  const cookie = cookieValue(response, session.ADMIN_SESSION_COOKIE);
  assert.ok(cookie);
  assert.equal(session.readAdminSession(cookie).role, "reader");
  assert.doesNotMatch(response.headers.get("set-cookie"), /never-store|access_token|refresh_token/);
  assert.ok(response.headers.getSetCookie().some(c => c.startsWith(`${session.ADMIN_LOGIN_COOKIE}=`) && c.includes("Max-Age=0")));
  assert.equal(f.calls[1].redirect, "error");
  assert.equal(f.calls[2].cache, "no-store");
  // Browser has discarded state, so replay is rejected before even calling verify.
  await check(await complete({ ...state, cookie: "" }), 403);
  assert.equal(f.calls.length, 3);
});

test("copied state cannot replay consumed upstream proof, and verify requires Origin before consuming", async () => {
  mockAuth();
  const state = await begin();
  for (const origin of [null, "https://other.example.invalid"]) {
    const rejected = await check(await complete(state, {}, { origin }), 403);
    assert.equal(rejected.headers.get("set-cookie"), null);
    assert.equal(f.calls.length, 1);
  }
  await check(await complete(state), 303, { location: "/admin" });
  assert.equal(f.calls.length, 3);
  f.fetchMock(call => {
    assert.equal(call.url, "https://supabase.example.invalid/auth/v1/verify");
    assert.deepEqual(call.payload, { token_hash: TOKEN, type: "email" });
    return new Response(null, { status: 403 }); // Auth has atomically consumed it.
  });
  const replay = await check(await complete(state), 503);
  assert.equal(replay.headers.get("set-cookie"), null);
  assert.equal(f.calls.length, 4, "no second login audit after rejected replay");
});

test("admin login ignores metadata/request role and records the current env role", async () => {
  mockAuth({ user: { id: ID, email: "admin@example.invalid", email_confirmed_at: "2026-01-01T00:00:00Z", user_metadata: { role: "reader" } } });
  const state = await begin("admin@example.invalid");
  const response = await check(await complete(state), 303, { location: "/admin" });
  assert.equal(session.readAdminSession(cookieValue(response, session.ADMIN_SESSION_COOKIE)).role, "admin");
  assert.equal(f.calls.at(-1).payload.p_actor_role, "admin");
});

test("bad, absent, expired or duplicate state and malformed hashes never consume Supabase proof", async () => {
  mockAuth();
  const state = await begin();
  const data = decode(state.cookie);
  const now = Math.floor(Date.now() / 1000);
  const expired = `${session.ADMIN_LOGIN_COOKIE}=${signed({ ...data, iat: now - 600, exp: now }, "login")}`;
  for (const [cookie, body] of [["", {}], [`${state.cookie}x`, {}], [state.cookie, { state: "x".repeat(43) }],
    [`${state.cookie}; ${state.cookie}`, {}], [`${session.ADMIN_LOGIN_COOKIE} =bad; ${state.cookie}`, {}],
    [expired, {}], [state.cookie, { token_hash: "bad" }],
    [state.cookie, { token_hash: "a".repeat(57) }], [state.cookie, { type: "signup" }]]) {
    const response = await complete({ ...state, cookie }, body);
    assert.ok([400, 403].includes(response.status));
    await check(response, response.status);
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(f.calls.length, 1);
  }
});

test("mismatched/unconfirmed/invalid users, removed access, JSON/refusal/replay/audit errors never issue a session", async () => {
  for (const user of [{ id: ID, email: "someone@example.invalid", email_confirmed_at: "2026-01-01" },
    { id: ID, email: EMAIL }, { id: "invalid", email: EMAIL, email_confirmed_at: "2026-01-01" },
    { id: ID, email: EMAIL, email_confirmed_at: "not-a-date" }, null]) {
    f.calls.length = 0;
    mockAuth({ user });
    const state = await begin();
    const response = await complete(state);
    await check(response, 403);
    assert.equal(cookieValue(response, session.ADMIN_SESSION_COOKIE), null);
    assert.equal(f.calls.length, 2);
  }
  f.calls.length = 0;
  mockAuth();
  const removed = await begin();
  f.env({ ADMIN_ALLOWLIST: "someone@example.invalid:admin" });
  await check(await complete(removed), 403);
  assert.equal(f.calls.length, 1);
  f.env();
  for (const failure of [() => new Response("bad JSON"), () => Response.json(null),
    () => new Response(null, { status: 403 }), () => { throw new Error("internal private error"); }]) {
    mockAuth();
    const state = await begin();
    const before = f.calls.length;
    f.fetchMock(failure);
    const response = await complete(state);
    await check(response, 503);
    assert.equal(cookieValue(response, session.ADMIN_SESSION_COOKIE), null);
    assert.equal(f.calls.length, before + 1);
  }
  mockAuth({ audit: false });
  const state = await begin();
  const response = await complete(state);
  await check(response, 503);
  assert.equal(cookieValue(response, session.ADMIN_SESSION_COOKIE), null);
});

test("logout requires session+Origin+CSRF; reader allowed; audit failure still clears cookie", async () => {
  const made = actor();
  const cookie = made.cookie.split(";")[0];
  for (const [body, headers] of [[{ csrf: "wrong" }, { cookie }], [{ csrf: made.actor.csrf }, {}],
    [{ csrf: made.actor.csrf }, { cookie, origin: null }], [{ csrf: made.actor.csrf }, { cookie, origin: "https://evil.example.invalid" }],
    [{ csrf: made.actor.csrf, role: "admin" }, { cookie }]]) {
    const response = await logout.POST(request("logout", body, headers));
    assert.ok([400, 403].includes(response.status));
    await check(response, response.status);
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(f.calls.length, 0);
  }
  mockAuth();
  const response = await check(await logout.POST(request("logout", { csrf: made.actor.csrf }, { cookie })), 303, { location: "/admin" });
  assert.match(response.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(f.calls.length, 1);
  assert.deepEqual(f.calls[0].payload, { p_actor_id: ID, p_actor_email: EMAIL, p_actor_role: "reader", p_action: "logout" });
  assert.equal(session.readAdminSession(cookieValue(response, session.ADMIN_SESSION_COOKIE)), null);
  mockAuth({ audit: false });
  const failed = await check(await logout.POST(request("logout", { csrf: made.actor.csrf }, { cookie })), 503);
  assert.match(failed.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(f.calls.length, 2);
  f.env({ SUPABASE_SERVICE_ROLE_KEY: undefined });
  const unconfigured = await check(await logout.POST(request("logout", { csrf: made.actor.csrf }, { cookie })), 503);
  assert.match(unconfigured.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(f.calls.length, 2);
});

test("all unsupported methods are inert 405 including scanner GET; existing public handler stays unchanged", async () => {
  for (const route of [login, verify, logout]) {
    for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      const response = await route[method](new Request(`${ORIGIN}/admin/verify?token_hash=${TOKEN}`, { method }));
      await check(response, 405, { body: method === "HEAD" ? "" : ERROR });
      assert.equal(response.headers.get("allow"), "POST");
      assert.equal(response.headers.get("set-cookie"), null);
    }
  }
  assert.equal(f.calls.length, 0);
  const publicRoute = f.load("app/api/preinscripcion/route.ts");
  const publicResponse = await publicRoute.GET(new Request(`${ORIGIN}/api/preinscripcion`));
  assert.equal(publicResponse.status, 405);
  assert.deepEqual(await publicResponse.json(), { message: "Método no permitido." });
  assert.equal(f.calls.length, 0);
});
