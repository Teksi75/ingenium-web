# Pendientes — sitio institucional INGENIUM

> Para qué sirve este archivo: es la lista de tareas pendientes del proyecto, independiente de cualquier conversación. Si preguntás "qué falta hacer" o "qué tareas pendientes hay", este archivo es la respuesta. Marcar `[x]` al completar cada ítem.

Última actualización: 2026-10-16 · Detalle técnico (specs, decisiones y evidencia): `odd/tasks/aeo-discoverability.md`

## 1. Gestiones tuyas (externas — solo vos podés hacerlas)

Estas son las que hacen que Google, Bing y las IA conozcan el sitio oficialmente. El trabajo técnico de descubribilidad del sitio ya está hecho y en producción. Esto no incluye la habilitación de preinscripciones, cuyo estado separado está en la sección 4.

- [ ] **Google Search Console** — Crear propiedad con `https://ingenium-web.vercel.app/` en [search.google.com/search-console](https://search.google.com/search-console). Verificar (archivo HTML en `public/` o registro TXT en el DNS). Después: Sitemaps → enviar `sitemap.xml`.
- [ ] **Bing Webmaster Tools** — En [bing.com/webmasters](https://www.bing.com/webmasters): "Importar desde Google Search Console" (un clic, trae verificación y sitemap). Esto alimenta a Copilot y ChatGPT.
- [ ] **Google Business Profile** — Crear/reclamar "INGENIUM Apoyo escolar" en [google.com/business](https://www.google.com/business/): Suyai 2632, Vistalba, Luján de Cuyo · +54 9 2615010488 · sitio `https://ingenium-web.vercel.app`. Es lo que aparece en Maps cuando buscan apoyo escolar en la zona.
- [ ] **Vercel — permisos de rastreo** — En el dashboard del proyecto → Settings → Deployment Protection: producción debe estar sin protección, si no Google no puede rastrear.

## 2. Esperando tu palabra

- [ ] **Más preguntas reales de familias para el FAQ** — Si Bárbara pasa 3–8 preguntas que le hacen siempre, con sus respuestas (2–4 líneas cada una), se suman a la página y al schema FAQPage. Van en `data/ingeniumSections.ts`.
- [ ] **Precios** — No publicar ningún valor sin tu aprobación explícita. Si querés mostrar precios o formas de pago, decime y los sumo.

## 3. Cuando termines la sección 1

Avisame para cerrar la tarea T5 del documento técnico y, si querés, medir la indexación a los 2–3 días (Search Console muestra si Google ya rastreó).

## 4. Preinscripciones — base de prueba validada, habilitación productiva pendiente

Referencia: [integración y publicación controlada](docs/preinscripciones.md) · [operación privada de Supabase](docs/preinscripciones-supabase.md) · specs en `odd/tasks/preinscripciones-ingenium.md`.

Implementados: contrato/ciclo centralizado, página y formulario, API y migración versionada, enlace desde ingreso y sitemap. Con autorización posterior se aplicó una vez la migración en **ingenium-preinscripciones-test**, proyecto Free separado, sólo con datos ficticios. Pasaron el SQL real con rollback y las carreras de cupos e idempotencia; aún no se configuró el runtime de Vercel ni se publicó este servicio. **Producción permanece sin cambios.** Una preinscripción no confirma vacante; no confundir los grupos especiales de ingreso (hasta 8) con apoyo habitual (primaria 3, secundaria 4).

- [x] **Validación final local** — `pnpm lint` exit 0, suite Node completa en serie (`pnpm exec node --test --test-concurrency=1 tests/*.test.mjs`, incluye SEO HTTP) **106/106**, sin omitidas, y `pnpm build` exit 0. Errores iniciales de lint y colisión del lock en modo paralelo corregidos/documentados.
- [x] **Recorrido funcional móvil local** — Chromium a 390/320 px sin desborde del formulario; cuatro pasos, teclado/foco/errores, grupos/preferencia, revisión, consentimientos y dos 503 sin recibo falso, datos y clave de reintento conservados. Integridad de portada/WhatsApp/SEO comprobada por tests. No equivale a probar un lector de pantalla o un envío real a Supabase.
- [x] **Verificación independiente ejecutable local** — Continuación acotada autorizada: 54/54 pruebas de API/formulario y TypeScript exit 0, Node directo sin instalar dependencias, sin correcciones ni reintentos. Se conserva el timeout previo de 60 s/cero pruebas como antecedente. Este PASS local no sustituye SQL real, recepción integrada ni lector de pantalla.
- [x] **Recepción real desde el servidor local** — Build real de Next conectado sólo al Supabase de prueba: 201 con recibo, reintento 200/mismo recibo, dos rechazos 409 privados. Lectura administrativa de campos/consentimientos y fila completa idéntica tras cada reintento/rechazo; 13 solicitudes, contador total 13, ocho confirmadas/cinco recibidas. Un fixture nuevo, ninguna vacante adicional, credencial sólo en memoria y servidor propio detenido. No equivale a verificar Vercel.
- [ ] **Lector de pantalla real** — Comprobar con tecnología asistiva real antes de habilitar familias; teclado, foco y etiquetas no sustituyen esa prueba.
- [x] **Aprobación no productiva explícita** — Proyecto separado Free/São Paulo y migración con datos ficticios autorizados; el usuario creó la base. Push de la rama y despliegue autorizados, sin permiso de merge, borrado ni planes pagos. Configuración pendiente sólo en Preview protegida; no usar secretos ni datos de producción.
- [x] **Evidencia SQL real y aislamiento de datos** — Migración aplicada una vez, suite SQL real con rollback, lectura administrativa, catorce denegaciones ejecutadas bajo roles reales y carreras concurrentes de cupos/replay/duplicado/conflicto. Esquema privado excluido de la Data API y cinco denegaciones HTTP comprobadas con clave pública válida (control positivo 200). Las carreras/denegaciones dejaron doce fixtures; la prueba integrada posterior agregó sólo uno (trece en total, ocho confirmados). Rechazos sin cambios de filas/contadores; no confundir estas comprobaciones con la Preview aún pendiente.
- [ ] **Preview protegida** — La transferencia manual y la autenticación moderna pasaron, sin cambiar cabeceras de la aplicación. Falta publicar la rama, guardar las variables sólo para esa Preview y redesplegar; verificar commit, protección y envío/recibo/reintento con lectura administrativa desde el despliegue nuevo. La configuración actual sigue como borrador sin guardar. Sin secretos en chat, repositorio, frontend ni Production.
- [ ] **Privacidad y administración** — Definir responsables, cuentas individuales/MFA y mínimo privilegio, plazo/procedimiento de retención/supresión, respaldo, rectificación y atención de derechos antes de recibir datos reales. Sin panel: acceso restringido documentado en la guía Supabase.
- [ ] **Producción: permisos separados** — Sólo con validación y evidencia aprobadas, pedir autorización nueva para migración/configuración productivas y después para despliegue Vercel. Push/merge requieren permiso propio; no hay publicación autorizada por esta lista.
- [ ] **Próximo ciclo** — Seguir el flujo documentado: configuración revisada y nueva migración con grupos del ciclo nuevo, conservar registros/consentimientos anteriores, coordinar reintentos y repetir validación sin cambiar `/preinscripcion`.

## Contexto y restricciones vigentes

- Ya está en producción: identidad unificada (URL oficial `https://ingenium-web.vercel.app`), ofertas visibles (ETEC, preuniversitarios UTN/UNCuyo Matemática y Física), FAQ de familias con schema FAQPage, rastreo abierto (robots + sitemap).
- Restricciones: sin promesas de que una IA recomiende el instituto; sin keyword stuffing; las fotos promocionales son fotos reales de estudiantes modificadas con IA para proteger su identidad; el razonamiento comercial/económico es interno y no se publica.
- Ubicación en copy público: "Luján de Cuyo, cerca de Chacras de Coria". La localidad postal real (Vistalba) se conserva en el JSON-LD porque coincide con Google Maps.
