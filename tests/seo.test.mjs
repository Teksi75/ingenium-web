import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";

const canonical = "https://ingenium-web.vercel.app";
let base = process.env.SEO_TEST_URL;
let server;
let html;

before(async () => {
  if (!base) {
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "0"], {
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(() => reject(new Error(`Server startup timed out:\n${output}`)), 90000);
      server.once("error", (error) => { clearTimeout(timer); reject(error); });
      server.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Server exited ${code}:\n${output}`)); });
      const collect = (chunk) => {
        output += chunk.toString();
        const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (match && /Ready in/.test(output)) {
          base = match[0];
          clearTimeout(timer);
          resolve();
        }
      };
      server.stdout.on("data", collect);
      server.stderr.on("data", collect);
    });
  }
  const response = await fetch(base, { signal: AbortSignal.timeout(90000) });
  assert.equal(response.status, 200);
  html = await response.text();
});

after(() => { server?.kill(); });

function meta(key) {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  const tag = tags.find((value) => value.includes(`name="${key}"`) || value.includes(`property="${key}"`));
  return tag?.match(/content="([^"]*)"/)?.[1];
}

test("canonical and social metadata use the official site and an existing image", async () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/ingenium-web\.vercel\.app\/?"/);
  assert.equal(meta("og:url")?.replace(/\/$/, ""), canonical);
  assert.equal(meta("og:image"), `${canonical}/og-image.png`);
  assert.equal(meta("twitter:image"), `${canonical}/og-image.png`);
  assert.match(meta("description"), /Vistalba/);
  assert.doesNotMatch(html, /institutoingenium\.com/);
  const image = await fetch(`${base}/og-image.png`);
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type"), /image\/png/);
});

test("structured identity matches the public location and contact", () => {
  const raw = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(raw, "JSON-LD must be present in server-rendered HTML");
  const organization = JSON.parse(raw);
  assert.equal(organization["@type"], "EducationalOrganization");
  assert.equal(organization["@id"], `${canonical}/#organization`);
  assert.equal(organization.url, canonical);
  assert.equal(organization.address.addressLocality, "Vistalba");
  assert.equal(organization.address.addressRegion, "Mendoza");
  assert.equal(organization.address.addressCountry, "AR");
  assert.equal(organization.telephone, "+54 9 2615010488");
  assert.match(html, /Suyai 2632/);
  assert.ok(organization.sameAs.some((url) => url.includes("instagram.com/ingenium_barbaratomba")));
  assert.ok(organization.hasMap.startsWith("https://www.google.com/maps/"));
});

test("robots keeps public crawling open and points at the official sitemap", async () => {
  const response = await fetch(`${base}/robots.txt`);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /User-Agent: \*/i);
  assert.match(body, /Allow: \/(?:\r?\n|$)/);
  assert.doesNotMatch(body, /Disallow:/i);
  assert.match(body, /Sitemap: https:\/\/ingenium-web\.vercel\.app\/sitemap.xml/);
});

test("sitemap retains the homepage without claiming a synthetic update date", async () => {
  const response = await fetch(`${base}/sitemap.xml`);
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /<loc>https:\/\/ingenium-web\.vercel\.app\/<\/loc>/);
  assert.equal((body.match(/<url>/g) ?? []).length, 1);
  assert.doesNotMatch(body, /<lastmod>/);
});
