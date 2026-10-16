# Pendientes — sitio institucional INGENIUM

> Para qué sirve este archivo: es la lista de tareas pendientes del proyecto, independiente de cualquier conversación. Si preguntás "qué falta hacer" o "qué tareas pendientes hay", este archivo es la respuesta. Marcar `[x]` al completar cada ítem.

Última actualización: 2026-10-16 · Detalle técnico (specs, decisiones y evidencia): `odd/tasks/aeo-discoverability.md`

## 1. Gestiones tuyas (externas — solo vos podés hacerlas)

Estas son las que hacen que Google, Bing y las IA conozcan el sitio oficialmente. El trabajo técnico del sitio ya está hecho y en producción.

- [ ] **Google Search Console** — Crear propiedad con `https://ingenium-web.vercel.app/` en [search.google.com/search-console](https://search.google.com/search-console). Verificar (archivo HTML en `public/` o registro TXT en el DNS). Después: Sitemaps → enviar `sitemap.xml`.
- [ ] **Bing Webmaster Tools** — En [bing.com/webmasters](https://www.bing.com/webmasters): "Importar desde Google Search Console" (un clic, trae verificación y sitemap). Esto alimenta a Copilot y ChatGPT.
- [ ] **Google Business Profile** — Crear/reclamar "INGENIUM Apoyo escolar" en [google.com/business](https://www.google.com/business/): Suyai 2632, Vistalba, Luján de Cuyo · +54 9 2615010488 · sitio `https://ingenium-web.vercel.app`. Es lo que aparece en Maps cuando buscan apoyo escolar en la zona.
- [ ] **Vercel — permisos de rastreo** — En el dashboard del proyecto → Settings → Deployment Protection: producción debe estar sin protección, si no Google no puede rastrear.

## 2. Esperando tu palabra

- [ ] **Más preguntas reales de familias para el FAQ** — Si Bárbara pasa 3–8 preguntas que le hacen siempre, con sus respuestas (2–4 líneas cada una), se suman a la página y al schema FAQPage. Van en `data/ingeniumSections.ts`.
- [ ] **Precios** — No publicar ningún valor sin tu aprobación explícita. Si querés mostrar precios o formas de pago, decime y los sumo.

## 3. Cuando termines la sección 1

Avisame para cerrar la tarea T5 del documento técnico y, si querés, medir la indexación a los 2–3 días (Search Console muestra si Google ya rastreó).

## Contexto y restricciones vigentes

- Ya está en producción: identidad unificada (URL oficial `https://ingenium-web.vercel.app`), ofertas visibles (ETEC, preuniversitarios UTN/UNCuyo Matemática y Física), FAQ de familias con schema FAQPage, rastreo abierto (robots + sitemap).
- Restricciones: sin promesas de que una IA recomiende el instituto; sin keyword stuffing; las fotos promocionales son fotos reales de estudiantes modificadas con IA para proteger su identidad; el razonamiento comercial/económico es interno y no se publica.
- Ubicación en copy público: "Luján de Cuyo, cerca de Chacras de Coria". La localidad postal real (Vistalba) se conserva en el JSON-LD porque coincide con Google Maps.
