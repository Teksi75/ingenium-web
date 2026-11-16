# Preinscripciones: operación privada de Supabase

## Estado y límites

Implementación preparada para `/api/preinscripcion`, ciclo de cursado **2027**, ingreso **2028**. No se aplicaron migraciones ni se usaron proyectos remotos, credenciales o datos reales. Las pruebas Node del SQL son **estructurales**, no ejecutan PostgreSQL. Falta la prueba real de migración, privilegios, escritura/lectura autorizada y concurrencia en un entorno desechable autorizado. No habilitar producción sin esa evidencia y revisión independiente de permisos/capacidad.

Una solicitud recibida **no confirma una vacante**. El servidor toma ciclo, ingreso y versiones del contrato de `lib/preinscripcion/config.ts`, nunca del navegador. No hay consulta pública de recibos, vistas públicas ni API administrativa.

## Configuración del servidor

Faltan los valores de conexión de un proyecto **no productivo** autorizado:

| Variable (sólo servidor) | Valor que debe configurar el operador |
| --- | --- |
| `SUPABASE_URL` | URL HTTPS del proyecto, sin ruta, usuario, contraseña ni parámetros; ejemplo ficticio `https://your-nonproduction-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role` del mismo proyecto. Nunca clave anónima, nunca en frontend. |
| `PREINSCRIPCION_RATE_SECRET` | Opcional: secreto aleatorio independiente de al menos 32 caracteres. Si falta se usa la clave de servicio con separación de dominio. |

No usar nombres `NEXT_PUBLIC_*`, pegar claves en documentación/chat, commitearlas, registrarlas ni enviarlas al navegador. El usuario está autorizado a configurar por separado los valores reales únicamente en el entorno cifrado del **runtime servidor**, con acceso mínimo. No se creó `.env.example` porque el guard de rutas sensibles bloqueó su escritura; no se reintentó ni se eludió esa protección. `.env*` permanece ignorado sin excepciones. Las variables ausentes o inválidas cierran la API con 503. Un secreto de rate limit explícito demasiado corto también cierra el servicio. Un cambio de secreto/clave reinicia la identidad de los contadores del día; coordinar rotación y no usarla para eludir límites.

No se requieren cookies ni Supabase en el frontend. La dependencia `server-only` separa el código privilegiado del cliente. La ruta usa `fetch` REST RPC, timeout de **8 segundos**, sin redirecciones ni reintentos automáticos. Oculta errores internos y no registra PII, claves ni hashes.

## Migración y preproducción (requiere autorización)

1. Crear/elegir manualmente un proyecto de pruebas desechable, con autorización explícita. No vincular producción. Confirmar región, responsables autorizados y restricciones de tratamiento de datos de menores.
2. Revisar `supabase/migrations/202608130001_preinscripciones.sql` con el responsable de seguridad. Ejecutarla una sola vez como `postgres` mediante una conexión administrativa autorizada o SQL Editor de Supabase. No es una migración idempotente para reaplicar a ciegas.
3. En la configuración de Data API, comprobar **antes y después** que `prereg_private` **no** figura entre los esquemas expuestos. No agregarlo a esquemas extra ni crear vistas públicas. Los tests de catálogo no pueden probar esta configuración de la plataforma.
4. Ejecutar el script de pruebas SQL de abajo como `postgres` en esa base vacía. Usa sólo fixtures sintéticos dentro de `BEGIN` / `ROLLBACK`. Detener ante cualquier error. Confirmar permisos anon/authenticated, RLS y límite real de nueve confirmaciones.
5. Probar también con claves de prueba anon/authenticated que no se puede ejecutar el RPC, leer tablas privadas ni cambiar estados (denegación esperada). Con la clave de servicio sólo debe existir el RPC de creación; no lectura ni función administrativa. No copiar claves a comandos registrados ni guardar sus respuestas con PII.
6. Ejecutar la prueba concurrente descrita más abajo. Conservar resultados sanitizados (resultados/SQLSTATE, no datos ni credenciales).
7. Configurar el entorno servidor no productivo y probar una solicitud sintética por la página, respuesta mínima y lectura autorizada en SQL Editor. Probar pérdida de respuesta y reintento con **la misma clave**. Verificar que ninguna confirmación se anuncia sin persistencia.
8. Revisar la exposición de esquemas, permisos, acceso del equipo, retención y aviso de privacidad antes de cualquier habilitación productiva. Migración remota, despliegue, creación de proyecto y cambios de secretos requieren autorización separada.

La migración crea tablas en `prereg_private`, RLS habilitado sin políticas públicas y sin permisos de esquema/tablas para `anon`, `authenticated` **ni `service_role`**. `service_role` puede saltar RLS, pero no los privilegios de objeto revocados. El único puente es `public.submit_preinscripcion`, `SECURITY DEFINER`, `search_path = ''`, objetos cualificados y ejecución revocada de `PUBLIC`, `anon`, `authenticated`, concedida sólo a `service_role`. Aplicar como `postgres` conserva ese propietario confiable. Los administradores propietarios siguen teniendo acceso intencional; RLS no es protección frente al propietario.

## Contrato HTTP y reintentos

`POST /api/preinscripcion`, `Content-Type: application/json` (opcional `charset=utf-8`), `Origin` exacto del URL de la petición o del origen canónico institucional y `Idempotency-Key` UUID requerido. Sin origen se rechaza; no hay CORS comodín. Para el servidor local de producción, Next puede normalizar `Request.url` a `localhost` aunque el navegador acceda por `127.0.0.1`: sólo se admite ese alias loopback con HTTP, mismo puerto y coincidencia exacta del `Host` real. No se admiten alias externos. Cabeceras reenviadas, IP o supuestos privilegios enviados por cliente no otorgan autoridad. Todas las respuestas de la ruta son `Cache-Control: no-store` y `X-Robots-Tag: noindex, nofollow`; los demás métodos devuelven 405 sin acceso a datos.

Se lee el stream con máximo **16 KiB reales**, incluso sin `Content-Length`. Validación compartida, honeypot vacío, listas permitidas, longitudes y consentimientos literalmente `true` antes de acceder a la base. Nunca enviar año, estado, versiones/fechas de consentimiento ni campos adicionales.

- 201 creación / 200 reintento confirmado: únicamente `{ "publicCode": "UUID impredecible" }`.
- 400 datos/JSON/clave inválidos; puede incluir `errors` por campo.
- 403 origen inválido; 413 exceso de bytes; 415 tipo incorrecto.
- 409 clave reutilizada con otro contenido o estudiante duplicado: **mismo mensaje genérico**, nunca devuelve el recibo anterior bajo otra clave.
- 429 límite diario; `Retry-After: 86400` conservador.
- 503 configuración ausente, ciclo no abierto, error/timeout de almacenamiento o recibo inválido. Conservar datos y **la clave original** al reintentar. No generar una nueva clave por un error incierto.

El hash SHA-256 canónico incorpora datos normalizados, grupos ordenados, ciclo, ingreso y versiones del programa/privacidad. El dedupe es por ciclo + nombre normalizado en minúsculas + nacimiento + email normalizado. No intenta resolver personas distintas con nombres similares ni variantes ortográficas. Un bloqueo transaccional por clave serializa reintentos; el índice único de estudiante resuelve carreras entre claves distintas. Un recibo se devuelve sólo al confirmar un resultado válido del RPC. Rotar versiones/ciclo cambia el hash: no hacerlo a mitad de una ventana operativa sin tratar reintentos pendientes (pueden recibir 409).

Límite de **5 altas por contacto email y día UTC**. La base conserva sólo HMAC-SHA256 del contacto y contador diario, no IPs. Las solicitudes inválidas, duplicadas, claves conflictivas y fallos no incrementan contadores; los reintentos confirmados tampoco. Contador e inserción están en la misma transacción/subtransacción. Cada alta limpia hasta 100 ventanas con más de dos días de antigüedad usando índice y `SKIP LOCKED`; sin tráfico pueden quedar ventanas antiguas pendientes, nunca un historial de IPs. No sustituye protección DDoS del proveedor ni evita abuso distribuido con muchos emails.

## Administración segura sin panel

Sólo personal explícitamente autorizado, cuentas individuales del proyecto Supabase, **MFA obligatoria**, permisos mínimos, revisión periódica y baja inmediata de accesos. No compartir cuenta `postgres`, claves de servicio ni enlaces con resultados. Mientras no haya un rol administrativo restringido revisado, el SQL Editor con rol `postgres` queda limitado a responsables técnicos de confianza; no otorgar SQL Editor a todo el equipo. No confundir `authenticated` (usuarios de la app) con autorización administrativa.

Ejemplos con marcadores que el operador reemplaza localmente; nunca pegar datos reales en tickets o historial público:

```sql
-- Lista mínima por ciclo/escuela/estado/grupo; NO select * ni exportación masiva.
select id, public_code, created_at, status, groups, first_preference
from prereg_private.registrations
where course_year = 2027 and target_school = 'uncuyo' and status = 'recibida'
  and 'grupo-1' = any(groups)
order by created_at limit 50;

-- Contacto sólo cuando sea necesario y para una solicitud autorizada.
select guardian_name, whatsapp, email
from prereg_private.registrations where id = '<UUID_INTERNO>'::uuid;

-- Un UUID INTERNO, no un código público usado como credencial.
begin;
select prereg_private.set_registration_status('<UUID_INTERNO>'::uuid, 'contactada');
commit;

-- Confirmación explícita: el grupo debe ser compatible y del mismo ciclo.
begin;
select prereg_private.set_registration_status('<UUID_INTERNO>'::uuid, 'confirmada', 'grupo-1');
commit;

-- Transferencia: conserva la misma solicitud; asigna destino y libera origen.
select prereg_private.set_registration_status('<UUID_INTERNO>'::uuid, 'confirmada', 'grupo-2');
-- Cancelación/lista de espera liberan el slot en esa misma transacción.
select prereg_private.set_registration_status('<UUID_INTERNO>'::uuid, 'cancelada');
```

Estados permitidos: `recibida`, `contactada`, `horario_propuesto`, `convenio_enviado`, `confirmada`, `lista_espera`, `cancelada`. No se impone un embudo de estados comercial adicional. Todas las escrituras, incluso INSERT/UPDATE privilegiados directos, pasan por el trigger: fila del grupo bloqueada, slot persistido asignado entre 1 y capacidad, unicidad `(course_year, confirmed_group, confirmed_slot)` y CHECK 1..8. La capacidad/configuración del grupo es inmutable; una futura modificación necesita migración revisada. El trigger no permite confirmar sin grupo compatible; tampoco mover una solicitud a otro ciclo. Un cambio de estado actualiza `updated_at`. Cancelar, pasar a espera, eliminar por retención autorizada o transferir libera capacidad; una preinscripción nunca la ocupa. Nunca deshabilitar triggers/constraints ni modificarlos para forzar una novena vacante.

Con transacciones concurrentes puede producirse espera, error de cupo, unicidad, serialización o deadlock. No se confirma parcialmente: hacer rollback y revisar disponibilidad antes de un nuevo intento administrativo completo. No reintentar automáticamente ni mostrar éxito tras un error. Es posible que una liberación concurrente todavía no visible obligue a reintentar; se favorece seguridad sobre disponibilidad.

Los datos originales/consentimientos/recibos son inmutables por la operación administrativa ordinaria. Rectificación o supresión requieren un procedimiento privilegiado separado, revisado y autorizado; no deshabilitar el trigger de manera improvisada. Decisión pendiente antes de producción: **responsable, plazo y procedimiento de retención/supresión, respaldo y atención de derechos**, incluida la conservación de evidencia de consentimiento y tratamiento de claves de reintento. No inventar un plazo legal. Exportar únicamente campos/filas imprescindibles con autorización, destino cifrado, acceso limitado y fecha de eliminación; no descargar datos de menores a equipos/correos personales.

## Pruebas

En el repositorio (no requieren credenciales):

```sh
pnpm exec node --test tests/preinscripcion-api.test.mjs tests/preinscripcion-sql.test.mjs
pnpm exec tsc --noEmit --incremental false
```

La API se prueba por Request/Response reales con sólo `fetch` Supabase simulado; `server-only` se sustituye exclusivamente en el loader de pruebas en memoria. No se prueba contra almacenamiento privado simulado ni se instalan dependencias.

Para un operador con PostgreSQL y autorización en **base desechable vacía**, usar SQL Editor o un servicio local de conexión de prueba configurado fuera del repositorio; no incluir contraseñas en comandos/historial:

```sh
PGSERVICE=ingenium_prereg_test psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202608130001_preinscripciones.sql
PGSERVICE=ingenium_prereg_test psql -X -v ON_ERROR_STOP=1 -f supabase/tests/preinscripciones.sql
```

No se ejecutaron aquí: no están disponibles psql, Docker, CLI ni MCP Supabase. `supabase/tests/preinscripciones.sql` incluye privilegios/RLS, replay/conflicto/dedupe, contador transaccional, expiración, consentimiento, longitudes, octava/novena confirmación, INSERT/UPDATE directos, compatibilidad/ciclo, cancelación, transferencia y timestamps, con rollback integral. Debe pasar antes de considerar probada la migración.

### Procedimiento concurrente (dos sesiones PostgreSQL)

Sólo en un proyecto de pruebas desechable, migrado y vacío. El script anterior revierte sus fixtures; este procedimiento necesita fixtures **confirmados/committed** visibles a dos sesiones. No usar datos ni grupos operativos; el propietario destruye después el entorno desechable mediante un procedimiento autorizado.

Preparación en una sesión administrativa (ninguna fila previa de `registrations`):

```sql
begin;
do $$
declare n integer; k uuid; rid uuid; d jsonb := '{"studentName":"Carrera Ficticia","birthDate":"2014-01-01","primarySchool":"Ficticia","targetSchool":"etec","guardianName":"Responsable Ficticio","relationship":"tutor","whatsapp":"5492615550101","email":"race@example.test","groups":["grupo-4"],"acceptedProgram":true,"acceptedPrivacy":true,"website":""}'::jsonb;
begin
  if exists(select 1 from prereg_private.registrations) then raise exception 'requires empty disposable DB'; end if;
  for n in 1..9 loop
    k := md5('race-key:' || n)::uuid;
    perform public.submit_preinscripcion(k, repeat(md5('race-request:' || n),2), repeat(md5('race-student:' || n),2), repeat(md5('race-contact:' || n),2), 2027,2028,'1','1',d);
    select id into strict rid from prereg_private.registrations where idempotency_key = k;
    if n <= 7 then perform prereg_private.set_registration_status(rid,'confirmada','grupo-4'); end if;
  end loop;
end; $$;
commit;
```

1. Sesión A: `BEGIN; SELECT prereg_private.set_registration_status((SELECT id FROM prereg_private.registrations WHERE idempotency_key = md5('race-key:8')::uuid), 'confirmada', 'grupo-4');` **No confirmar la transacción todavía.**
2. Sesión B: `BEGIN; SELECT prereg_private.set_registration_status((SELECT id FROM prereg_private.registrations WHERE idempotency_key = md5('race-key:9')::uuid), 'confirmada', 'grupo-4');` Debe esperar a A.
3. A: `COMMIT;`. B debe rechazar por cupo/constraint (nunca éxito con nueve), luego B: `ROLLBACK;`.
4. Verificar en nueva transacción que `SELECT count(*), count(DISTINCT confirmed_slot) FROM prereg_private.registrations WHERE course_year=2027 AND confirmed_group='grupo-4';` devuelve **8,8**; la novena sigue `recibida` sin slot.
5. Repetir desde un entorno desechable nuevo invirtiendo A/B y con UPDATE directo para el intento noveno. Probar transferencia hacia un grupo lleno: falla y mantiene asignación anterior. No deshabilitar restricciones para preparar pruebas.
6. Carrera de idempotencia: en dos sesiones, ejecutar `public.submit_preinscripcion` con la misma nueva clave UUID, mismos hashes/payload sintéticos (usar el JSON anterior y hashes distintos de los nueve fixtures). Dejar A sin commit; B espera. Al hacer commit A, B devuelve `replayed` con el **mismo** código. Sólo una fila y un incremento del contador. Repetir con distinta clave pero mismo student_hash: B devuelve sólo `duplicate`, sin código ni incremento. Repetir con misma clave y distinto request_hash: sólo `conflict` sin incremento. Registrar exclusivamente resultados sanitizados.

Los tests de texto no sustituyen estas carreras reales ni la inspección de esquemas expuestos en Supabase.

## Ciclos siguientes

Cambiar el ciclo/configuración compartida mediante un cambio revisado; agregar **nuevas filas** `cycle_groups` para ese ciclo en otra migración versionada (con capacidad <=8). No modificar/reutilizar filas antiguas, no borrar solicitudes anteriores ni cambiar URL pública. La FK/grupos del trigger exigen el mismo ciclo. Actualizar los tests y las versiones de consentimiento cuando cambie el contenido; no alterar versiones de aceptaciones históricas.
