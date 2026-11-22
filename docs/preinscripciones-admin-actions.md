# Acciones administrativas de preinscripción (T5 local)

Extiende el [panel de consulta T4](preinscripciones-admin-panel.md): sólo el rol
`admin` vigente ve tres formularios al final del detalle. El rol `reader` conserva
listado y detalle sin controles; cualquier POST de un reader responde 403, incluso
si intenta aportar identidad o rol. No se cambia el ingreso ni su sesión absoluta
de ocho horas. La allowlist se lee del entorno actual, sin cuentas en el código.

## Operación

- **Guardar estado**: recibida, contactada, horario propuesto, convenio enviado o
  lista de espera. No ofrece confirmación ni cancelación. Si la solicitud estaba
  confirmada, quita el grupo asignado y libera el lugar.
- **Confirmar preinscripción**: formulario separado con selector de grupos
  solicitados compatibles con la escuela. La base valida compatibilidad y cupo
  en la transacción; ver un grupo en el selector no reserva una vacante.
- **Cancelar preinscripción**: requiere marcar «Confirmo que quiero cancelar esta
  preinscripción». Conserva los datos enviados y el consentimiento, y libera el
  lugar si estaba confirmada. Para cambiar datos u organizar una nueva solicitud,
  la familia debe volver a enviar el formulario **manualmente** después de la
  cancelación. No hay botón de reorganizar, reenvío de formulario ni envío de correo.
  Cancelar no elimina datos ni adopta una política de retención.

No se edita ningún dato enviado, fecha o versión de consentimiento. No hay DELETE
operativo, campos de actor/rol ni motivo libre. La auditoría del gateway T2 guarda
actor y estado/grupo antes y después, de manera atómica con el cambio; no se agrega
una segunda escritura de auditoría desde la app.

## Contrato del POST

`POST /admin/[id]/status` exige cookie firmada con rol `admin` actual, origen
válido, UUID válido y formulario URL-encoded acotado por `readAdminForm`.
Las únicas claves, todas obligatorias y sin duplicados, son:

| Clave | Regla |
|---|---|
| `status` | Uno de los siete estados existentes. |
| `group` | Grupo conocido no vacío sólo para `confirmada`; cadena vacía para los otros estados, enviada al RPC como `null`. |
| `csrf` | Token de la sesión actual. |
| `confirmCancel` | Exactamente `yes` para `cancelada`; cadena vacía para cualquier otro estado. Un checkbox no marcado no permite cancelar. |

Después de esperar el cuerpo se revalida cookie, rol vigente, vencimiento y CSRF.
La app invoca una sola vez `public.admin_set_registration_status` por el endpoint
`/rest/v1/rpc/admin_set_registration_status`, con actor derivado de la sesión y
sólo ID, estado y grupo. Nunca acepta identidad del navegador ni escribe directo
a tablas. No hay fetch de auditoría para anónimos, readers o pedidos malformados.
Se reutilizan los helpers de auth/HTTP/configuración existentes sin modificarlos.

El transporte es server-only, con service key fuera del bundle cliente,
`cache: no-store`, `redirect: error` y timeout de ocho segundos, sin reintentos.
Sólo un HTTP 200 con la proyección exacta T2 (`id`, `status`, `confirmed_group`,
`confirmed_slot`) coincidente con el pedido, con lugar entero 1–8 al confirmar y
nulo en otros estados, permite 303 al detalle canónico `/admin/[id]`. No se
conservan filtros en este retorno ni se aceptan URLs de destino del navegador.
Los flags GET no muestran éxito ni alteran estado; el detalle relee la base.

- SQLSTATE exacto `P0002`: 404, solicitud no encontrada.
- SQLSTATE exacto `23505` o `23514`: 409, revisar estado/disponibilidad.
- Error de red, JSON inválido, respuesta incompleta/inconsistente u otro error:
  503, «No pudimos confirmar el resultado. Revisá el estado de la solicitud antes
  de volver a intentar». **Consultar el detalle antes de repetir**: el cambio
  podría haberse aplicado aunque no haya llegado una respuesta válida. No se
  afirma éxito ni que los datos/cupos hayan quedado sin cambios.

No se muestran mensajes, detalles o payloads del proveedor ni credenciales.
GET, HEAD, PUT, PATCH, DELETE y OPTIONS responden 405 inerte (`Allow: POST`,
HEAD sin cuerpo). Todas las respuestas del endpoint llevan `private, no-store`,
`noindex, nofollow` y `no-referrer`; no renuevan cookies ni agregan CORS.

## Evidencia y límites

S1: controles sólo admin y denegación en servidor. S2: cancelación sin editar ni
reenviar datos; grupo nulo fuera de confirmada. S3/S4: rol actual del entorno,
actor de cookie y RPC auditado único. S5: vencimiento absoluto preservado y
revalidado después de leer el cuerpo, sin renovación. No reemplaza evidencia SQL
real de inmutabilidad, liberación de cupos o reenvío posterior: esa garantía
pertenece a T1/T2 y sus triggers existentes, no a los mocks de esta unidad.

Las pruebas usan Request/Response reales con fetch sintético, sesiones firmadas y
render React en memoria con headers de Next simulados. No prueban HTTP de Next,
SQL real, SMTP, interacción visual/móvil ni producción. No se desplegó ni se
cambió el formulario público; no acredita readiness productiva ni resuelve la
verificación independiente pendiente de T2/T3. No se ejecuta un nuevo verificador.

Comandos de comprobación local (timeout de 30 segundos por comando):

```text
pnpm exec node --test --test-concurrency=1 tests/admin-status.test.mjs tests/admin-panel.test.mjs tests/admin-auth.test.mjs
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint lib/admin app/admin tests/admin-status.test.mjs
git diff --check
```

RED inicial observado: 26 pasan, 11 fallan (ruta/documento ausentes y controles
sin implementar), exit 1. El handoff registra resultados GREEN, tipos, lint y
comprobación de diff observados; no se atribuyen pruebas reales de SQL/HTTP/SMTP.

## Reversión local

Rollback de T5: retirar como unidad `app/admin/[id]/status/route.ts`,
`lib/admin/registration-actions.ts`, `lib/admin/registration-status-controls.tsx`,
`tests/admin-status.test.mjs` y este documento; revertir sólo el import, texto
introductorio e inserción de controles T5 en `app/admin/[id]/page.tsx` al T4 previo.
Es un límite propuesto, no una operación ejecutada. Preservar T1–T4, auth, SQL,
formulario público e índice. No hay migración ni rollback productivo que aplicar.
