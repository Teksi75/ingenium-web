# Panel privado: consulta local de preinscripciones

T4 agrega ingreso, confirmación explícita del enlace, listado filtrado y detalle
server-rendered. Es una unidad **local y de sólo lectura**: no habilita publicación
ni acredita que producción esté lista. T2/T3 siguen sin su verificación independiente;
esta unidad no repite ni reemplaza esos intentos agotados.

## Recorrido

1. Abrir `/admin`. Sin sesión vigente sólo aparece el formulario de correo, que
   envía `email` por POST a `/admin/login`. `sent=1` muestra siempre el mismo aviso
   genérico, sin revelar si la cuenta está autorizada.
2. Abrir el enlace en el mismo navegador. `/admin/confirm` no verifica ni consume
   nada en GET: exige hash SHA-224 de 56 caracteres hexadecimales minúsculos y
   estado firmado coincidente. Sólo el botón envía `token_hash` y `state` a
   `/admin/verify`. `type=email` se valida y nunca se reenvía; otro tipo se rechaza.
3. Consultar el listado, aplicar filtros y abrir un detalle. Volver al listado
   conserva filtros válidos y página. Los enlaces son HTML sin prefetch para no
   adelantar lecturas de PII ni eventos de auditoría.
4. Cerrar sesión desde el listado. El formulario existente usa exactamente `csrf`.
   Leer la cookie no la renueva: se mantiene el vencimiento absoluto de 8 horas.

La configuración y los contratos de POST siguen en
[autenticación](preinscripciones-admin-auth.md). No se agregan cuentas ni correos
reales al repositorio; la allowlist se resuelve desde el entorno en cada petición.

## Filtros y estados

| Control | Semántica y límite |
|---|---|
| `escuela` | `uncuyo`, `etec`, `ambos`; coincidencia exacta. «Ambos» no significa todas. Vacío omite el filtro. |
| `estado` | Recibida, contactada, horario propuesto, convenio enviado, confirmada, lista de espera o cancelada; valores del gateway T2. |
| `grupo` | `grupo-1` a `grupo-4`, entre los grupos **solicitados**, no el confirmado. |
| `pagina` | Entero decimal canónico 1–201, 50 filas por página, offset máximo 10000. Aplicar filtros vuelve a página 1. |

Un valor inválido, duplicado o fuera de límite no dispara RPC ni se transforma
silenciosamente en una consulta sin filtros. Se muestran filtros activos y una
acción para limpiarlos. El listado distingue colección vacía, ningún resultado,
página vacía y servicio no disponible. El total corresponde a los filtros, no al
catálogo completo; orden del gateway: fecha descendente e ID descendente.

El detalle valida UUID antes del RPC. Ausencia y servicio no disponible tienen
mensajes distintos; sólo el segundo ofrece reintento. Errores del proveedor y
respuestas malformadas nunca se muestran al usuario.

## Límite de datos y autorización

- Home y detalle verifican su propia sesión con `readAdminSession` y
  `await headers()`; no delegan autorización al layout. El adaptador revalida el actor justo
  antes de cada fetch. Una sesión ausente/revocada no llega al backend; el detalle
  redirige únicamente a `/admin`.
- `AdminActor` es la única autoridad de identidad y rol. Filtros y parámetros no
  pueden aportar email, UUID o rol administrativo. Reader y admin tienen la misma
  consulta; T4 no ofrece cambios de estado, cancelación, edición ni borrado.
- Sólo se invocan `admin_list_registrations` y `admin_registration_detail`, por
  POST server-only, con `storageConfig()`, apikey/bearer, un intento, timeout de
  8 segundos, `redirect: error` y `cache: no-store`. El helper de transporte de T3
  es privado: se conserva su patrón, sin modificar la unidad de auth.
- Se valida y reconstruye una proyección nueva: la lista sólo conserva sus diez
  campos T2; el detalle sólo los campos de negocio aprobados en
  [el gateway](preinscripciones-admin-base.md). No se pasan objetos crudos a HTML
  o componentes cliente; nunca se renderizan hashes, clave de idempotencia,
  credenciales ni identidad del actor. Los textos se escapan con React.
- Las lecturas válidas conservan la auditoría atómica del RPC T2. No se agrega
  endpoint JSON público, logging, analítica, recursos externos ni caché compartida.
  El token/estado sólo se incluye en el formulario de confirmación válido; CSRF
  sólo en el formulario autenticado de logout.
- El detalle deja una costura comentada para T5: acciones server-side con el actor
  vigente, nunca autoridad tomada de campos ocultos o query. No hay mutación T5.

## Privacidad de navegación

El layout fuerza renderizado dinámico y metadata `noindex, nofollow` en el
subárbol. `next.config.ts` agrega `/admin/:path*` **después** de las cabeceras
públicas: `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store` y
`Referrer-Policy: same-origin`. Las cabeceras públicas originales se conservan.
`no-referrer` quedó descartado a propósito: con esa política Chrome serializa el
`Origin` como `null` en el POST de navegación del formulario de ingreso, y
`isAdminSameOrigin` —correctamente— lo rechaza con 403.
Sitemap y robots no cambian: bloquear rastreo impediría leer el noindex.

Next puede normalizar Cache-Control al servir páginas dinámicas. Las pruebas de
configuración comprueban las reglas, **no las cabeceras HTTP efectivas**. Sigue
pendiente un smoke de servidor real sobre loopback que confirme no-store/private,
noindex y `same-origin` en `/admin`, confirmación y detalle, sin datos ni secretos
productivos. No se arrancó Next: los comandos delegados sólo autorizan pruebas en
memoria, tipos, lint y diff; un arranque generaría salida fuera de las superficies
editables. Tampoco se realizó inspección visual/browser en desktop o móvil.

## Evidencia y límites por spec

| Spec | Evidencia local de T4 / pendiente |
|---|---|
| S1 | Listado/detalle para ambos roles, filtros exactos, estados recuperables, metadata y cabeceras estructurales. T5 y comprobación HTTP/browser pendientes. |
| S3 | Actor resuelto desde sesión y allowlist actual; cuenta revocada no consulta. Sin configuración privada nueva. |
| S4 | Auth antes de datos, confirmación GET inerte y proyecciones validadas con mocks sintéticos. No prueba SMTP, single-use real, SQL ni verificación independiente de T2/T3. |
| S5 | Lectura de sesión sin escritura/rolling y logout `csrf`; se preservan las 15 pruebas existentes de auth. |
| S6 | Sin consultas ni escrituras productivas, despliegue, SMTP o publicación. No hay evidencia nueva de readiness del formulario público. |

Comandos autorizados, sin generar archivos de compilación:

```text
pnpm exec node --test --test-concurrency=1 tests/admin-panel.test.mjs tests/admin-auth.test.mjs tests/next-config.test.mjs
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint lib/admin app/admin next.config.ts tests/admin-panel.test.mjs tests/next-config.test.mjs
git diff --check
```

RED observado: 15 pass, 12 fail (páginas ausentes y regla privada ausente), sin
crash de imports a nivel suite. Primer GREEN: 27/27, exit 0. TypeScript: exit 0.
El primer lint detectó seis errores de convención Next: cuatro enlaces HTML
intencionales y dos variables locales `module` de los loaders. Corrección acotada:
justificar la ausencia de prefetch en esas páginas y renombrar las variables.
Validación final: **30/30, exit 0**, conservando por separado las tres pruebas
originales de configuración; TypeScript y lint **exit 0**, sin salida. No hubo
timeouts (límite 30 segundos por comando). No se ejecutó build, suite amplia, SQL,
servidor HTTP, email real ni producción. Las pruebas renderizan React en memoria
con `headers`/redirect simulados y fetch sintético; no son un smoke real ni
acreditan cabeceras efectivas o compatibilidad visual. El resultado de
`git diff --check` se informa en el handoff final.

## Reversión local

Retirar como unidad los cuatro archivos de UI (`app/admin/layout.tsx`,
`app/admin/page.tsx`, `app/admin/confirm/page.tsx`, `app/admin/[id]/page.tsx`),
`lib/admin/registrations.ts`, `lib/admin/registration-options.ts`, las dos pruebas
de T4 y este documento; revertir sólo la regla privada agregada a
`next.config.ts`. Esto describe el límite de rollback, no ejecuta borrado ni git.
Conservar íntegros T1–T3, su índice, SQL, auth y formulario público. Coordinar
primero cualquier futura dependencia T5. No hay rollback productivo que ejecutar.
