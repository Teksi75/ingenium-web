import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readAdminSession } from "@/lib/admin/session";
import { registrationById } from "@/lib/admin/registrations";
import RegistrationStatusControls from "../../../lib/admin/registration-status-controls";
import { adminDate, groupOptions, optionLabel, parseRegistrationFilters, registrationQuery,
  schoolOptions, statusOptions, type AdminSearchParams } from "@/lib/admin/registration-options";

function DetailSection({ title, fields }: { title: string; fields: [string, string | number | null][] }) {
  return <section className="min-w-0 border-t border-[var(--paper-border)] pt-5">
    <h2 className="text-lg font-semibold text-[var(--ink-950)]">{title}</h2>
    <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {fields.map(([label, value]) => <div key={label} className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-600)]">{label}</dt>
        <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{value === null || value === "" ? "No informado" : value}</dd>
      </div>)}
    </dl>
  </section>;
}

export default async function AdminRegistrationPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<AdminSearchParams>;
}) {
  // Independent request guard: the layout is deliberately not the authority.
  const cookie = (await headers()).get("cookie");
  const actor = readAdminSession(cookie);
  if (!actor) redirect("/admin");
  const { id } = await params;
  const filters = parseRegistrationFilters(await searchParams);
  const back = `/admin${filters ? registrationQuery(filters) : ""}`;
  const result = await registrationById(cookie, id);
  if (result.kind === "unauthorized") redirect("/admin");
  const backLink = <a href={back} className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-copper-deep)] underline underline-offset-4">← Volver al listado</a>;
  if (result.kind !== "ok") return <div className="space-y-4">
    {backLink}
    <h1 className="text-2xl font-semibold">{result.kind === "not-found" ? "No encontramos la solicitud" : "No pudimos cargar la solicitud"}</h1>
    <p className="text-sm">{result.kind === "not-found" ? "Revisá el enlace o volvé al listado." : "El servicio no está disponible en este momento. Podés volver a intentar."}</p>
    {result.kind === "unavailable" && <a href={`/admin/${id}${filters ? registrationQuery(filters) : ""}`} className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Volver a intentar</a>}
  </div>;
  const r = result.registration;
  const groups = (values: string[]) => values.map(value => optionLabel(groupOptions, value)).join(", ");
  return <article className="space-y-6">
    {backLink}
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-[var(--brand-copper-deep)]">Detalle de preinscripción · Curso {r.course_year}</p>
        <h1 className="mt-2 break-words text-3xl font-semibold text-[var(--ink-950)]">{r.student_name}</h1>
        <p className="mt-2 break-all text-xs text-[var(--ink-600)]">Comprobante: {r.public_code}</p>
      </div>
      <span className="rounded-full border border-[var(--paper-border)] bg-[var(--paper-glow)] px-3 py-2 text-sm font-semibold text-[var(--brand-sage)]">{optionLabel(statusOptions, r.status)}</span>
    </div>
    <p className="text-sm">Consulta de los datos enviados. Esta vista no permite editarlos.{actor.role === "reader" ? " Tu acceso es de sólo lectura." : " Las acciones de estado están al final del detalle."}</p>
    <DetailSection title="Estudiante" fields={[
      ["Nombre y apellido", r.student_name], ["Fecha de nacimiento", adminDate(r.birth_date, true)],
      ["Escuela primaria", r.primary_school], ["Grado", r.grade], ["Escuela de destino", optionLabel(schoolOptions, r.target_school)],
      ["Otra escuela", r.other_school], ["Año de cursado", r.course_year], ["Año de ingreso", r.entry_year],
    ]} />
    <DetailSection title="Responsable y contacto" fields={[
      ["Nombre y apellido", r.guardian_name], ["Vínculo", ({ madre: "Madre", padre: "Padre", tutor: "Tutor/a", otro: "Otro" } as Record<string, string>)[r.relationship]],
      ["WhatsApp", r.whatsapp], ["Correo electrónico", r.email], ["Localidad", r.locality],
    ]} />
    <DetailSection title="Grupos y organización" fields={[
      ["Grupos solicitados", groups(r.groups)], ["Primera preferencia", r.first_preference ? groups([r.first_preference]) : "Sin preferencia"],
      ["Grupo confirmado", r.confirmed_group ? groups([r.confirmed_group]) : "Sin asignar"], ["Lugar asignado", r.confirmed_slot],
      ["Observaciones de horario", r.schedule_notes], ["Materias que presentan dificultad", r.difficult_subjects],
      ["Observaciones pedagógicas", r.pedagogical_notes], ["Cómo conocieron Ingenium", r.referral_source],
    ]} />
    <DetailSection title="Consentimiento y fechas" fields={[
      ["Programa · versión aceptada", r.program_version], ["Programa · aceptación (UTC)", adminDate(r.program_accepted_at)],
      ["Privacidad · versión aceptada", r.privacy_version], ["Privacidad · aceptación (UTC)", adminDate(r.privacy_accepted_at)],
      ["Recibida (UTC)", adminDate(r.created_at)], ["Última actualización (UTC)", adminDate(r.updated_at)],
    ]} />
    {actor.role === "admin" && <RegistrationStatusControls registration={r} csrf={actor.csrf} />}
  </article>;
}
