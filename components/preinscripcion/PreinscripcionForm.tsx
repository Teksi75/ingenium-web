"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { preinscripcionConfig as config } from "@/lib/preinscripcion/config";
import { advanceStep, availabilityNotice, createDraft, createSubmissionLock, editDraft, prepareAttempt, sendAttempt, stepForErrors, toggleGroup } from "@/lib/preinscripcion/form-state";
import type { FormStep, ValidationErrors } from "@/lib/preinscripcion/types";
import { validateSubmission } from "@/lib/preinscripcion/validation";
import { FormFields, type ChangeField } from "./FormFields";
import { Receipt, Review } from "./Review";

const steps = ["Estudiante", "Responsable", "Horarios y acompañamiento", "Revisión y consentimiento"];

export function FormActions({ step, pending, notice, onBack }: { step: FormStep; pending: boolean; notice: string | null; onBack: () => void }) {
  return <div className="mt-8 flex flex-col gap-3 border-t border-[var(--paper-border)] pt-6 sm:flex-row sm:justify-between">
    {step > 1 ? <Button type="button" variant="secondary" className="min-h-11" wrap disabled={pending} onClick={onBack}>Anterior</Button> : <span />}
    <Button type="submit" className="min-h-11" wrap disabled={pending || (step === 4 && Boolean(notice))}>
      {pending ? "Enviando…" : step === 4 ? "Enviar preinscripción" : "Continuar"}
    </Button>
  </div>;
}

export default function PreinscripcionForm() {
  const [draft, setDraft] = useState(createDraft);
  const [step, setStep] = useState<FormStep>(1);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [publicCode, setPublicCode] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{ id: string } | null>(null);
  const lock = useRef(createSubmissionLock());
  const notice = availabilityNotice();

  useEffect(() => {
    if (focusRequest) document.getElementById(focusRequest.id)?.focus();
  }, [focusRequest]);

  const change: ChangeField = (field, value) => {
    setDraft((current) => {
      if (field !== "targetSchool") return editDraft(current, field, value);
      // Choosing ETec (alone or alongside UNCuyo) pre-selects the Tuesday group,
      // which is reserved for ETec admission; UNCuyo alone cannot take it.
      const school = value as "uncuyo" | "etec" | "ambos" | "";
      const keepsEtec = school === "etec" || school === "ambos";
      const withoutEtec = current.data.groups.filter((id) => id !== "grupo-2");
      const next = editDraft(current, "groups", keepsEtec ? [...withoutEtec, "grupo-2"] : withoutEtec);
      const withSchool = editDraft(next, "targetSchool", school);
      return !keepsEtec && withSchool.data.firstPreference === "grupo-2"
        ? editDraft(withSchool, "firstPreference", null)
        : withSchool;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setMessage("");
  };

  function goTo(next: FormStep) {
    setStep(next);
    setErrors({});
    setMessage("");
    setFocusRequest({ id: "step-heading" });
  }

  function showErrors(nextErrors: ValidationErrors, target: FormStep) {
    setErrors(nextErrors);
    setStep(target);
    const firstField = Object.keys(nextErrors).find((field) => field !== "_form" && field !== "website" && stepForErrors({ [field]: nextErrors[field] }) === target);
    setFocusRequest({ id: firstField ?? "form-status" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || publicCode) return;
    if (step < 4) {
      const next = advanceStep(step, draft.data);
      if (Object.keys(next.errors).length) {
        setMessage("Revisá los campos señalados para continuar.");
        showErrors(next.errors, step);
      } else goTo(next.step);
      return;
    }
    if (notice) { setMessage(notice); setFocusRequest({ id: "form-status" }); return; }
    const validation = validateSubmission(draft.data);
    if (!validation.ok) {
      setMessage("Revisá los campos señalados antes de enviar.");
      showErrors(validation.errors, stepForErrors(validation.errors));
      return;
    }
    if (!lock.current.tryAcquire()) return;
    setPending(true);
    setErrors({});
    setMessage("Enviando la solicitud. Esperá la respuesta antes de salir de esta página.");
    try {
      const attempt = prepareAttempt(draft.data, draft.attempt, () => crypto.randomUUID());
      setDraft((current) => ({ ...current, attempt }));
      const result = await sendAttempt(attempt);
      if (result.ok) {
        setPublicCode(result.publicCode);
        setMessage("Solicitud recibida. Consultá tu número público de solicitud.");
        setFocusRequest({ id: "receipt-title" });
      } else {
        setMessage(`${result.message} Tus datos se conservan mientras permanezcas en esta página.`);
        showErrors(result.errors, stepForErrors(result.errors));
        lock.current.release();
      }
    } catch {
      setMessage("No pudimos iniciar el envío. Tus datos siguen en el formulario. Podés reintentar desde un navegador actualizado con conexión segura.");
      setFocusRequest({ id: "form-status" });
      lock.current.release();
    } finally {
      setPending(false);
    }
  }

  return <div>
    {!publicCode && <>
      <ol aria-label="Pasos de la preinscripción" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={`min-w-0 border-t-2 pt-3 text-sm ${step === index + 1 ? "border-[var(--brand-sage)] font-semibold text-[var(--brand-sage)]" : "border-[var(--paper-border)] text-[var(--ink-600)]"}`}>
          <span className="mb-1 block text-xs uppercase tracking-widest">Paso {index + 1}</span>{label}
        </li>)}
      </ol>
      <p className="mb-6 text-sm leading-relaxed text-[var(--ink-600)]">Los datos se conservan solo en memoria mientras avanzás entre pasos. Si recargás o cerrás esta página, se perderá el borrador. Los campos opcionales están indicados.</p>
    </>}
    {notice && !publicCode && <p className="mb-6 rounded-xl border border-[var(--brand-copper)] bg-[var(--paper-soft)] p-4 font-semibold">{notice} Podés consultar al instituto desde <a href={config.privacy.contactHref} className="underline underline-offset-4">Contacto</a>.</p>}
    <div id="form-status" role="status" aria-live="polite" aria-atomic="true" tabIndex={-1} className="mb-5 whitespace-pre-wrap text-sm font-medium text-[var(--ink-800)] focus-visible:outline-2 focus-visible:outline-offset-4">
      {message}{errors._form ? ` ${errors._form}` : ""}{errors.website ? ` ${errors.website}` : ""}
    </div>
    {publicCode ? <Receipt publicCode={publicCode} /> : <form method="post" action="/api/preinscripcion" noValidate onSubmit={submit} aria-busy={pending} aria-labelledby="step-heading">
      <h2 id="step-heading" tabIndex={-1} className="mb-6 font-display text-2xl font-semibold text-[var(--ink-950)] focus-visible:outline-2 focus-visible:outline-offset-4">{step}. {steps[step - 1]}</h2>
      <fieldset disabled={pending} className="min-w-0">
        <legend className="sr-only">{steps[step - 1]}</legend>
        <div hidden aria-hidden="true">
          <label htmlFor="website">Dejar vacío</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={draft.data.website} onChange={(event) => change("website", event.target.value)} />
        </div>
        {step === 4
          ? <Review data={draft.data} errors={errors} onChange={change} onEdit={goTo} />
          : <FormFields step={step} data={draft.data} errors={errors} onChange={change} onToggleGroup={(id, checked) => {
            setDraft((current) => toggleGroup(current, id, checked));
            setErrors((current) => {
              const next = { ...current }; delete next.groups; delete next.firstPreference; return next;
            });
            setMessage("");
          }} />}
      </fieldset>
      <FormActions step={step} pending={pending} notice={notice} onBack={() => goTo((step - 1) as FormStep)} />
    </form>}
  </div>;
}
