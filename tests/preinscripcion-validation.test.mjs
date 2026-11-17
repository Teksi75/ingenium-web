import assert from "node:assert/strict";
import { test } from "node:test";
import { loadPreinscripcion } from "./helpers/load-preinscripcion.mjs";

const { preinscripcionConfig, targetSchoolOptions, relationshipOptions } = loadPreinscripcion("config");
const { validateSubmission, validateStep, initialFormData, MAX_LENGTHS } = loadPreinscripcion("validation");

// Entirely synthetic fixtures; no real student or guardian information.
function valid(overrides = {}) {
  return {
    studentName: "Ana Prueba", birthDate: "2014-02-28", primarySchool: "Escuela de prueba",
    targetSchool: "uncuyo", otherSchool: "", guardianName: "Responsable Prueba",
    relationship: "madre", whatsapp: "+54 (9) 261-555-0101", email: " FAMILIA@EXAMPLE.TEST ",
    locality: "", groups: ["grupo-1", "grupo-3"], firstPreference: "grupo-3",
    scheduleNotes: "", difficultSubjects: "", pedagogicalNotes: "", referralSource: "",
    acceptedProgram: true, acceptedPrivacy: true, website: "", ...overrides,
  };
}
function rejected(overrides, errors) {
  const input = valid(overrides);
  const before = structuredClone(input);
  assert.deepEqual(validateSubmission(input), { ok: false, errors });
  assert.deepEqual(input, before, "rejected input remains unchanged");
}

test("config owns the permanent cycle, month precision, capacity and four stable schedules", () => {
  assert.equal(preinscripcionConfig.path, "/preinscripcion");
  assert.equal(preinscripcionConfig.courseYear, 2027);
  assert.equal(preinscripcionConfig.entryYear, 2028);
  assert.equal(preinscripcionConfig.startMonth, "2027-03");
  assert.equal(preinscripcionConfig.endMonth, "2027-10");
  assert.equal(preinscripcionConfig.status, "abiertas");
  assert.equal(preinscripcionConfig.maxStudentsPerGroup, 8);
  assert.equal(preinscripcionConfig.grade, "séptimo grado");
  assert.equal(preinscripcionConfig.noPreferenceLabel, "Sin preferencia");
  assert.deepEqual(preinscripcionConfig.groups, [
    { id: "grupo-1", label: "Grupo 1", schedule: "Lunes y miércoles, 17:30 a 19:00." },
    { id: "grupo-2", label: "Grupo 2", schedule: "Martes y jueves, 17:30 a 19:00." },
    { id: "grupo-3", label: "Grupo 3", schedule: "Lunes y miércoles, 16:00 a 17:30." },
    { id: "grupo-4", label: "Grupo 4", schedule: "Martes y jueves, 16:00 a 17:30." },
  ]);
});

test("dropdowns expose exact school labels and normalized allowed values", () => {
  assert.deepEqual(targetSchoolOptions, [
    { value: "uncuyo", label: "Colegios de la UNCuyo." },
    { value: "etec", label: "ETec." },
    { value: "ambos", label: "Ambos (UNCuyo y ETec)." },
  ]);
  assert.deepEqual(relationshipOptions, [
    { value: "madre", label: "Madre" }, { value: "padre", label: "Padre" },
    { value: "tutor", label: "Tutor/a" }, { value: "otro", label: "Otro" },
  ]);
  for (const { value } of targetSchoolOptions) assert.equal(validateSubmission(valid({ targetSchool: value })).ok, true);
  for (const { value } of relationshipOptions) assert.equal(validateSubmission(valid({ relationship: value })).ok, true);
});

test("public program, terms and versioned privacy copy state the limits of preregistration", () => {
  const { program, terms, privacy } = preinscripcionConfig;
  assert.equal(program.title, "Preinscripción 2027 — Ingreso al Secundario 2028");
  assert.equal(program.tagline, "Cada estudiante aprende a su ritmo. Nosotros lo acompañamos a llegar más lejos");
  assert.deepEqual(program.features, [
    "Grupos de hasta 8 estudiantes.", "Tres horas semanales de clases presenciales.",
    "Dos encuentros semanales de 90 minutos.", "Un taller complementario mensual, un viernes de cada mes.",
    "Acceso a la plataforma educativa propia.", "Práctica y acompañamiento desde casa.",
    "Seguimiento personalizado.", "Preparación de marzo a octubre.",
  ]);
  assert.match(program.vacancyNotice, /no confirma una vacante/);
  assert.equal(terms.version, "1");
  assert.match(terms.fees, /mensuales.*comienzo de cada mes/);
  assert.match(terms.agreement, /posteriormente.*detalles del curso.*condiciones económicas/);
  assert.equal(privacy.version, "2");
  assert.match(privacy.notice, /Instituto Ingenium.*preinscripción.*contactarte.*horarios/);
  assert.match(privacy.notice, /proveedor de alojamiento de datos.*por cuenta de Ingenium/);
  assert.doesNotMatch(privacy.notice, /Supabase/i);
  assert.match(privacy.notice, /No.*públicamente.*promociones/);
  assert.match(privacy.notice, /acceso, la rectificación.*supresión/);
  assert.equal(privacy.contactHref, "/#contacto");
  assert.match(privacy.sensitiveDataNotice, /diagnósticos médicos.*certificados.*información sensible/);
});

test("valid payload is normalized, preserves multiple groups and never mutates input or config", () => {
  const input = valid({ studentName: "  Ana   María O’Connor  ", guardianName: "Jean-Luc D'Angelo", primarySchool: " Escuela ", locality: " Barrio " });
  const before = structuredClone(input);
  const configBefore = structuredClone(preinscripcionConfig);
  const result = validateSubmission(input);
  assert.deepEqual(result, { ok: true, data: {
    ...input, studentName: "Ana María O’Connor", primarySchool: "Escuela", locality: "Barrio",
    whatsapp: "5492615550101", email: "familia@example.test",
  } });
  assert.notEqual(result.data.groups, input.groups);
  assert.deepEqual(input, before);
  assert.deepEqual(preinscripcionConfig, configBefore);
});

test("initial form has every payload field, no preselected consents and no client authority", () => {
  assert.deepEqual(Object.keys(initialFormData).sort(), Object.keys(valid()).sort());
  assert.equal(initialFormData.acceptedProgram, false);
  assert.equal(initialFormData.acceptedPrivacy, false);
  assert.deepEqual(initialFormData.groups, []);
  assert.equal(initialFormData.firstPreference, null);
  assert.equal(initialFormData.targetSchool, "");
  assert.equal(initialFormData.relationship, "");
  assert.equal(initialFormData.website, "");
});

const requiredErrors = {
  studentName: "Ingresá nombre y apellido.", birthDate: "Ingresá una fecha de nacimiento válida y anterior a hoy.",
  primarySchool: "Ingresá la escuela primaria actual.", targetSchool: "Seleccioná una escuela secundaria válida.",
  guardianName: "Ingresá nombre y apellido.", relationship: "Seleccioná un vínculo válido.",
  whatsapp: "Ingresá un teléfono de WhatsApp de 10 a 15 dígitos.", email: "Ingresá un correo electrónico válido.",
};
for (const [field, message] of Object.entries(requiredErrors)) {
  test(`${field} is required and rejects wrong types`, () => {
    for (const value of [undefined, null, "", "   ", 123, [], {}]) rejected({ [field]: value }, { [field]: message });
  });
}

test("names require reasonable Unicode name and surname, not digits or markup", () => {
  for (const field of ["studentName", "guardianName"]) {
    for (const value of ["Ana", "123 Prueba", "<b>Ana</b> Prueba"]) rejected({ [field]: value }, { [field]: requiredErrors[field] });
  }
  assert.equal(validateSubmission(valid({ studentName: "李 明", guardianName: "María del Carmen Pérez" })).ok, true);
});

test("school and relationship values cannot be substituted by labels or arbitrary text", () => {
  for (const value of ["UNCuyo", "Colegios de la UNCuyo.", "otra"]) rejected({ targetSchool: value }, { targetSchool: requiredErrors.targetSchool });
  rejected({ relationship: "vecino" }, { relationship: requiredErrors.relationship });
});

test("birth dates reject impossible, non-ISO, present and future dates without an age limit", () => {
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  for (const value of ["2014-02-29", "2012-02-30", "2014-04-31", "2014-13-01", "2014-00-10", "2014-01-00", "01/02/2014", "2014-2-01", "0000-01-01", today, future]) {
    rejected({ birthDate: value }, { birthDate: requiredErrors.birthDate });
  }
  for (const value of ["2012-02-29", "1900-01-01", new Date(Date.now() - 86400000).toISOString().slice(0, 10)]) {
    assert.equal(validateSubmission(valid({ birthDate: value })).ok, true);
  }
});

test("phone accepts 10–15 digits with formatting, not letters, extra plus signs or extensions", () => {
  for (const value of ["1234567890", "123456789012345", "+54 (9) 261.555-0101"]) assert.equal(validateSubmission(valid({ whatsapp: value })).ok, true);
  for (const value of ["123456789", "1234567890123456", "++5492615550101", "call5492615550101", "5492615550101 ext 2"]) rejected({ whatsapp: value }, { whatsapp: requiredErrors.whatsapp });
});

test("email syntax and the 254-character limit are enforced", () => {
  const boundary = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(61)}`;
  assert.equal(boundary.length, 254);
  assert.equal(validateSubmission(valid({ email: boundary })).ok, true);
  for (const value of ["a@", "a b@example.test", "a@@example.test", "a@example", `${boundary}d`]) rejected({ email: value }, { email: requiredErrors.email });
});

test("text maxima are explicit and accept the boundary but not boundary + 1", () => {
  assert.deepEqual(MAX_LENGTHS, { name: 160, text: 160, longText: 1000, email: 254, phoneDigitsMin: 10, phoneDigitsMax: 15 });
  for (const field of ["studentName", "guardianName", "primarySchool", "otherSchool", "locality", "referralSource", "scheduleNotes", "difficultSubjects", "pedagogicalNotes"]) {
    const max = ["scheduleNotes", "difficultSubjects", "pedagogicalNotes"].includes(field) ? 1000 : 160;
    const boundary = field.endsWith("Name") ? `A ${"b".repeat(max - 2)}` : "x".repeat(max);
    assert.equal(validateSubmission(valid({ [field]: boundary })).ok, true, field);
    rejected({ [field]: `${boundary}x` }, { [field]: `Usá hasta ${max} caracteres.` });
  }
});

test("optional text is trimmed or defaults to empty, but never coerces non-text values", () => {
  for (const field of ["otherSchool", "locality", "scheduleNotes", "difficultSubjects", "pedagogicalNotes", "referralSource"]) {
    const input = valid();
    delete input[field];
    assert.equal(validateSubmission(input).data[field], "");
    assert.equal(validateSubmission(valid({ [field]: "  texto de prueba  " })).data[field], "texto de prueba");
    for (const value of [null, false, [], {}]) rejected({ [field]: value }, { [field]: "Ingresá un texto válido." });
  }
});

test("groups allow every valid combination, require at least one and reject duplicates or unknown IDs", () => {
  for (let mask = 1; mask < 16; mask++) {
    const groups = preinscripcionConfig.groups.filter((_, i) => mask & (1 << i)).map(({ id }) => id);
    assert.equal(validateSubmission(valid({ groups, firstPreference: groups[0] })).ok, true);
  }
  rejected({ groups: [], firstPreference: null }, { groups: "Seleccioná al menos un grupo." });
  for (const groups of [undefined, null, "grupo-1", ["grupo-5"], ["grupo-1", "grupo-1"], [1], [null], Array(1)]) {
    rejected({ groups, firstPreference: null }, { groups: "Seleccioná grupos válidos sin repetir." });
  }
});

test("first preference is null or an exact selected group; it never silently selects one", () => {
  const result = validateSubmission(valid({ firstPreference: null }));
  assert.equal(result.data.firstPreference, null);
  for (const value of ["grupo-2", "grupo-5", "", "Sin preferencia", [], 1]) rejected({ firstPreference: value }, { firstPreference: "Elegí un grupo marcado o Sin preferencia." });
});

for (const field of ["acceptedProgram", "acceptedPrivacy"]) {
  test(`${field} requires literal true, never truthy coercion or a precheck`, () => {
    const message = field === "acceptedProgram" ? "Aceptá la información del programa." : "Aceptá el aviso de privacidad para gestionar la solicitud.";
    for (const value of [false, undefined, null, "true", 1, {}, []]) rejected({ [field]: value }, { [field]: message });
  });
}

test("unknown properties reject client cycle, state, consent timestamps, idempotency and private data", () => {
  for (const key of ["year", "courseYear", "cycle", "status", "state", "acceptedAt", "privacyAcceptedAt", "idempotencyKey", "dni", "address", "__proto__"]) {
    const input = JSON.parse(JSON.stringify(valid()));
    Object.defineProperty(input, key, { value: "forbidden", enumerable: true });
    const before = JSON.stringify(input);
    assert.deepEqual(validateSubmission(input), { ok: false, errors: { _form: "La solicitud contiene campos no permitidos." } });
    assert.equal(JSON.stringify(input), before);
  }
});

test("non-object payloads reject cleanly and a filled honeypot cannot be accepted", () => {
  for (const input of [null, undefined, [], true, "{}", 42]) assert.deepEqual(validateSubmission(input), { ok: false, errors: { _form: "La solicitud no es válida." } });
  for (const website of ["https://example.test", " ", null, 1]) rejected({ website }, { website: "No se pudo validar la solicitud." });
});

test("step validation shares submission rules without showing future-step errors", () => {
  assert.deepEqual(validateStep(1, initialFormData), Object.fromEntries(Object.entries(requiredErrors).filter(([key]) => ["studentName", "birthDate", "primarySchool", "targetSchool"].includes(key))));
  assert.deepEqual(validateStep(2, initialFormData), Object.fromEntries(Object.entries(requiredErrors).filter(([key]) => ["guardianName", "relationship", "whatsapp", "email"].includes(key))));
  assert.deepEqual(validateStep(3, initialFormData), { groups: "Seleccioná al menos un grupo." });
  assert.deepEqual(validateStep(4, initialFormData), { acceptedProgram: "Aceptá la información del programa.", acceptedPrivacy: "Aceptá el aviso de privacidad para gestionar la solicitud." });
  for (const step of [1, 2, 3, 4]) assert.deepEqual(validateStep(step, valid()), {});
});
