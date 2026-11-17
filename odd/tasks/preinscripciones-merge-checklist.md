# Antes del merge — preinscripciones

> Lista corta y accionable para decidir el merge de `feat/preinscripciones-ingenium` a `main`.
> Estado verificado al 16/11/2026. Detalle y evidencia completa: `odd/tasks/preinscripciones-ingenium.md` (T9 y logs L41–L55).
> Para reanudar: basta con decir **«continuemos con el formulario de preinscripción»**.

## A. Bloqueantes — no mergear sin resolver estos cuatro

- [ ] **1. Variables de Production en Vercel.** Hoy `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` existen **sólo** como Secrets del entorno Preview limitados a esta rama. Production no tiene ninguna. Si se mergea así, la API en producción responde **503** (falla cerrada y honesta, sin recibo falso) y ninguna familia puede preinscribirse.
      *Comprobación:* Settings → Environment Variables → filtro Production: deben aparecer las dos, con alcance Production. Después de mergear, un envío real en producción debe dar **201** con recibo.
- [ ] **2. Decidir qué base recibe datos reales.** La app apunta hoy a `ingenium-preinscripciones-test` (Free, São Paulo), que contiene **14 fixtures sintéticos**. Recibir datos de menores ahí es una decisión de privacidad, no un detalle técnico.
      *Opciones:* (a) crear un proyecto Supabase productivo separado y aplicar la migración una vez; o (b) declarar este proyecto como productivo y borrar los fixtures — el borrado requiere tu autorización explícita.
- [ ] **3. Lector de pantalla real.** Teclado, foco y etiquetas ya están probados; no sustituyen una prueba con tecnología asistiva real.
- [ ] **4. Privacidad y administración aprobadas por el instituto.** Responsables, cuentas individuales/MFA, mínimo privilegio, plazo y procedimiento de retención/supresión, respaldo, rectificación y atención de derechos. Sin panel: el acceso restringido está documentado en `docs/preinscripciones-supabase.md`.

- [ ] **5. Revisión nativa del candidato acumulado.** Todo el sistema (30 rutas desde `c848bc1`) sigue **sin revisión nativa**; es el paso previo obligatorio antes de entregar bajo RDD. Se inicia con una decisión de consentimiento tuya. El 16/11 elegiste explícitamente **dejarlo sin revisar hasta mañana** (target `sha256:8ac7cdc7…`), así que no hay transacción abierta ni autoridad consumida.

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
