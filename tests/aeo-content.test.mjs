import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

test("visible preuniversitario offer names UTN/UNCuyo with Matemática y Física", () => {
  const source = read("data/ingeniumSections.ts");
  assert.match(source, /id:\s*"preuniversitarios"/);
  assert.match(source, /UTN y UNCuyo/);
  assert.match(source, /Matemática y Física/);
  assert.match(source, /práctica guiada y seguimiento cercano/);
});

test("visible ETEC offer exists without inventing subjects", () => {
  const source = read("data/ingeniumSections.ts");
  assert.match(source, /id:\s*"ingreso-etec"/);
  assert.match(source, /ingreso a la ETEC/i);
});

test("new sections are wired into the homepage", () => {
  const page = read("app/page.tsx");
  assert.match(page, /PreuniversitariosSection/);
  assert.match(page, /EtecSection/);
});

test("metadata declares the visible offers and FAQPage schema stays tied to visible FAQ", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /ETEC/);
  assert.match(layout, /UTN\/UNCuyo|UTN y UNCuyo/);
  assert.match(layout, /FAQPage/);
});
