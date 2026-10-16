import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { test } from "node:test";

test("development starts and serves the existing homepage without persistence or root errors", { timeout: 190000 }, async () => {
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "0"], {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  try {
    const base = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Startup timed out:\n${output}`)), 60000);
      server.once("error", (error) => { clearTimeout(timer); reject(error); });
      server.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Server exited ${code}:\n${output}`)); });
      const collect = (chunk) => {
        output += chunk.toString();
        const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (match && /Ready in/.test(output)) {
          clearTimeout(timer);
          resolve(match[0]);
        }
      };
      server.stdout.on("data", collect);
      server.stderr.on("data", collect);
    });
    const response = await fetch(base, { signal: AbortSignal.timeout(120000) });
    const html = await response.text();
    assert.equal(response.status, 200, output);
    assert.match(html, /INGENIUM/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
    assert.equal(response.headers.get("permissions-policy"), "geolocation=(), microphone=(), camera=()");
    assert.doesNotMatch(output, /Failed to open database|inferred your workspace root|os error 426/);
    console.log(output);
  } catch (error) {
    console.error(output);
    throw error;
  } finally {
    server.kill();
  }
});
