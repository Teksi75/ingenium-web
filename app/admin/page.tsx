/* eslint-disable @next/next/no-html-link-for-pages -- Plain links avoid prefetch of private/audited reads. */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { readAdminSession } from "@/lib/admin/session";
import { listRegistrations } from "@/lib/admin/registrations";
import { adminDate, groupOptions, MAX_PAGE, optionLabel, PAGE_SIZE, parseRegistrationFilters,
  registrationQuery, schoolOptions, statusOptions, type AdminSearchParams } from "@/lib/admin/registration-options";

const control = "mt-2 min-h-11 w-full rounded-lg border border-[var(--paper-border)] bg-white px-3 py-2 text-sm";
const textLink = "inline-flex min-h-11 items-center text-sm font-semibold text-[var(--brand-copper-deep)] underline underline-offset-4";

export default async function AdminPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const cookie = (await headers()).get("cookie");
  const actor = readAdminSession(cookie);
  const query = await searchParams;
  if (!actor) return <section className="mx-auto max-w-md space-y-5" aria-labelledby="login-title">
    <div>
      <p className="text-sm text-[var(--brand-copper-deep)]">Panel de preinscripciones</p>
      <h1 id="login-title" className="mt-2 text-3xl font-semibold text-[var(--ink-950)]">Ingresar</h1>
      <p className="mt-3 text-sm leading-relaxed">Usá tu correo autorizado. El enlace de acceso se confirma desde este mismo navegador.</p>
    </div>
    {query.sent === "1" && <p role="status" className="rounded-lg border border-[var(--paper-border)] bg-[var(--paper-glow)] p-4 text-sm">Si el correo está autorizado, recibirás un enlace para ingresar.</p>}
    <Card className="md:hover:translate-y-0">
      <form action="/admin/login" method="post" className="space-y-5">
        <label className="block text-sm font-semibold">Correo electrónico
          <input type="email" name="email" required maxLength={254} autoComplete="email" className={control} />
        </label>
        <Button type="submit" size="sm" wrap className="min-h-11">Enviar enlace de acceso</Button>
      </form>
    </Card>
    <p className="text-sm text-[var(--ink-600)]">La sesión dura 8 horas desde el ingreso; visitar el panel no la extiende.</p>
  </section>;

  const filters = parseRegistrationFilters(query);
  const result = await listRegistrations(cookie, query);
  if (result.kind === "unauthorized") redirect("/admin");
  const context = filters ? registrationQuery(filters) : "";
  const active = filters ? [
    filters.escuela && `Escuela: ${optionLabel(schoolOptions, filters.escuela)}`,
    filters.estado && `Estado: ${optionLabel(statusOptions, filters.estado)}`,
    filters.grupo && `Grupo solicitado: ${optionLabel(groupOptions, filters.grupo)}`,
  ].filter(Boolean) : [];
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-sm text-[var(--brand-copper-deep)]">Consulta de solicitudes</p>
        <h1 className="mt-1 text-3xl font-semibold text-[var(--ink-950)]">Preinscripciones</h1>
        <p className="mt-2 text-sm">{actor.role === "admin" ? "Administración" : "Lectura"} · Datos privados, sólo para gestionar las solicitudes.</p>
      </div>
      <form action="/admin/logout" method="post">
        <input type="hidden" name="csrf" value={actor.csrf} />
        <Button type="submit" variant="secondary" size="sm" wrap className="min-h-11">Cerrar sesión</Button>
      </form>
    </div>
    <section aria-label="Filtros de preinscripciones" className="rounded-xl border border-[var(--paper-border)] bg-[var(--paper-glow)] p-4 sm:p-5">
      <form action="/admin" method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
        {([["escuela", "Escuela", schoolOptions], ["estado", "Estado", statusOptions], ["grupo", "Grupo solicitado", groupOptions]] as const).map(([name, label, options]) =>
          <label key={name} className="block min-w-0 text-sm font-semibold">{label}
            <select name={name} defaultValue={filters?.[name] ?? ""} className={control}>
              <option value="">{name === "escuela" ? "Todas las escuelas" : name === "estado" ? "Todos los estados" : "Todos los grupos"}</option>
              {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>)}
        <Button type="submit" size="sm" className="min-h-11">Aplicar filtros</Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {active.length > 0 && <p><span className="font-semibold">Filtros activos:</span> {active.join(" · ")}</p>}
        <a href="/admin" className={textLink}>Limpiar filtros</a>
      </div>
      <p className="text-xs leading-relaxed text-[var(--ink-600)]">Escuela coincide exactamente: «Ambos» es una opción propia. Grupo filtra los solicitados, no el confirmado.</p>
    </section>
    {result.kind === "invalid" && <section role="status" className="space-y-2 rounded-xl border border-[var(--paper-border)] p-5">
      <h2 className="font-semibold">Los filtros no son válidos</h2><p className="text-sm">Elegí las opciones del formulario o limpiá los filtros para continuar.</p>
    </section>}
    {result.kind === "unavailable" && <section role="status" className="space-y-2 rounded-xl border border-[var(--paper-border)] p-5">
      <h2 className="font-semibold">No pudimos cargar las solicitudes</h2><p className="text-sm">El servicio no está disponible en este momento.</p>
      <a href={`/admin${context}`} className={textLink}>Volver a intentar</a>
    </section>}
    {result.kind === "ok" && <section aria-labelledby="results-title" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="results-title" className="text-lg font-semibold">{result.total} solicitudes{active.length ? " con estos filtros" : ""}</h2>
        <p className="text-xs text-[var(--ink-600)]">Más recientes primero · hasta {PAGE_SIZE} por página</p>
      </div>
      {result.items.length === 0 ? <div className="rounded-xl border border-[var(--paper-border)] p-5">
        <p className="font-semibold">{result.total > 0 ? "Esta página no tiene solicitudes" : active.length ? "No hay solicitudes que coincidan" : "Todavía no hay preinscripciones"}</p>
        <p className="mt-2 text-sm">{result.total > 0 ? "Volvé a la primera página conservando los filtros." : active.length ? "Probá con otros filtros o limpiá la selección." : "Las solicitudes aparecerán aquí cuando las familias las envíen."}</p>
        {result.total > 0 && <a href={`/admin${registrationQuery({ ...result.filters, pagina: 1 })}`} className={textLink}>Primera página</a>}
      </div> : <ul className="divide-y divide-[var(--paper-border)] border-y border-[var(--paper-border)]">
        {result.items.map(item => <li key={item.id} className="grid min-w-0 gap-3 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0 space-y-1">
            <a href={`/admin/${item.id}${context}`} className="inline-flex min-h-11 items-center break-words font-semibold text-[var(--ink-950)] underline decoration-[var(--paper-border)] underline-offset-4">{item.student_name}</a>
            <p className="text-xs">{optionLabel(schoolOptions, item.target_school)} · Curso {item.course_year}</p>
            <p className="text-xs text-[var(--ink-600)]">Recibida: {adminDate(item.created_at)} UTC</p>
          </div>
          <div className="space-y-1 text-sm">
            <p>Solicitados: {item.groups.map(group => optionLabel(groupOptions, group)).join(", ")}</p>
            <p className="text-xs text-[var(--ink-600)]">Preferencia: {item.first_preference ? optionLabel(groupOptions, item.first_preference) : "Sin preferencia"}</p>
            {item.confirmed_group && <p className="text-xs">Confirmado: {optionLabel(groupOptions, item.confirmed_group)}</p>}
          </div>
          <span className="w-fit rounded-full border border-[var(--paper-border)] bg-[var(--paper-glow)] px-3 py-1 text-xs font-semibold text-[var(--brand-sage)]">{optionLabel(statusOptions, item.status)}</span>
        </li>)}
      </ul>}
      <nav aria-label="Páginas de solicitudes" className="flex flex-wrap items-center gap-4">
        <p className="text-sm">Página {result.filters.pagina}</p>
        {result.filters.pagina > 1 && <a href={`/admin${registrationQuery({ ...result.filters, pagina: result.filters.pagina - 1 })}`} className={buttonVariants({ variant: "secondary", size: "sm", className: "min-h-11" })}>Anterior</a>}
        {result.filters.pagina < MAX_PAGE && result.total > result.filters.pagina * PAGE_SIZE && <a href={`/admin${registrationQuery({ ...result.filters, pagina: result.filters.pagina + 1 })}`} className={buttonVariants({ variant: "secondary", size: "sm", className: "min-h-11" })}>Siguiente</a>}
      </nav>
      {result.filters.pagina === MAX_PAGE && result.total > MAX_PAGE * PAGE_SIZE && <p className="text-sm">Llegaste al límite de navegación. Usá los filtros para acotar las solicitudes.</p>}
    </section>}
  </>;
}
