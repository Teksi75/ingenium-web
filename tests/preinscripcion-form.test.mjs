import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadPreinscripcion } from "./helpers/load-preinscripcion.mjs";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const cache = new Map();
// Compile the production UI in memory, sharing the contract's existing test loader.
function load(relative) {
  if (cache.has(relative)) return cache.get(relative).exports;
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  const loadedModule = { exports: {} };
  cache.set(relative, loadedModule);
  const localRequire = (specifier) => {
    const shared = specifier.match(/(?:^\.\/|^@\/lib\/preinscripcion\/)(config|types|validation)$/);
    if (shared) return loadPreinscripcion(shared[1]);
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return require(specifier);
    const base = specifier.startsWith("@/") ? specifier.slice(2) : path.relative(root, path.resolve(path.dirname(filename), specifier));
    const target = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(path.join(root, candidate)));
    if (!target || target.startsWith("..")) throw new Error(`Unresolved test import ${specifier}`);
    return load(target);
  };
  new vm.Script(`(function(exports, require, module) {\n${outputText}\n})`, { filename }).runInThisContext()(loadedModule.exports, localRequire, loadedModule);
  return loadedModule.exports;
}
const state = load("lib/preinscripcion/form-state.ts");
const ui = load("components/preinscripcion/FormFields.tsx");
const review = load("components/preinscripcion/Review.tsx");
const form = load("components/preinscripcion/PreinscripcionForm.tsx");
const page = load("app/preinscripcion/page.tsx");
const { preinscripcionConfig: config, targetSchoolOptions, relationshipOptions } = loadPreinscripcion("config");
const { initialFormData, validateSubmission, MAX_LENGTHS } = loadPreinscripcion("validation");
const uuid = "f680bac3-8ac8-4fe6-a4cb-3375ad06f31e";
const secondUuid = "4cc085dc-aac1-490c-9a94-3346bf7c2a58";
function valid(overrides = {}) {
  return { ...initialFormData, studentName: "Estudiante Prueba", birthDate: "2014-05-03", primarySchool: "Primaria sintética", targetSchool: "ambos", otherSchool: "Otra sintética", guardianName: "Responsable Prueba", relationship: "tutor", whatsapp: "+54 261 555 0101", email: "TEST@EXAMPLE.TEST", locality: "Localidad de prueba", groups: ["grupo-1", "grupo-3"], firstPreference: "grupo-3", scheduleNotes: "Horario de prueba", difficultSubjects: "Materia de prueba", pedagogicalNotes: "Observación de prueba", referralSource: "Referencia de prueba", acceptedProgram: true, acceptedPrivacy: true, ...overrides };
}
const render = (Component, props = {}) => renderToStaticMarkup(React.createElement(Component, props));
const response = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test("drafts are independent, memory-only and independently opt in to both consents", () => {
  const a = state.createDraft();
  const b = state.createDraft();
  assert.deepEqual(a, { data: initialFormData, attempt: null });
  assert.notEqual(a.data, b.data);
  assert.notEqual(a.data.groups, b.data.groups);
  const accepted = state.editDraft(a, "acceptedProgram", true);
  assert.equal(accepted.data.acceptedPrivacy, false);
  assert.equal(a.data.acceptedProgram, false);
});

test("four-step navigation validates only current step and keeps all entered data on back/correction", () => {
  const empty = state.createDraft();
  const before = structuredClone(empty);
  const invalid = state.advanceStep(1, empty.data);
  assert.equal(invalid.step, 1);
  assert.deepEqual(Object.keys(invalid.errors), ["studentName", "birthDate", "primarySchool", "targetSchool"]);
  assert.deepEqual(empty, before);
  for (const step of [1, 2, 3, 4]) {
    assert.deepEqual(state.advanceStep(step, valid()), { step: Math.min(step + 1, 4), errors: {} });
  }
  for (const [step, field] of [[1, "studentName"], [2, "guardianName"], [3, "groups"], [4, "acceptedPrivacy"]]) {
    assert.equal(state.stepForErrors({ [field]: "Error" }), step);
  }
  assert.equal(state.stepForErrors({ _form: "Error", website: "Error" }), 4);
  const draft = { data: valid(), attempt: null };
  const edited = state.editDraft(draft, "primarySchool", "Corrección de prueba");
  assert.deepEqual(edited.data, { ...draft.data, primarySchool: "Corrección de prueba" });
});

test("multiple groups toggle without duplicates and deselecting first preference resets only stale preference", () => {
  let draft = { data: valid(), attempt: null };
  draft = state.toggleGroup(draft, "grupo-2", true);
  draft = state.toggleGroup(draft, "grupo-2", true);
  assert.deepEqual(draft.data.groups, ["grupo-1", "grupo-3", "grupo-2"]);
  assert.equal(draft.data.firstPreference, "grupo-3");
  draft = state.toggleGroup(draft, "grupo-3", false);
  assert.deepEqual(draft.data.groups, ["grupo-1", "grupo-2"]);
  assert.equal(draft.data.firstPreference, null);
});

test("a no-op group update preserves an existing retry key", () => {
  const attempt = state.prepareAttempt(valid(), null, () => uuid);
  const draft = { data: valid(), attempt };
  assert.equal(state.toggleGroup(draft, "grupo-2", false), draft);
  assert.equal(state.toggleGroup(draft, "grupo-1", true), draft);
});

test("choosing ETec pre-selects the Tuesday group; switching to UNCuyo drops it and its stale preference", () => {
  let draft = { data: valid(), attempt: null };
  draft = state.applyTargetSchool(draft, "etec");
  assert.deepEqual(draft.data.groups, ["grupo-1", "grupo-3", "grupo-2"]);
  assert.equal(draft.data.firstPreference, "grupo-3");

  draft = state.applyTargetSchool(draft, "uncuyo");
  assert.deepEqual(draft.data.groups, ["grupo-1", "grupo-3"]);
  assert.equal(draft.data.firstPreference, "grupo-3");

  const tuesdayOnly = { data: { ...valid(), groups: ["grupo-2"], firstPreference: "grupo-2" }, attempt: null };
  assert.equal(state.applyTargetSchool(tuesdayOnly, "uncuyo").data.firstPreference, null);
  assert.deepEqual(state.applyTargetSchool(tuesdayOnly, "uncuyo").data.groups, []);
  assert.deepEqual(state.applyTargetSchool(tuesdayOnly, "ambos").data.groups, ["grupo-2"]);
});

test("unchanged retries keep UUID, real edits after an attempt invalidate it even when reverted", () => {
  let calls = 0;
  const key = () => (++calls === 1 ? uuid : secondUuid);
  const attempt = state.prepareAttempt(valid(), null, key);
  assert.equal(attempt.key, uuid);
  assert.deepEqual(attempt.payload, validateSubmission(valid()).data);
  assert.equal(state.prepareAttempt(valid(), attempt, key), attempt);
  assert.equal(calls, 1);
  const same = state.editDraft({ data: valid(), attempt }, "locality", "Localidad de prueba");
  assert.equal(same.attempt, attempt);
  const edited = state.editDraft(same, "locality", "Otra localidad");
  assert.equal(edited.attempt, null);
  const reverted = state.editDraft(edited, "locality", "Localidad de prueba");
  assert.equal(state.prepareAttempt(reverted.data, reverted.attempt, key).key, secondUuid);
  assert.throws(() => state.prepareAttempt(initialFormData, null, key));
});

test("synchronous submission lock rejects double clicks and allows a retry after failure", () => {
  const lock = state.createSubmissionLock();
  assert.equal(lock.tryAcquire(), true);
  assert.equal(lock.tryAcquire(), false);
  lock.release();
  assert.equal(lock.tryAcquire(), true);
});

test("POST uses exact normalized contract and same-origin credentials only; 201 and replay 200 accept UUID receipts", async () => {
  const attempt = state.prepareAttempt(valid(), null, () => uuid);
  for (const status of [201, 200]) {
    let calls = 0;
    let credentialMode;
    const result = await state.sendAttempt(attempt, async (url, options) => {
      calls++;
      credentialMode = options.credentials;
      assert.equal(url, "/api/preinscripcion");
      assert.equal(options.method, "POST");
      assert.equal(options.headers["Idempotency-Key"], uuid);
      assert.equal(options.headers["Content-Type"], "application/json");
      assert.equal(options.cache, "no-store");
      assert.equal(options.redirect, "error");
      assert.ok(options.signal instanceof AbortSignal);
      assert.deepEqual(JSON.parse(options.body), validateSubmission(valid()).data);
      return response(status, { publicCode: secondUuid });
    });
    assert.equal(credentialMode, "same-origin");
    assert.deepEqual(result, { ok: true, publicCode: secondUuid });
    assert.equal(calls, 1);
  }
});

for (const status of [400, 401, 403, 409, 413, 415, 429, 503]) {
  test(`HTTP ${status} preserves draft/attempt and exposes recoverable errors, never a receipt`, async () => {
    const draft = { data: valid(), attempt: state.prepareAttempt(valid(), null, () => uuid) };
    const before = structuredClone(draft);
    const result = await state.sendAttempt(draft.attempt, async () => response(status, { message: "Error de prueba", errors: { email: "Revisá el correo." }, publicCode: uuid }));
    assert.deepEqual(result, { ok: false, message: "Error de prueba", errors: { email: "Revisá el correo." } });
    assert.deepEqual(draft, before);
  });
}

test("non-JSON 401 from protected deployment preserves draft/attempt and never becomes a receipt", async () => {
  // Characterization of the actual protected-Preview failure: Vercel answered 401
  // with an HTML authentication page, so json() must fail honestly, not succeed.
  const draft = { data: valid(), attempt: state.prepareAttempt(valid(), null, () => uuid) };
  const before = structuredClone(draft);
  const result = await state.sendAttempt(draft.attempt, async () => new Response("<html>Unauthorized</html>", { status: 401 }));
  assert.equal(result.ok, false);
  assert.equal(Object.hasOwn(result, "publicCode"), false);
  assert.match(result.message, /reintentar/);
  assert.deepEqual(draft, before);
});

test("missing, predictable, non-v4 and malformed receipts, unexpected status and invalid JSON never succeed", async () => {
  const attempt = state.prepareAttempt(valid(), null, () => uuid);
  for (const body of [null, {}, { publicCode: "123" }, { publicCode: "00000000-0000-0000-0000-000000000000" }, { publicCode: "f680bac3-8ac8-1fe6-a4cb-3375ad06f31e" }, { publicCode: 1 }]) {
    assert.equal((await state.sendAttempt(attempt, async () => response(201, body))).ok, false);
  }
  assert.equal((await state.sendAttempt(attempt, async () => response(202, { publicCode: uuid }))).ok, false);
  assert.equal((await state.sendAttempt(attempt, async () => ({ ...response(201, { publicCode: uuid }), ok: false }))).ok, false);
  const malformed = await state.sendAttempt(attempt, async () => ({ ok: true, status: 201, json: async () => { throw new SyntaxError(); } }));
  assert.equal(malformed.ok, false);
});

test("network rejection and aborted timeout are recoverable without changing retry identity", async () => {
  const attempt = state.prepareAttempt(valid(), null, () => uuid);
  const before = structuredClone(attempt);
  const network = await state.sendAttempt(attempt, async () => { throw new TypeError("synthetic"); });
  assert.equal(network.ok, false);
  assert.match(network.message, /reintentar/);
  const timeout = await state.sendAttempt(attempt, async (_url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("synthetic", "AbortError")), { once: true });
  }), 1);
  assert.equal(timeout.ok, false);
  assert.match(timeout.message, /reintentar/);
  assert.deepEqual(attempt, before);
});

test("student/responsible fields use labeled native controls, exact options and shared limits", () => {
  for (const step of [1, 2]) {
    const html = render(ui.FormFields, { step, data: valid(), errors: {}, onChange() {}, onToggleGroup() {} });
    const fields = step === 1 ? ["studentName", "birthDate", "primarySchool", "targetSchool", "otherSchool"] : ["guardianName", "relationship", "whatsapp", "email", "locality"];
    for (const field of fields) {
      assert.match(html, new RegExp(`for="${field}"`));
      assert.match(html, new RegExp(`id="${field}"`));
    }
    const options = step === 1 ? targetSchoolOptions : relationshipOptions;
    for (const { value, label } of options) assert.ok(html.includes(`value="${value}"`), label);
    assert.match(html, /<select/);
    assert.ok(html.includes(`maxLength="${MAX_LENGTHS.name}"`));
    assert.match(html, /min-h-11/);
  }
  const html = render(ui.FormFields, { step: 1, data: valid({ studentName: "" }), errors: { studentName: "Ingresá nombre y apellido." }, onChange() {}, onToggleGroup() {} });
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /aria-describedby="studentName-error"/);
  assert.match(html, /id="studentName-error"[^>]*>Ingresá nombre y apellido\./);
});

test("schedules are multi-checkboxes and preference options contain only selected groups plus none", () => {
  const html = render(ui.FormFields, { step: 3, data: valid({ groups: ["grupo-1"], firstPreference: null }), errors: { groups: "Seleccioná al menos un grupo." }, onChange() {}, onToggleGroup() {} });
  assert.equal((html.match(/type="checkbox"/g) || []).length, 4);
  for (const group of config.groups) assert.ok(html.includes(group.schedule));
  const select = html.match(/<select[\s\S]*?<\/select>/)[0];
  assert.match(select, /Sin preferencia/);
  assert.match(select, /value="grupo-1"/);
  assert.doesNotMatch(select, /value="grupo-[234]"/);
  assert.match(html, /id="groups-error"/);
  for (const field of ["scheduleNotes", "difficultSubjects", "pedagogicalNotes", "referralSource"]) assert.ok(html.includes(`id="${field}"`));
  assert.ok(html.includes(config.privacy.sensitiveDataNotice));
});

test("review includes every visible entered field and independent unmarked required consent with privacy contact", () => {
  const data = valid({ acceptedProgram: false, acceptedPrivacy: false });
  const html = render(review.Review, { data, errors: {}, onChange() {}, onEdit() {} });
  for (const field of ["studentName", "primarySchool", "otherSchool", "guardianName", "locality", "scheduleNotes", "difficultSubjects", "pedagogicalNotes", "referralSource", "whatsapp", "email"]) assert.ok(html.includes(data[field]), field);
  assert.match(html, /03\/05\/2014/);
  assert.ok(html.includes("Ambos (UNCuyo y ETec)."));
  assert.ok(html.includes("Tutor/a"));
  for (const id of data.groups) assert.ok(html.includes(config.groups.find((g) => g.id === id).schedule));
  for (const field of ["acceptedProgram", "acceptedPrivacy"]) {
    assert.match(html, new RegExp(`id="${field}"`));
    assert.match(html, new RegExp(`for="${field}"`));
  }
  assert.equal((html.match(/type="checkbox"/g) || []).length, 2);
  assert.doesNotMatch(html, /checked=""/);
  assert.equal((html.match(/required=""/g) || []).length, 2);
  assert.ok(html.includes(config.terms.fees));
  assert.ok(html.includes(config.terms.agreement));
  assert.ok(html.includes(config.privacy.notice));
  assert.ok(html.includes(config.privacy.retentionNotice));
  assert.ok(html.includes('href="/#contacto"'));
  const contact = fs.readFileSync(path.join(root, "components/sections/ContactCTA.tsx"), "utf8");
  assert.match(contact, /id="contacto"/);
  assert.equal((html.match(/Corregir /g) || []).length, 3);
});

test("public form renders progress, draft-loss notice, hidden unfocusable honeypot and no initial receipt", () => {
  const html = render(form.default);
  assert.match(html, /aria-current="step"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /recargás.*perder/);
  assert.match(html, /<div hidden="" aria-hidden="true">/);
  const honeypot = html.match(/<input[^>]*id="website"[^>]*>/)[0];
  assert.match(honeypot, /name="website"/);
  assert.match(honeypot, /tabindex="-1"/);
  assert.doesNotMatch(html, /¡Recibimos tu preinscripción!/);
  assert.match(html, /Continuar/);
});

test("native form fallback never puts personal fields in a GET query before hydration", () => {
  const html = render(form.default);
  const openingForm = html.match(/<form[^>]*>/)[0];
  assert.match(openingForm, /method="post"/);
  assert.match(openingForm, /action="\/api\/preinscripcion"/);
});

test("closed and suspended public status disable sending and show honest explanatory copy", () => {
  assert.equal(state.availabilityNotice("abiertas"), null);
  for (const [status, notice] of [["cerradas", config.closedNotice], ["suspendidas", config.suspendedNotice]]) {
    assert.equal(state.availabilityNotice(status), notice);
    const html = render(form.FormActions, { step: 4, pending: false, notice, onBack() {} });
    assert.match(html, /type="submit"[^>]*disabled=""/);
  }
  const open = render(form.FormActions, { step: 4, pending: false, notice: null, onBack() {} });
  assert.doesNotMatch(open, /disabled=""/);
  const pending = render(form.FormActions, { step: 4, pending: true, notice: null, onBack() {} });
  assert.equal((pending.match(/disabled=""/g) || []).length, 2);
  assert.match(pending, /Enviando…/);
});

test("receipt renders exact honest copy and public number, never a confirmation of a place or public URL", () => {
  const html = render(review.Receipt, { publicCode: uuid });
  for (const paragraph of config.successMessage.split("\n\n")) assert.ok(html.includes(paragraph));
  assert.ok(html.includes(uuid));
  assert.ok(html.includes(config.program.vacancyNotice));
  assert.doesNotMatch(html, new RegExp(`href="[^"]*${uuid}`));
});

test("page has own canonical/social metadata, configured program/date copy and home navigation", () => {
  const html = render(page.default);
  assert.equal(page.metadata.alternates.canonical, "https://ingenium-web.vercel.app/preinscripcion");
  assert.equal(page.metadata.openGraph.url, page.metadata.alternates.canonical);
  assert.equal(page.metadata.twitter.title, config.program.title);
  assert.ok(html.includes(config.program.title));
  for (const feature of config.program.features) assert.ok(html.includes(feature));
  assert.match(html, /marzo de 2027/);
  assert.match(html, /octubre de 2027/);
  assert.match(html, /href="\/"/);
});
