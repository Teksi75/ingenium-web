import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(".");
const envKeys = ["ADMIN_ALLOWLIST", "ADMIN_SESSION_SECRET", "ADMIN_APP_ORIGIN", "SITE_ORIGIN",
  "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "PREINSCRIPCION_RATE_SECRET", "NODE_ENV"];

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
    globalThis.fetch = async (url, options) => {
      const call = { url: String(url), ...options, payload: JSON.parse(options.body) };
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
      NODE_ENV: "test",
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
