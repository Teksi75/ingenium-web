import "server-only";
import { preinscripcionConfig } from "@/lib/preinscripcion/config";
import { statusOptions } from "./registration-options";
import type { RegistrationDetail } from "./registrations";

const selectClass = "mt-2 block min-h-11 w-full rounded-lg border border-[var(--paper-border)] bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-copper-deep)]";
const buttonClass = "min-h-11 rounded-lg bg-[var(--brand-copper-deep)] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-copper-deep)]";
const regularStatuses = statusOptions.filter(({ value }) => value !== "confirmada" && value !== "cancelada");

function CommonFields({ csrf }: { csrf: string }) {
  return <>
    <input type="hidden" name="csrf" value={csrf} />
    <input type="hidden" name="confirmCancel" value="" />
  </>;
}

/** Server HTML only. Visibility is convenience, never mutation authorization. */
export default function RegistrationStatusControls({ registration: r, csrf }: {
  registration: RegistrationDetail; csrf: string;
}) {
  const action = `/admin/${r.id}/status`;
  const groups = preinscripcionConfig.groups.filter(group => r.groups.includes(group.id)
    && (!group.etecOnly || r.target_school !== "uncuyo"));
  const currentRegular = regularStatuses.some(({ value }) => value === r.status) ? r.status : "";
  return <section className="space-y-6 border-t border-[var(--paper-border)] pt-5" aria-labelledby="registration-actions">
    <div>
      <h2 id="registration-actions" className="text-lg font-semibold text-[var(--ink-950)]">Gestionar preinscripción</h2>
      <p className="mt-2 text-sm">Sólo se cambia el estado y el grupo confirmado. Los datos enviados y el consentimiento no se editan. Cada cambio queda auditado.</p>
    </div>
    <form action={action} method="post" className="space-y-3">
      <h3 className="font-semibold">Cambiar estado</h3>
      <CommonFields csrf={csrf} />
      <input type="hidden" name="group" value="" />
      <label htmlFor="registration-status" className="block text-sm">Nuevo estado
        <select id="registration-status" name="status" required defaultValue={currentRegular} className={selectClass}>
          <option value="" disabled>Elegí un estado</option>
          {regularStatuses.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <p className="text-sm text-[var(--ink-600)]">Si estaba confirmada, este cambio libera el lugar y quita el grupo asignado. Confirmar y cancelar son acciones separadas.</p>
      <button type="submit" className={buttonClass}>Guardar estado</button>
    </form>
    <form action={action} method="post" className="space-y-3 border-t border-[var(--paper-border)] pt-5">
      <h3 className="font-semibold">Confirmar en un grupo</h3>
      <CommonFields csrf={csrf} />
      <input type="hidden" name="status" value="confirmada" />
      <label htmlFor="registration-group" className="block text-sm">Grupo solicitado
        <select id="registration-group" name="group" required defaultValue={r.confirmed_group ?? ""} className={selectClass}>
          <option value="" disabled>Elegí un grupo</option>
          {groups.map(({ id, label, schedule }) => <option key={id} value={id}>{label} · {schedule}</option>)}
        </select>
      </label>
      <p className="text-sm text-[var(--ink-600)]">Sólo se ofrecen grupos solicitados y compatibles. La disponibilidad se comprueba al confirmar.</p>
      <button type="submit" disabled={groups.length === 0} className={buttonClass}>Confirmar preinscripción</button>
      {groups.length === 0 && <p className="text-sm">No hay grupos compatibles para confirmar esta solicitud.</p>}
    </form>
    <form action={action} method="post" className="space-y-3 border-t border-[var(--paper-border)] pt-5">
      <h3 className="font-semibold">Cancelar preinscripción</h3>
      <input type="hidden" name="csrf" value={csrf} />
      <input type="hidden" name="status" value="cancelada" />
      <input type="hidden" name="group" value="" />
      <p id="cancel-consequences" className="text-sm">Cancelar conserva los datos enviados y el consentimiento; libera el lugar si estaba confirmada. Para cambiar datos u organizar una nueva solicitud, la familia debe volver a enviar el formulario manualmente. No se envía ningún correo automáticamente.</p>
      <label className="flex min-h-11 items-start gap-3 py-2 text-sm" htmlFor="confirm-cancel">
        <input id="confirm-cancel" type="checkbox" name="confirmCancel" required value="yes" aria-describedby="cancel-consequences" className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand-copper-deep)]" />
        Confirmo que quiero cancelar esta preinscripción.
      </label>
      <button type="submit" className={buttonClass}>Cancelar preinscripción</button>
    </form>
  </section>;
}
