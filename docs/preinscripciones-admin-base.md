# Gateway privado de administración (fase 1)

Esta unidad agrega lectura y cambios de estado con auditoría atómica. Sólo el
backend de confianza puede invocar los RPC con `service_role`; no habilita acceso
directo al esquema privado ni entrega un panel, sesión o login todavía.

## Límite de confianza

- La service key nunca llega al navegador. Los RPC revocan ejecución a `PUBLIC`,
  `anon` y `authenticated`; las tablas y funciones privadas siguen revocadas.
- El servidor debe resolver UUID/email desde identidad verificada y el rol desde
  `ADMIN_ALLOWLIST` en el entorno, en cada petición. Email/rol enviados por el
  usuario **no son autoridad**, aunque tengan formato válido. PostgreSQL valida
  forma y permisos reader/admin; no autentica al usuario ni consulta la allowlist.
- Usar únicamente direcciones sintéticas en pruebas, por ejemplo
  `reader@example.invalid` y `admin@example.invalid`. No guardar cuentas reales.

## Contrato estable para el servidor

Todos los argumentos iniciales son `p_actor_id uuid, p_actor_email text,
p_actor_role text`. Email debe ser no nulo, normalizado en minúsculas, sin espacios
externos, con formato de correo y máximo 254 caracteres; rol: `reader` o `admin`.

| RPC público | Argumentos posteriores, en orden | Resultado |
|---|---|---|
| `admin_list_registrations` | `p_school text = null, p_status text = null, p_group text = null, p_limit integer = 50, p_offset integer = 0` | `{items: [...], total: number}` |
| `admin_registration_detail` | `p_id uuid` | Objeto de detalle o `null` si no existe |
| `admin_set_registration_status` | `p_id uuid, p_status text, p_group text = null` | `{id, status, confirmed_group, confirmed_slot}`; sólo admin |
| `admin_log_event` | `p_action text` | `void`; sólo `login`, `logout`, `access_denied` |

**Filtros:** escuela es `target_school`: `uncuyo`, `etec`, `ambos` (coincidencia
exacta). Grupo es **grupo solicitado**, `p_group = ANY(groups)`, no grupo
confirmado. Se aceptan `grupo-1` a `grupo-4`. Los estados son `recibida`,
`contactada`, `horario_propuesto`, `convenio_enviado`, `confirmada`, `lista_espera`,
`cancelada`. Los filtros nulos se omiten; otros valores inválidos se rechazan.
Límite 1–100 y offset 0–10000, ambos no nulos. Orden: `created_at DESC, id DESC`.
Total y página comparten snapshot; una página vacía devuelve `items: []`.

**Datos expuestos:** lista sólo proyecta `id`, `public_code`, `student_name`,
`target_school`, `status`, `groups`, `confirmed_group`, `created_at`, `course_year`,
`first_preference`. Detalle proyecta explícitamente todos los datos de negocio,
contacto, consentimiento, versiones y fechas; nunca `idempotency_key`,
`request_hash` ni `student_hash`. El detalle contiene PII: el servidor posterior
debe proteger autorización, `no-store` y evitar logs de respuestas.

**Cambios:** confirmar exige grupo válido y compatible; fuera de `confirmada`,
el grupo debe ser nulo. La función bloquea la fila antes de capturar el estado
anterior y llama al setter privado existente. Los triggers originales conservan
inmutabilidad, capacidad y slots. No se agregan restricciones de transición ni
edición de datos enviados. No hay RPC de borrado. Cancelar conserva consentimiento
y libera el slot; el reenvío de la familia sigue siendo una inscripción nueva.

| Error | SQLSTATE |
|---|---|
| Actor inválido o reader intentando cambiar estado | `42501` |
| Filtro/paginación/estado/grupo/evento inválido | `22023` |
| ID desconocido en cambio de estado (también nulo) | `P0002` |
| Capacidad, incompatibilidad o conflicto de unicidad | Los errores existentes de PostgreSQL (`23514`, `23505`) |

## Auditoría y privacidad

`prereg_private.admin_audit_events` es privada, sin políticas RLS de acceso y sin
lectura de auditoría expuesta al navegador. Registra UUID de evento, fecha,
UUID/email/rol del actor, acción, ID opcional de inscripción, estados/grupos
anterior y posterior, y `request_id` UUID generado por evento (no un ID de petición
HTTP aportado por el cliente). No guarda filtros, payloads, hashes, tokens ni
contactos de familias. El email del actor es PII administrativa: limitar su acceso.

Lista siempre audita; detalle sólo cuando existe. Estado y auditoría se confirman
en la misma transacción, con valores reales antes/después; cancelar usa `cancel`,
los otros cambios `status_change`. Si falla la auditoría, la lectura falla cerrada
y el cambio de estado se revierte. El RPC de eventos no permite falsificar acciones
de modificación. UPDATE, DELETE y TRUNCATE de auditoría se rechazan por triggers,
incluso para el propietario en uso normal; un administrador con poder DDL sigue
siendo autoridad de confianza. No hay FK a inscripciones: su futura eliminación
separada de fase 2 no debe destruir ni bloquear el historial.

## Verificación y reversión

- Los tests Node son **estructurales**; no prueban ejecución SQL ni privilegios
  reales. Ejecutar el comando de la unidad desde la raíz del repositorio.
- Pruebas PostgreSQL: `supabase/tests/prereg_admin_gateway.sql`, **no ejecutadas**
  en el entorno de implementación por falta de runner. Requieren base aislada
  vacía, roles compatibles con Supabase y las tres migraciones en orden. Ejecutar
  como postgres con `psql -X -v ON_ERROR_STOP=1`; cerrar conexión ante error.
- El script usa RPC reales y cambios locales de rol. Comprueba contratos, denegación,
  snapshots sin cambios ante errores, capacidad, auditoría y fallos de auditoría.
  Todo queda dentro de `BEGIN`/`ROLLBACK`, incluidos helpers y trigger de fallo.
- Límite de reversión: estos cuatro archivos forman una unidad local sobre T1.
  Retirarlos antes de aplicar la migración no cambia T1. Si se aplicara en un
  entorno autorizado, no borrar historial de auditoría: una reversión de permisos
  requiere otra migración revisada; no se proporciona down destructivo.

No se aplicó esta migración a producción ni se consultaron/envíaron datos, se
configuró SMTP o se desplegó nada. Esta unidad no demuestra disponibilidad actual
del formulario productivo ni habilita el panel. Sesión, auth, UI, noindex/no-store
y readiness integrado siguen siendo unidades posteriores. No incluye decisiones
de retención/derechos ni los seguimientos excluidos por el alcance de fase 1.
