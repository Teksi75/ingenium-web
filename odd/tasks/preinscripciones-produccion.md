# Producción de preinscripciones: datos reales, acceso y política

> Unidad abierta el 2026-11-21. Producción ya recibe solicitudes reales y no tiene
> respaldo ni forma de consultarlas: el objetivo es que los datos no se pierdan y
> que el instituto pueda verlos, bajo la política de datos de familias declarada.
> Evidencia: `docs/preinscripciones-supabase.md` (bloque corregido) y `docs/preinscripciones-privacidad.md`.

## Specs

S1. «necesito que los datos de Supabase no se pierdan»

S2. «debo poder verlso, de nada sirven si no puedo tener acceso a los datos cargados»

S3. «los datos de las familias que que no concreten la inscripción (uan vez iniciadas las clases) serán eliminados»

S4. «los datos de las familias que termien la inscripción no seran dados a terceros ni utilizados comercialmente»

S5. «Luego de terminado el cursado del ingreso y una vez que hallan rendido los datos sernan eliminados»

## Tasks

| ID | Spec | Ruta | Estado |
| --- | --- | --- | --- |
| T1 | S1, S2 | inline | Documentar el estado real verificado de ambos proyectos y el faltante de migraciones |
| T2 | S2 | inline + Vercel | Confirmar en Vercel el estado de las variables (hecho: Production tiene las dos de Supabase, faltan las `ADMIN_*`) |
| T3 | S2 | Supabase prod (autorización explícita) | Aplicar sólo `202611170002_prereg_admin_gateway` en producción; es aditiva y no depende de `202611170001` |
| T4 | S2 | Vercel (decisión humana) | Configurar las cinco `ADMIN_*` en Production y desplegar el panel; requiere merge de `feat/admin-preinscripciones` |
| T5 | S2 | verificación previa al deploy | Confirmar qué firma de `submit_preinscripcion` envía la rama antes de tocar producción; no aplicar `202611170001` con la app actual |
| T6 | S1 | inline | Respaldo decidido: **sin plan Pro**. El mecanismo es el export lógico; hoy Free no tiene ningún backup automático |
| T7 | S3, S5 | decisión humana | Fijar plazos concretos, responsable y procedimiento de supresión, con constancia |
| T8 | S4 | inline + verificación | Alinear el texto público de privacidad y su `privacy_version` con la política declarada |
| T9 | S1 | operación | Evitar pausa por inactividad del proyecto Free y dejar el procedimiento de reactivación |

## Log

L1 (2026-11-21, solicitud original verbatim): «realziaza el punto 1 para documentar el estado real, todavía no se configura als varialbes en Vercel es lo que habría que hacer, necesito tu ayuda esa está abierto Vercel en Ego lite, necesito que los datos de Supabase no se pierdan pero debo poder verlso, de nada sirven si no puedo tener acceso a los datos cargados. En cuanto a los datos de menores si hay política los datos de las familias que que no concreten la inscripción (uan vez iniciadas las clases) serán eliminados, los datos de las familias que termien la inscripción no seran dados a terceros ni utilizados comercialmente. Luego de terminado el cursado del ingreso y una vez que hallan rendido los datos sernan eliminados. Bueno dime como seguimos.»

L2 (2026-11-21, hallazgo): la premisa «todavía no se configuraron las variables en Vercel» es incorrecta. Vercel › `ingenium-web` › Environment Variables muestra `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en **Production**, agregadas el 17/11; los dos Secrets de Preview siguen limitados a `feat/preinscripciones-ingenium`; las cinco `ADMIN_*` están agregadas hace tres días y son **sólo Preview**. Un formulario no puede enviar por una Preview protegida, así que el tráfico real proviene de Production.

L3 (2026-11-21, lectura directa): `ingenium-preinscripciones` tiene 12 solicitudes, todas `recibida`, sin grupo ni vacante, ciclo 2027/2028, creadas 17/11 14:31 → 20/11 10:47 (1/5/5/1 por día), 11 filas en `rate_windows` y 4 grupos. `ingenium-preinscripciones-test` sigue con las mismas 14 fixtures (8 `confirmada` / 6 `recibida`). Sólo se ejecutaron SELECT de conteo y agregación; no se leyó ni exportó PII y no se escribió ninguna fila.

L4 (2026-11-21, estructura): producción tiene 3 tablas privadas, un `submit_preinscripcion` y **cero** funciones `admin_*` → migración base únicamente. `202611170002` es aditiva (tabla `admin_audit_events`, triggers y cuatro funciones `public.admin_*`) y no referencia artefactos de `202611170001`. `202611170001` **no** es aditiva para la semántica: elimina la unicidad `(course_year, student_hash)` y cambia la firma del RPC de envío, por lo que no debe aplicarse con la app actual en producción.

L5 (2026-11-21, respaldo): el dashboard del proyecto de producción informa literalmente «Free Plan does not include project backups». No hay copia automática de las 12 filas.

L6 (2026-11-21, decisión del humano): «en cuanto al Backup no es necesario por lo que no se pasará al plan Pro… los datos se cargan una vez son extraidos y no se vuelven a modificar hasta se rdestruidos (no es una regla es solo una descripción de lo que puede pasar) el mecanismo lógico es el export». Decisión registrada: no se contrata Pro; el mecanismo de respaldo es export lógico. Precisión técnica para que la premisa no se rompa sola: en `registrations` los campos personales sí son de escritura única, pero `status`, `confirmed_group` y `confirmed_slot` **se modifican** por la vía administrativa; un estado corrupto se puede reconstruir a mano, un dato personal perdido no. Los 12 registros actuales siguen todos en `recibida`, así que hoy no hay ningún cambio de estado que reconstruir.
