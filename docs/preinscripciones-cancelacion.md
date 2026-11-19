# Cancelar y recibir una nueva preinscripción

**Cambio preparado, migración NO aplicada.** Permite una nueva solicitud del mismo
estudiante/ciclo después de cancelar la anterior, sin editar ni borrar evidencia
histórica. Las pruebas Node son **ESTRUCTURALES**: no prueban ejecución SQL.
La prueba real de esta migración está **NO EJECUTADA**: no hay `psql`, Docker ni
Supabase CLI disponibles en este entorno. No se instaló nada ni se accedió a producción.

## Flujo manual

1. Un responsable técnico autorizado cancela la solicitud mediante la función
   existente `prereg_private.set_registration_status(id_interno, 'cancelada')`.
   No editar datos enviados, consentimientos ni recibos; no deshabilitar el trigger.
   Mientras no exista el panel autorizado, seguir el acceso restringido de la
   [guía de operación](preinscripciones-supabase.md#administración-segura-sin-panel).
2. La familia vuelve a completar y enviar el formulario: **nuevo envío y nueva
   clave**, no un reintento de la solicitud anterior. No hay reenvío automático,
   email automático ni botón administrativo que copie o modifique el formulario.
3. Se crea otra fila con otro recibo y sus propios consentimientos. La fila
   cancelada permanece completa. Reintentar con la clave antigua conserva el
   recibo antiguo, incluso si ya existe una solicitud nueva activa.

Una solicitud activa del mismo estudiante/ciclo sigue siendo duplicada: no recibe
comprobante ni consume cuota. Cancelar libera el slot si estaba confirmada, pero
**no devuelve cuota diaria**. La nueva alta consume una de las cinco altas por
contacto/día UTC; no confirma ni reserva vacante. Nunca borrar solicitudes para
permitir otro envío. El índice también impide reactivar una fila cancelada si ya
existe otra activa del mismo estudiante/ciclo.

## Verificación aislada, en orden

Sólo con autorización separada, como `postgres`, en una base **desechable vacía**
compatible con Supabase (roles `anon`, `authenticated`, `service_role` existentes).
El servicio local `ingenium_prereg_test` debe apuntar exclusivamente a esa base,
configurado fuera del repositorio y sin credenciales en comandos/historial.

**NUNCA volver a ejecutar la migración inicial no idempotente en producción.**
El primer comando es únicamente para preparar una base aislada nueva; si la inicial
ya está aplicada, no repetirla. La actualización de una base existente usa sólo la
migración nueva, previa revisión y autorización específica; esta guía no las concede.

```sh
PGSERVICE=ingenium_prereg_test psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202608130001_preinscripciones.sql
PGSERVICE=ingenium_prereg_test psql -X -v ON_ERROR_STOP=1 -f supabase/migrations/202611170001_prereg_cancelled_resubmission.sql
PGSERVICE=ingenium_prereg_test psql -X -v ON_ERROR_STOP=1 -f supabase/tests/preinscripciones.sql
PGSERVICE=ingenium_prereg_test psql -X -v ON_ERROR_STOP=1 -f supabase/tests/prereg_cancelled_resubmission.sql
```

Detenerse ante cualquier error. Ambos scripts de pruebas revierten sus fixtures;
los nuevos usan sólo contactos sintéticos `.invalid`. El script anterior verifica
permisos/RLS, errores, cuotas, limpieza y capacidad después de ambas migraciones.
El nuevo verifica respuestas exactas de duplicado/replay/conflicto/límite, filas y
contadores intactos al rechazar, consentimiento histórico, recibo nuevo y slot
reutilizable tras cancelar. No sustituye las carreras concurrentes de la guía base
ni la comprobación de esquemas expuestos en la plataforma.

Sin base, desde la raíz, sólo comprobación estructural:

```sh
pnpm exec node --test --test-concurrency=1 tests/preinscripcion-sql.test.mjs tests/preinscripcion-cancelled-sql.test.mjs
```

## Límite de reversión y estado operativo

Antes de aplicar, esta unidad se puede retirar junto con sus pruebas y esta nota.
La migración usa una transacción: un fallo revierte el cambio completo. Una vez
aplicada y aceptadas nuevas solicitudes, **no restaurar a ciegas** la unicidad
antigua: los históricos cancelados pueden compartir estudiante/ciclo. Requeriría
una nueva migración revisada y una decisión explícita de compatibilidad, nunca
borrar/editar evidencia ni reaplicar la migración inicial para revertir.

Esta entrega no prueba la recepción actual en producción ni autoriza abrir el
formulario a familias: no hubo envíos, migraciones, despliegues ni configuración
SMTP productivos. La evidencia previa es independiente; faltan ejecución SQL real
de este cambio y la revisión integrada del panel. No se implementan aquí auth,
auditoría ni UI; los permisos privados existentes se conservan.
