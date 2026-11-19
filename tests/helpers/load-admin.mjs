import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import * as jose from "jose";

const googleKeys = jose.generateKeyPair("RS256");
export const GOOGLE_EMAIL = "ingenium.reader.fixture.000000@gmail.com";
export const GOOGLE_ADMIN = "ingenium.admin.fixture.000000@gmail.com";

/** Real local signatures; every provider request is intercepted, never sent. */
export async function mockGoogle(f, cookie, claims = {}, { audit = true, token, reject = false, providerError = false, tamper = false, keyClaims = {} } = {}) {
  const { privateKey, publicKey } = await googleKeys;
  const data = JSON.parse(Buffer.from(cookie.split("=")[1].split(".")[0], "base64url"));
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: "https://accounts.google.com", aud: "fixture.apps.googleusercontent.com",
    sub: "123456789012345678901", iat: now, exp: now + 600, nonce: data.nonce,
    email: GOOGLE_EMAIL, email_verified: true, ...claims };
  for (const key of Object.keys(payload)) if (payload[key] === undefined) delete payload[key];
  let jwt = token ?? await new jose.SignJWT(payload).setProtectedHeader({ alg: "RS256", kid: "fixture", ...keyClaims })
    .sign(keyClaims.alg === "HS256" ? new TextEncoder().encode("synthetic-signing-key-32-characters") : privateKey);
  if (tamper) {
    const parts = jwt.split(".");
    parts[2] = (parts[2][0] === "a" ? "b" : "a") + parts[2].slice(1);
    jwt = parts.join(".");
  }
  const jwk = { ...await jose.exportJWK(publicKey), kid: "fixture", alg: "RS256", use: "sig" };
  f.fetchMock(call => {
    if (call.url === "https://oauth2.googleapis.com/token") return reject
      ? Response.json({ error: "private-provider-error" }, { status: 400 })
      : Response.json({ id_token: jwt, access_token: "never-store-access", refresh_token: "never-store-refresh",
        ...(providerError ? { error: "private-provider-error" } : {}) });
    if (call.url === "https://www.googleapis.com/oauth2/v3/certs") return Response.json({ keys: [jwk] });
    assert.equal(call.url, "https://supabase.example.invalid/rest/v1/rpc/admin_log_event");
    return new Response(null, { status: audit ? 204 : 503 });
  });
  return { payload, jwt };
}

const require = createRequire(import.meta.url);
const root = path.resolve(".");
const envKeys = ["ADMIN_ALLOWLIST", "ADMIN_SESSION_SECRET", "ADMIN_APP_ORIGIN", "SITE_ORIGIN",
  "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "PREINSCRIPCION_RATE_SECRET", "NODE_ENV",
  "ADMIN_GOOGLE_CLIENT_ID", "ADMIN_GOOGLE_CLIENT_SECRET"];

/** Fresh module cache and explicit, reversible environment/fetch fixtures; no disk output. */
export function loadAdmin() {
  const savedEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  const savedFetch = globalThis.fetch;
  const cache = new Map();
  function load(relative) {
    const filename = path.resolve(root, relative);
    assert.ok(filename.startsWith(`${root}${path.sep}`));
    if (cache.has(filename)) return cache.get(filename).exports;
    const source = fs.readFileSync(filename, "utf8");
    const { outputText } = ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    } });
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    function localRequire(specifier) {
      if (specifier === "server-only") return {};
      if (specifier === "jose") return jose;
      if (specifier.startsWith("node:")) return require(specifier);
      assert.ok(specifier.startsWith("@/") || specifier.startsWith("."));
      const base = specifier.startsWith("@/") ? path.join(root, specifier.slice(2))
        : path.resolve(path.dirname(filename), specifier);
      return load(base.endsWith(".ts") ? base : `${base}.ts`);
    }
    new vm.Script(`(function(exports, require, module) {${outputText}\n})`, { filename })
      .runInThisContext()(loaded.exports, localRequire, loaded);
    return loaded.exports;
  }
  const calls = [];
  function fetchMock(handler) {
    globalThis.fetch = async (url, options = {}) => {
      const body = options.body;
      const call = { url: String(url), ...options, payload: body instanceof URLSearchParams
        ? Object.fromEntries(body) : body ? JSON.parse(body) : null };
      calls.push(call);
      return handler(call, calls.length);
    };
  }
  function env(overrides = {}) {
    for (const key of envKeys) delete process.env[key];
    Object.assign(process.env, {
      ADMIN_ALLOWLIST: "reader@example.invalid:reader,admin@example.invalid:admin",
      ADMIN_SESSION_SECRET: "synthetic-session-secret-with-at-least-32-characters",
      ADMIN_APP_ORIGIN: "https://panel.example.invalid",
      SUPABASE_URL: "https://supabase.example.invalid",
      SUPABASE_SERVICE_ROLE_KEY: "synthetic-service-key-with-at-least-32-characters",
      NODE_ENV: "test", ADMIN_GOOGLE_CLIENT_ID: "fixture.apps.googleusercontent.com",
      ADMIN_GOOGLE_CLIENT_SECRET: "synthetic-google-client-secret",
    });
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
  env();
  fetchMock(() => { throw new Error("Unexpected network call"); });
  return { load, env, calls, fetchMock, restore() {
    globalThis.fetch = savedFetch;
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  } };
}
