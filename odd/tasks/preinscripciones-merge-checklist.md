# Antes del merge — preinscripciones

> Lista corta y accionable para decidir el merge de `feat/preinscripciones-ingenium` a `main`.
> Estado verificado al 16/11/2026. Detalle y evidencia completa: `odd/tasks/preinscripciones-ingenium.md` (T9 y logs L41–L55).
> Para reanudar: basta con decir **«continuemos con el formulario de preinscripción»**.

## A. Bloqueantes — no mergear sin resolver estos

- [x] **1. Variables de Production en Vercel.** Verificado el 2026-11-21: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` **sí existen en Production** (agregadas el 17/11), además de los dos Secrets de Preview limitados a `feat/preinscripciones-ingenium`. La API ya no falla cerrada: producción recibe envíos reales. Faltan únicamente las cinco `ADMIN_*`, que hoy son Preview-only. El faltante real no es la API sino el panel: sin las cinco `ADMIN_*` en Production y sin la migración del gateway administrativo, producción recibe envíos pero nadie puede consultarlos ni gestionarlos.
      *Comprobación:* Settings → Environment Variables → filtro Production: deben aparecer las dos, con alcance Production. Después de mergear, un envío real en producción debe dar **201** con recibo.
- [x] **2. Decidir qué base recibe datos reales.** La decisión ya ocurrió de hecho: producción escribe en **`ingenium-preinscripciones`** (Free, São Paulo), que al 2026-11-21 tiene **12 solicitudes reales**, todas `recibida` (17–20/11) y **sin respaldo automático**. La base de test conserva sus 14 fixtures sintéticos, intactas. Riesgos abiertos: esa base no tiene la migración del gateway administrativo, así que el panel no puede verlas; y Free no incluye backups.
      *Opciones:* (a) mantener `ingenium-preinscripciones` como base productiva y aplicarle **sólo** el gateway administrativo, que es aditivo; o (b) trasladar los 12 registros a otra base, lo que implica escribir sobre datos reales y exige autorización explícita. No borrar los fixtures de la base de prueba: no hay respaldo y siguen siendo evidencia de las pruebas. Decisión y orden: `odd/tasks/preinscripciones-produccion.md` (T3, T4, T6).
- [ ] **3. Lector de pantalla real.** Teclado, foco y etiquetas ya están probados; no sustituyen una prueba con tecnología asistiva real.
- [ ] **4. Privacidad y administración aprobadas por el instituto.** Responsables, cuentas individuales/MFA, mínimo privilegio, plazo y procedimiento de retención/supresión, respaldo, rectificación y atención de derechos. Sin panel: el acceso restringido está documentado en `docs/preinscripciones-supabase.md`.

- [x] **5. Revisión nativa del candidato acumulado.** El candidato completo (30 rutas desde `c848bc1`) **no se puede revisar en una sola transacción**: el proveedor lo rechaza con `lens_context_budget_exceeded` y no crea autoridad, así que reintentarlo no sirve. Se revisó el 17/11 como **cuatro slices por commit**, cada uno con su propio worktree, consentimiento y autoridad: `5d58c4e` (API/SQL), `8c223d9` (contrato), `7e426c9` (formulario) y `ea99f8f..dd354a5` (integración, fix same-origin y docs). **Los cuatro aprobados y su autoridad quemada.** Cinco hallazgos advisory, ninguno bloqueante; los dos de documentación se corrigieron en `2a2fba1` y los tres de código quedan como trabajo posterior. Evidencia: `odd/tasks/preinscripciones-ingenium.md`, T11 y L57.

Además, el merge y la publicación en producción requieren **tu autorización explícita**: no está dada.

## B. Después del merge — comprobaciones de ~10 minutos

- [ ] Producción **sin** variables todavía → envío real devuelve **503** y muestra el mensaje honesto, sin recibo.
- [ ] Con variables cargadas → envío real **201** + recibo visible; reintento idéntico **200** con el mismo número; cuerpo cambiado **409**; otra clave con el mismo estudiante **409**. Todos sin CORS público, con `no-store` y `noindex, nofollow`.
- [ ] Lectura administrativa: una fila `recibida`, `confirmed_group`/`confirmed_slot` en NULL, consentimientos fechados, y las confirmadas previas sin cambios.
- [ ] `/preinscripcion` en producción: título «Preinscripción 2027 — Ingreso al Secundario 2028», canónica correcta, enlace a la portada, sitemap y robots.
- [ ] Portada: los 7 enlaces de WhatsApp y el enlace a `/preinscripcion` siguen visibles.
- [ ] Controles de fallo: `GET` a la API → **405**; `POST` sin `Origin` válido → **403**.

## C. Ya verificado — no repetir

- Suite completa **108/108**, `lint`, `tsc` y `build` con exit 0.
- Preview protegida `314ff36` (`https://ingenium-nci7qkxh3-teksi75s-projects.vercel.app`): **201** con recibo, **200** en reintento, **409** por cuerpo cambiado y **409** por otra clave, fila canónica exacta, contadores **14/14/8/6** con un único fixture y ocho confirmadas intactas.
- Acceso anónimo a formulario y API en el dominio nuevo → **302** al login de Vercel.
- Humo institucional: WhatsApp, enlace desde portada, títulos/H1, canónica a producción, sin precios ni promesas de resultados.

## D. Limpiezas opcionales — sólo con autorización

- [ ] Los **14 fixtures sintéticos** de la base de prueba siguen ahí; no se borró nada.
- [ ] `PREINSCRIPCION_RATE_SECRET` es opcional (si falta se usa la clave de servicio con separación de dominio). Cambiarlo reinicia los contadores diarios.
- [ ] El intento que devolvió 401 y el intento fallido de UI **no crearon fila** (comprobado con consultas administrativas); no requieren limpieza.
