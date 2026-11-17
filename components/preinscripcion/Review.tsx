import { preinscripcionConfig as config, relationshipOptions, targetSchoolOptions } from "@/lib/preinscripcion/config";
import type { FormStep, PreinscripcionFormData, ValidationErrors } from "@/lib/preinscripcion/types";
import { Button } from "@/components/ui/button";
import { checkboxClass, FieldError, fieldA11y, type ChangeField } from "./FormFields";

function Summary({ title, step, rows, onEdit }: { title: string; step: FormStep; rows: [string, string][]; onEdit: (step: FormStep) => void }) {
  return <section className="space-y-4 border-b border-[var(--paper-border)] pb-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <Button type="button" variant="secondary" size="sm" className="min-h-11" wrap onClick={() => onEdit(step)}>Corregir {title.toLowerCase()}</Button>
    </div>
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {rows.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-[var(--ink-600)]">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words font-medium text-[var(--ink-950)]">{value || "No indicado"}</dd></div>)}
    </dl>
  </section>;
}

export function Review({ data, errors, onChange, onEdit }: { data: PreinscripcionFormData; errors: ValidationErrors; onChange: ChangeField; onEdit: (step: FormStep) => void }) {
  const groupText = (id: string) => {
    const group = config.groups.find((group) => group.id === id);
    return group ? `${group.label} — ${group.schedule}` : "No indicado";
  };
  return <div className="space-y-7">
    <p className="text-[var(--ink-600)]">Revisá todos los datos. Podés volver a cada paso para corregirlos antes de enviar.</p>
    <Summary title="Datos del estudiante" step={1} onEdit={onEdit} rows={[
      ["Nombre y apellido del estudiante", data.studentName],
      ["Fecha de nacimiento", data.birthDate.split("-").reverse().join("/")],
      ["Escuela primaria actual", data.primarySchool],
      [`Grado que cursará en ${config.courseYear}`, config.grade],
      ["Escuela secundaria a la que aspira", targetSchoolOptions.find((option) => option.value === data.targetSchool)?.label ?? ""],
      ["Otra escuela de interés (opcional)", data.otherSchool],
    ]} />
    <Summary title="Datos del responsable" step={2} onEdit={onEdit} rows={[
      ["Nombre y apellido del responsable", data.guardianName],
      ["Vínculo con el estudiante", relationshipOptions.find((option) => option.value === data.relationship)?.label ?? ""],
      ["Teléfono de WhatsApp", data.whatsapp], ["Correo electrónico", data.email],
      ["Barrio o localidad de residencia (opcional)", data.locality],
    ]} />
    <Summary title="Horarios y acompañamiento" step={3} onEdit={onEdit} rows={[
      ["Grupos compatibles", data.groups.map(groupText).join("\n")],
      ["Primera preferencia", data.firstPreference ? groupText(data.firstPreference) : config.noPreferenceLabel],
      ["Observaciones sobre horarios (opcional)", data.scheduleNotes],
      ["Materias que presentan mayor dificultad (opcional)", data.difficultSubjects],
      ["Observaciones pedagógicas (opcional)", data.pedagogicalNotes],
      ["Cómo conocieron Ingenium (opcional)", data.referralSource],
    ]} />
    <section aria-labelledby="program-conditions" className="space-y-3 rounded-xl bg-[var(--paper-soft)] p-5 text-sm leading-relaxed">
      <h3 id="program-conditions" className="font-semibold">Información del programa y condiciones</h3>
      <p>{config.terms.fees}</p><p>{config.terms.agreement}</p><p>{config.program.vacancyNotice}</p>
    </section>
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2" htmlFor="acceptedProgram">
        <input {...fieldA11y("acceptedProgram", errors)} type="checkbox" className={`${checkboxClass} mt-1`} required checked={data.acceptedProgram} onChange={(event) => onChange("acceptedProgram", event.target.checked)} />
        <span className="text-sm leading-relaxed">{config.terms.acceptanceLabel} <strong>(obligatorio)</strong></span>
      </label>
      <FieldError field="acceptedProgram" errors={errors} />
    </div>
    <section aria-labelledby="privacy-notice" className="space-y-3 text-sm leading-relaxed">
      <h3 id="privacy-notice" className="font-semibold">Aviso de privacidad</h3>
      <p>{config.privacy.notice}</p>
      <a className="inline-flex min-h-11 items-center font-semibold text-[var(--brand-copper-deep)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2" href={config.privacy.contactHref}>Contactar a Ingenium para ejercer tus derechos</a>
    </section>
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2" htmlFor="acceptedPrivacy">
        <input {...fieldA11y("acceptedPrivacy", errors)} type="checkbox" className={`${checkboxClass} mt-1`} required checked={data.acceptedPrivacy} onChange={(event) => onChange("acceptedPrivacy", event.target.checked)} />
        <span className="text-sm leading-relaxed">{config.privacy.acceptanceLabel} <strong>(obligatorio)</strong></span>
      </label>
      <FieldError field="acceptedPrivacy" errors={errors} />
    </div>
  </div>;
}

export function Receipt({ publicCode }: { publicCode: string }) {
  const [title, ...paragraphs] = config.successMessage.split("\n\n");
  return <section aria-labelledby="receipt-title" className="space-y-6">
    <p className="text-sm font-semibold uppercase tracking-widest text-[var(--brand-sage)]">Solicitud recibida</p>
    <h2 id="receipt-title" tabIndex={-1} className="font-display text-2xl font-semibold text-[var(--ink-950)] focus-visible:outline-2 focus-visible:outline-offset-4">{title}</h2>
    {paragraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
    <div className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper-soft)] p-5">
      <p className="text-sm font-semibold">Número público de solicitud</p>
      <p className="mt-2 break-all font-mono text-base">{publicCode}</p>
      <p className="mt-3 text-sm">Podés guardar este número. El comprobante permanece en esta pantalla y no tiene un enlace público.</p>
    </div>
    <p className="text-sm leading-relaxed text-[var(--ink-600)]">{config.program.vacancyNotice}</p>
  </section>;
}
