import { preinscripcionConfig, targetSchoolOptions } from "@/lib/preinscripcion/config";

export const schoolOptions = targetSchoolOptions;
export const groupOptions = preinscripcionConfig.groups.map(({ id, label }) => ({ value: id, label }));
export const statusOptions = [
  { value: "recibida", label: "Recibida" },
  { value: "contactada", label: "Contactada" },
  { value: "horario_propuesto", label: "Horario propuesto" },
  { value: "convenio_enviado", label: "Convenio enviado" },
  { value: "confirmada", label: "Confirmada" },
  { value: "lista_espera", label: "Lista de espera" },
  { value: "cancelada", label: "Cancelada" },
] as const;
export type AdminSearchParams = Record<string, string | string[] | undefined>;
export interface RegistrationFilters {
  escuela: string | null;
  estado: string | null;
  grupo: string | null;
  pagina: number;
}
export const PAGE_SIZE = 50;
export const MAX_PAGE = 201; // T2's maximum offset 10000, fixed pages of 50.
type Option = { readonly value: string; readonly label: string };
export function isOption(options: readonly Option[], value: unknown): value is string {
  return typeof value === "string" && options.some(option => option.value === value);
}
export function optionLabel(options: readonly Option[], value: string | null): string {
  return options.find(option => option.value === value)?.label ?? "Sin asignar";
}
export function parseRegistrationFilters(query: AdminSearchParams): RegistrationFilters | null {
  const { escuela, estado, grupo, pagina } = query;
  for (const [value, options] of [[escuela, schoolOptions], [estado, statusOptions], [grupo, groupOptions]] as const) {
    if (value !== undefined && value !== "" && !isOption(options, value)) return null;
  }
  if (pagina !== undefined && (typeof pagina !== "string" || !/^[1-9][0-9]{0,2}$/.test(pagina)
    || Number(pagina) > MAX_PAGE)) return null;
  return { escuela: (escuela || null) as string | null, estado: (estado || null) as string | null,
    grupo: (grupo || null) as string | null, pagina: pagina === undefined ? 1 : Number(pagina) };
}
/** Only canonical validated list context, never a browser-selected destination. */
export function registrationQuery(filters: RegistrationFilters): string {
  const query = new URLSearchParams();
  for (const key of ["escuela", "estado", "grupo"] as const) if (filters[key]) query.set(key, filters[key]);
  if (filters.pagina !== 1) query.set("pagina", String(filters.pagina));
  return query.size ? `?${query}` : "";
}
export function adminDate(value: string, dateOnly = false): string {
  return new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", dateStyle: "medium",
    ...(dateOnly ? {} : { timeStyle: "short" as const }) }).format(new Date(value));
}
