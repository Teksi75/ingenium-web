import type { ReactNode } from "react";
import { preinscripcionConfig as config, relationshipOptions, targetSchoolOptions } from "@/lib/preinscripcion/config";
import type { FormStep, GroupId, PreinscripcionFormData, ValidationErrors } from "@/lib/preinscripcion/types";
import { MAX_LENGTHS } from "@/lib/preinscripcion/validation";

export type ChangeField = <K extends keyof PreinscripcionFormData>(field: K, value: PreinscripcionFormData[K]) => void;
type TextField = "studentName" | "birthDate" | "primarySchool" | "otherSchool" | "guardianName" | "whatsapp" | "email" | "locality" | "scheduleNotes" | "difficultSubjects" | "pedagogicalNotes" | "referralSource";
type FieldProps = { field: string; label: string; errors: ValidationErrors; children: ReactNode };

export const controlClass = "min-h-11 w-full min-w-0 rounded-xl border border-[var(--ink-500)] bg-white/80 px-3 py-3 text-base text-[var(--ink-950)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-sage)] aria-invalid:border-red-800";
export const checkboxClass = "h-5 w-5 shrink-0 accent-[var(--brand-sage)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-sage)]";

export function fieldA11y(field: string, errors: ValidationErrors) {
  return { id: field, name: field, "aria-invalid": errors[field] ? true : undefined, "aria-describedby": errors[field] ? `${field}-error` : undefined } as const;
}

export function FieldError({ field, errors }: { field: string; errors: ValidationErrors }) {
  return errors[field] ? <p id={`${field}-error`} className="mt-2 text-sm font-medium text-red-800">{errors[field]}</p> : null;
}

function Field({ field, label, errors, children }: FieldProps) {
  return <div className="min-w-0 space-y-2"><label htmlFor={field} className="block text-sm font-semibold text-[var(--ink-800)]">{label}</label>{children}<FieldError field={field} errors={errors} /></div>;
}

type FieldsProps = {
  step: FormStep; data: PreinscripcionFormData; errors: ValidationErrors;
  onChange: ChangeField; onToggleGroup: (id: GroupId, checked: boolean) => void;
};

export function FormFields({ step, data, errors, onChange, onToggleGroup }: FieldsProps) {
  function text(field: TextField, label: string, options: { type?: string; autoComplete?: string; required?: boolean; multiline?: boolean; max?: number } = {}) {
    const { type = "text", autoComplete = "off", required = false, multiline = false, max = MAX_LENGTHS.text } = options;
    const props = { ...fieldA11y(field, errors), className: controlClass, value: data[field], required, maxLength: max, autoComplete, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, event.target.value) };
    return <Field key={field} field={field} label={label} errors={errors}>{multiline ? <textarea {...props} rows={3} /> : <input {...props} type={type} inputMode={field === "whatsapp" ? "tel" : undefined} />}</Field>;
  }
  if (step === 1) return <div className="grid gap-6 sm:grid-cols-2">
    {text("studentName", "Nombre y apellido del estudiante (obligatorio)", { required: true, max: MAX_LENGTHS.name })}
    {text("birthDate", "Fecha de nacimiento (obligatoria)", { type: "date", required: true })}
    {text("primarySchool", "Escuela primaria actual (obligatoria)", { required: true })}
    <div className="space-y-2"><p className="text-sm font-semibold">Grado que cursará en {config.courseYear}</p><p className="min-h-11 rounded-xl bg-[var(--paper-soft)] px-3 py-3">{config.grade}</p></div>
    <Field field="targetSchool" label="Escuela secundaria a la que aspira (obligatoria)" errors={errors}>
      <select {...fieldA11y("targetSchool", errors)} className={controlClass} value={data.targetSchool} required onChange={(event) => onChange("targetSchool", event.target.value as PreinscripcionFormData["targetSchool"])}>
        <option value="">Seleccioná una opción</option>
        {targetSchoolOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </Field>
    {text("otherSchool", "Otra escuela de interés (opcional)")}
  </div>;
  if (step === 2) return <div className="grid gap-6 sm:grid-cols-2">
    {text("guardianName", "Nombre y apellido del responsable (obligatorio)", { required: true, autoComplete: "name", max: MAX_LENGTHS.name })}
    <Field field="relationship" label="Vínculo con el estudiante (obligatorio)" errors={errors}>
      <select {...fieldA11y("relationship", errors)} className={controlClass} value={data.relationship} required onChange={(event) => onChange("relationship", event.target.value as PreinscripcionFormData["relationship"])}>
        <option value="">Seleccioná un vínculo</option>
        {relationshipOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </Field>
    {text("whatsapp", "Teléfono de WhatsApp (obligatorio)", { type: "tel", required: true, autoComplete: "tel" })}
    {text("email", "Correo electrónico (obligatorio)", { type: "email", required: true, autoComplete: "email", max: MAX_LENGTHS.email })}
    {text("locality", "Barrio o localidad de residencia (opcional)")}
  </div>;
  return <div className="space-y-7">
    <fieldset aria-describedby={errors.groups ? "groups-error" : "groups-hint"}>
      <legend className="font-semibold">Grupos compatibles (al menos uno)</legend>
      <p id="groups-hint" className="mt-2 text-sm text-[var(--ink-600)]">Podés marcar varios. Hasta {config.maxStudentsPerGroup} estudiantes por grupo; la disponibilidad se informa posteriormente.</p>
      {(data.targetSchool === "etec" || data.targetSchool === "ambos") && <p className="mt-2 text-sm text-[var(--ink-600)]">{config.terms.etecScheduleNote}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {config.groups.filter((group) => !group.etecOnly || data.targetSchool === "etec" || data.targetSchool === "ambos").map((group, index) => <label key={group.id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-[var(--paper-border)] bg-white/70 p-4 has-[:checked]:border-[var(--brand-sage)] has-[:checked]:bg-[var(--paper-soft)]">
          <input {...fieldA11y("groups", errors)} id={index === 0 ? "groups" : `groups-${group.id}`} className={`${checkboxClass} mt-1`} type="checkbox" value={group.id} checked={data.groups.includes(group.id)} onChange={(event) => onToggleGroup(group.id, event.target.checked)} />
          <span><span className="block font-semibold">{group.label}</span><span className="mt-1 block text-sm leading-relaxed">{group.schedule}</span></span>
        </label>)}
      </div>
      <FieldError field="groups" errors={errors} />
    </fieldset>
    <Field field="firstPreference" label="Primera preferencia" errors={errors}>
      <select {...fieldA11y("firstPreference", errors)} className={controlClass} value={data.firstPreference ?? ""} onChange={(event) => onChange("firstPreference", event.target.value ? event.target.value as GroupId : null)}>
        <option value="">{config.noPreferenceLabel}</option>
        {config.groups.filter((group) => data.groups.includes(group.id)).map((group) => <option key={group.id} value={group.id}>{group.label} — {group.schedule}</option>)}
      </select>
    </Field>
    <p className="rounded-xl bg-[var(--paper-soft)] p-4 text-sm leading-relaxed">{config.privacy.sensitiveDataNotice}</p>
    <div className="grid gap-6 sm:grid-cols-2">
      {text("scheduleNotes", "Observaciones sobre horarios (opcional)", { multiline: true, max: MAX_LENGTHS.longText })}
      {text("difficultSubjects", "Materias que presentan mayor dificultad (opcional)", { multiline: true, max: MAX_LENGTHS.longText })}
      {text("pedagogicalNotes", "Observaciones pedagógicas (opcional)", { multiline: true, max: MAX_LENGTHS.longText })}
      {text("referralSource", "Cómo conocieron Ingenium (opcional)")}
    </div>
  </div>;
}
