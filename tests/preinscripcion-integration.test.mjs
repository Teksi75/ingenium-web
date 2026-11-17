import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const cache = new Map();
// Render the real components in memory: no server, generated output or credentials.
function load(relative) {
  if (cache.has(relative)) return cache.get(relative).exports;
  const filename = path.join(root, relative);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  const loadedModule = { exports: {} };
  cache.set(relative, loadedModule);
  const localRequire = (specifier) => {
    if (specifier.endsWith(".css")) return {};
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return require(specifier);
    const base = specifier.startsWith("@/") ? specifier.slice(2) : path.relative(root, path.resolve(path.dirname(filename), specifier));
    const target = [`${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(path.join(root, candidate)));
    if (!target || target.startsWith("..")) throw new Error(`Unresolved import: ${specifier}`);
    return load(target);
  };
  new vm.Script(`(function(exports, require, module) {\n${outputText}\n})`, { filename }).runInThisContext()(loadedModule.exports, localRequire, loadedModule);
  return loadedModule.exports;
}
const { preinscripcionConfig: config } = load("lib/preinscripcion/config.ts");
const { ingeniumSectionsById: sections } = load("data/ingeniumSections.ts");
const { ingeniumContact: contact } = load("lib/contact.ts");
const { SITE_ORIGIN: origin } = load("lib/site.ts");
const render = (Component, props = {}) => renderToStaticMarkup(React.createElement(Component, props));
const ingreso = () => render(load("components/sections/IngresoSection.tsx").default);
const layout = load("app/layout.tsx");
const home = load("app/page.tsx");
const registration = load("app/preinscripcion/page.tsx");
const structuredData = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));

test("admission section links visibly to the permanent route with configured cycle and distinct capacity", () => {
  const html = ingreso();
  const link = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].find((match) => match[1].includes(`href="${config.path}"`));
  assert.ok(link, "Missing visible /preinscripcion link in the admission section");
  assert.ok(link[2].includes(config.program.title));
  assert.doesNotMatch(link[1], /target=|hidden|display:\s*none/);
  assert.ok(html.includes(`hasta ${config.maxStudentsPerGroup} estudiantes`));
  assert.match(html, /preparación para el ingreso/);
  assert.match(html, /apoyo escolar habitual/);
  assert.match(html, /primaria hasta 3 y secundaria hasta 4/);
});

test("sitemap lists only homepage and public form, without synthetic dates or receipt URLs", () => {
  const entries = load("app/sitemap.ts").default();
  assert.deepEqual(entries, [{ url: `${origin}/` }, { url: `${origin}${config.path}` }]);
});

test("existing admission copy and WhatsApp CTA survive alongside the new navigation", () => {
  const html = ingreso();
  const section = sections["ingreso-uncuyo"];
  for (const text of [section.title, section.body, "App exclusiva para alumnos de INGENIUM", "El acceso a la plataforma se solicita por WhatsApp", ...section.items.flatMap((item) => [item.title, item.body])]) {
    assert.ok(html.includes(text), `Missing original copy: ${text}`);
  }
  for (const cta of section.ctas) {
    assert.ok(html.includes(`href="${cta.href.replaceAll("&", "&amp;")}"`));
    assert.ok(html.includes(cta.label));
  }
  assert.equal((html.match(/href="https:\/\/wa\.me\//g) ?? []).length, 1);
  assert.match(html, /target="_blank" rel="noopener noreferrer"/);
  const groups = render(load("components/sections/GroupsSection.tsx").default);
  assert.ok(groups.includes("Primaria: hasta 3 estudiantes"));
  assert.ok(groups.includes("Secundaria: hasta 4 estudiantes"));
});

test("FAQ JSON-LD remains exact on the homepage and is not inherited by the form", () => {
  const homepage = render(layout.default, { children: React.createElement(home.default) });
  const formPage = render(layout.default, { children: React.createElement(registration.default) });
  const scripts = structuredData(homepage);
  assert.deepEqual(scripts.map((item) => item["@type"]), ["EducationalOrganization", "FAQPage"]);
  assert.deepEqual(scripts[1], {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: sections.faq.items.filter((item) => item.body).map((item) => ({
      "@type": "Question", name: item.title, acceptedAnswer: { "@type": "Answer", text: item.body },
    })),
  });
  const visible = homepage.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  for (const item of sections.faq.items) {
    assert.ok(visible.includes(item.title));
    assert.ok(visible.includes(item.body));
  }
  assert.deepEqual(structuredData(formPage).map((item) => item["@type"]), ["EducationalOrganization"]);
  assert.deepEqual(structuredData(formPage)[0], scripts[0]);
});

test("organization identity and homepage metadata remain unchanged", () => {
  const title = "INGENIUM | Apoyo escolar e ingresos en Luján de Cuyo, Mendoza";
  const description = "Apoyo escolar para primaria y secundaria, preparación ETEC y preuniversitarios UTN y UNCuyo (Matemática y Física) en Luján de Cuyo, cerca de Chacras de Coria, Mendoza. Acompañamiento educativo personalizado, con clases individuales y grupales.";
  assert.equal(layout.metadata.title, title);
  assert.equal(layout.metadata.description, description);
  for (const meta of [layout.metadata.openGraph, layout.metadata.twitter]) {
    assert.equal(meta.title, title);
    assert.equal(meta.description, description);
  }
  assert.equal(layout.metadata.alternates.canonical, "/");
  assert.deepEqual(structuredData(render(layout.default))[0], {
    "@context": "https://schema.org", "@type": "EducationalOrganization", "@id": `${origin}/#organization`,
    name: "INGENIUM", description, url: origin, telephone: contact.whatsappNumber,
    address: { "@type": "PostalAddress", streetAddress: contact.addressParts.streetAddress, addressLocality: contact.addressParts.addressLocality, addressRegion: contact.addressParts.addressRegion, addressCountry: "AR" },
    hasMap: contact.googleMapsUrl, sameAs: ["https://www.instagram.com/ingenium_barbaratomba?igsh=ZDhzMWhuNTdzMWp3"],
  });
});

test("public form has its own canonical/title and return navigation without personal query parameters", () => {
  assert.equal(registration.metadata.title, config.program.title);
  assert.equal(registration.metadata.alternates.canonical, `${origin}${config.path}`);
  assert.equal(registration.metadata.openGraph.url, `${origin}${config.path}`);
  const html = render(registration.default);
  assert.match(html, /href="\/"[^>]*>← Volver a la portada/);
  assert.doesNotMatch(html, /href="[^"]*\?(?:publicCode|email|studentName)=/);
});
