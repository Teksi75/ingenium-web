import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const filename = path.join(root, "next.config.ts");
const source = fs.readFileSync(filename, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const context = { exports: {}, __dirname: root, require };
vm.runInNewContext(outputText, context, { filename });
const config = context.exports.default;

test("Turbopack uses the project directory rather than an ancestor lockfile", () => {
  assert.equal(config.turbopack?.root, root);
});

test("development does not open the persistent Turbopack database on OneDrive", () => {
  assert.equal(config.experimental?.turbopackFileSystemCacheForDev, false);
});

test("existing response security headers remain unchanged", async () => {
  const rules = await config.headers();
  assert.equal(rules.length, 2);
  assert.equal(rules[0].source, "/:path*");
  const headers = JSON.parse(JSON.stringify(rules[0].headers));
  assert.deepEqual(headers, [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  ]);
});

test("admin headers override only the private subtree after the original public headers", async () => {
  const rules = JSON.parse(JSON.stringify(await config.headers()));
  assert.deepEqual(rules[1], { source: "/admin/:path*", headers: [
    { key: "X-Robots-Tag", value: "noindex, nofollow" },
    { key: "Cache-Control", value: "private, no-store" },
    { key: "Referrer-Policy", value: "no-referrer" },
  ] });
});
