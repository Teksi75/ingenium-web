# Preinscripciones: integración y habilitación segura

La ruta pública permanente es **`/preinscripcion`**, sin año ni datos personales en la URL. La implementación conecta la portada con el programa de preparación y fue verificada de extremo a extremo en una Preview protegida de la rama de trabajo; **no significa que el servicio esté habilitado en producción**. Sólo se usaron datos ficticios. La migración se aplicó **una sola vez** en el proyecto de prueba autorizado `ingenium-preinscripciones-test` y la rama `feat/preinscripciones-ingenium` se publicó; producción y `main` no se modificaron.

## Recorrido de las familias

- Portada → sección de ingreso al secundario → botón de preinscripción → programa y formulario de cuatro pasos → resumen y consentimientos → envío.
- Se conservan los botones y textos de WhatsApp. El regreso a la portada y el contacto institucional siguen disponibles.
- Los grupos especiales de preparación para ingreso tienen hasta **8 estudiantes**. El apoyo escolar habitual conserva sus capacidades menores: primaria hasta **3**, secundaria hasta **4**. No se amplían los grupos habituales.
- La configuración inicial es cursado **2027**, ingreso **2028**, de marzo a octubre. El programa no publica importes ni promete resultados o vacantes garantizadas; el taller mensual no tiene un horario inventado.
- Una respuesta exitosa muestra sólo el código público y el mensaje de recepción, no una vacante confirmada. Ante un fallo se conservan los datos y la clave de reintento en memoria; recargar/cerrar la página no conserva el formulario.

## Qué está verificado y qué falta antes de producción

| Área | Verificado | Falta antes de producción |
| --- | --- | --- |
| Página/formulario | Programa, validación, revisión, consentimientos y resultado honesto; recorrido Chromium móvil, teclado/foco y error/reintento; envío real con recibo en la Preview protegida | Lector de pantalla real |
| Integración institucional | Enlace con `next/link`, ciclo/título/capacidad desde configuración, WhatsApp intacto; comprobaciones HTTP/componentes aprobadas y humo institucional en la Preview | Revalidar en producción tras el merge |
| SEO | Canonical propio, sitemap de dos rutas, FAQ sólo en portada y organización intacta; suite SEO HTTP aprobada y canónica a producción comprobada en la Preview | Revalidar en producción tras el merge |
| API/SQL | API de servidor, esquema privado, RPC, idempotencia y confirmación transaccional; migración real, permisos, escritura/lectura administrativa y carreras concurrentes en el proyecto de prueba | Variables de Production en Vercel y la base definitiva que recibirá datos reales |
| Operación | Procedimiento documentado sin panel | Responsables, accesos, política de retención/supresión y autorizaciones |

Las respuestas personales no tienen una ruta de recibo indexable: el resultado vive sólo en el cliente. La API devuelve `no-store` y `noindex, nofollow`, sin endpoints públicos de consulta. El código público no es una credencial administrativa; no agregarlo al sitemap, canonical, enlaces ni parámetros de URL.

## Configuración y acceso administrativo

La [guía privada de Supabase](preinscripciones-supabase.md) es la referencia exacta para **variables de servidor**, RPC, permisos, lectura administrativa, estados y pruebas de concurrencia. Faltan los valores reales de `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` del entorno autorizado; `PREINSCRIPCION_RATE_SECRET` es opcional según esa guía. No configurarlos sin aprobación explícita ni usar nombres `NEXT_PUBLIC_*`, documentación, chats o comandos con claves.

Mientras no haya panel, sólo responsables técnicos expresamente autorizados acceden desde Supabase con cuentas individuales, MFA y permisos mínimos. Consultar únicamente las filas/campos necesarios; no exportar datos de menores a equipos personales. Los ejemplos de lectura y cambios de estado están en la guía enlazada. No dar acceso público a tablas ni confundir la clave de servicio con un rol de lectura administrativo.

Antes de recibir datos reales deben quedar aprobados el responsable del tratamiento, plazo y procedimiento de retención/supresión, respaldos y atención de derechos por los canales institucionales. No se inventa un plazo legal. La rectificación/supresión necesita un procedimiento privilegiado separado y autorizado; no deshabilitar restricciones para ejecutarla. Conservar evidencia histórica de los consentimientos según la política aprobada, sin publicar registros ni datos de prueba reales.

## Verificación local y evidencia

Desde la raíz del repositorio, con las dependencias ya disponibles:

```sh
# Focalizada: no abre servidor ni usa Supabase.
pnpm exec node --test tests/preinscripcion-integration.test.mjs tests/aeo-content.test.mjs tests/next-config.test.mjs
pnpm exec tsc --noEmit --incremental false

# Puerta de validación final: ejecutar de a uno, sin otro next dev activo.
pnpm lint
pnpm exec node --test --test-concurrency=1 tests/*.test.mjs
pnpm build
```

La suite Node completa incluye formulario, contrato, API con transporte simulado, SQL estructural, integración, SEO y arranque. Se ejecuta en serie porque SEO y arranque abren servidores Next locales que comparten `.next`; no ejecutarla en paralelo con desarrollo/build. El servidor necesita poder abrir un puerto local. No cambiar el workaround de OneDrive/Turbopack para ocultar un fallo.

**Evidencia de esta integración:** la corrida focalizada falló primero por enlace/sitemap ausentes y FAQ heredado (10/13); después pasó **13/13**. Esto verifica HTML estático de componentes reales y contratos, no interacción del navegador ni PostgreSQL. También pasaron `pnpm exec tsc --noEmit --incremental false` y `git diff --check` (exit 0; este último advierte normalización LF/CRLF). No sustituyen las puertas siguientes.

**Resultados locales finales:** `pnpm lint` exit 0; `pnpm exec node --test --test-concurrency=1 tests/*.test.mjs` **106/106**, exit 0, sin omitidas; `pnpm build` exit 0. Typecheck sin artefactos también pasó. El primer lint señaló seis errores de enlaces/cargadores de tests, corregidos; la primera suite paralela falló por el lock compartido de Next y pasó al usar el comando secuencial documentado.

Sobre el build servido localmente se comprobaron cuatro pasos, foco/errores, avance por teclado, grupos múltiples y limpieza de preferencia incompatible, revisión, consentimientos inicialmente desmarcados y rechazo si faltan. A 390 y 320 px no hubo desborde horizontal del formulario. Dos envíos sintéticos sin configuración devolvieron **503**, sin recibo falso; el reintento conservó la misma clave y el resumen. GET/HEAD/OPTIONS reales devolvieron **405**, `no-store` y `noindex, nofollow`. Se detectó y corrigió el origen loopback normalizado por Next con prueba RED y GREEN; el servidor compilado devolvió después el 503 esperado. No se simuló éxito en el recorrido real.

**Verificación independiente:** la primera inspección estática no identificó un defecto concreto de código, pero su ejecutor aislado agotó 60 segundos antes de iniciar pruebas, con cero pruebas ejecutadas y sin reintento. Una continuación acotada autorizada después sí ejecutó Node directo sobre API y formulario (54/54) y TypeScript sin emisión (exit 0). La evidencia real de PostgreSQL, permisos y concurrencia no provino de esa verificación sino del proyecto de prueba autorizado. La suite local y un test de texto SQL por sí solos no sustituyen esa evidencia.

### Recorrido manual mínimo

- [ ] Portada conserva título, descripción, FAQ visible/JSON-LD exacto, organización y todos los WhatsApp; nuevo enlace visible, sin desbordes a 320–390 px.
- [ ] Abrir `/preinscripcion` desde la portada y directamente; volver sin perder la navegación institucional. Comprobar canonical y ausencia de FAQ heredado.
- [ ] Navegar con teclado y móvil por los cuatro pasos; errores asociados a campos, foco, varios grupos, preferencia compatible, resumen/corrección y ambos consentimientos sin premarcar.
- [ ] Sin configuración o con error simulado: no hay éxito falso, no se pierden datos y reintentar mantiene la clave. Sólo en el entorno de pruebas autorizado: envío sintético y lectura administrativa correspondiente.
- [ ] Verificar en red que no se exponen claves ni datos personales en URL, logs o recibos públicos. En Supabase, demostrar denegación anon/authenticated y esquema privado no expuesto.
- [ ] Ejecutar las pruebas SQL y las carreras de confirmación/idempotencia de la guía técnica; registrar resultados sanitizados, incluyendo octava aceptada y novena rechazada.

## Publicación controlada: etapas separadas

**No ejecutar operaciones externas ni publicar por seguir esta guía. Cada autorización debe identificar entorno, responsable y alcance.**

1. **Validación local primero.** Completar los comandos y recorridos anteriores que no requieren base, revisión de código/seguridad y resolver fallos. Mantener la función fuera de producción. Registrar qué sigue sin evidencia real.
2. **Solicitar aprobación explícita no productiva.** Autorizar por separado elección/creación de proyecto desechable si hace falta, aplicación de la migración versionada y configuración de variables exclusivamente del servidor de prueba. Acordar privacidad y acceso mínimo antes de configurar secretos. No vincular ni modificar producción.
3. **Ejecutar sólo el alcance no productivo aprobado.** Seguir la guía Supabase para migración, esquemas expuestos, privilegios, SQL, carreras en dos sesiones y envío sintético end-to-end. Detenerse ante fallos y conservar evidencia sanitizada, sin PII ni credenciales. No continuar por el mero hecho de que los tests Node pasen.
4. **Puerta de producción.** Con toda la evidencia, política de retención y responsables aprobados, solicitar una autorización **nueva y específica** para migración productiva y configuración de secretos productivos. Revisar respaldo/recuperación y compatibilidad del código con la base antes de aplicarla. No reutilizar fixtures ni credenciales de pruebas.
5. **Despliegue separado.** Sólo después, pedir autorización explícita para el despliegue en Vercel; push/merge también requieren permiso propio. Verificar servicio/configuración y smoke checks sin datos de menores antes de anunciar apertura. Ante fallos, detener la habilitación y solicitar la corrección o reversión revisada; nunca borrar registros para volver atrás.

Las etapas remotas se ejecutaron únicamente contra el proyecto de prueba autorizado y la Preview protegida de la rama; ninguna etapa de producción se ejecutó. El estado operativo pendiente se mantiene en [`PENDIENTES.md`](../PENDIENTES.md).

## Cambio de ciclo sin perder registros

1. Revisar `lib/preinscripcion/config.ts`: años de cursado/ingreso, fechas, estado, grupos, capacidad y textos/versiones de consentimiento. La portada, página y sitemap reutilizan esta configuración; la ruta **no cambia** y el servidor decide el ciclo activo.
2. Preparar otra migración versionada con **nuevas filas** de grupos para el nuevo ciclo, siguiendo la guía técnica. No reutilizar/modificar grupos históricos, mover solicitudes entre ciclos ni borrar registros anteriores. No ampliar a más de ocho sin un cambio de contrato y revisión independiente.
3. Coordinar el cierre temporal de recepción y los reintentos pendientes: un cambio de ciclo/versiones altera el hash de idempotencia. Conservar las versiones/fechas de aceptación históricas; no reescribirlas con los textos nuevos.
4. Actualizar y repetir pruebas de contrato, formulario, API, SQL, integración y SEO; comprobar que la lectura administrativa distingue ciclos. Volver a las puertas no productiva y productiva con autorizaciones separadas. No editar sólo el año del título ni aplicar la migración original de nuevo a ciegas.
